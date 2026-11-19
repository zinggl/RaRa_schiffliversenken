// Der Jubel der Spieler: Wird ein Schiff getroffen, jubelt der getroffene Spieler.
// Treffer: klein am Rand. Versenkt: gross in der Mitte, mit Namen. Beides dauert so lange wie «jubelDauer».
// Die Figur ist ein gezeichnetes Brustbild (keine Fotos): Trikot in den Clubfarben, Gesicht,
// Frisur und Hautfarbe passend zum Spieler, Arme mit Gelenken (Schulter, Ellbogen) und Händen.
// Winkel in Grad, 0 = Arm hängt gerade nach unten. Linker Arm (vom Betrachter aus): positiv = nach
// aussen/oben, negativ = vor den Körper. Rechter Arm: umgekehrt.
// Vorlage für Yamal: Raphaels Foto (Unterarme vor der Brust gekreuzt, Hände gespreizt).

// Gelenke (Zeichenfläche 0 0 240 300, sichtbar -30 … 270, damit ausgestreckte Arme Platz haben)
const S_L = [72, 150]; // Schultern
const S_R = [168, 150];
const OBERARM = 66;
const UNTERARM = 58;

const GRUND = { aL: 6, fL: 0, aR: -6, fR: 0, y: 0, kopf: 0 };

// Aussehen der Spieler: Hautfarbe, Frisur, Haarfarbe, Bart, Gesichtsausdruck, Trikot-Art
const AUSSEHEN = {
  // Zuber nach Raphaels Foto: FCZ-Trikot, kurze blonde Haare, schreit vor Freude
  zuber: { haut: '#3f281c', frisur: 'blond-kurz', haar: '#e4cf92', seiten: '#120c08', trikot: 'fcz' },
  mbappe: { haut: '#6a432d', frisur: 'buzz', haar: '#140d09', ausdruck: 'schmunzeln', trikot: 'real' },
  haaland: { haut: '#ecc9ac', frisur: 'dutt', haar: '#d9c07c' },
  ronaldo: { haut: '#c99572', frisur: 'kurz', haar: '#2a1c12' },
  yamal: { haut: '#8a5839', frisur: 'fade-locken', haar: '#e9d394', seiten: '#1b130d', ausdruck: 'lachen', trikot: 'spanien' },
  keni: { haut: '#e6bd9d', frisur: 'kurz', haar: '#7a5534' },
  // Messi nach Raphaels Foto: Argentinien-Trikot, Blick zum Himmel, Kapitänsbinde, Tattoo am rechten Arm
  messi: { haut: '#d6a47c', frisur: 'zurueck', haar: '#5a3b25', bart: true, trikot: 'argentinien', blick: 'oben', ausdruck: 'staunen', tattoo: 'l', binde: 'r' },
  neymar: { haut: '#b98459', frisur: 'kurz', haar: '#3a2617' },
  xhaka: { haut: '#d6a682', frisur: 'kurz', haar: '#1f1914', bart: true },
  pedri: { haut: '#d6a381', frisur: 'wellig', haar: '#2b1d13' },
  musiala: { haut: '#7c4b2f', frisur: 'locken', haar: '#1d140f' },
};

// Die Jubel-Posen (aus Raphaels Liste). hand: offen | faust | zeigen | daumen
export const JUBEL = {
  zuber: { text: 'Schrei mit Faust', hand: 'faust', mund: 'schreien', pose: { aL: 42, fL: -58, aR: -8, fR: -4, kopf: -3 } },
  mbappe: { text: 'Arme verschränkt', hand: 'faust', pose: { aL: -8, fL: -88, aR: 8, fR: 88, kopf: -3 } },
  haaland: { text: 'Meditiert', hand: 'offen', augenZu: true, ruhig: true, pose: { aL: 30, fL: 22, aR: -30, fR: -22 } },
  ronaldo: {
    text: 'Siuuu!',
    hand: 'offen',
    mund: 'offen',
    sprung: { aL: 150, fL: 10, aR: -150, fR: -10, y: -26 },
    pose: { aL: 46, fL: 10, aR: -46, fR: -10, y: 6, kopf: -4 },
  },
  yamal: { text: 'Hände gekreuzt', hand: 'offen', pose: { aL: -16, fL: -118, aR: 16, fR: 118 } },
  keni: { text: 'Faust hoch', hand: 'faust', mund: 'offen', pose: { aL: 34, fL: -72, aR: -172, fR: 0 } },
  messi: { text: 'Finger zum Himmel', hand: 'zeigen', pose: { aL: 138, fL: 38, aR: -138, fR: -38, kopf: 0 } },
  neymar: { text: 'Herz', hand: 'offen', herz: true, pose: { aL: -4, fL: -130, aR: 4, fR: 130 } },
  xhaka: { text: 'Faust aufs Wappen', hand: 'faust', mund: 'offen', pose: { aL: -6, fL: -118, aR: -40, fR: -115 } },
  pedri: { text: 'Arme hoch', hand: 'offen', mund: 'offen', pose: { aL: 150, fL: 10, aR: -150, fR: -10 } },
  musiala: { text: 'Daumen hoch', hand: 'daumen', pose: { aL: 40, fL: 140, aR: -40, fR: -140 } },
};

let zaehler = 0;

