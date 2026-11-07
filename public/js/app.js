import { kremowkaSVG, pencilSVG, micSVG, haloSVG } from './art.js';
import { sfx, unlockAudio, vibrate, confetti, isMuted, setMuted } from './fx.js';
import { VoiceMeter, micErrorMessage } from './voice.js';

/* =====================================================================
   MASZYNA STANÓW
   Każdy stan przyjmuje wyłącznie wymienione zdarzenia. Zdarzenie spoza
   listy jest ignorowane – nie da się „przeskoczyć” etapu przypadkiem.
   RESTART jest dozwolony zawsze.
   ===================================================================== */
const MACHINE = {
  WELCOME: { START: 'MATURZYSTA_CHECK' },
  MATURZYSTA_CHECK: { YES: 'GET_PENCIL', NO: 'NORMAL_RECIPE' },
  NORMAL_RECIPE: {},
  GET_PENCIL: { HAVE_TOOL: 'DOT_CHALLENGE_FIRST' },
  DOT_CHALLENGE_FIRST: { TOUCH: 'DOT_CONFIRM_FIRST' },
  DOT_CONFIRM_FIRST: { CONFIRM: 'PENCIL_ERROR', RETRY: 'DOT_CHALLENGE_FIRST' },
  PENCIL_ERROR: { NEXT: 'FIGURINE_CHALLENGE' },
  FIGURINE_CHALLENGE: { FIGURINE_TOUCHED: 'PENCIL_RECALIBRATION' },
  PENCIL_RECALIBRATION: { DONE: 'PENCIL_RESTORED' },
  PENCIL_RESTORED: { BACK_TO_DOT: 'DOT_CHALLENGE_SECOND' },
  DOT_CHALLENGE_SECOND: { TOUCH: 'DOT_CONFIRM_SECOND' },
  DOT_CONFIRM_SECOND: { CONFIRM: 'DOT_SUCCESS', RETRY: 'DOT_CHALLENGE_SECOND' },
  DOT_SUCCESS: { NEXT: 'VOICE_CHALLENGE' },
  VOICE_CHALLENGE: { VOICE_DONE: 'VOICE_SUCCESS', MANUAL_CONFIRM: 'VOICE_SUCCESS' },
  VOICE_SUCCESS: { NEXT: 'FINAL_REWARD' },
  FINAL_REWARD: {},
};

/** Postęp: [numer misji, wypełnienie paska 0–1, nazwa] */
const PROGRESS = {
  MATURZYSTA_CHECK: [1, 0.1, 'Weryfikacja'],
  GET_PENCIL: [2, 0.22, 'Legendarny ołówek'],
  DOT_CHALLENGE_FIRST: [2, 0.28, 'Legendarny ołówek'],
  DOT_CONFIRM_FIRST: [2, 0.32, 'Legendarny ołówek'],
  PENCIL_ERROR: [3, 0.38, 'Interwencja specjalna'],
  FIGURINE_CHALLENGE: [3, 0.42, 'Interwencja specjalna'],
  PENCIL_RECALIBRATION: [3, 0.48, 'Interwencja specjalna'],
  PENCIL_RESTORED: [3, 0.52, 'Interwencja specjalna'],
  DOT_CHALLENGE_SECOND: [3, 0.56, 'Ponowna próba'],
  DOT_CONFIRM_SECOND: [3, 0.6, 'Ponowna próba'],
  DOT_SUCCESS: [3, 0.66, 'Ponowna próba'],
  VOICE_CHALLENGE: [4, 0.74, 'Próba głosu'],
  VOICE_SUCCESS: [4, 0.88, 'Próba głosu'],
  FINAL_REWARD: [5, 1, 'Nagroda'],
};

const STORAGE_KEY = 'kremowka-state-v1';
const SAFE_STATES = new Set(['WELCOME', 'NORMAL_RECIPE', 'FINAL_REWARD']);

const RECIPES = {
  classic: { href: 'recipes/kremowka-klasyczna.pdf', name: 'Kremowka-Klasyczna-UPJPII.pdf' },
  maturzysta: { href: 'recipes/kremowka-maturzysty.pdf', name: 'Kremowka-Maturzysty-UPJPII.pdf' },
};

const $stage = document.getElementById('stage');
const $topbar = document.getElementById('topbar');
const $progress = document.querySelector('.progress');
const $progressText = document.getElementById('progressText');
const $progressName = document.getElementById('progressName');
const $progressFill = document.getElementById('progressFill');

