// Spielmodus wählen: gegen den Computer, zu zweit auf einem iPad oder zu zweit mit zwei Geräten.
// In Modul 1 führen alle drei Knöpfe zum Aufstellen der Flotte.
import Phaser from 'phaser';
import { spielstand } from '../logik/spielstand.js';

const SPERRE_MS = 400; // kurz nach dem Wechsel nichts annehmen (sonst zählt der Tipp aufs Schiff gleich mit)

// Feine Linien-Symbole (keine Emojis)
const SYMBOLE = {
  computer: `<svg viewBox="0 0 48 48"><rect x="7" y="9" width="34" height="22" rx="2.5"/><path d="M18 39h12M24 31v8"/><path d="M15 20l5 4 5-7 8 6"/></svg>`,
  zwei: `<svg viewBox="0 0 48 48"><rect x="11" y="6" width="26" height="36" rx="3"/><circle cx="20" cy="20" r="3.5"/><circle cx="29" cy="20" r="3.5"/><path d="M14.5 32c1-4 3-5.5 5.5-5.5s4.5 1.5 5.5 5.5M23.5 32c1-4 3-5.5 5.5-5.5s4.5 1.5 5.5 5.5"/></svg>`,
  online: `<svg viewBox="0 0 48 48"><rect x="4" y="14" width="16" height="24" rx="2.5"/><rect x="28" y="10" width="16" height="28" rx="2.5"/><path d="M21 9c2-3 4-4 6-4M22 13c1.2-1.6 2.6-2.4 4-2.4"/></svg>`,
};

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
    const ab = performance.now() + SPERRE_MS;
    this.ebene = document.createElement('div');
    this.ebene.className = 'modus';
    this.ebene.innerHTML = `
      <h1 class="start-titel">RaRa Seeschlacht</h1>
      <button class="knopf knopf-zurueck" data-ziel="start">Zurück</button>
      <div class="modus-box">
        <div class="modus-titel">Spielmodus</div>
        ${MODI.map((m) => `
          <button class="modus-knopf" data-modus="${m.modus}">
            <span class="modus-symbol">${SYMBOLE[m.modus]}</span>
            <span class="modus-text">
              <span class="modus-name">${m.name}</span>
              <span class="modus-info">${m.info}</span>
            </span>
          </button>`).join('')}
      </div>`;
    document.body.appendChild(this.ebene);
    this.events.once('shutdown', () => this.ebene.remove());

    this.ebene.addEventListener('click', (e) => {
      if (performance.now() < ab) return;
      const knopf = e.target.closest('button');
      if (!knopf) return;
      if (knopf.dataset.ziel === 'start') return this.scene.start('Start');
      spielstand.modus = knopf.dataset.modus;
      spielstand.flotten = [null, null];
      this.scene.start('Aufstellen', { modus: knopf.dataset.modus, spieler: 1 });
    });
  }
}
