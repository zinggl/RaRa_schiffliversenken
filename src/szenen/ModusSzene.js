// Spielmodus wählen: gegen den Computer, zu zweit auf einem iPad oder zu zweit mit zwei Geräten.
// Gegen den Computer wählt man danach noch die Schwierigkeit (leicht, mittel, schwer).
import Phaser from 'phaser';
import { spielstand } from '../logik/spielstand.js';

const SPERRE_MS = 400; // kurz nach dem Wechsel nichts annehmen (sonst zählt der Tipp aufs Schiff gleich mit)

// Feine Linien-Symbole (keine Emojis)
const SYMBOLE = {
  computer: `<svg viewBox="0 0 48 48"><rect x="7" y="9" width="34" height="22" rx="2.5"/><path d="M18 39h12M24 31v8"/><path d="M15 20l5 4 5-7 8 6"/></svg>`,
  zwei: `<svg viewBox="0 0 48 48"><rect x="11" y="6" width="26" height="36" rx="3"/><circle cx="20" cy="20" r="3.5"/><circle cx="29" cy="20" r="3.5"/><path d="M14.5 32c1-4 3-5.5 5.5-5.5s4.5 1.5 5.5 5.5M23.5 32c1-4 3-5.5 5.5-5.5s4.5 1.5 5.5 5.5"/></svg>`,
  online: `<svg viewBox="0 0 48 48"><rect x="4" y="14" width="16" height="24" rx="2.5"/><rect x="28" y="10" width="16" height="28" rx="2.5"/><path d="M21 9c2-3 4-4 6-4M22 13c1.2-1.6 2.6-2.4 4-2.4"/></svg>`,
};

// Stufen-Symbol: 1, 2 oder 3 gefüllte Balken
const balken = (n) =>
  `<svg viewBox="0 0 48 48">${[0, 1, 2].map((i) => `<rect x="${9 + i * 11}" y="${30 - i * 8}" width="8" height="${12 + i * 8}" rx="1.5" class="${i < n ? 'voll' : ''}"/>`).join('')}</svg>`;

const STUFEN = [
  { stufe: 'leicht', name: 'Leicht', info: 'Der Computer schiesst aufs Geratewohl', balken: 1 },
  { stufe: 'mittel', name: 'Mittel', info: 'Nach einem Treffer sucht er rundherum weiter', balken: 2 },
  { stufe: 'schwer', name: 'Schwer', info: 'Er rechnet aus, wo deine Schiffe liegen', balken: 3 },
];

const MODI = [
  { modus: 'computer', name: 'Gegen den Computer', info: 'Ein Spieler' },
  { modus: 'zwei', name: 'Zu zweit auf einem iPad', info: 'Abwechselnd aufstellen und spielen' },
  { modus: 'online', name: 'Zu zweit mit zwei Geräten', info: 'Kommt bald' },
];

export class ModusSzene extends Phaser.Scene {
  constructor() {
    super('Modus');
  }

  create() {
    this.ab = performance.now() + SPERRE_MS;
    this.schritt = 'modus';
    this.ebene = document.createElement('div');
    this.ebene.className = 'modus';
    this.ebene.innerHTML = `
      <h1 class="start-titel">RaRa Seeschlacht</h1>
      <button class="knopf knopf-zurueck">Zurück</button>
      <div class="modus-box"></div>`;
    document.body.appendChild(this.ebene);
    this.box = this.ebene.querySelector('.modus-box');
    this.events.once('shutdown', () => this.ebene.remove());
    this.modiZeigen();

    this.ebene.addEventListener('click', (e) => {
      if (performance.now() < this.ab) return;
      const knopf = e.target.closest('button');
      if (!knopf) return;
      if (knopf.classList.contains('knopf-zurueck')) {
        if (this.schritt === 'stufe') return this.modiZeigen();
        return this.scene.start('Start');
      }
      if (knopf.dataset.stufe) {
        spielstand.stufe = knopf.dataset.stufe;
        return this.losgehen('computer');
      }
      if (knopf.dataset.modus === 'computer') return this.stufenZeigen();
      if (knopf.dataset.modus) this.losgehen(knopf.dataset.modus);
    });
  }

  knopfHtml(daten, symbol, wert) {
    return `
      <button class="modus-knopf" ${wert}>
        <span class="modus-symbol">${symbol}</span>
        <span class="modus-text">
          <span class="modus-name">${daten.name}</span>
          <span class="modus-info">${daten.info}</span>
        </span>
      </button>`;
  }

  modiZeigen() {
    this.schritt = 'modus';
    this.box.innerHTML = `
      <div class="modus-titel">Spielmodus</div>
      ${MODI.map((m) => this.knopfHtml(m, SYMBOLE[m.modus], `data-modus="${m.modus}"`)).join('')}`;
  }

  stufenZeigen() {
    this.schritt = 'stufe';
    this.ab = performance.now() + 250;
    this.box.innerHTML = `
      <div class="modus-titel">Schwierigkeit</div>
      ${STUFEN.map((s) => this.knopfHtml(s, balken(s.balken), `data-stufe="${s.stufe}"${s.stufe === spielstand.stufe ? ' aria-current="true"' : ''}`)).join('')}`;
  }

  losgehen(modus) {
    spielstand.modus = modus;
    spielstand.flotten = [null, null];
    this.scene.start('Aufstellen', { modus, spieler: 1 });
  }
}
