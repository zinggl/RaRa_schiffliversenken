// Der Jubel der Spieler: Wird ein Schiff getroffen, jubelt der getroffene Spieler.
// Treffer: kurz klein am Rand. Versenkt: gross in der Mitte, mit Namen.
// Die Figur ist eine schlanke Silhouette im Trikot der Clubfarben (keine Fotos).
// Sie besteht aus Gelenken, die sich drehen: Arme (Schulter, Ellbogen), Beine (Hüfte, Knie).
// Winkel in Grad, 0 = hängt gerade nach unten. Linke Seite (vom Betrachter aus):
// positiv = nach aussen/oben. Rechte Seite: negativ = nach aussen/oben.

// Gelenke der Figur (viewBox 0 -34 200 324: oben Platz für hochgestreckte Arme)
const G = {
  schulterL: [80, 86], ellbogenL: [80, 126], handL: [80, 160],
  schulterR: [120, 86], ellbogenR: [120, 126], handR: [120, 160],
  huefteL: [92, 170], knieL: [92, 214], fussL: [92, 256],
  huefteR: [108, 170], knieR: [108, 214], fussR: [108, 256],
  hals: [100, 78],
};

const GRUND = { aL: 8, fL: 0, aR: -8, fR: 0, bL: 3, kL: 0, bR: -3, kR: 0, y: 0, kopf: 0 };

// Die Jubel-Posen (aus Raphaels Liste)
export const JUBEL = {
  mbappe: { text: 'Arme verschränkt', pose: { aL: -25, fL: -100, aR: 25, fR: 100, kopf: -4 } },
  haaland: { text: 'Meditiert', pose: { aL: 22, fL: 38, aR: -22, fR: -38, bL: 82, kL: -168, bR: -82, kR: 168, y: 70 }, ruhig: true },
  ronaldo: {
    text: 'Siuuu!',
    sprung: { aL: 150, fL: 10, aR: -150, fR: -10, bL: 18, kL: -70, bR: -18, kR: 70, y: -48 },
    pose: { aL: 52, fL: 6, aR: -52, fR: -6, bL: 30, kL: -6, bR: -30, kR: 6, y: 8, kopf: -6 },
  },
  yamal: { text: '3 0 4', pose: { aL: 140, fL: -128, aR: -140, fR: 128 }, zeichen: '304' },
  keni: { text: 'Faust hoch', pose: { aL: 32, fL: -85, aR: -176, fR: 0, bL: 14, kL: -28, bR: -10, kR: 22 } },
  messi: { text: 'Finger zum Himmel', pose: { aL: 168, fL: 4, aR: -168, fR: -4, kopf: 0 }, finger: true },
  neymar: { text: 'Herz', pose: { aL: -20, fL: -141, aR: 20, fR: 141 }, herz: true },
  xhaka: { text: 'Faust aufs Wappen', pose: { aL: 38, fL: -70, aR: 20, fR: 141 } },
  pedri: { text: 'Arme hoch', pose: { aL: 150, fL: 12, aR: -150, fR: -12 } },
  musiala: { text: 'Daumen hoch', pose: { aL: 38, fL: 140, aR: -38, fR: -140 }, daumen: true },
};

let zaehler = 0;

