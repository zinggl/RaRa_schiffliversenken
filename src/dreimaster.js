// Der Dreimaster fürs Logo, als Vektorgrafik (SVG) – scharf auf jedem Bildschirm.
// Das Licht kommt von rechts hinten (Abendsonne), darum sind die rechten Seiten heller.
// Die Wasserlinie liegt bei y = 290 (von 360). Was darunter liegt, ist «unter Wasser»
// und wird mit der Wasserfarbe (CSS-Variable --wasser-oben) überdeckt.
// Auf dem Deck steht ein Pirat mit Holzbein, der langsam den Säbel hebt.

export const WASSERLINIE = 290 / 360; // Anteil der Bildhöhe, für die Platzierung im CSS

// Masten: x-Position, Spitze, und die beiden Segel je [oben, unten, breite]
const MASTEN = [
  { x: 120, spitze: 86, segel: [[102, 140, 52], [148, 206, 74]] }, // Besan (hinten)
  { x: 210, spitze: 40, segel: [[60, 112, 74], [122, 204, 102]] }, // Grossmast
  { x: 295, spitze: 62, segel: [[80, 124, 62], [132, 204, 86]] }, // Fockmast (vorne)
];

const DECK = (x) => 231 + ((x - 104) / 212) * 4; // Höhe der Reling an Stelle x

function segel(mitte, oben, unten, breite) {
  const l = mitte - breite / 2;
  const r = mitte + breite / 2;
  const m = (oben + unten) / 2;
  const form = `M${l},${oben} L${r},${oben} Q${r + 6},${m} ${r + 2},${unten}
    Q${mitte},${unten + 10} ${l - 2},${unten} Q${l - 6},${m} ${l},${oben} Z`;
  let naehte = '';
  for (const anteil of [0.25, 0.5, 0.75]) {
    const x = l + breite * anteil;
    naehte += `M${x},${oben + 1} Q${x + 2},${m} ${x},${unten + 4 * Math.sin(anteil * Math.PI)}`;
  }
  return `
    <path d="${form}" fill="url(#tuch)"/>
    <path d="${form}" fill="url(#tuch-schatten)"/>
    <path d="${naehte}" stroke="#8c7d60" stroke-width="0.5" fill="none" opacity="0.5"/>
    <path d="${form}" fill="none" stroke="#7d6f55" stroke-width="0.7"/>
    <line x1="${l - 5}" y1="${oben}" x2="${r + 5}" y2="${oben}" stroke="#1f150d" stroke-width="2.6" stroke-linecap="round"/>`;
}

// Wanten: Taue von der Mastspitze schräg zur Reling
function wanten({ x, spitze }) {
  let linien = '';
  for (const versatz of [-24, -12, 12, 24]) {
    linien += `M${x},${spitze + 14} L${x + versatz},${DECK(x + versatz)} `;
  }
  return linien;
}

function luken() {
  let text = '';
  for (let x = 130; x <= 300; x += 28) {
    text += `<rect x="${x}" y="249" width="10" height="8" rx="1" fill="#0d0805" stroke="#6e5434" stroke-width="0.8"/>`;
  }
  return text;
}