let state = loadState();
let cleanup = null;
let inputLockedUntil = 0;

function loadState() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw && Object.prototype.hasOwnProperty.call(MACHINE, raw)) return raw;
  } catch { /* brak sessionStorage */ }
  return 'WELCOME';
}
function saveState() {
  try { sessionStorage.setItem(STORAGE_KEY, state); } catch { /* ignoruj */ }
}

function send(event) {
  if (performance.now() < inputLockedUntil) return; // ochrona przed podwójnym tapnięciem
  const next = event === 'RESTART' ? 'WELCOME' : MACHINE[state][event];
  if (!next) return;
  go(next);
}

function go(next) {
  if (cleanup) { try { cleanup(); } catch { /* ignoruj */ } cleanup = null; }
  state = next;
  saveState();
  inputLockedUntil = performance.now() + 450;
  render();
}

/* =====================================================================
   RENDEROWANIE
   ===================================================================== */
function render() {
  const view = VIEWS[state];
  updateTopbar();
  const old = $stage.firstElementChild;
  const mount = () => {
    $stage.innerHTML = '';
    const el = document.createElement('section');
    el.className = 'screen';
    el.dataset.state = state;
    el.innerHTML = view.html();
    $stage.appendChild(el);
    window.scrollTo(0, 0);
    const c = view.mount ? view.mount(el) : null;
    if (typeof c === 'function') cleanup = c;
    const focusTarget = el.querySelector('h1, h2');
    if (focusTarget) { focusTarget.setAttribute('tabindex', '-1'); focusTarget.focus({ preventScroll: true }); }
  };
  if (old) {
    old.classList.add('leaving');
    setTimeout(mount, 200);
  } else mount();
}

function updateTopbar() {
  $topbar.hidden = state === 'WELCOME';
  const p = PROGRESS[state];
  $progress.style.visibility = p ? 'visible' : 'hidden';
  if (p) {
    $progressText.textContent = `Misja ${p[0]}/5`;
    $progressName.textContent = p[2];
    $progressFill.style.width = `${Math.round(p[1] * 100)}%`;
  } else {
    $progressFill.style.width = '0%';
  }
}

const btn = (action, label, cls = 'btn-primary', extra = '') =>
  `<button type="button" class="btn ${cls}" data-action="${action}" ${extra}>${label}</button>`;

// Wersja jednoplikowa (Kremowka-Maturzysty.html) ma PDF-y wbudowane jako base64.
const blobUrls = {};
function recipeHref(recipe) {
  const inline = window.__INLINE_RECIPES__ && window.__INLINE_RECIPES__[recipe];
  if (!inline) return RECIPES[recipe].href;
  if (!blobUrls[recipe]) {
    const bin = atob(inline);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    blobUrls[recipe] = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
  }
  return blobUrls[recipe];
}

const downloadBtn = (recipe, label, cls = 'btn-gold') => {
  const r = { ...RECIPES[recipe], href: recipeHref(recipe) };
  // W trybie „aplikacji” na iOS otwieramy PDF w nowym oknie, żeby nie utknąć w podglądzie.
  const standalone = window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;
  const target = standalone ? 'target="_blank" rel="noopener"' : '';
  return `<a class="btn ${cls}" href="${r.href}" download="${r.name}" ${target} data-download="${recipe}"><span class="emoji" aria-hidden="true">📜</span>${label}</a>`;
};