// Etwas dunkler/heller machen (für Schatten und Licht)
function toenen(farbe, faktor) {
  const h = parseInt(farbe.slice(1), 16);
  const k = (v) => Math.max(0, Math.min(255, Math.round(v * faktor)));
  return `rgb(${k((h >> 16) & 255)},${k((h >> 8) & 255)},${k(h & 255)})`;
}

// Ein Finger als schmale, sich verjüngende Form (zeigt in Richtung «winkel», 0 = nach unten)
function finger(x, y, winkel, laenge, breite, haut, dunkel) {
  const r = (winkel * Math.PI) / 180;
  const dx = Math.sin(r);
  const dy = Math.cos(r);
  const nx = dy; // quer zum Finger
  const ny = -dx;
  const ex = x + dx * laenge;
  const ey = y + dy * laenge;
  const b1 = breite / 2;
  const b2 = breite * 0.38;
  const mx = x + dx * laenge * 0.55;
  const my = y + dy * laenge * 0.55;
  return `<path d="M${x + nx * b1},${y + ny * b1} L${ex + nx * b2},${ey + ny * b2} Q${ex + dx * 2.2},${ey + dy * 2.2} ${ex - nx * b2},${ey - ny * b2} L${x - nx * b1},${y - ny * b1} Z" fill="${haut}"/>
    <path d="M${mx + nx * b1 * 0.8},${my + ny * b1 * 0.8} L${mx - nx * b1 * 0.8},${my - ny * b1 * 0.8}" stroke="${dunkel}" stroke-width="0.7" opacity="0.5"/>`;
}

// Hände (zeigen in Armrichtung nach unten); alle Arten werden gezeichnet, CSS zeigt die richtige
function haende(x, y, haut, dunkel, id) {
  const faust = (b) => `
      <path d="M${x - 9.5},${y + 1} Q${x - 11},${y + 12} ${x - 8},${y + b} Q${x},${y + b + 3} ${x + 8},${y + b} Q${x + 11},${y + 12} ${x + 9.5},${y + 1} Z" fill="url(#${id}-haut)"/>
      <path d="M${x - 7},${y + b - 4} Q${x - 3.5},${y + b - 1} ${x},${y + b - 4} Q${x + 3.5},${y + b - 1} ${x + 7},${y + b - 4}" stroke="${dunkel}" stroke-width="0.9" fill="none" opacity="0.6"/>
      <path d="M${x - 7},${y + b - 9} Q${x},${y + b - 7} ${x + 7},${y + b - 9}" stroke="${dunkel}" stroke-width="0.8" fill="none" opacity="0.45"/>`;
  return `
    <g class="hand hand-offen">
      <path d="M${x - 9},${y} Q${x - 11},${y + 9} ${x - 8},${y + 16} L${x + 8},${y + 16} Q${x + 11},${y + 9} ${x + 9},${y} Z" fill="url(#${id}-haut)"/>
      ${finger(x - 6.5, y + 14, -28, 13, 4.4, haut, dunkel)}
      ${finger(x - 2.2, y + 15, -9, 16, 4.6, haut, dunkel)}
      ${finger(x + 2.4, y + 15, 9, 16.5, 4.6, haut, dunkel)}
      ${finger(x + 6.6, y + 14, 27, 13.5, 4.3, haut, dunkel)}
      ${finger(x - 8.5, y + 5, -62, 12, 5.2, haut, dunkel)}
    </g>
    <g class="hand hand-faust">${faust(19)}</g>
    <g class="hand hand-zeigen">${faust(17)}${finger(x + 3, y + 15, 0, 19, 4.8, haut, dunkel)}</g>
    <g class="hand hand-daumen">${faust(18)}${finger(x + 7, y + 10, 4, 16, 5.6, haut, dunkel)}</g>`;
}

