// Ein Tigerhai, der langsam durchs Meer zieht (unter dem Schiff durch).
// Breite stumpfe Schnauze, Querstreifen, heller Bauch, Lichtflecken auf dem Rücken.
// Geheimtipp: 2 Sekunden auf den Hai drücken öffnet die Werkstatt.
// Solange man drückt, hält der Hai an, und ein goldener Ring füllt sich.
import { werkstattOeffnen } from './werkstatt/werkstatt.js';

const DRUECKEN_MS = 2000; // so lange muss man auf den Hai drücken

// Körperform, wird auch als Schablone gebraucht (Streifen, Bauch und Lichtflecken bleiben im Körper)
const KOERPER = `M74,57 C110,45 142,35 192,33 C242,31 278,35 296,44
  C308,49 313,56 309,62 C305,68 294,72 278,75 C240,82 182,84 140,78 C110,74 90,68 74,64 Z`;

// Querstreifen wie beim Tigerhai: unregelmässig, teils unterbrochen, zum Schwanz hin deutlicher
const STREIFEN = [
  // [x oben, Biegung, Länge (0–1), Breite, Stärke]
  [112, -4, 0.9, 3.2, 0.2], [124, -6, 0.6, 2.4, 0.17], [137, -3, 0.95, 3.6, 0.19],
  [151, -5, 0.7, 2.6, 0.15], [163, -4, 0.85, 3.0, 0.14], [178, -6, 0.55, 2.2, 0.12],
  [192, -3, 0.75, 2.8, 0.11], [207, -5, 0.5, 2.0, 0.09], [221, -4, 0.6, 2.2, 0.08],
  [236, -3, 0.4, 1.8, 0.06],
];
function streifen() {
  return STREIFEN.map(([x, bogen, laenge, breite, staerke]) => {
    const unten = 34 + 38 * laenge;
    return `<path d="M${x},33 Q${x + bogen},${(33 + unten) / 2} ${x - 2},${unten}" stroke="#1d2626"
      stroke-width="${breite}" stroke-linecap="round" fill="none" opacity="${staerke}"/>`;
  }).join('');
}