/** Plansza z kropką – wspólna dla obu prób. */
function dotView(round) {
  return {
    html: () => `
      <div class="screen-body">
        <span class="kicker">${round === 1 ? 'Próba nr 1' : 'Próba nr 2 · ołówek napapieżony'}</span>
        <h2>DOTKNIJ KROPKI SWOIM LEGENDARNYM OŁÓWKIEM.</h2>
        <div class="dot-board" id="board">
          <button type="button" class="dot" id="dot" aria-label="Kropka – dotknij ołówkiem"></button>
          <div class="dot-hint">Celuj w środek. Z godnością.</div>
        </div>
      </div>
      <div class="screen-actions">
        <button type="button" class="btn btn-link" data-action="TOUCH" id="fallback" style="visibility:hidden">Nie działa? Potwierdź próbę</button>
      </div>`,
    mount(el) {
      const dot = el.querySelector('#dot');
      const board = el.querySelector('#board');
      let done = false;
      const hit = (ev) => {
        if (done) return;
        done = true;
        ev.preventDefault();
        const r = board.getBoundingClientRect();
        const fromPointer = ev.type === 'pointerdown';
        const x = fromPointer ? ev.clientX - r.left : r.width / 2;
        const y = fromPointer ? ev.clientY - r.top : r.height / 2;
        const rip = document.createElement('span');
        rip.className = 'tap-ripple';
        rip.style.left = `${x}px`; rip.style.top = `${y}px`;
        board.appendChild(rip);
        dot.classList.add('hit');
        unlockAudio(); sfx.tap(); vibrate(35);
        setTimeout(() => { inputLockedUntil = 0; send('TOUCH'); }, 700);
      };
      dot.addEventListener('pointerdown', hit);
      // Klawiatura / czytniki ekranu
      dot.addEventListener('click', (ev) => { if (ev.detail === 0) hit(ev); });
      const t = setTimeout(() => { const f = el.querySelector('#fallback'); if (f) f.style.visibility = 'visible'; }, 3000);
      return () => clearTimeout(t);
    },
  };
}

function confirmView() {
  return {
    html: () => `
      <div class="screen-body">
        <div class="badge-big" aria-hidden="true">🧐</div>
        <h2>ALE NA PEWNO DOTKNĄŁEŚ?</h2>
        <p class="text">Komisja ołówkowa patrzy Ci prosto w oczy. Uczciwość to podstawa – na maturze i w życiu.</p>
      </div>
      <div class="screen-actions">
        ${btn('CONFIRM', '<span class="emoji" aria-hidden="true">🤞</span>TAK, PRZYSIĘGAM')}
        ${btn('RETRY', 'NIE, SPRÓBUJĘ JESZCZE RAZ', 'btn-ghost')}
      </div>`,
  };
}

