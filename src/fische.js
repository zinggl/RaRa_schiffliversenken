// Bunte Fische, die im ganzen Meer herumschwimmen.
// Sie sind HTML über dem Spiel (gestochen scharf) und schwimmen auf beiden Bildschirmen.
// Tippt man einen Fisch an, erschrickt er: Er macht einen Sprung und schwimmt schnell weg.
// Werkstatt: «fischAnzahl» und «fischTempo».
import { wert, beiAenderung } from './werkstatt/werte.js';

const FARBEN = [
  ['#ff922b', '#ffd8a8'], // orange
  ['#fcc419', '#fff3bf'], // gelb
  ['#f06595', '#ffdeeb'], // rosa
  ['#51cf66', '#d3f9d8'], // grün
  ['#845ef7', '#e5dbff'], // violett
  ['#22b8cf', '#c5f6fa'], // türkis
];

const SCHRECK_DAUER = 1.2; // Sekunden, so lange schwimmt ein erschreckter Fisch schnell

let ebene = null;
const fische = [];
let letzteZeit = 0;

// Ein Fisch als kleine Vektorgrafik, schaut nach rechts
function fischSvg([farbe, hell]) {
  return `
    <svg viewBox="0 0 60 36" aria-hidden="true">
      <path d="M10,18 L0,6 Q4,18 0,30 Z" fill="${farbe}"/>
      <ellipse cx="32" cy="18" rx="24" ry="13" fill="${farbe}"/>
      <path d="M26,6 Q30,0 38,6 Z" fill="${farbe}"/>
      <path d="M22,8 Q26,18 22,28" stroke="${hell}" stroke-width="3" fill="none"/>
      <path d="M32,6 Q36,18 32,30" stroke="${hell}" stroke-width="3" fill="none"/>
      <circle cx="46" cy="15" r="3.6" fill="#fff"/>
      <circle cx="47" cy="15" r="1.9" fill="#212529"/>
      <path d="M53,22 Q50,24 47,22" stroke="#212529" stroke-width="1.2" fill="none" stroke-linecap="round"/>
    </svg>`;
}

function neuerFisch() {
  const element = document.createElement('div');
  element.className = 'fisch';
  const fisch = { element, x: 0, y: 0, breite: 0, tempo: 0, richtung: 1, welle: 0, schreck: 0 };
  element.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    erschrecken(fisch);
  });
  ebene.appendChild(element);
  neuStarten(fisch, true);
  fische.push(fisch);
}

// Fisch bekommt neue Farbe, Grösse und Bahn. Beim ersten Mal irgendwo im Bild, danach am Rand.
function neuStarten(fisch, irgendwo = false) {
  const zufall = (von, bis) => von + Math.random() * (bis - von);
  fisch.breite = zufall(34, 80);
  fisch.tempo = zufall(35, 90);
  fisch.richtung = Math.random() < 0.5 ? 1 : -1;
  fisch.y = zufall(0.06, 0.9) * window.innerHeight;
  fisch.welle = Math.random() * Math.PI * 2;
  fisch.schreck = 0;
  if (irgendwo) fisch.x = zufall(0, window.innerWidth);
  else fisch.x = fisch.richtung === 1 ? -fisch.breite : window.innerWidth + fisch.breite;
  fisch.element.style.width = `${fisch.breite}px`;
  fisch.element.innerHTML = fischSvg(FARBEN[Math.floor(Math.random() * FARBEN.length)]);
}

function erschrecken(fisch) {
  fisch.schreck = SCHRECK_DAUER;
  // Kleiner Sprung (CSS-Animation), neu starten auch wenn sie schon läuft
  const bild = fisch.element.firstElementChild;
  bild.classList.remove('erschreckt');
  void bild.offsetWidth;
  bild.classList.add('erschreckt');
  if (navigator.vibrate) navigator.vibrate(20);
}

function anzahlAnpassen() {
  const soll = Math.max(0, Math.round(wert('fischAnzahl') ?? 0));
  while (fische.length < soll) neuerFisch();
  while (fische.length > soll) fische.pop().element.remove();
}

function schwimmen(zeit) {
  const dt = Math.min((zeit - letzteZeit) / 1000, 0.1);
  letzteZeit = zeit;
  const tempo = wert('fischTempo') ?? 1;

  for (const fisch of fische) {
    fisch.schreck = Math.max(0, fisch.schreck - dt);
    const turbo = 1 + 6 * (fisch.schreck / SCHRECK_DAUER);
    fisch.x += fisch.richtung * fisch.tempo * tempo * turbo * dt;
    fisch.welle += dt * 2;

    const ausserhalb =
      (fisch.richtung === 1 && fisch.x > window.innerWidth + fisch.breite) ||
      (fisch.richtung === -1 && fisch.x < -fisch.breite * 2);
    if (ausserhalb) neuStarten(fisch);

    const y = fisch.y + Math.sin(fisch.welle) * 6; // leichtes Auf und Ab
    fisch.element.style.transform = `translate3d(${fisch.x}px, ${y}px, 0) scaleX(${fisch.richtung})`;
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
