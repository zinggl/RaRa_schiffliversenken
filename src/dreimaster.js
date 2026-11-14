// Der Dreimaster fürs Logo, als Vektorgrafik (SVG).
// SVG bleibt bei jeder Grösse gestochen scharf, auch auf dem Retina-Bildschirm vom iPad.
// Das Wasser unten nimmt die Meerfarbe aus der Werkstatt (CSS-Variable --meer).

// Ein Segel, das sich im Wind nach vorne wölbt.
// mitte = Mast, oben/unten = Rahen, breite = Segelbreite
function segel(mitte, oben, unten, breite) {
  const l = mitte - breite / 2;
  const r = mitte + breite / 2;
  const m = (oben + unten) / 2;
  return `
    <path class="segel" d="M${l},${oben} L${r},${oben}
      Q${r + 7},${m} ${r + 3},${unten}
      Q${mitte},${unten + 13} ${l - 3},${unten}
      Q${l - 7},${m} ${l},${oben} Z"/>
    <path class="segel-naht" d="M${mitte - breite / 6},${oben + 2} Q${mitte - breite / 6 + 3},${m} ${mitte - breite / 6},${unten + 3}
      M${mitte + breite / 6},${oben + 2} Q${mitte + breite / 6 + 3},${m} ${mitte + breite / 6},${unten + 3}"/>
    <line class="rahe" x1="${l - 6}" y1="${oben}" x2="${r + 6}" y2="${oben}"/>`;
}

// Kleiner Wimpel oben am Mast
function wimpel(x, y, laenge) {
  return `<path class="wimpel" d="M${x},${y} Q${x + laenge / 2},${y + 1} ${x + laenge},${y + 5} Q${x + laenge / 2},${y + 7} ${x},${y + 10} Z"/>`;
}

// Kanonen-Luken am Rumpf
function luken() {
  let text = '';
  for (let x = 128; x <= 300; x += 34) {
    text += `<rect class="luke-rahmen" x="${x - 1.5}" y="${251.5}" width="15" height="13" rx="2"/>`;
    text += `<rect class="luke" x="${x}" y="253" width="12" height="10" rx="1.5"/>`;
  }
  return text;
}