const VIEWS = {
  WELCOME: {
    html: () => `
      <div class="screen-body">
        <span class="kicker">UPJPII · Operacja Kremówka</span>
        <div class="hero-art float">${kremowkaSVG({ cap: true, sparkles: true })}</div>
        <h1>WYGRAJ PRZEPIS NA KREMÓWKĘ MATURZYSTY!</h1>
        <p class="lead">Nie każdy bohater nosi pelerynę. Niektórzy po prostu zdają maturę i zasługują na kremówkę.</p>
        <p class="text">Przed Tobą kilka prób, które sprawdzą Twoją odwagę, determinację i gotowość do wielkich rzeczy.</p>
      </div>
      <div class="screen-actions">
        ${btn('START', '<span class="emoji" aria-hidden="true">🚀</span>PRZYSTĄP DO GRY', 'btn-primary btn-pulse')}
        <p class="footer-note"><strong>„Matura to nie przelewki. Kremówka już trochę tak.”</strong><br>Bez logowania. Bez zbierania danych. Z kremówką.</p>
      </div>`,
  },

  MATURZYSTA_CHECK: {
    html: () => `
      <div class="screen-body">
        <div class="badge-big" aria-hidden="true">🎓</div>
        <span class="kicker">Weryfikacja tożsamości</span>
        <h1>CZY JESTEŚ MATURZYSTĄ?</h1>
        <p class="text">Odpowiadaj szczerze. Kremówka wyczuje kłamstwo.</p>
      </div>
      <div class="screen-actions">
        ${btn('YES', 'TAK, WALCZĘ O ŚWIADECTWO DOJRZAŁOŚCI')}
        ${btn('NO', 'NIE, JESZCZE MAM CZAS', 'btn-ghost')}
      </div>`,
  },

  NORMAL_RECIPE: {
    html: () => `
      <div class="screen-body">
        <div class="hero-art small wobble">${kremowkaSVG({ face: 'happy' })}</div>
        <h2>„Jeszcze za młody na Kremówkę Maturzysty!”</h2>
        <p class="lead">Ale spokojnie. Kremówka nie dyskryminuje wiekiem. Dla Ciebie też mamy coś pysznego.</p>
        <div class="card card-gold">
          <p><strong>Kremówka Klasyczna</strong> – dwa chrupiące blaty, waniliowy krem i chmura cukru pudru. Prawdziwy przepis, z gramaturą i alergenami.</p>
        </div>
        <p class="small">A za rok–dwa wracaj na stoisko UPJPII po wersję dla maturzystów 😉</p>
      </div>
      <div class="screen-actions">
        ${downloadBtn('classic', 'POBIERZ PRZEPIS NA KREMÓWKĘ')}
        ${btn('RESTART', 'ZAGRAJ PONOWNIE', 'btn-ghost')}
      </div>`,
    mount() { sfx.success(); vibrate([20, 40, 20]); },
  },

  GET_PENCIL: {
    html: () => `
      <div class="screen-body">
        <div class="pencil-wrap float">${pencilSVG()}</div>
        <span class="kicker">Misja: zdobądź legendarny ołówek</span>
        <h2>KAŻDY MATURZYSTA POTRZEBUJE ODPOWIEDNIEGO NARZĘDZIA.</h2>
        <div class="card">
          <p>Podejdź do naszego stoiska UPJPII i poproś jednego z członków ekipy o <strong>legendarny ołówek lub długopis</strong>.</p>
          <p><em>Nie pytaj, dlaczego. To część procedury.</em></p>
        </div>
      </div>
      <div class="screen-actions">
        ${btn('HAVE_TOOL', '<span class="emoji" aria-hidden="true">✏️</span>MAM JUŻ NARZĘDZIE')}
      </div>`,
  },

  DOT_CHALLENGE_FIRST: dotView(1),
  DOT_CONFIRM_FIRST: confirmView(),

  PENCIL_ERROR: {
    html: () => `
      <div class="screen-body reveal">
        <div class="pencil-wrap error-pencil"><div class="shake-host">${pencilSVG({ broken: true })}</div></div>
        <h2 class="glitch-text">COŚ TU SIĘ NIE ZGADZA…</h2>
        <p class="lead">TEN OŁÓWEK JEST OSZUKANY. ALBO SIĘ ROZPAPIEŻYŁ.</p>
        <p class="text">Potrzebna będzie interwencja specjalna.</p>
      </div>
      <div class="screen-actions late">
        ${btn('NEXT', '<span class="emoji" aria-hidden="true">🆘</span>CO TERAZ?!')}
      </div>`,
    mount(el) {
      inputLockedUntil = performance.now() + 2200; // przycisk pojawia się po animacji
      el.classList.add('screen-shake');
      el.querySelector('.pencil-wrap .art').classList.add('shake');
      sfx.fail();
      vibrate([90, 60, 90, 60, 250]);
    },
  },

  FIGURINE_CHALLENGE: {
    html: () => `
      <div class="screen-body">
        <div class="halo-wrap">${haloSVG()}<div class="pencil-mini">${pencilSVG()}</div></div>
        <span class="kicker">Interwencja specjalna</span>
        <div class="card">
          <p><strong>Znajdź na naszym stoisku wydrukowaną w 3D figurkę Jana Pawła II.</strong> Dotknij jej delikatnie, aby przywrócić ołówkowi właściwą moc.</p>
        </div>
        <p class="lead" id="napapiezenie">Operacja napapieżenia w toku…</p>
        <p class="small">Telefon nie widzi figurki – liczymy na Twoje słowo honoru 🤝</p>
      </div>
      <div class="screen-actions">
        ${btn('FIGURINE_TOUCHED', '<span class="emoji" aria-hidden="true">✨</span>FIGURKA DOTKNIĘTA — NAPAPIEŻONO!', 'btn-gold')}
      </div>`,
  },

  PENCIL_RECALIBRATION: {
    html: () => `
      <div class="screen-body">
        <div class="halo-wrap">${haloSVG()}<div class="pencil-mini"><div class="shake-soft">${pencilSVG()}</div></div></div>
        <h2>Trwa napapieżanie…</h2>
        <div class="card loader">
          <ol class="loader-steps" id="steps">
            <li><span class="tick">✓</span><span>Kalibracja ołówka…</span></li>
            <li><span class="tick">✓</span><span>Przywracanie mocy…</span></li>
            <li><span class="tick">✓</span><span>Poziom kremówkowej energii: <span id="energy">0</span>%</span></li>
          </ol>
          <div class="meter"><div id="meter"></div></div>
        </div>
      </div>
      <div class="screen-actions"></div>`,
    mount(el) {
      sfx.magic();
      const items = [...el.querySelectorAll('#steps li')];
      const meter = el.querySelector('#meter');
      const energy = el.querySelector('#energy');
      const total = 3600;
      const t0 = performance.now();
      let raf = 0;
      let lastStep = -1;
      let finished = false;
      const tick = () => {
        const p = Math.min(1, (performance.now() - t0) / total);
        meter.style.width = `${Math.round(p * 100)}%`;
        const idx = Math.min(2, Math.floor(p * 3));
        if (idx !== lastStep) {
          items.forEach((li, i) => { li.classList.toggle('done', i < idx); li.classList.toggle('active', i === idx); });
          if (lastStep >= 0) { sfx.tick(); vibrate(15); }
          lastStep = idx;
        }
        if (idx === 2) energy.textContent = String(Math.round(Math.min(1, (p - 2 / 3) * 3) * 100));
        if (p < 1) raf = requestAnimationFrame(tick);
        else if (!finished) {
          finished = true;
          items.forEach((li) => { li.classList.add('done'); li.classList.remove('active'); });
          energy.textContent = '100';
          setTimeout(() => { inputLockedUntil = 0; send('DONE'); }, 700);
        }
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    },
  },

  PENCIL_RESTORED: {
    html: () => `
      <div class="screen-body">
        <div class="halo-wrap pop-in">${haloSVG()}<div class="pencil-mini">${pencilSVG()}</div></div>
        <h2>OŁÓWEK ZOSTAŁ POMYŚLNIE NAPAPIEŻONY!</h2>
        <p class="text">Moc przywrócona. Grafit lśni. Można działać.</p>
      </div>
      <div class="screen-actions">
        ${btn('BACK_TO_DOT', '<span class="emoji" aria-hidden="true">🎯</span>WRÓĆ DO KROPKI')}
      </div>`,
    mount() { sfx.success(); vibrate([30, 50, 30]); confetti({ count: 60, origin: { x: innerWidth / 2, y: innerHeight * 0.35 } }); },
  },

  DOT_CHALLENGE_SECOND: dotView(2),
  DOT_CONFIRM_SECOND: confirmView(),

  DOT_SUCCESS: {
    html: () => `
      <div class="screen-body">
        <div class="badge-big" aria-hidden="true">✅</div>
        <h2>TEST ZALICZONY. MOŻESZ PRZEJŚĆ DALEJ.</h2>
        <p class="text">Ołówek działa, kropka dotknięta, komisja usatysfakcjonowana.</p>
      </div>
      <div class="screen-actions">
        ${btn('NEXT', 'DALEJ <span class="emoji" aria-hidden="true">➜</span>')}
      </div>`,
    mount() { sfx.success(); vibrate([30, 40, 60]); confetti({ count: 90, origin: { x: innerWidth / 2, y: innerHeight * 0.3 } }); },
  },

  VOICE_CHALLENGE: {
    html: () => `
      <div class="screen-body">
        <span class="kicker">Próba głosu</span>
        <h2>OSTATNIA PRÓBA. TERAZ LICZY SIĘ TWÓJ GŁOS.</h2>
        <p class="text" id="voiceIntro">Każdy maturzysta ma swoją pieśń zwycięstwa. Twoja misja: zaśpiewać do telefonu początek <strong>Barki</strong>.</p>
        <div class="mic-wrap mic-idle" id="micWrap">${micSVG()}</div>
        <div class="voice-panel" id="voicePanel" hidden>
          <div class="bars" id="bars">${'<span></span>'.repeat(12)}</div>
          <div class="voice-meta">
            <svg class="ring-progress" viewBox="0 0 108 108" aria-hidden="true"><circle class="bg" cx="54" cy="54" r="46"/><circle class="fg" id="ring" cx="54" cy="54" r="46" stroke-dasharray="289" stroke-dashoffset="289"/></svg>
            <span class="pct" id="pct">0%</span>
          </div>
          <p class="voice-status" id="voiceStatus">Słucham…</p>
        </div>
        <p class="small" id="privacy">To zabawowa próba aktywności głosowej: liczymy tylko, jak długo słychać Twój głos. Nie rozpoznajemy melodii ani słów i <strong>niczego nie nagrywamy</strong>.</p>
        <div class="notice" id="micError" hidden></div>
      </div>
      <div class="screen-actions">
        ${btn('', '<span class="emoji" aria-hidden="true">🎤</span>URUCHOM MIKROFON', 'btn-primary btn-pulse', 'id="micStart"')}
        ${btn('MANUAL_CONFIRM', 'ZAŚPIEWAŁEM PRZED OBSŁUGĄ STOISKA', 'btn-ghost', 'id="manual" hidden')}
        <button type="button" class="btn btn-link" id="noMic">Nie mogę użyć mikrofonu</button>
      </div>`,
    mount(el) {
      const $ = (s) => el.querySelector(s);
      const startBtn = $('#micStart');
      const manual = $('#manual');
      const noMic = $('#noMic');
      const errBox = $('#micError');
      const panel = $('#voicePanel');
      const micWrap = $('#micWrap');
      const bars = [...el.querySelectorAll('#bars span')];
      const ring = $('#ring');
      const pct = $('#pct');
      const status = $('#voiceStatus');
      let meter = null;
      let slowTimer = 0;
      let lastPct = -1;

      const showManual = () => { manual.hidden = false; noMic.hidden = true; };
      noMic.addEventListener('click', () => { sfx.click(); showManual(); manual.focus(); });

      startBtn.addEventListener('click', async () => {
        unlockAudio();
        startBtn.disabled = true;
        errBox.hidden = true;
        meter = new VoiceMeter({
          targetSeconds: 4,
          barCount: bars.length,
          onLevel(level, b) {
            micWrap.style.setProperty('--lvl', (0.7 + level * 0.6).toFixed(2));
            for (let i = 0; i < bars.length; i++) bars[i].style.height = `${Math.max(8, Math.round(b[i] * 100))}%`;
          },
          onProgress(p, active) {
            ring.style.strokeDashoffset = String(289 * (1 - p));
            const v = Math.round(p * 100);
            if (v !== lastPct) { pct.textContent = `${v}%`; lastPct = v; }
            status.textContent = active ? 'Śpiewaj śmiało! Scena należy do Ciebie!' : (p > 0 ? 'Nie przestawaj! Głośniej! 🎶' : 'Słucham… zaczynaj!');
          },
          onDone() {
            clearTimeout(slowTimer);
            status.textContent = 'BRAWO! 🎉';
            sfx.success(); vibrate([40, 40, 120]);
            setTimeout(() => { inputLockedUntil = 0; send('VOICE_DONE'); }, 900);
          },
        });
        try {
          await meter.start();
          micWrap.classList.remove('mic-idle');
          panel.hidden = false;
          startBtn.hidden = true;
          $('#voiceIntro').hidden = true;
          slowTimer = setTimeout(() => {
            errBox.className = 'notice info';
            errBox.textContent = 'Mikrofon słabo Cię słyszy (na targach bywa głośno!). Podejdź bliżej telefonu – albo zaśpiewaj przed obsługą stoiska.';
            errBox.hidden = false;
            showManual();
          }, 20000);
        } catch (err) {
          meter = null;
          startBtn.disabled = false;
          startBtn.innerHTML = '<span class="emoji" aria-hidden="true">🔁</span>SPRÓBUJ PONOWNIE';
          startBtn.classList.remove('btn-pulse');
          errBox.className = 'notice';
          errBox.textContent = micErrorMessage(err);
          errBox.hidden = false;
          showManual();
          sfx.fail(); vibrate([60, 40, 60]);
        }
      });

      // Wyjście z karty/aplikacji wyłącza mikrofon i resetuje ekran próby.
      const onHide = () => { if (document.hidden && meter) go('VOICE_CHALLENGE'); };
      document.addEventListener('visibilitychange', onHide);
      return () => {
        clearTimeout(slowTimer);
        document.removeEventListener('visibilitychange', onHide);
        if (meter) meter.stop();
      };
    },
  },

  VOICE_SUCCESS: {
    html: () => `
      <div class="screen-body">
        <div class="badge-big" aria-hidden="true">🎤</div>
        <span class="kicker">Wszystkie próby zaliczone</span>
        <h2>MISJA ZAKOŃCZONA. MATURA NIE MA Z TOBĄ SZANS!</h2>
      </div>
      <div class="screen-actions">
        ${btn('NEXT', '<span class="emoji" aria-hidden="true">🎁</span>ODBIERZ NAGRODĘ', 'btn-gold btn-pulse')}
      </div>`,
    mount() { sfx.success(); confetti({ count: 80, origin: { x: innerWidth / 2, y: innerHeight * 0.3 } }); },
  },

  FINAL_REWARD: {
    html: () => `
      <div class="screen-body compact">
        <div class="hero-art tiny float">${kremowkaSVG({ cap: true, sparkles: true, face: 'wow' })}</div>
        <h2>GRATULACJE! ZDOBYWASZ KREMÓWKOWE BŁOGOSŁAWIEŃSTWO MATURZYSTY!</h2>
        <p class="lead">Legenda głosi, że szczęście na maturze sprzyja tym, którzy odbiorą breloczek ze stoiska UPJPII i zjedzą przy nim własnoręcznie przygotowaną kremówkę.</p>
        <p class="text">Nie gwarantujemy setki z matematyki. Ale dobry humor już zdecydowanie tak.</p>
        <div class="card card-gold">
          <ol class="tasks">
            <li><span class="num">1</span><span>Odbierz pamiątkowy breloczek od obsługi stoiska UPJPII<span class="sub">— jeśli jest dostępny. Pokaż ten ekran ekipie!</span></span></li>
            <li><span class="num">2</span><span>Pobierz swój dedykowany przepis na Kremówkę Maturzysty</span></li>
          </ol>
        </div>
      </div>
      <div class="screen-actions">
        ${downloadBtn('maturzysta', 'POBIERZ TAJNY PRZEPIS MATURZYSTY')}
        ${btn('RESTART', 'ZAGRAJ PONOWNIE', 'btn-ghost')}
      </div>`,
    mount() {
      sfx.fanfare();
      vibrate([50, 50, 50, 50, 200]);
      confetti({ count: 220 });
      const again = setTimeout(() => confetti({ count: 120 }), 1400);
      return () => clearTimeout(again);
    },
  },
};

/* =====================================================================
   OBSŁUGA ZDARZEŃ
   ===================================================================== */
$stage.addEventListener('click', (ev) => {
  const dl = ev.target.closest('[data-download]');
  if (dl) { unlockAudio(); sfx.success(); vibrate(25); return; }
  const b = ev.target.closest('[data-action]');
  if (!b || b.disabled || !b.dataset.action) return;
  unlockAudio();
  sfx.click();
  vibrate(12);
  send(b.dataset.action);
});

// Pierwszy dotyk gdziekolwiek odblokowuje dźwięk (iOS).
window.addEventListener('pointerdown', unlockAudio, { once: true, capture: true });

// Wyciszanie
const $mute = document.getElementById('muteBtn');
const syncMute = () => {
  $mute.setAttribute('aria-pressed', String(isMuted()));
  $mute.setAttribute('aria-label', isMuted() ? 'Włącz dźwięki' : 'Wycisz dźwięki');
};
$mute.addEventListener('click', () => { setMuted(!isMuted()); syncMute(); unlockAudio(); sfx.click(); });
syncMute();

// Restart z potwierdzeniem
const $sheet = document.getElementById('sheet');
const $restartBtn = document.getElementById('restartBtn');
const closeSheet = () => { $sheet.hidden = true; $restartBtn.focus(); };
$restartBtn.addEventListener('click', () => {
  sfx.click();
  if (SAFE_STATES.has(state)) { go('WELCOME'); return; }
  $sheet.hidden = false;
  document.getElementById('sheetNo').focus();
});
document.getElementById('sheetYes').addEventListener('click', () => { $sheet.hidden = true; go('WELCOME'); });
document.getElementById('sheetNo').addEventListener('click', closeSheet);
$sheet.addEventListener('click', (e) => { if (e.target === $sheet) closeSheet(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$sheet.hidden) closeSheet(); });

// Ostrzeżenie przed przypadkowym opuszczeniem strony w trakcie gry
// (stan i tak przetrwa przeładowanie dzięki sessionStorage).
window.addEventListener('beforeunload', (e) => {
  if (!SAFE_STATES.has(state)) { e.preventDefault(); e.returnValue = ''; }
});

// Tryb offline
const $offline = document.getElementById('offlineBadge');
const syncOnline = () => { $offline.hidden = navigator.onLine; };
window.addEventListener('online', syncOnline);
window.addEventListener('offline', syncOnline);
syncOnline();

// Service worker (PWA + offline). Wymaga HTTPS lub localhost.
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
  window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
}

render();
