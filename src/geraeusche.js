// Geräusche, direkt im Gerät erzeugt (keine Sound-Dateien nötig).
// Werkstatt: «geraeusche» (ein/aus) und «lautstaerke».
import { wert } from './werkstatt/werte.js';

let ctx = null;
let rauschPuffer = null;

// Auf dem iPad darf Ton erst nach einem Antippen starten – darum erst beim ersten Geräusch
function kontext() {
  if (!wert('geraeusche')) return null;
  try {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    if (!rauschPuffer) {
      rauschPuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const d = rauschPuffer.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    return ctx;
  } catch {
    return null;
  }
}

// Lautstärke-Verlauf: schnell an, dann ausklingen
function huelle(c, ziel, start, laut, an, dauer) {
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0001, laut * (wert('lautstaerke') ?? 0.7)), start + an);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dauer);
  g.connect(ziel);
  return g;
}

function rauschen(c, start, dauer) {
  const q = c.createBufferSource();
  q.buffer = rauschPuffer;
  q.start(start, Math.random(), dauer + 0.1);
  return q;
}

function filter(c, typ, frequenz, q = 0.7) {
  const f = c.createBiquadFilter();
  f.type = typ;
  f.frequency.value = frequenz;
  f.Q.value = q;
  return f;
}

// Tiefer Schlag: Ton, der schnell nach unten fällt
function schlag(c, start, von, bis, dauer, laut) {
  const o = c.createOscillator();
  o.type = 'sine';
  o.frequency.setValueAtTime(von, start);
  o.frequency.exponentialRampToValueAtTime(bis, start + dauer);
  o.connect(huelle(c, c.destination, start, laut, 0.005, dauer));
  o.start(start);
  o.stop(start + dauer + 0.05);
}

export function kanone() {
  const c = kontext();
  if (!c) return;
  const t = c.currentTime;
  const f = filter(c, 'lowpass', 500);
  f.connect(huelle(c, c.destination, t, 1, 0.005, 0.7));
  rauschen(c, t, 0.7).connect(f);
  schlag(c, t, 140, 40, 0.35, 0.9);
}

export function explosion() {
  const c = kontext();
  if (!c) return;
  const t = c.currentTime;
  const f = filter(c, 'lowpass', 1200);
  f.frequency.setValueAtTime(1500, t);
  f.frequency.exponentialRampToValueAtTime(180, t + 1.4);
  f.connect(huelle(c, c.destination, t, 1, 0.01, 1.5));
  rauschen(c, t, 1.5).connect(f);
  schlag(c, t, 90, 30, 0.6, 1);
  // Knistern vom Feuer
  for (let i = 0; i < 6; i++) {
    const s = t + 0.25 + Math.random() * 0.9;
    const k = filter(c, 'highpass', 2500);
    k.connect(huelle(c, c.destination, s, 0.25, 0.002, 0.06));
    rauschen(c, s, 0.08).connect(k);
  }
}

export function platsch() {
  const c = kontext();
  if (!c) return;
  const t = c.currentTime;
  const hoch = filter(c, 'bandpass', 1400, 0.8);
  hoch.connect(huelle(c, c.destination, t, 0.7, 0.02, 0.6));
  rauschen(c, t, 0.6).connect(hoch);
  const tief = filter(c, 'bandpass', 380, 1.2);
  tief.connect(huelle(c, c.destination, t + 0.05, 0.6, 0.03, 0.9));
  rauschen(c, t + 0.05, 0.9).connect(tief);
}

// Tiefes Schiffshorn, wenn ein Schiff versenkt ist
export function horn() {
  const c = kontext();
  if (!c) return;
  const t = c.currentTime;
  const f = filter(c, 'lowpass', 600);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.35 * (wert('lautstaerke') ?? 0.7), t + 0.25);
  g.gain.setValueAtTime(0.35 * (wert('lautstaerke') ?? 0.7), t + 1.3);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 1.9);
  f.connect(g).connect(c.destination);
  for (const frequenz of [73, 110, 146]) {
    const o = c.createOscillator();
    o.type = 'sawtooth';
    o.frequency.value = frequenz;
    o.connect(f);
    o.start(t);
    o.stop(t + 2);
  }
}

// Knall einer Feuerwerksrakete
export function knall() {
  const c = kontext();
  if (!c) return;
  const t = c.currentTime;
  const f = filter(c, 'highpass', 700);
  f.connect(huelle(c, c.destination, t, 0.45, 0.003, 0.35));
  rauschen(c, t, 0.35).connect(f);
  schlag(c, t, 120, 50, 0.2, 0.4);
}