export const DREIMASTER_SVG = `
<svg class="dreimaster" viewBox="0 0 400 330" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Dreimaster">
  <defs>
    <linearGradient id="holz" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#9c5a2b"/>
      <stop offset="1" stop-color="#5a2c10"/>
    </linearGradient>
    <linearGradient id="tuch" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#e6d6b4"/>
      <stop offset="0.45" stop-color="#fffbf1"/>
      <stop offset="1" stop-color="#eadbbb"/>
    </linearGradient>
    <!-- Das Wasser läuft an den Rändern weich aus, damit man keine Ecken sieht -->
    <radialGradient id="weich" cx="0.5" cy="0.3" r="0.5">
      <stop offset="0.55" stop-color="#fff"/>
      <stop offset="1" stop-color="#000"/>
    </radialGradient>
    <mask id="wasser-maske" maskContentUnits="userSpaceOnUse">
      <rect x="0" y="270" width="400" height="60" fill="url(#weich)"/>
    </mask>
    <clipPath id="rumpf-form">
      <path d="M46,212 L98,212 L102,236 L318,238 Q350,236 374,220 L354,262 Q332,293 290,299 L112,299 Q72,294 58,268 Z"/>
    </clipPath>
  </defs>

  <style>
    .dreimaster .tau { stroke: #3b2a1a; stroke-width: 1.3; opacity: 0.65; fill: none; }
    .dreimaster .mast { fill: #6b3a17; }
    .dreimaster .rahe { stroke: #5a2c10; stroke-width: 4; stroke-linecap: round; }
    .dreimaster .segel { fill: url(#tuch); stroke: #bfa77c; stroke-width: 1.5; stroke-linejoin: round; }
    .dreimaster .segel-naht { stroke: #d8c49c; stroke-width: 1; fill: none; }
    .dreimaster .wimpel { fill: #e03131; }
    .dreimaster .gold { fill: #e8b030; }
    .dreimaster .luke { fill: #2b1608; }
    .dreimaster .luke-rahmen { fill: #e8b030; }
    .dreimaster .planke { stroke: #3d1d08; stroke-width: 1.2; opacity: 0.45; }
    .dreimaster .fenster { fill: #ffe08a; stroke: #e8b030; stroke-width: 1; }
    .dreimaster .wasser { fill: var(--meer, #1971c2); }
    .dreimaster .gischt { fill: none; stroke: #ffffff; stroke-width: 3; stroke-linecap: round; opacity: 0.8; }
  </style>

  <!-- Taue (hinter den Segeln) -->
  <path class="tau" d="M50,212 L120,84 M120,84 L210,40 M210,40 L295,62 M295,62 L396,196
    M120,84 L100,236 M210,40 L176,238 M210,40 L246,238 M295,62 L270,238 M295,62 L330,238"/>

  <!-- Masten -->
  <rect class="mast" x="117" y="80" width="6" height="160" rx="2"/>
  <rect class="mast" x="207" y="36" width="7" height="204" rx="2"/>
  <rect class="mast" x="292" y="58" width="6" height="182" rx="2"/>

  <!-- Bugspriet und Klüver (Dreiecksegel vorne) -->
  <line x1="350" y1="232" x2="398" y2="194" stroke="#6b3a17" stroke-width="6" stroke-linecap="round"/>
  <path class="segel" d="M298,80 Q352,128 392,198 L304,198 Q312,140 298,80 Z"/>

  <!-- Segel: Besan (hinten), Gross (Mitte), Fock (vorne) -->
  ${segel(120, 98, 138, 54)}
  ${segel(120, 146, 204, 76)}
  ${segel(210, 56, 108, 76)}
  ${segel(210, 120, 202, 104)}
  ${segel(295, 78, 122, 64)}
  ${segel(295, 130, 202, 88)}

  <!-- Mastkorb am Grossmast -->
  <rect x="200" y="110" width="21" height="6" rx="2" fill="#5a2c10"/>

  <!-- Wimpel und Schweizer Fahne -->
  ${wimpel(123, 80, 24)}
  ${wimpel(298, 58, 26)}
  <rect x="214" y="22" width="22" height="22" rx="2" fill="#e03131"/>
  <rect x="223" y="26" width="4" height="14" fill="#fff"/>
  <rect x="218" y="31" width="14" height="4" fill="#fff"/>

  <!-- Rumpf -->
  <path d="M46,212 L98,212 L102,236 L318,238 Q350,236 374,220 L354,262 Q332,293 290,299 L112,299 Q72,294 58,268 Z"
        fill="url(#holz)" stroke="#3d1d08" stroke-width="2" stroke-linejoin="round"/>
  <g clip-path="url(#rumpf-form)">
    <line class="planke" x1="40" y1="252" x2="380" y2="252"/>
    <line class="planke" x1="40" y1="268" x2="380" y2="268"/>
    <line class="planke" x1="40" y1="283" x2="380" y2="283"/>
    <rect class="gold" x="40" y="240" width="340" height="6"/>
    <rect class="gold" x="40" y="224" width="62" height="3"/>
  </g>
  ${luken()}

  <!-- Heck mit Fenstern und Laterne -->
  <rect class="fenster" x="58" y="215" width="9" height="7" rx="1"/>
  <rect class="fenster" x="72" y="215" width="9" height="7" rx="1"/>
  <rect class="fenster" x="86" y="215" width="9" height="7" rx="1"/>
  <line x1="50" y1="212" x2="50" y2="198" stroke="#5a2c10" stroke-width="2"/>
  <circle cx="50" cy="196" r="5" fill="#ffd43b" stroke="#e8b030" stroke-width="1.5"/>

  <!-- Galionsfigur-Schnörkel am Bug -->
  <path d="M364,226 Q376,224 378,214" stroke="#e8b030" stroke-width="3" fill="none" stroke-linecap="round"/>

  <!-- Wasser vorne über dem Rumpf, damit das Schiff schwimmt -->
  <path class="wasser" mask="url(#wasser-maske)" d="M0,292 Q25,284 50,292 T100,292 T150,292 T200,292 T250,292 T300,292 T350,292 T400,292 L400,312 L0,312 Z"/>
  <path class="gischt" d="M60,290 Q78,282 96,290 M150,293 Q168,285 186,293 M240,293 Q258,285 276,293 M330,288 Q348,280 366,288"/>
</svg>`;