function arm(seite, [sx, sy], farbe1, farbe2, haut, id, a = {}) {
  const ex = sx;
  const ey = sy + OBERARM;
  const wy = ey + UNTERARM;
  const dunkel = toenen(haut, 0.68);
  return `
    <g class="glied ${seite}-arm" style="transform-origin:${sx}px ${sy}px">
      <!-- Oberarm: Bizeps, dann Ärmel vom Trikot -->
      <path d="M${sx - 12},${sy + 30} Q${sx - 16},${sy + 50} ${sx - 10},${ey} L${sx + 10},${ey} Q${sx + 16},${sy + 48} ${sx + 12},${sy + 30} Z" fill="url(#${id}-haut)"/>
      <path d="M${sx + 2},${sy + 44} Q${sx + 9},${sy + 52} ${sx + 6},${ey - 4}" stroke="#fff" stroke-opacity="0.12" stroke-width="3" fill="none"/>
      <path d="M${sx - 19},${sy - 6} Q${sx - 21},${sy + 20} ${sx - 16},${sy + 43} Q${sx},${sy + 46} ${sx + 16},${sy + 43} Q${sx + 21},${sy + 20} ${sx + 19},${sy - 6} Q${sx},${sy - 16} ${sx - 19},${sy - 6} Z" fill="${a.trikot === 'argentinien' ? '#f6f6f3' : a.trikot === 'fcz' ? farbe2 : farbe1}"/>
      <path d="M${sx - 19},${sy - 6} Q${sx - 21},${sy + 20} ${sx - 16},${sy + 43} Q${sx},${sy + 46} ${sx + 16},${sy + 43} Q${sx + 21},${sy + 20} ${sx + 19},${sy - 6} Q${sx},${sy - 16} ${sx - 19},${sy - 6} Z" fill="url(#${id}-stoff)"/>
      <path d="M${sx - 10},${sy + 8} Q${sx - 4},${sy + 22} ${sx - 9},${sy + 34}" stroke="#000" stroke-opacity="0.12" stroke-width="2.2" fill="none"/>
      <path d="M${sx - 16},${sy + 38} Q${sx},${sy + 41} ${sx + 16},${sy + 38}" stroke="${a.trikot === 'argentinien' ? '#111' : a.trikot === 'fcz' ? '#8fb6e6' : farbe2}" stroke-width="4" fill="none"/>
      ${a.binde === seite ? `<path d="M${sx - 18.5},${sy + 18} Q${sx},${sy + 22} ${sx + 18.5},${sy + 18} L${sx + 18},${sy + 29} Q${sx},${sy + 33} ${sx - 18},${sy + 29} Z" fill="#1d3f9a"/><text x="${sx}" y="${sy + 28.5}" text-anchor="middle" font-size="8" font-weight="800" fill="#fff" font-family="system-ui">C</text>` : ''}
      ${a.tattoo === seite ? `<path d="M${sx - 11},${sy + 46} Q${sx - 4},${sy + 52} ${sx - 9},${sy + 58} M${sx + 2},${sy + 47} q4,6 -1,12 M${sx - 6},${sy + 60} q6,2 10,-2" stroke="#2b2622" stroke-width="2.2" fill="none" opacity="0.55"/>` : ''}
      <ellipse cx="${ex}" cy="${ey}" rx="10" ry="9" fill="url(#${id}-haut)"/>
      <g class="glied ${seite}-unterarm" style="transform-origin:${ex}px ${ey}px">
        <!-- Unterarm: oben kräftig, zum Handgelenk schmal -->
        <path d="M${ex - 10},${ey} Q${ex - 13},${ey + 18} ${ex - 7.5},${wy} L${ex + 7.5},${wy} Q${ex + 12},${ey + 16} ${ex + 10},${ey} Z" fill="url(#${id}-haut)"/>
        <path d="M${ex + 3},${ey + 8} Q${ex + 7},${ey + 22} ${ex + 4},${wy - 8}" stroke="#fff" stroke-opacity="0.1" stroke-width="2.5" fill="none"/>
        ${a.tattoo === seite ? `<g opacity="0.55" stroke="#2b2622" fill="none" stroke-width="1.8"><path d="M${ex - 8},${ey + 6} q6,6 0,12 q-5,6 2,12 q6,5 0,11"/><circle cx="${ex + 3}" cy="${ey + 14}" r="3.5"/><path d="M${ex + 6},${ey + 24} l-8,6 M${ex + 4},${ey + 34} q-4,4 -9,2"/><path d="M${ex - 9},${ey + 3} L${ex + 9},${ey + 3}" stroke-width="1.2"/></g>` : ''}
        ${haende(ex, wy - 2, haut, dunkel, id)}
      </g>
    </g>`;
}