const HAI_SVG = `
<svg viewBox="0 0 320 120" aria-hidden="true">
  <defs>
    <linearGradient id="hai-ruecken" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#3a4645"/>
      <stop offset="0.45" stop-color="#5f6c6b"/>
      <stop offset="0.75" stop-color="#7f8a88"/>
    </linearGradient>
    <linearGradient id="hai-bauch" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#dfe6e6"/>
      <stop offset="1" stop-color="#b9c6c8"/>
    </linearGradient>
    <linearGradient id="hai-flosse" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#3d4a4a"/>
      <stop offset="1" stop-color="#55615f"/>
    </linearGradient>
    <clipPath id="hai-koerper"><path d="${KOERPER}"/></clipPath>
    <filter id="hai-weich" x="-20%" y="-50%" width="140%" height="200%">
      <feGaussianBlur stdDeviation="3"/>
    </filter>
  </defs>

  <!-- Schwanzflosse: oberer Lappen lang und schlank, unterer klein; bewegt sich leicht -->
  <g class="hai-schwanz">
    <path d="M78,57 Q56,46 30,10 Q24,4 26,12 Q36,36 52,58 Q44,70 36,84 Q38,86 42,82 Q58,72 78,65 Z"
          fill="url(#hai-flosse)"/>
  </g>

  <!-- Rückenflosse hoch und nach hinten geschwungen, zweite Rückenflosse klein -->
  <path d="M168,37 Q180,14 203,4 Q198,22 218,35 Z" fill="url(#hai-flosse)"/>
  <path d="M104,49 Q108,41 116,38 Q114,45 120,48 Z" fill="#3d4a4a"/>

  <!-- Körper -->
  <path d="${KOERPER}" fill="url(#hai-ruecken)"/>
  <g clip-path="url(#hai-koerper)">
    ${streifen()}
    <!-- Heller Bauch mit klarer Grenze, beginnt unter dem Auge -->
    <path d="M60,69 Q110,66 160,70 Q215,73 262,64 Q286,59 300,58 L330,58 L330,120 L60,120 Z" fill="url(#hai-bauch)"/>
    <!-- Lichtflecken von der Sonne auf dem Rücken -->
    <g filter="url(#hai-weich)" fill="#ffe9b8" opacity="0.62">
      <ellipse cx="240" cy="36" rx="30" ry="4.5"/>
      <ellipse cx="200" cy="37" rx="14" ry="3.5"/>
      <ellipse cx="165" cy="41" rx="18" ry="3.5"/>
      <ellipse cx="284" cy="43" rx="11" ry="3"/>
      <ellipse cx="120" cy="50" rx="10" ry="2.5"/>
    </g>
    <!-- leichter Schatten an der Unterseite -->
    <path d="M90,74 Q180,86 300,66 L300,90 L90,90 Z" fill="#5d6b6d" opacity="0.25"/>
  </g>

  <!-- Afterflosse und Bauchflosse -->
  <path d="M110,72 Q112,80 118,84 Q120,77 126,74 Z" fill="#4a5655"/>
  <path d="M150,79 Q150,88 156,94 Q160,85 170,81 Z" fill="#4a5655"/>

  <!-- Lange Brustflosse, schräg nach hinten -->
  <path d="M244,73 Q232,88 204,104 Q200,107 206,106 Q232,96 258,77 Z" fill="url(#hai-flosse)"/>

  <!-- Kiemenspalten -->
  <path d="M246,50 Q243,60 246,71 M252,49 Q249,59 252,71 M258,49 Q255,59 258,70 M264,49 Q261,58 264,69"
        stroke="#2c3636" stroke-width="0.8" fill="none" opacity="0.4"/>

  <!-- Breite, stumpfe Schnauze: Auge, Nasenloch, Maul -->
  <ellipse cx="287" cy="50" rx="2.6" ry="2.3" fill="#0b0f10"/>
  <path d="M300,55.5 Q302.5,56.5 305,55.5" stroke="#283232" stroke-width="0.9" fill="none" opacity="0.8"/>
  <!-- Maul liegt unter der Schnauze, nur als feine Kante sichtbar -->
  <path d="M302,67 Q294,72.5 280,74" stroke="#7d8a8b" stroke-width="1" fill="none" opacity="0.7"/>
</svg>`;

// Einmal beim Spielstart aufrufen. Der Hai hat eine eigene Ebene über dem Spiel,
// damit man ihn antippen kann.
export function haiStarten() {
  const ebene = document.createElement('div');
  ebene.className = 'hai-ebene';
  const hai = document.createElement('div');
  hai.className = 'hai';
  hai.innerHTML = `
    <svg class="hai-ring" viewBox="0 0 100 100" aria-hidden="true">
      <circle class="hai-ring-kreis" cx="50" cy="50" r="48" pathLength="100"/>
    </svg>
    ${HAI_SVG}`;
  ebene.appendChild(hai);
  document.body.appendChild(ebene);
  langDrueckenEinrichten(hai);
}

function langDrueckenEinrichten(hai) {
  const kreis = hai.querySelector('.hai-ring-kreis');
  let start = null;
  let bild = null;

  const abbrechen = () => {
    start = null;
    cancelAnimationFrame(bild);
    kreis.style.strokeDashoffset = 100;
    hai.classList.remove('drueckt'); // Hai schwimmt weiter
  };

  // Ring füllen, solange der Finger drauf bleibt
  const weiter = () => {
    if (start === null) return;
    const anteil = Math.min((performance.now() - start) / DRUECKEN_MS, 1);
    kreis.style.strokeDashoffset = 100 - anteil * 100;
    if (anteil >= 1) {
      abbrechen();
      if (navigator.vibrate) navigator.vibrate(50);
      werkstattOeffnen();
      return;
    }
    bild = requestAnimationFrame(weiter);
  };

  hai.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    if (document.querySelector('.werkstatt')) return;
    start = performance.now();
    hai.classList.add('drueckt'); // Hai hält an
    bild = requestAnimationFrame(weiter);
  });
  for (const art of ['pointerup', 'pointerleave', 'pointercancel']) {
    hai.addEventListener(art, abbrechen);
  }
  hai.addEventListener('contextmenu', (e) => e.preventDefault());
}
