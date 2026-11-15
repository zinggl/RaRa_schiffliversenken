// Ein modernes Kriegsschiff, von oben gesehen (Bug zeigt nach rechts).
// Länge in Feldern: 1 Feld = 100 Einheiten. Grauer Stahlrumpf, Brücke mit Radar,
// Geschütztürme, zwei Streifen in den Clubfarben am Heck und der Name auf dem Deck.

let zaehler = 0; // für eindeutige IDs der Verläufe

export function kriegsschiffSvg(laenge, name, farbe1, farbe2) {
  const id = `ks${zaehler++}`;
  const w = laenge * 100;
  const rumpf = `M10,33 L${w - 92},27 Q${w - 16},40 ${w - 5},50 Q${w - 16},60 ${w - 92},73 L10,67 Q4,50 10,33 Z`;

  // Brücke (Aufbau) und Geschütztürme je nach Länge
  const bruecke = { x: 52, b: laenge <= 2 ? 28 : 30 + laenge * 8 };
  const tuerme = laenge >= 3 ? [w - 122] : [];
  if (laenge >= 5) tuerme.push(w - 186);
  if (laenge >= 6) tuerme.push(w - 250); // der GOAT hat drei Türme

  // Der Name steht zwischen Brücke und vorderstem Turm (oder Bug)
  const nameVon = bruecke.x + bruecke.b + 10;
  const nameBis = (tuerme.length ? Math.min(...tuerme) - 16 : w - 52) - 4;
  const platz = nameBis - nameVon;
  const text = name.toUpperCase();
  const schrift = laenge <= 2 ? 14 : 16;
  const natuerlich = text.length * schrift * 0.78;
  const passend = natuerlich > platz ? `textLength="${platz}" lengthAdjust="spacingAndGlyphs"` : '';

  const turm = (x) => `
    <rect x="${x}" y="47.6" width="34" height="4.8" rx="1.5" fill="#262c31"/>
    <circle cx="${x}" cy="50" r="11.5" fill="url(#${id}-turm)" stroke="#262c31" stroke-width="1.4"/>
    <circle cx="${x - 3}" cy="47" r="3" fill="#ffffff" opacity="0.12"/>`;

  return `
<svg viewBox="0 0 ${w} 100" xmlns="http://www.w3.org/2000/svg" aria-label="${name}">
  <defs>
    <linearGradient id="${id}-stahl" x1="0" y1="27" x2="0" y2="73" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#4c555b"/>
      <stop offset="0.45" stop-color="#a9b2b7"/>
      <stop offset="0.55" stop-color="#9aa3a8"/>
      <stop offset="1" stop-color="#454e54"/>
    </linearGradient>
    <linearGradient id="${id}-bruecke" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#7b858b"/>
      <stop offset="1" stop-color="#3c444a"/>
    </linearGradient>
    <radialGradient id="${id}-turm" cx="0.4" cy="0.35" r="0.7">
      <stop offset="0" stop-color="#8d979d"/>
      <stop offset="1" stop-color="#4e575d"/>
    </radialGradient>
    <clipPath id="${id}-form"><path d="${rumpf}"/></clipPath>
  </defs>

  <!-- Rumpf -->
  <path d="${rumpf}" fill="url(#${id}-stahl)"/>
  <g clip-path="url(#${id}-form)">
    <!-- Clubfarben am Heck -->
    <rect x="0" y="0" width="30" height="100" fill="${farbe1}"/>
    <rect x="30" y="0" width="14" height="100" fill="${farbe2}"/>
    <rect x="44" y="0" width="1.2" height="100" fill="#1f2529" opacity="0.5"/>
    <!-- Decksplanken-Linien und Mittellinie -->
    <path d="M46,50 L${w - 30},50" stroke="#ffffff" stroke-width="0.8" opacity="0.18"/>
    <path d="M46,36 L${w - 90},33 M46,64 L${w - 90},67" stroke="#2a3035" stroke-width="0.8" opacity="0.35"/>
  </g>
  <path d="${rumpf}" fill="none" stroke="#252b30" stroke-width="1.6"/>

  <!-- Brücke mit Radar -->
  <rect x="${bruecke.x}" y="37" width="${bruecke.b}" height="26" rx="4" fill="url(#${id}-bruecke)" stroke="#262c31" stroke-width="1.2"/>
  <rect x="${bruecke.x + bruecke.b - 9}" y="40" width="5" height="20" rx="1.5" fill="#1b2a35" opacity="0.85"/>
  <circle cx="${bruecke.x + bruecke.b / 2 - 4}" cy="50" r="6.5" fill="#2b3237" stroke="#9aa4aa" stroke-width="1.2"/>
  <line x1="${bruecke.x + bruecke.b / 2 - 10}" y1="50" x2="${bruecke.x + bruecke.b / 2 + 2}" y2="50" stroke="#c9d1d5" stroke-width="1.4"/>

  <!-- Geschütztürme, Rohre zeigen zum Bug -->
  ${tuerme.map(turm).join('')}

  <!-- Name auf dem Deck -->
  <text x="${(nameVon + nameBis) / 2}" y="55.5" text-anchor="middle" ${passend}
        font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="${schrift}"
        letter-spacing="1.2" fill="#1d2327" opacity="0.85">${text}</text>
</svg>`;
}