// Frisuren. «kopf» ist die Schädelform, damit Haare sauber am Haaransatz sitzen.
const SCHAEDEL = 'M95,62 Q92,30 120,26 Q148,30 145,62 Q143,46 132,42 Q120,39 108,42 Q97,46 95,62 Z';
function frisurSvg(a, id) {
  const h = a.haar;
  const s = a.seiten ?? toenen(h, 0.8);
  switch (a.frisur) {
    case 'blond-kurz':
      // Seiten dunkel und ganz kurz, oben kurz und blond gefärbt (Zuber)
      return `<path d="${SCHAEDEL}" fill="${s}"/>
        <path d="M99,48 Q100,29 120,27 Q140,29 141,48 Q132,41 120,41 Q108,41 99,48 Z" fill="${h}"/>
        <path d="M99,48 Q100,29 120,27 Q140,29 141,48 Q132,41 120,41 Q108,41 99,48 Z" fill="url(#${id}-stoppeln)"/>
        <path d="M106,33 Q120,28 134,33" stroke="#fff" stroke-opacity="0.35" stroke-width="2" fill="none"/>`;
    case 'zurueck':
      // Nach hinten gekämmt (Messi)
      return `<path d="M95,60 Q91,28 120,24 Q149,28 145,60 Q143,44 133,39 Q120,35 107,39 Q97,44 95,60 Z" fill="${h}"/>
        <path d="M101,44 Q110,32 124,30 M108,40 Q118,32 134,32 M116,38 Q128,34 140,40" stroke="${toenen(h, 1.45)}" stroke-width="1.6" fill="none" opacity="0.7"/>`;
    case 'buzz':
      // Ganz kurz geschoren, gerader Haaransatz (Mbappé)
      return `<path d="M96,60 Q95,30 120,27.5 Q145,30 144,60 Q141,47 136,43 L131,41.5 Q120,40 109,41.5 L104,43 Q99,47 96,60 Z" fill="${h}" opacity="0.88"/>
        <path d="M96,60 Q95,30 120,27.5 Q145,30 144,60 Q141,47 136,43 L131,41.5 Q120,40 109,41.5 L104,43 Q99,47 96,60 Z" fill="url(#${id}-stoppeln)"/>
        <path d="M103,35 Q120,29 137,35" stroke="#fff" stroke-opacity="0.12" stroke-width="3" fill="none"/>`;
    case 'fade-locken': {
      // Seiten kurz rasiert und dunkel, oben blonde Locken (Yamal)
      let k = '';
      const locken = [];
      // Viele kleine, unregelmässige Locken in einer flachen Kuppel
      for (let reihe = 0; reihe < 5; reihe++) {
        const anzahl = 9 - Math.abs(reihe - 2);
        for (let i = 0; i < anzahl; i++) {
          const breite = 40 - Math.abs(reihe - 2) * 4;
          const x = 120 - breite / 2 + (i + 0.5) * (breite / anzahl) + (((i * 13 + reihe * 7) % 5) - 2) * 0.6;
          const y = 45 - reihe * 3.6 - Math.sin(((x - 100) / 40) * Math.PI) * 3.2 + (((i * 5 + reihe) % 3) - 1) * 0.7;
          locken.push([x, y, 2.4 + ((i * 7 + reihe * 3) % 5) * 0.18]);
        }
      }
      for (const [x, y, r] of locken) {
        k += `<circle cx="${x}" cy="${y}" r="${r}" fill="${toenen(h, 0.72)}"/>
          <circle cx="${x - 0.6}" cy="${y - 0.8}" r="${r * 0.82}" fill="${h}"/>
          <path d="M${x - r * 0.5},${y - r * 0.2} Q${x},${y - r * 0.9} ${x + r * 0.5},${y - r * 0.1}" stroke="#fff" stroke-opacity="0.45" stroke-width="0.9" fill="none"/>`;
      }
      return `<path d="${SCHAEDEL}" fill="${s}"/>
        <path d="M95,62 Q94,50 99,44 L101,60 Z M145,62 Q146,50 141,44 L139,60 Z" fill="url(#${id}-fade)"/>
        <path d="M100,47 Q102,30 120,28 Q138,30 140,47 Q130,42 120,42 Q110,42 100,47 Z" fill="${toenen(h, 0.62)}"/>
        ${k}`;
    }
    case 'dutt':
      return `<path d="${SCHAEDEL}" fill="${h}"/>
        <path d="M95,60 Q92,40 101,32 M145,60 Q148,40 139,32" stroke="${toenen(h, 0.82)}" stroke-width="2.5" fill="none"/>
        <ellipse cx="120" cy="22" rx="11" ry="9" fill="${toenen(h, 0.9)}"/>
        <path d="M112,22 Q120,15 128,22" stroke="#fff" stroke-opacity="0.3" stroke-width="1.5" fill="none"/>`;
    case 'locken': {
      let k = '';
      for (const [x, y, r] of [[104, 38, 6], [111, 32, 6.5], [119, 29, 7], [127, 30, 6.5], [135, 34, 6], [140, 41, 5], [108, 43, 5], [116, 37, 6], [125, 38, 6], [133, 42, 5]]) {
        k += `<circle cx="${x}" cy="${y}" r="${r}" fill="${h}"/><circle cx="${x - 1.2}" cy="${y - 1.5}" r="${r * 0.4}" fill="#fff" opacity="0.12"/>`;
      }
      return `<path d="${SCHAEDEL}" fill="${s}"/>${k}`;
    }
    case 'wellig':
      return `<path d="${SCHAEDEL}" fill="${h}"/>
        <path d="M100,47 Q108,36 118,42 Q126,34 136,40 Q142,42 145,52 Q140,44 132,46 Q124,40 116,47 Q108,42 100,51 Z" fill="${toenen(h, 1.3)}"/>`;
    default:
      return `<path d="${SCHAEDEL}" fill="${h}"/>
        <path d="M101,44 Q114,34 140,40" stroke="${toenen(h, 1.4)}" stroke-width="2" fill="none" opacity="0.7"/>`;
  }
}