const PIRAT = `
  <g class="pirat">
    <!-- Holzbein und Stiefel -->
    <path d="M168.5,221 L169.5,233" stroke="#7a5534" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M161,220 L160.5,229" stroke="#2a2420" stroke-width="3.2" stroke-linecap="round"/>
    <path d="M158.5,229 L163,229 L163.5,233 L157.5,233 Z" fill="#14100d"/>
    <!-- Hose bis zum Knie am Holzbein -->
    <path d="M167,218 L168.4,223" stroke="#2a2420" stroke-width="3.2" stroke-linecap="round"/>
    <!-- Langer Mantel -->
    <path d="M157,200 Q165,197 173,200 L175,222 Q165,225 155.5,222 Z" fill="#1f2a38"/>
    <path d="M165,201 L165,222" stroke="#121a24" stroke-width="0.8"/>
    <path d="M162.5,201 L165,206 L167.5,201 Z" fill="#e8e1d2"/>
    <!-- Gurt -->
    <rect x="156" y="210" width="18.5" height="2.4" fill="#3b2516"/>
    <rect x="164" y="209.6" width="2.6" height="3.2" fill="none" stroke="#a88a52" stroke-width="0.8"/>
    <!-- Linker Arm -->
    <path d="M157.5,202 Q154,209 155,216" stroke="#1f2a38" stroke-width="3.6" stroke-linecap="round" fill="none"/>
    <circle cx="155" cy="217" r="1.6" fill="#c8946a"/>
    <!-- Kopf mit Bart und Augenklappe -->
    <circle cx="165" cy="193" r="5.2" fill="#c8946a"/>
    <path d="M160.5,194 Q165,203 169.5,194 Q167,197 165,197 Q163,197 160.5,194 Z" fill="#241a12"/>
    <path d="M160,190 L170,194" stroke="#0d0b0a" stroke-width="0.7"/>
    <ellipse cx="163" cy="191.8" rx="1.6" ry="1.3" fill="#0d0b0a"/>
    <circle cx="167.3" cy="191.6" r="0.6" fill="#0d0b0a"/>
    <!-- Dreispitz -->
    <path d="M157,189.5 Q165,180 173,189.5 Q165,186.5 157,189.5 Z" fill="#14100d"/>
    <path d="M157.5,189.3 Q165,186.8 172.5,189.3" stroke="#a88a52" stroke-width="0.6" fill="none"/>
    <!-- Rechter Arm mit Säbel, hebt sich langsam -->
    <g class="pirat-arm">
      <path d="M172.5,202 L180,196" stroke="#1f2a38" stroke-width="3.6" stroke-linecap="round"/>
      <circle cx="181" cy="195.2" r="1.6" fill="#c8946a"/>
      <path d="M181,195 Q187,186 186,174" stroke="url(#stahl)" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      <path d="M178.5,196 L183.5,194.5" stroke="#a88a52" stroke-width="1.4" stroke-linecap="round"/>
    </g>
  </g>`;

const RUMPF = 'M44,206 L100,206 L104,231 L316,235 Q350,233 377,213 L362,258 Q346,300 302,318 L116,320 Q74,314 56,268 Z';

