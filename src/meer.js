// Der Hintergrund: Abendhimmel oben, Unterwasserwelt unten.
// Alles HTML/CSS hinter dem Spiel, damit es auf jedem Bildschirm scharf ist.
// Die Wasserfarbe kommt aus der Werkstatt («meerfarbe»), siehe CSS-Variable --meer.
import { wert, beiAenderung } from './werkstatt/werte.js';
import { haiStarten } from './hai.js';

const STRAHLEN = 6; // Lichtstrahlen unter Wasser
const TEILCHEN = 18; // schwebende Teilchen im Wasser

let ebene = null;

function farbeSetzen() {
  document.documentElement.style.setProperty('--meer', wert('meerfarbe'));
}

// Einmal beim Spielstart aufrufen
export function meerStarten() {
  if (ebene) return;
  farbeSetzen();
  beiAenderung((schluessel) => {
    if (schluessel === 'meerfarbe') farbeSetzen();
  });

  ebene = document.createElement('div');
  ebene.className = 'meer';
  ebene.innerHTML = `
    <div class="himmel"><div class="sonne"></div></div>
    <div class="unterwasser">
      <div class="strahlen"></div>
      <div class="teilchen"></div>
      <div class="tiefe"></div>
    </div>
    <div class="oberflaeche"></div>
    <div class="oberflaeche-glanz"></div>`;
  document.body.appendChild(ebene);

  // Lichtstrahlen: verschieden breit, mit eigenem Rhythmus
  const strahlen = ebene.querySelector('.strahlen');
  for (let i = 0; i < STRAHLEN; i++) {
    const s = document.createElement('div');
    s.className = 'strahl';
    s.style.left = `${8 + i * 15 + Math.random() * 6}%`;
    s.style.width = `${4 + Math.random() * 7}%`;
    s.style.animationDuration = `${6 + Math.random() * 5}s`;
    s.style.animationDelay = `${-Math.random() * 8}s`;
    strahlen.appendChild(s);
  }

  // Kleine Teilchen, die langsam nach oben schweben
  const teilchen = ebene.querySelector('.teilchen');
  for (let i = 0; i < TEILCHEN; i++) {
    const t = document.createElement('div');
    t.className = 'teilchen-punkt';
    t.style.left = `${Math.random() * 100}%`;
    t.style.width = t.style.height = `${1.5 + Math.random() * 2.5}px`;
    t.style.animationDuration = `${14 + Math.random() * 16}s`;
    t.style.animationDelay = `${-Math.random() * 30}s`;
    teilchen.appendChild(t);
  }

  haiStarten(ebene.querySelector('.unterwasser'));
}