// Gesicht: Augen mit Lidern, Nase mit Nasenflügeln, Lippen, Ohren, Licht und Schatten
function gesichtSvg(a, j, id) {
  const haut = a.haut;
  const schatten = toenen(haut, 0.7);
  const tief = toenen(haut, 0.55);
  const licht = toenen(haut, 1.18);
  const lippe = toenen(haut, 0.78);
  const brauen = a.haar === '#d9c07c' ? '#a88d52' : a.frisur === 'fade-locken' ? '#2a1c12' : toenen(a.haar, 0.95);
  const iy = a.blick === 'oben' ? 63.2 : 65.3; // Blick zum Himmel: Iris weiter oben
  const auge = (cx) => `
    <path d="M${cx - 7},66 Q${cx},60.5 ${cx + 7},66 Q${cx},69.5 ${cx - 7},66 Z" fill="#efe7dc"/>
    <circle cx="${cx + 0.4}" cy="${iy}" r="3.3" fill="url(#${id}-iris)"/>
    <circle cx="${cx + 0.4}" cy="${iy}" r="1.5" fill="#0c0806"/>
    <circle cx="${cx + 1.5}" cy="${iy - 1.1}" r="0.9" fill="#fff" opacity="0.9"/>
    <path d="M${cx - 7.5},66 Q${cx},59.5 ${cx + 7.5},65.6" stroke="#160e0a" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    <path d="M${cx - 6},67.6 Q${cx},70 ${cx + 6},67.4" stroke="${tief}" stroke-width="0.8" fill="none" opacity="0.6"/>`;
  const augen = j.augenZu
    ? `<path d="M103,66 Q110,69.5 117,66 M123,66 Q130,69.5 137,66" stroke="#20160f" stroke-width="1.8" fill="none" stroke-linecap="round"/>`
    : auge(110) + auge(130);
  const ausdruck = j.mund ?? a.ausdruck ?? 'laecheln';
  const mund = {
    offen: `<path d="M109,87 Q120,83.5 131,87 Q129,99 120,100 Q111,99 109,87 Z" fill="#3d1714"/>
      <path d="M110.5,87.4 Q120,85 129.5,87.4 L128.5,90.4 Q120,88.8 111.5,90.4 Z" fill="#f2ece4"/>
      <path d="M113,96 Q120,98.5 127,96" stroke="#b5544e" stroke-width="2.5" fill="none" opacity="0.8"/>`,
    lachen: `<path d="M106,84.5 Q120,87.5 134,84.5 Q132,97.5 120,99.5 Q108,97.5 106,84.5 Z" fill="#3d1714"/>
      <path d="M107.5,85.4 Q120,88 132.5,85.4 Q131.5,91.5 120,92.5 Q108.5,91.5 107.5,85.4 Z" fill="#f4eee6"/>
      <path d="M112,86.6 L112.4,91 M116,87.3 L116.2,92 M120,87.6 L120,92.4 M124,87.3 L123.8,92 M128,86.6 L127.6,91" stroke="#c9bfb2" stroke-width="0.6"/>
      <path d="M106,84.5 Q120,87.5 134,84.5" stroke="${toenen(haut, 0.62)}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
      <path d="M109,96 Q120,101.5 131,96" stroke="${lippe}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      <path d="M104,83 Q105.5,86 107,85 M136,83 Q134.5,86 133,85" stroke="${toenen(haut, 0.6)}" stroke-width="1.2" fill="none" stroke-linecap="round"/>`,
    schreien: `<path d="M107,85 Q120,80.5 133,85 Q132,101 120,104 Q108,101 107,85 Z" fill="#3a1412"/>
      <path d="M108.5,85.6 Q120,82 131.5,85.6 L130.5,89 Q120,86.5 109.5,89 Z" fill="#f4eee6"/>
      <path d="M113,100 Q120,103 127,100 L126,97.5 Q120,99.5 114,97.5 Z" fill="#efe8de"/>
      <ellipse cx="120" cy="96" rx="6" ry="3" fill="#a8423f" opacity="0.8"/>
      <path d="M107,85 Q120,80.5 133,85 Q132,101 120,104 Q108,101 107,85 Z" fill="none" stroke="${lippe}" stroke-width="2.2"/>`,
    staunen: `<path d="M113,88 Q120,85.5 127,88 Q126,96 120,97 Q114,96 113,88 Z" fill="#3d1714"/>
      <path d="M114,88.3 Q120,86.5 126,88.3 L125.5,90 Q120,89 114.5,90 Z" fill="#efe8de"/>
      <path d="M115,95.5 Q120,98 125,95.5" stroke="${lippe}" stroke-width="2" fill="none"/>`,
    schmunzeln: `<path d="M110,87.5 Q118,90.5 131,85.5" stroke="${toenen(haut, 0.5)}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
      <path d="M111,88 Q120,94.5 129,87.8 Q120,91 111,88 Z" fill="${lippe}"/>
      <path d="M110.5,87.4 Q115,85 120,86.2 Q125,84.6 130.5,86.4" stroke="${toenen(haut, 0.62)}" stroke-width="1.2" fill="none"/>`,
    laecheln: `<path d="M109,86 Q120,95 131,86 Q120,90.5 109,86 Z" fill="#f2ece4" stroke="${lippe}" stroke-width="1.4"/>`,
  }[ausdruck];
  const bart = a.bart
    ? `<path d="M97,70 Q99,96 120,105 Q141,96 143,70 Q141,90 131,95 Q120,99 109,95 Q99,90 97,70 Z" fill="${a.haar}" opacity="0.92"/>
       <path d="M109,84 Q120,80 131,84 Q120,86.5 109,84 Z" fill="${a.haar}"/>`
    : '';
  return `
    <!-- Ohren -->
    <path d="M97,60 Q89,58 90,68 Q91,78 98,78 Z" fill="${schatten}"/>
    <path d="M95,63 Q92,66 94,72" stroke="${tief}" stroke-width="1.2" fill="none"/>
    <path d="M143,60 Q151,58 150,68 Q149,78 142,78 Z" fill="${haut}"/>
    <path d="M145,63 Q148,66 146,72" stroke="${schatten}" stroke-width="1.2" fill="none"/>
    <!-- Gesichtsform mit Wangenknochen und Kinn -->
    <path d="M97,60 Q96,34 120,31 Q144,34 143,60 Q143.5,74 139,84 Q134,99 120,105 Q106,99 101,84 Q96.5,74 97,60 Z" fill="url(#${id}-gesicht)"/>
    <g filter="url(#${id}-weich)">
      <ellipse cx="104" cy="80" rx="6" ry="9" fill="${tief}" opacity="0.35"/>
      <ellipse cx="135" cy="74" rx="5" ry="7" fill="${licht}" opacity="0.35"/>
      <ellipse cx="124" cy="44" rx="12" ry="6" fill="${licht}" opacity="0.3"/>
      <ellipse cx="110" cy="62" rx="8" ry="3.5" fill="${tief}" opacity="0.3"/>
      <ellipse cx="130" cy="62" rx="8" ry="3.5" fill="${tief}" opacity="0.25"/>
      <ellipse cx="120" cy="101" rx="9" ry="3" fill="${licht}" opacity="0.25"/>
    </g>
    <!-- Brauen -->
    <path d="M102.5,59.5 Q109,54.5 117.5,57.5 Q110,56.8 102.5,59.5 Z M122.5,57.5 Q131,54.5 137.5,59.5 Q130,56.8 122.5,57.5 Z" fill="${brauen}" stroke="${brauen}" stroke-width="1.8" stroke-linejoin="round"/>
    ${augen}
    <!-- Nase -->
    <path d="M118,64 Q117,73 115,78" stroke="${schatten}" stroke-width="1.3" fill="none" opacity="0.7"/>
    <path d="M123,64 Q124.5,72 125,77" stroke="${licht}" stroke-width="1.6" fill="none" opacity="0.6"/>
    <path d="M113.5,79.5 Q116,83.5 120,82.5 Q124,83.5 126.5,79.5 Q125,77 120,78 Q115,77 113.5,79.5 Z" fill="${schatten}" opacity="0.55"/>
    <ellipse cx="116.8" cy="81" rx="1.6" ry="1.1" fill="${tief}"/>
    <ellipse cx="123.2" cy="81" rx="1.6" ry="1.1" fill="${tief}"/>
    ${bart}
    ${mund}`;
}

