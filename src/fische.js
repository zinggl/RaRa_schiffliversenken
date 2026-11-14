// Fischschwärme, die unter Wasser vorbeiziehen.
// Sie sind HTML über dem Spiel (gestochen scharf) und schwimmen auf allen Bildschirmen.
// Tippt man einen Fisch an, erschrickt der ganze Schwarm und stiebt schnell davon.
// Werkstatt: «fischAnzahl» (alle Fische zusammen) und «fischTempo».
import { wert, beiAenderung } from './werkstatt/werte.js';

const PRO_SCHWARM = 6; // so viele Fische hat ein Schwarm (ungefähr)
const SCHRECK_DAUER = 1.4; // Sekunden, so lange ist ein Schwarm erschreckt
const ABSTAND_OBERFLAECHE = 14; // so viele Pixel bleibt jeder Fisch mindestens unter der Wasserlinie
const WASSER_UNTEN = 0.85; // Schwärme schwimmen höchstens bis hier (Anteil der Bildhöhe)

// Wo ist die Wasserlinie gerade? (Oberkante der Unterwasserwelt, siehe meer.js)
function wasserlinie() {
  const unterwasser = document.querySelector('.unterwasser');
  return unterwasser ? unterwasser.getBoundingClientRect().top : window.innerHeight * 0.6;
}

// Farbarten: [Rücken, Bauch, Schwanz]
const ARTEN = [
  ['#2c4a5a', '#d4e2e8', '#3b5f72'], // silbrig-blau (Makrele)
  ['#2f5b55', '#cfe3dc', '#c9a227'], // grün mit gelbem Schwanz
  ['#3a4656', '#e3e7ea', '#56687c'], // grau-silber (Hering)
];

let ebene = null;
let schwaerme = [];
let letzteZeit = 0;
let nummer = 0; // für eindeutige Verlauf-IDs

const zufall = (von, bis) => von + Math.random() * (bis - von);

// Ein schlanker Fisch, schaut nach rechts
function fischSvg([ruecken, bauch, schwanz]) {
  const id = `fv${nummer++}`;
  return `
    <svg viewBox="0 0 48 18" aria-hidden="true">
      <defs>
        <linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="${ruecken}"/>
          <stop offset="0.5" stop-color="${bauch}" stop-opacity="0.95"/>
          <stop offset="1" stop-color="${bauch}"/>
        </linearGradient>
      </defs>
      <path d="M9,9 L1,2 Q4,9 1,16 Z" fill="${schwanz}"/>
      <path d="M8,9 Q18,1.5 34,3 Q44,5 47,9 Q44,13 34,15 Q18,16.5 8,9 Z" fill="url(#${id})"/>
      <path d="M22,3.2 Q26,0.5 31,3" fill="${ruecken}"/>
      <path d="M24,14.5 Q27,17 30,14.8" fill="${ruecken}" opacity="0.8"/>
      <circle cx="40.5" cy="7.6" r="1.1" fill="#0b1015"/>
      <path d="M36,5 Q37.5,9 36,13" stroke="${ruecken}" stroke-width="0.5" fill="none" opacity="0.6"/>
    </svg>`;
}

function schwarmNeu(irgendwo = false) {
  const schwarm = {
    richtung: Math.random() < 0.5 ? 1 : -1,
    tempo: zufall(22, 45),
    y: zufall(wasserlinie() + 50, Math.max(wasserlinie() + 60, WASSER_UNTEN * window.innerHeight)),
    x: 0,
    breite: 0,
    schreck: 0,
    fische: [],
  };
  schwarm.x = irgendwo
    ? zufall(0, window.innerWidth)
    : schwarm.richtung === 1
      ? -160
      : window.innerWidth + 160;
  return schwarm;
}

// Fische im Schwarm neu verteilen (beim Start und wenn der Schwarm wieder ins Bild kommt)
function fischeVerteilen(schwarm) {
  const art = ARTEN[Math.floor(Math.random() * ARTEN.length)];
  const groesse = zufall(22, 38);
  for (const fisch of schwarm.fische) {
    fisch.dx = zufall(-70, 70);
    fisch.dy = zufall(-26, 26);
    fisch.breite = groesse * zufall(0.85, 1.1);
    fisch.phase = Math.random() * Math.PI * 2;
    fisch.flucht = 0;
    fisch.element.style.width = `${fisch.breite}px`;
    fisch.element.innerHTML = fischSvg(art);
  }
}

