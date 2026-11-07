// Detektor aktywności głosowej (tylko głośność!).
// Nic nie jest nagrywane, zapisywane ani wysyłane – analizujemy wyłącznie
// chwilowy poziom sygnału w pamięci przeglądarki.

export class VoiceMeter {
  /**
   * @param {{onLevel:(level:number, bars:number[])=>void, onProgress:(p:number, active:boolean)=>void, onDone:()=>void, targetSeconds?:number, barCount?:number}} opts
   */
  constructor(opts) {
    this.opts = { targetSeconds: 4, barCount: 12, ...opts };
    this.ctx = null;
    this.stream = null;
    this.raf = 0;
    this.running = false;
  }

  static supported() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) && !!(window.AudioContext || window.webkitAudioContext);
  }

  /** Wywołuj bezpośrednio z obsługi kliknięcia (wymóg iOS Safari). */
  async start() {
    if (!window.isSecureContext) {
      const e = new Error('insecure'); e.name = 'InsecureContext'; throw e;
    }
    if (!VoiceMeter.supported()) {
      const e = new Error('unsupported'); e.name = 'NotSupportedError'; throw e;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    // AudioContext tworzymy synchronicznie w geście użytkownika – inaczej iOS go zablokuje.
    this.ctx = new AC();
    const resumed = this.ctx.resume ? this.ctx.resume() : Promise.resolve();
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
        video: false,
      });
    } catch (err) {
      this.stop();
      throw err;
    }
    // Niektóre przeglądarki nigdy nie rozwiązują resume() – nie czekamy w nieskończoność.
    await Promise.race([resumed.catch(() => {}), new Promise((r) => setTimeout(r, 1200))]);
    if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});

    const src = this.ctx.createMediaStreamSource(this.stream);
    const analyser = this.ctx.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.6;
    src.connect(analyser); // NIE łączymy z głośnikiem – brak sprzężenia
    this.analyser = analyser;
    this.time = new Uint8Array(analyser.fftSize);
    this.freq = new Uint8Array(analyser.frequencyBinCount);

    this.running = true;
    this.startedAt = performance.now();
    this.last = this.startedAt;
    this.voiced = 0;          // sekundy aktywności głosowej
    this.ambientSum = 0;
    this.ambientN = 0;
    this.threshold = 0.035;   // nadpisywane po kalibracji
    this.smooth = 0;
    this.loop();
  }

  loop = () => {
    if (!this.running) return;
    const now = performance.now();
    const dt = Math.min(0.1, (now - this.last) / 1000);
    this.last = now;

    this.analyser.getByteTimeDomainData(this.time);
    let sum = 0;
    for (let i = 0; i < this.time.length; i++) {
      const v = (this.time[i] - 128) / 128;
      sum += v * v;
    }
    const rms = Math.sqrt(sum / this.time.length);
    this.smooth = this.smooth * 0.7 + rms * 0.3;

    // Pierwsze ~0,7 s: kalibracja szumu tła (na targach bywa głośno!)
    const elapsed = (now - this.startedAt) / 1000;
    if (elapsed < 0.7) {
      this.ambientSum += rms; this.ambientN++;
    } else if (this.ambientN) {
      const ambient = this.ambientSum / this.ambientN;
      this.threshold = Math.min(0.22, Math.max(0.03, ambient * 1.7 + 0.012));
      this.ambientN = 0;
    }

    // Słupki z widma (pasmo głosu ~ 80 Hz – 4 kHz)
    this.analyser.getByteFrequencyData(this.freq);
    const n = this.opts.barCount;
    const hzPerBin = this.ctx.sampleRate / 2 / this.freq.length;
    const lo = Math.floor(80 / hzPerBin), hi = Math.floor(4000 / hzPerBin);
    const bars = [];
    for (let b = 0; b < n; b++) {
      const a = lo + Math.floor(((hi - lo) * b) / n);
      const z = lo + Math.floor(((hi - lo) * (b + 1)) / n);
      let m = 0;
      for (let i = a; i <= z; i++) m = Math.max(m, this.freq[i]);
      bars.push(m / 255);
    }

    const level = Math.min(1, this.smooth / Math.max(this.threshold * 2.2, 0.08));
    const active = elapsed >= 0.7 && this.smooth > this.threshold;
    if (active) this.voiced += dt;
    const progress = Math.min(1, this.voiced / this.opts.targetSeconds);

    this.opts.onLevel(level, bars);
    this.opts.onProgress(progress, active);

    if (progress >= 1) {
      this.stop();
      this.opts.onDone();
      return;
    }
    this.raf = requestAnimationFrame(this.loop);
  };

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    if (this.stream) this.stream.getTracks().forEach((t) => t.stop());
    this.stream = null;
    if (this.ctx && this.ctx.state !== 'closed') this.ctx.close().catch(() => {});
    this.ctx = null;
  }
}

export function micErrorMessage(err) {
  const name = err && err.name;
  switch (name) {
    case 'NotAllowedError':
    case 'PermissionDeniedError':
    case 'SecurityError':
      return 'Brak zgody na mikrofon. Spokojnie – możesz zaśpiewać na żywo przed obsługą stoiska. Albo zezwól na mikrofon w ustawieniach przeglądarki i spróbuj ponownie.';
    case 'NotFoundError':
    case 'DevicesNotFoundError':
      return 'Nie znaleźliśmy mikrofonu w tym urządzeniu. Zaśpiewaj przed obsługą stoiska – to się liczy tak samo!';
    case 'NotReadableError':
    case 'TrackStartError':
      return 'Mikrofon jest zajęty przez inną aplikację (np. rozmowę lub dyktafon). Zamknij ją i spróbuj ponownie – albo zaśpiewaj przed obsługą stoiska.';
    case 'InsecureContext':
      return 'Mikrofon działa tylko na stronie otwartej przez HTTPS. Zaśpiewaj przed obsługą stoiska i zaliczaj dalej!';
    case 'NotSupportedError':
      return 'Ta przeglądarka nie obsługuje mikrofonu w grach webowych. Zaśpiewaj przed obsługą stoiska!';
    default:
      return 'Coś poszło nie tak z mikrofonem. Spróbuj ponownie albo zaśpiewaj przed obsługą stoiska.';
  }
}