// Trikot-Einzelheiten (Kragen und Wappen) je nach Club/Land
function trikotDetails(art, farbe1, farbe2, id) {
  if (art === 'real') {
    // Weiss mit Gold: Krone über einem runden Wappen
    return `<path d="M98,118 Q120,136 142,118" stroke="#d9b46a" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M100,119 Q120,132 140,119" stroke="#1c2a4a" stroke-width="1.6" fill="none"/>
      <circle cx="147" cy="180" r="8.5" fill="#f5f1e6" stroke="#d9b46a" stroke-width="2"/>
      <path d="M141,169 L143,164 L145.5,168 L147,163 L148.5,168 L151,164 L153,169 Z" fill="#d9b46a"/>
      <path d="M142,184 L152,176" stroke="#1c2a4a" stroke-width="2.4"/>`;
  }
  if (art === 'fcz') {
    // Weiss mit dunkelblauen Schultern und Kragen, rundes Wappen mit blau-weissen Schrägstreifen
    return `<g clip-path="url(#${id}-rumpf)">
        <path d="M40,110 L92,110 Q74,140 62,180 L40,180 Z M200,110 L148,110 Q166,140 178,180 L200,180 Z" fill="${farbe2}"/>
        <rect x="40" y="110" width="160" height="200" fill="url(#${id}-stoff)"/>
      </g>
      <path d="M98,118 Q120,138 142,118" stroke="${farbe2}" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path d="M101,121 l4,4 4,-4 4,4 4,-4 4,4 4,-4 4,4 4,-4 4,4" stroke="#8fb6e6" stroke-width="1.3" fill="none"/>
      <clipPath id="${id}-wappen"><circle cx="148" cy="182" r="9"/></clipPath>
      <circle cx="148" cy="182" r="9.5" fill="#fff" stroke="${farbe2}" stroke-width="2"/>
      <g clip-path="url(#${id}-wappen)"><path d="M136,176 L160,194 M136,184 L156,198 M140,170 L164,188" stroke="#2a78c4" stroke-width="3.2"/></g>
      <path d="M148,168 l1.2,2.6 2.8,0.2 -2.1,1.8 0.7,2.7 -2.6,-1.5 -2.6,1.5 0.7,-2.7 -2.1,-1.8 2.8,-0.2 Z" fill="#d9b46a"/>`;
  }
  if (art === 'argentinien') {
    // Weiss mit hellblauen Längsstreifen, schwarzer Kragen, goldenes Abzeichen, Nummer 10
    return `<g clip-path="url(#${id}-rumpf)">
        <rect x="62" y="110" width="20" height="200" fill="${farbe1}"/>
        <rect x="108" y="110" width="24" height="200" fill="${farbe1}"/>
        <rect x="156" y="110" width="20" height="200" fill="${farbe1}"/>
        <rect x="40" y="110" width="160" height="200" fill="url(#${id}-stoff)"/>
      </g>
      <path d="M98,118 Q120,136 142,118" stroke="#111" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M140,170 h14 v10 q0,8 -7,11 q-7,-3 -7,-11 Z" fill="#f6f6f3" stroke="#d9b46a" stroke-width="1.6"/>
      <path d="M144,166 l1,-2.5 1,2.5 M149,166 l1,-2.5 1,2.5" stroke="#d9b46a" stroke-width="1.2" fill="none"/>
      <rect x="117" y="168" width="13" height="16" rx="2" fill="#d9b46a"/>
      <text x="108" y="222" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="800" font-size="26" fill="#14161a">10</text>`;
  }
  if (art === 'spanien') {
    // Rot mit gelbem Kragen, Wappen und Stern
    return `<path d="M98,118 Q120,136 142,118" stroke="#f1bf00" stroke-width="5.5" fill="none" stroke-linecap="round"/>
      <path d="M140,170 h15 v11 q0,8 -7.5,11.5 q-7.5,-3.5 -7.5,-11.5 Z" fill="#c60b1e" stroke="#f1bf00" stroke-width="1.8"/>
      <path d="M143,174 h9 M143,178 h9" stroke="#f1bf00" stroke-width="1.6"/>
      <path d="M147.5,160 l1.4,3 3.2,0.3 -2.4,2.1 0.8,3.1 -3,-1.7 -3,1.7 0.8,-3.1 -2.4,-2.1 3.2,-0.3 Z" fill="#f1bf00"/>`;
  }
  return `<path d="M98,118 Q120,136 142,118" stroke="${farbe2}" stroke-width="6" fill="none" stroke-linecap="round"/>
    <path d="M138,166 h18 v12 q0,10 -9,14 q-9,-4 -9,-14 Z" fill="${farbe2}" stroke="#d9b46a" stroke-width="1.5"/>`;
}