export const DREIMASTER_SVG = `
<svg class="dreimaster" viewBox="0 0 400 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Dreimaster mit Pirat">
  <defs>
    <linearGradient id="tuch" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#9c8f74"/>
      <stop offset="0.55" stop-color="#ddd2b8"/>
      <stop offset="1" stop-color="#f1e8d3"/>
    </linearGradient>
    <linearGradient id="tuch-schatten" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#3a2c18" stop-opacity="0.18"/>
      <stop offset="0.3" stop-color="#3a2c18" stop-opacity="0"/>
      <stop offset="1" stop-color="#3a2c18" stop-opacity="0.22"/>
    </linearGradient>
    <linearGradient id="holz" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#4f3320"/>
      <stop offset="0.6" stop-color="#2e1d11"/>
      <stop offset="1" stop-color="#1a1009"/>
    </linearGradient>
    <linearGradient id="holz-licht" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#000" stop-opacity="0.35"/>
      <stop offset="0.6" stop-color="#000" stop-opacity="0"/>
      <stop offset="1" stop-color="#e9a86a" stop-opacity="0.22"/>
    </linearGradient>
    <linearGradient id="mast" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#1a110a"/>
      <stop offset="1" stop-color="#4d3421"/>
    </linearGradient>
    <linearGradient id="stahl" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stop-color="#8d969e"/>
      <stop offset="1" stop-color="#eef1f3"/>
    </linearGradient>
    <linearGradient id="unterwasser-schiff" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" style="stop-color: var(--wasser-oben, #2f8fae)" stop-opacity="0.45"/>
      <stop offset="0.45" style="stop-color: var(--wasser-flach, #2a7f9c)" stop-opacity="0.9"/>
      <stop offset="0.75" style="stop-color: var(--wasser-flach, #2a7f9c)" stop-opacity="1"/>
    </linearGradient>
    <radialGradient id="laterne-schein">
      <stop offset="0" stop-color="#ffd38a" stop-opacity="0.9"/>
      <stop offset="1" stop-color="#ffb347" stop-opacity="0"/>
    </radialGradient>
    <clipPath id="ueber-wasser"><rect x="0" y="0" width="400" height="291"/></clipPath>
    <clipPath id="rumpf-form"><path d="${RUMPF}"/></clipPath>
  </defs>

  <!-- Stage zwischen den Mastspitzen und zum Bugspriet -->
  <path d="M120,92 L210,46 M210,46 L295,68 M295,68 L392,198 M120,92 L48,206 M295,80 L382,206"
        stroke="#1b120b" stroke-width="0.8" fill="none" opacity="0.75"/>

  <!-- Masten -->
  ${MASTEN.map((m) => `<rect x="${m.x - 3}" y="${m.spitze}" width="${m.x === 210 ? 6.5 : 5.5}" height="${DECK(m.x) - m.spitze + 2}" fill="url(#mast)"/>`).join('')}

  <!-- Bugspriet und Vorsegel -->
  <line x1="352" y1="228" x2="398" y2="192" stroke="url(#mast)" stroke-width="5" stroke-linecap="round"/>
  <path d="M297,84 Q340,130 382,203 L310,201 Q314,140 297,84 Z" fill="url(#tuch)"/>
  <path d="M297,84 Q340,130 382,203 L310,201 Q314,140 297,84 Z" fill="url(#tuch-schatten)" stroke="#7d6f55" stroke-width="0.7"/>

  <!-- Segel -->
  ${MASTEN.map((m) => m.segel.map(([o, u, b]) => segel(m.x, o, u, b)).join('')).join('')}

  <!-- Wanten -->
  <path d="${MASTEN.map(wanten).join('')}" stroke="#1b120b" stroke-width="0.55" fill="none" opacity="0.5"/>

  <!-- Mastkörbe -->
  <rect x="202" y="114" width="17" height="3.5" rx="1" fill="#1f150d"/>
  <rect x="288" y="126" width="14" height="3" rx="1" fill="#1f150d"/>

  <!-- Piratenflagge am Grossmast, Wimpel an den anderen Masten -->
  <path d="M213,30 Q226,26 238,31 Q236,38 238,46 Q226,41 213,45 Z" fill="#0e0d0c"/>
  <circle cx="225" cy="35.5" r="2.8" fill="#e9e4d8"/>
  <path d="M220.5,41.5 L229.5,38 M220.5,38 L229.5,41.5" stroke="#e9e4d8" stroke-width="1.1" stroke-linecap="round"/>
  <rect x="223.6" y="35" width="1" height="1" fill="#0e0d0c"/><rect x="225.6" y="35" width="1" height="1" fill="#0e0d0c"/>
  <path d="M123,86 Q136,86 150,90 Q136,91 123,92 Z" fill="#6e1b1b"/>
  <path d="M298,62 Q312,62 328,66 Q312,67 298,68 Z" fill="#6e1b1b"/>

  <!-- Rumpf -->
  <path d="${RUMPF}" fill="url(#holz)"/>
  <g clip-path="url(#rumpf-form)">
    <rect x="40" y="200" width="340" height="120" fill="url(#holz-licht)"/>
    <path d="M40,243 L380,243 M40,262 L380,262 M40,276 L380,276 M40,288 L380,288"
          stroke="#140b05" stroke-width="0.6" opacity="0.6"/>
    <rect x="40" y="238.5" width="340" height="2.4" fill="#7a5a3a"/>
    <rect x="40" y="258.5" width="340" height="1.8" fill="#5e4329"/>
    <rect x="40" y="219" width="64" height="1.6" fill="#8a6a42"/>
  </g>
  <path d="${RUMPF}" fill="none" stroke="#0d0805" stroke-width="1.2" clip-path="url(#ueber-wasser)"/>
  ${luken()}

  <!-- Heck: beleuchtete Fenster und Laterne -->
  <rect x="58" y="211" width="8" height="6" rx="0.8" fill="#f2c46d"/>
  <rect x="71" y="211" width="8" height="6" rx="0.8" fill="#f2c46d"/>
  <rect x="84" y="211" width="8" height="6" rx="0.8" fill="#f2c46d"/>
  <circle cx="48" cy="196" r="14" fill="url(#laterne-schein)"/>
  <line x1="48" y1="206" x2="48" y2="199" stroke="#1f150d" stroke-width="1.4"/>
  <rect x="45.5" y="193" width="5" height="6" rx="1" fill="#ffd38a" stroke="#6e5434" stroke-width="0.6"/>

  ${PIRAT}

  <!-- Unter der Wasserlinie: Wasser liegt über dem Rumpf -->
  <g clip-path="url(#rumpf-form)">
  <rect x="0" y="290" width="400" height="70" fill="url(#unterwasser-schiff)"/>
  <path d="M30,290.5 Q60,288 90,290.5 T150,290.5 T210,290.5 T270,290.5 T330,290.5 T390,290.5"
        stroke="#ffffff" stroke-opacity="0.45" stroke-width="1.1" fill="none"/>
  </g>
</svg>`;
