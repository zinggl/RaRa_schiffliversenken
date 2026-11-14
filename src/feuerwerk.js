// Feuerwerk für den Gewinner: Raketen steigen auf und zerplatzen in Funken.
// Gezeichnet auf einer eigenen Leinwand in voller Auflösung (scharf auf dem iPad).
import { knall } from './geraeusche.js';

export function feuerwerkStarten(farben) {
  const leinwand = document.createElement('canvas');
  leinwand.className = 'feuerwerk';
  document.body.appendChild(leinwand);
  const g = leinwand.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let B = 0;
  let H = 0;
  const groesse = () => {
    B = window.innerWidth;
    H = window.innerHeight;
    leinwand.width = B * dpr;
    leinwand.height = H * dpr;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  groesse();
  window.addEventListener('resize', groesse);

  const raketen = [];
  const funken = [];
  let naechste = 0;
  let letzte = performance.now();
  let laeuft = true;

  function rakete() {
    raketen.push({
      x: B * (0.15 + Math.random() * 0.7),
      y: H,
      vy: -(H * 0.9 + Math.random() * H * 0.35),
      hoehe: H * (0.15 + Math.random() * 0.3),
      farbe: farben[Math.floor(Math.random() * farben.length)],
    });
  }

  function zerplatzen(r) {
    const anzahl = 70 + Math.floor(Math.random() * 40);
    const zweite = farben[Math.floor(Math.random() * farben.length)];
    for (let i = 0; i < anzahl; i++) {
      const winkel = (i / anzahl) * Math.PI * 2 + Math.random() * 0.1;
      const tempo = (0.35 + Math.random() * 0.65) * Math.min(B, H) * 0.42;
      funken.push({
        x: r.x,
        y: r.y,
        vx: Math.cos(winkel) * tempo,
        vy: Math.sin(winkel) * tempo,
        leben: 1.2 + Math.random() * 0.8,
        alter: 0,
        farbe: Math.random() < 0.7 ? r.farbe : zweite,
      });
    }
    knall();
  }

  function bild(jetzt) {
    if (!laeuft) return;
    const dt = Math.min((jetzt - letzte) / 1000, 0.05);
    letzte = jetzt;
    naechste -= dt;
    if (naechste <= 0) {
      rakete();
      naechste = 0.45 + Math.random() * 0.6;
    }

    // Leichte Spur: altes Bild verblasst langsam
    g.globalCompositeOperation = 'destination-out';
    g.fillStyle = 'rgba(0,0,0,0.22)';
    g.fillRect(0, 0, B, H);
    g.globalCompositeOperation = 'lighter';

    for (let i = raketen.length - 1; i >= 0; i--) {
      const r = raketen[i];
      r.vy += H * 0.9 * dt; // Schwerkraft bremst
      r.y += r.vy * dt;
      g.fillStyle = 'rgba(255,230,180,0.9)';
      g.beginPath();
      g.arc(r.x, r.y, 2, 0, Math.PI * 2);
      g.fill();
      if (r.y <= r.hoehe || r.vy >= 0) {
        zerplatzen(r);
        raketen.splice(i, 1);
      }
    }

    for (let i = funken.length - 1; i >= 0; i--) {
      const f = funken[i];
      f.alter += dt;
      if (f.alter >= f.leben) {
        funken.splice(i, 1);
        continue;
      }
      f.vx *= 1 - 1.6 * dt; // Luft bremst
      f.vy *= 1 - 1.6 * dt;
      f.vy += 120 * dt; // fallen langsam
      f.x += f.vx * dt;
      f.y += f.vy * dt;
      const rest = 1 - f.alter / f.leben;
      g.globalAlpha = rest;
      g.fillStyle = f.farbe;
      g.beginPath();
      g.arc(f.x, f.y, 1.4 + rest * 1.4, 0, Math.PI * 2);
      g.fill();
    }
    g.globalAlpha = 1;
    requestAnimationFrame(bild);
  }
  requestAnimationFrame(bild);

  // Gibt eine Funktion zum Beenden zurück
  return () => {
    laeuft = false;
    window.removeEventListener('resize', groesse);
    leinwand.remove();
  };
}