function figurSvg(spielerId, farbe1, farbe2, j) {
  const id = `jf${zaehler++}`;
  const a = AUSSEHEN[spielerId] ?? AUSSEHEN.pedri;
  const haut = a.haut;
  const schatten = toenen(haut, 0.7);
  return `
<svg class="jubel-figur" viewBox="-30 0 300 300" aria-hidden="true">
  <defs>
    <linearGradient id="${id}-stoff" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#000" stop-opacity="0.36"/>
      <stop offset="0.45" stop-color="#000" stop-opacity="0.04"/>
      <stop offset="0.8" stop-color="#fff" stop-opacity="0.16"/>
      <stop offset="1" stop-color="#000" stop-opacity="0.14"/>
    </linearGradient>
    <linearGradient id="${id}-haut" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${toenen(haut, 0.64)}"/>
      <stop offset="0.5" stop-color="${haut}"/>
      <stop offset="0.78" stop-color="${toenen(haut, 1.14)}"/>
      <stop offset="1" stop-color="${toenen(haut, 0.86)}"/>
    </linearGradient>
    <radialGradient id="${id}-gesicht" cx="0.6" cy="0.42" r="0.68">
      <stop offset="0" stop-color="${toenen(haut, 1.12)}"/>
      <stop offset="0.65" stop-color="${haut}"/>
      <stop offset="1" stop-color="${schatten}"/>
    </radialGradient>
    <radialGradient id="${id}-iris" cx="0.4" cy="0.35" r="0.7">
      <stop offset="0" stop-color="#6b4a2e"/>
      <stop offset="1" stop-color="#24160c"/>
    </radialGradient>
    <linearGradient id="${id}-fade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${a.seiten ?? '#000'}" stop-opacity="0.9"/>
      <stop offset="1" stop-color="${haut}" stop-opacity="0.2"/>
    </linearGradient>
    <pattern id="${id}-stoppeln" width="2.4" height="2.4" patternUnits="userSpaceOnUse">
      <circle cx="1.2" cy="1.2" r="0.5" fill="#fff" opacity="0.12"/>
    </pattern>
    <clipPath id="${id}-rumpf"><path d="M97,118 Q82,124 62,133 Q48,141 51,166 L58,300 L182,300 L189,166 Q192,141 178,133 Q158,124 143,118 Z"/></clipPath>
    <filter id="${id}-weich" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.2"/></filter>
  </defs>
  <g class="koerper">
    <!-- Trikot mit Licht von rechts, Falten und Nähten -->
    <path d="M97,118 Q82,124 62,133 Q48,141 51,166 L58,300 L182,300 L189,166 Q192,141 178,133 Q158,124 143,118 Z" fill="${a.trikot === 'argentinien' ? '#f6f6f3' : a.trikot === 'fcz' ? '#f7f7f4' : farbe1}"/>
    <path d="M97,118 Q82,124 62,133 Q48,141 51,166 L58,300 L182,300 L189,166 Q192,141 178,133 Q158,124 143,118 Z" fill="url(#${id}-stoff)"/>
    <g filter="url(#${id}-weich)" opacity="0.8">
      <path d="M84,196 Q96,214 90,240" stroke="#000" stroke-opacity="0.22" stroke-width="4" fill="none"/>
      <path d="M152,188 Q142,212 152,238" stroke="#000" stroke-opacity="0.18" stroke-width="4" fill="none"/>
      <path d="M106,252 Q120,266 136,252" stroke="#000" stroke-opacity="0.16" stroke-width="4" fill="none"/>
      <path d="M156,140 Q170,150 176,170" stroke="#fff" stroke-opacity="0.22" stroke-width="5" fill="none"/>
    </g>
    <path d="M70,150 Q74,200 66,290 M170,150 Q166,200 174,290" stroke="${farbe2}" stroke-width="2.5" fill="none" opacity="0.65"/>
    <!-- Hals mit Muskeln und Schatten unter dem Kinn -->
    <g class="glied kopf" style="transform-origin:120px 120px">
      <path d="M103,92 L137,92 L141,124 Q120,135 99,124 Z" fill="url(#${id}-haut)"/>
      <path d="M107,102 Q112,114 115,124 M133,102 Q128,114 125,124" stroke="${schatten}" stroke-width="2.5" fill="none" opacity="0.25" filter="url(#${id}-weich)"/>
      <path d="M103,98 Q120,114 137,98 L137,106 Q120,120 103,106 Z" fill="${toenen(haut, 0.5)}" opacity="0.45"/>
      ${gesichtSvg(a, j, id)}
      ${frisurSvg(a, id)}
    </g>
    ${trikotDetails(a.trikot, farbe1, farbe2, id)}
    <!-- Arme vor dem Körper -->
    ${arm('l', S_L, farbe1, farbe2, haut, id, a)}
    ${arm('r', S_R, farbe1, farbe2, haut, id, a)}
    <!-- Herz (Neymar) -->
    <path class="herz" d="M120,186 C110,176 102,168 110,160 C115,155 120,160 120,164 C120,160 125,155 130,160 C138,168 130,176 120,186 Z" fill="#e0475b" stroke="#fff" stroke-opacity="0.5"/>
  </g>
</svg>`;
}