function fischNeu(schwarm) {
  const element = document.createElement('div');
  element.className = 'fisch';
  element.style.transform = 'translate3d(-9999px, 0, 0)'; // unsichtbar, bis er seinen Platz im Wasser hat
  const fisch = { element, dx: 0, dy: 0, breite: 30, phase: 0, flucht: 0 };
  element.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    erschrecken(schwarm);
  });
  ebene.appendChild(element);
  schwarm.fische.push(fisch);
}

function erschrecken(schwarm) {
  schwarm.schreck = SCHRECK_DAUER;
  // Jeder Fisch weicht ein Stück nach oben oder unten aus
  for (const fisch of schwarm.fische) fisch.flucht = zufall(-34, 34);
  if (navigator.vibrate) navigator.vibrate(15);
}

// Alle Schwärme neu bauen, passend zur Anzahl in der Werkstatt
function anzahlAnpassen() {
  ebene.innerHTML = '';
  schwaerme = [];
  let rest = Math.max(0, Math.round(wert('fischAnzahl') ?? 0));
  while (rest > 0) {
    const schwarm = schwarmNeu(true);
    const anzahl = Math.min(rest, PRO_SCHWARM);
    for (let i = 0; i < anzahl; i++) fischNeu(schwarm);
    fischeVerteilen(schwarm);
    schwaerme.push(schwarm);
    rest -= anzahl;
  }
}

function schwimmen(zeit) {
  const dt = Math.min((zeit - letzteZeit) / 1000, 0.1);
  letzteZeit = zeit;
  const tempo = wert('fischTempo') ?? 1;
  const oben = wasserlinie() + ABSTAND_OBERFLAECHE - 8; // 8 = Tipp-Rand über dem Fisch

  for (const schwarm of schwaerme) {
    schwarm.schreck = Math.max(0, schwarm.schreck - dt);
    const anteil = schwarm.schreck / SCHRECK_DAUER; // 1 = gerade erschreckt, 0 = ruhig
    const turbo = 1 + 5 * anteil * anteil;
    schwarm.x += schwarm.richtung * schwarm.tempo * tempo * turbo * dt;

    const weg =
      (schwarm.richtung === 1 && schwarm.x > window.innerWidth + 160) ||
      (schwarm.richtung === -1 && schwarm.x < -160);
    if (weg) {
      Object.assign(schwarm, schwarmNeu(), { fische: schwarm.fische });
      fischeVerteilen(schwarm);
    }

    for (const fisch of schwarm.fische) {
      fisch.phase += dt * (1.2 + 3 * anteil);
      const x = schwarm.x + fisch.dx * schwarm.richtung;
      // Fische bleiben immer im Wasser: nie über der Wasserlinie, nie unter dem Bildschirmrand
      const hoch = fisch.breite * 0.4 + 16; // Fischhöhe samt Tipp-Rand
      const wunsch = schwarm.y + fisch.dy + Math.sin(fisch.phase) * 3 + fisch.flucht * anteil;
      const y = Math.min(Math.max(wunsch, oben), window.innerHeight - hoch);
      fisch.element.style.transform = `translate3d(${x}px, ${y}px, 0) scaleX(${schwarm.richtung})`;
    }
  }
  requestAnimationFrame(schwimmen);
}

// Einmal beim Spielstart aufrufen
export function fischeStarten() {
  if (ebene) return;
  ebene = document.createElement('div');
  ebene.className = 'fische';
  document.body.appendChild(ebene);
  anzahlAnpassen();
  beiAenderung((schluessel) => {
    if (schluessel === 'fischAnzahl') anzahlAnpassen();
  });
  requestAnimationFrame((zeit) => {
    letzteZeit = zeit;
    requestAnimationFrame(schwimmen);
  });
}

// Für später: Auf dem Spielfeld können die Fische versteckt werden
export function fischeZeigen(sichtbar) {
  if (ebene) ebene.style.display = sichtbar ? '' : 'none';
}