function figurSvg(farbe1, farbe2) {
  const id = `jf${zaehler++}`;
  const [sLx, sLy] = G.schulterL; const [eLx, eLy] = G.ellbogenL; const [hLx, hLy] = G.handL;
  const [sRx, sRy] = G.schulterR; const [eRx, eRy] = G.ellbogenR; const [hRx, hRy] = G.handR;
  const [uLx, uLy] = G.huefteL; const [nLx, nLy] = G.knieL; const [fLx, fLy] = G.fussL;
  const [uRx, uRy] = G.huefteR; const [nRx, nRy] = G.knieR; const [fRx, fRy] = G.fussR;
  const haut = '#b98762';
  const arm = (s, e, h, seite) => `
    <g class="glied ${seite}-arm" style="transform-origin:${s[0]}px ${s[1]}px">
      <line x1="${s[0]}" y1="${s[1]}" x2="${e[0]}" y2="${e[1]}" stroke="${farbe1}" stroke-width="13" stroke-linecap="round"/>
      <g class="glied ${seite}-unterarm" style="transform-origin:${e[0]}px ${e[1]}px">
        <line x1="${e[0]}" y1="${e[1]}" x2="${h[0]}" y2="${h[1]}" stroke="${haut}" stroke-width="10" stroke-linecap="round"/>
        <circle cx="${h[0]}" cy="${h[1] + 3}" r="6.5" fill="${haut}"/>
        <line class="finger" x1="${h[0]}" y1="${h[1] + 3}" x2="${h[0]}" y2="${h[1] + 16}" stroke="${haut}" stroke-width="3.5" stroke-linecap="round"/>
        <line class="daumen" x1="${h[0] + (seite === 'l' ? 3 : -3)}" y1="${h[1] + 4}" x2="${h[0] + (seite === 'l' ? 3 : -3)}" y2="${h[1] + 15}" stroke="${haut}" stroke-width="4.5" stroke-linecap="round"/>
      </g>
    </g>`;
  const bein = (u, n, f, seite) => `
    <g class="glied ${seite}-bein" style="transform-origin:${u[0]}px ${u[1]}px">
      <line x1="${u[0]}" y1="${u[1]}" x2="${n[0]}" y2="${n[1]}" stroke="${haut}" stroke-width="14" stroke-linecap="round"/>
      <g class="glied ${seite}-unterschenkel" style="transform-origin:${n[0]}px ${n[1]}px">
        <line x1="${n[0]}" y1="${n[1]}" x2="${f[0]}" y2="${f[1]}" stroke="${farbe1}" stroke-width="12" stroke-linecap="round"/>
        <ellipse cx="${f[0] + (seite === 'l' ? -4 : 4)}" cy="${f[1] + 5}" rx="10" ry="5" fill="#15181b"/>
      </g>
    </g>`;
  return `
<svg class="jubel-figur" viewBox="0 -34 200 324" aria-hidden="true">
  <defs>
    <linearGradient id="${id}-trikot" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#000" stop-opacity="0.28"/>
      <stop offset="0.55" stop-color="#000" stop-opacity="0"/>
      <stop offset="1" stop-color="#fff" stop-opacity="0.16"/>
    </linearGradient>
  </defs>
  <ellipse class="schatten" cx="100" cy="270" rx="46" ry="7" fill="#000" opacity="0.35"/>
  <g class="koerper">
    ${bein([uLx, uLy], [nLx, nLy], [fLx, fLy], 'l')}
    ${bein([uRx, uRy], [nRx, nRy], [fRx, fRy], 'r')}
    <!-- Hose -->
    <path d="M86,150 L114,150 L116,178 L101,180 L100,170 L99,180 L84,178 Z" fill="${farbe2}"/>
    <!-- Trikot -->
    <path d="M78,84 Q100,76 122,84 L116,154 Q100,158 84,154 Z" fill="${farbe1}"/>
    <path d="M78,84 Q100,76 122,84 L116,154 Q100,158 84,154 Z" fill="url(#${id}-trikot)"/>
    <path d="M94,80 L100,90 L106,80" fill="none" stroke="${farbe2}" stroke-width="3"/>
    <rect class="wappen" x="86" y="98" width="9" height="11" rx="2" fill="${farbe2}" opacity="0.9"/>
    <!-- Kopf -->
    <g class="glied kopf" style="transform-origin:${G.hals[0]}px ${G.hals[1]}px">
      <rect x="95" y="68" width="10" height="12" fill="${haut}"/>
      <circle cx="100" cy="56" r="15" fill="${haut}"/>
      <path d="M85,54 Q86,38 100,38 Q114,38 115,54 Q108,46 100,46 Q92,46 85,54 Z" fill="#1d1612"/>
    </g>
    <!-- Arme vor dem Körper (für verschränkte Arme, Herz, Faust aufs Wappen) -->
    ${arm([sLx, sLy], [eLx, eLy], [hLx, hLy], 'l')}
    ${arm([sRx, sRy], [eRx, eRy], [hRx, hRy], 'r')}
    <!-- Herz (Neymar) -->
    <path class="herz" d="M100,112 C92,104 86,98 92,92 C96,88 100,92 100,95 C100,92 104,88 108,92 C114,98 108,104 100,112 Z" fill="#e0475b"/>
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
  drehen('l-bein', p.bL);
  drehen('l-unterschenkel', p.kL);
  drehen('r-bein', p.bR);
  drehen('r-unterschenkel', p.kR);
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
      ${figurSvg(farben[0], farben[1])}
      ${j.zeichen ? `<div class="jubel-zeichen">${j.zeichen}</div>` : ''}
    </div>
    <div class="jubel-name">${spieler.name}</div>
    ${gross ? `<div class="jubel-text">versenkt!</div>` : `<div class="jubel-text klein">Treffer</div>`}`;
  const svg = e.querySelector('svg');
  svg.classList.toggle('mit-herz', !!j.herz);
  svg.classList.toggle('mit-finger', !!j.finger);
  svg.classList.toggle('mit-daumen', !!j.daumen);
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

// Treffer: kurz klein am Rand
export function jubelKlein(eltern, spieler, farben, dauer = 1400) {
  const { e, svg, j } = jubelBauen(spieler, farben, false);
  eltern.appendChild(e);
  abspielen(svg, j);
  setTimeout(() => e.classList.add('weg'), dauer - 300);
  setTimeout(() => e.remove(), dauer);
}

// Versenkt: gross in der Mitte. Gibt ein Versprechen zurück, das nach dem Jubel erfüllt ist.
export function jubelGross(eltern, spieler, farben, dauer = 2500) {
  const { e, svg, j } = jubelBauen(spieler, farben, true);
  eltern.appendChild(e);
  abspielen(svg, j);
  return new Promise((fertig) => {
    setTimeout(() => e.classList.add('weg'), dauer - 400);
    setTimeout(() => {
      e.remove();
      fertig();
    }, dauer);
  });
}