// Pose auf die Figur legen (die Übergänge macht CSS)
function poseSetzen(svg, pose) {
  const p = { ...GRUND, ...pose };
  const drehen = (klasse, grad) => {
    const e = svg.querySelector(`.${klasse}`);
    if (e) e.style.transform = `rotate(${grad}deg)`;
  };
  drehen('l-arm', p.aL);
  drehen('l-unterarm', p.fL);
  drehen('r-arm', p.aR);
  drehen('r-unterarm', p.fR);
  drehen('kopf', p.kopf);
  svg.querySelector('.koerper').style.transform = `translateY(${p.y}px)`;
}

function jubelBauen(spieler, farben, gross) {
  const j = JUBEL[spieler.id] ?? JUBEL.pedri;
  const e = document.createElement('div');
  e.className = `jubel ${gross ? 'gross' : 'klein'} ${j.ruhig ? 'ruhig' : ''}`;
  e.innerHTML = `
    <div class="jubel-buehne">
      <div class="jubel-licht"></div>
      ${figurSvg(spieler.id, farben[0], farben[1], j)}
    </div>
    <div class="jubel-name">${spieler.name}</div>
    ${gross ? `<div class="jubel-text">versenkt!</div>` : `<div class="jubel-text klein">Treffer</div>`}`;
  const svg = e.querySelector('svg');
  svg.dataset.hand = j.hand ?? 'offen';
  svg.classList.toggle('mit-herz', !!j.herz);
  poseSetzen(svg, GRUND);
  return { e, svg, j };
}

// Posen nacheinander zeigen (Ronaldo springt zuerst)
function abspielen(svg, j) {
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      if (j.sprung) {
        svg.classList.add('dreht');
        poseSetzen(svg, j.sprung);
        setTimeout(() => {
          svg.classList.remove('dreht');
          poseSetzen(svg, j.pose);
        }, 520);
      } else poseSetzen(svg, j.pose);
    }),
  );
}

// Treffer: klein am Rand. Ein neuer Treffer ersetzt den alten kleinen Jubel.
export function jubelKlein(eltern, spieler, farben, dauer = 10000) {
  eltern.querySelectorAll('.jubel.klein').forEach((alt) => alt.remove());
  const { e, svg, j } = jubelBauen(spieler, farben, false);
  eltern.appendChild(e);
  abspielen(svg, j);
  setTimeout(() => e.classList.add('weg'), dauer - 300);
  setTimeout(() => e.remove(), dauer);
}

// Versenkt: gross in der Mitte. Antippen überspringt den Jubel.
// Gibt ein Versprechen zurück, das nach dem Jubel erfüllt ist.
export function jubelGross(eltern, spieler, farben, dauer = 10000) {
  eltern.querySelectorAll('.jubel.klein').forEach((alt) => alt.remove());
  const { e, svg, j } = jubelBauen(spieler, farben, true);
  e.insertAdjacentHTML('beforeend', '<div class="jubel-weiter">Antippen zum Weiterspielen</div>');
  // Unsichtbare Fläche über allem: irgendwo tippen = weiter
  const faenger = document.createElement('div');
  faenger.className = 'jubel-faenger';
  eltern.appendChild(faenger);
  eltern.appendChild(e);
  abspielen(svg, j);
  return new Promise((fertig) => {
    let vorbei = false;
    const ende = () => {
      if (vorbei) return;
      vorbei = true;
      e.classList.add('weg');
      faenger.remove();
      setTimeout(() => {
        e.remove();
        fertig();
      }, 400);
    };
    const ab = performance.now() + 600; // nicht gleich mit dem Schuss-Tipp überspringen
    faenger.addEventListener('pointerdown', () => performance.now() > ab && ende());
    setTimeout(ende, dauer - 400);
  });
}
