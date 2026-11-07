// Efekty: dźwięki (syntezowane Web Audio – zero plików), wibracje, konfetti.

const MUTE_KEY = 'kremowka-muted';

let ctx = null;
let muted = false;
try { muted = localStorage.getItem(MUTE_KEY) === '1'; } catch { /* prywatny tryb */ }

export function isMuted() { return muted; }
export function setMuted(v) {
  muted = !!v;
  try { localStorage.setItem(MUTE_KEY, muted ? '1' : '0'); } catch { /* ignoruj */ }
}

/** Musi zostać wywołane w obsłudze gestu użytkownika (iOS). */
export function unlockAudio() {
  try {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
  } catch { /* brak audio – trudno */ }
}

function tone({ freq = 440, to = null, dur = 0.12, type = 'sine', vol = 0.18, delay = 0 }) {
  if (muted || !ctx) return;
  const t0 = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

export const sfx = {
  click() { tone({ freq: 660, to: 880, dur: 0.07, type: 'triangle', vol: 0.12 }); },
  tap() { tone({ freq: 520, to: 1040, dur: 0.15, type: 'sine', vol: 0.2 }); },
  success() {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone({ freq: f, dur: 0.18, type: 'triangle', vol: 0.16, delay: i * 0.09 }));
  },
  fanfare() {
    const notes = [523.25, 659.25, 783.99, 659.25, 783.99, 1046.5];
    notes.forEach((f, i) => tone({ freq: f, dur: i === notes.length - 1 ? 0.5 : 0.14, type: 'square', vol: 0.07, delay: i * 0.12 }));
    notes.forEach((f, i) => tone({ freq: f / 2, dur: 0.14, type: 'triangle', vol: 0.1, delay: i * 0.12 }));
  },
  fail() {
    // „wah-wah-wah-waaah”
    [392, 370, 349].forEach((f, i) => tone({ freq: f, to: f * 0.97, dur: 0.28, type: 'sawtooth', vol: 0.07, delay: i * 0.32 }));
    tone({ freq: 330, to: 262, dur: 0.8, type: 'sawtooth', vol: 0.07, delay: 0.96 });
  },
  magic() {
    for (let i = 0; i < 8; i++) tone({ freq: 900 + i * 180, dur: 0.12, type: 'sine', vol: 0.08, delay: i * 0.06 });
  },
  tick() { tone({ freq: 1200, dur: 0.04, type: 'square', vol: 0.05 }); },
};

export function vibrate(pattern) {
  try { if (navigator.vibrate) navigator.vibrate(pattern); } catch { /* iOS nie wspiera – OK */ }
}

// ---------------- Konfetti ----------------
const canvas = document.getElementById('confetti');
const cctx = canvas ? canvas.getContext('2d') : null;
let parts = [];
let raf = 0;
const COLORS = ['#8a1538', '#d9a521', '#f6d77a', '#e8b931', '#ffffff', '#c43a62', '#f0b85a'];

function resize() {
  if (!canvas) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  cctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener('resize', resize);
resize();

export function confetti({ count = 140, origin = null } = {}) {
  if (!cctx) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const n = reduced ? Math.round(count / 4) : count;
  const W = innerWidth, H = innerHeight;
  for (let i = 0; i < n; i++) {
    const fromSide = origin === null;
    const x = fromSide ? (i % 2 ? -10 : W + 10) : origin.x;
    const y = fromSide ? H * 0.65 : origin.y;
    const angle = fromSide
      ? (i % 2 ? -Math.PI / 3 : -2 * Math.PI / 3) + (Math.random() - 0.5) * 0.7
      : Math.random() * Math.PI * 2;
    const speed = fromSide ? 9 + Math.random() * 9 : 3 + Math.random() * 7;
    const kremowka = Math.random() < 0.12;
    parts.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      w: kremowka ? 16 : 6 + Math.random() * 6,
      h: kremowka ? 12 : 10 + Math.random() * 8,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      color: COLORS[(Math.random() * COLORS.length) | 0],
      kremowka,
      life: 0,
      max: 180 + Math.random() * 90,
    });
  }
  if (!raf) raf = requestAnimationFrame(step);
}

function drawKremowka(p) {
  const { w, h } = p;
  cctx.fillStyle = '#eaa94c'; cctx.fillRect(-w / 2, -h / 2, w, h * 0.28);
  cctx.fillStyle = '#fff3c4'; cctx.fillRect(-w / 2, -h / 2 + h * 0.28, w, h * 0.44);
  cctx.fillStyle = '#d98f33'; cctx.fillRect(-w / 2, h / 2 - h * 0.28, w, h * 0.28);
}

function step() {
  const H = innerHeight;
  cctx.clearRect(0, 0, innerWidth, H);
  parts = parts.filter((p) => p.life < p.max && p.y < H + 40);
  for (const p of parts) {
    p.life++;
    p.vx *= 0.985;
    p.vy = p.vy * 0.985 + 0.22;
    p.x += p.vx + Math.sin(p.life / 12) * 0.6;
    p.y += p.vy;
    p.rot += p.vr;
    cctx.save();
    cctx.globalAlpha = Math.min(1, (p.max - p.life) / 40);
    cctx.translate(p.x, p.y);
    cctx.rotate(p.rot);
    if (p.kremowka) drawKremowka(p);
    else {
      cctx.fillStyle = p.color;
      cctx.scale(1, Math.cos(p.life / 6));
      cctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    }
    cctx.restore();
  }
  if (parts.length) raf = requestAnimationFrame(step);
  else { raf = 0; cctx.clearRect(0, 0, innerWidth, H); }
}
