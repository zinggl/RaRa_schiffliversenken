// Der Startbildschirm: Titel am Abendhimmel, Dreimaster auf dem Wasser.
// Aufs Schiff tippen startet das Spiel. Anderswo tippen macht nichts.
// (Die Werkstatt öffnet sich mit 2 Sekunden Drücken auf den Hai, siehe hai.js.)
// Alles Sichtbare ist HTML über dem Spiel, damit es auf dem iPad gestochen scharf ist.
import Phaser from 'phaser';
import { werkstattWiederOeffnenFallsNoetig } from '../werkstatt/werkstatt.js';
import { DREIMASTER_SVG } from '../dreimaster.js';

export class StartSzene extends Phaser.Scene {
  constructor() {
    super('Start');
  }

  create() {
    this.ebene = document.createElement('div');
    this.ebene.className = 'start';
    this.ebene.innerHTML = `
      <h1 class="start-titel">Schiffli versenken</h1>
      <div class="logo-schiff" role="button" aria-label="Spiel starten">${DREIMASTER_SVG}</div>
      <div class="start-hinweis">Aufs Schiff tippen</div>`;
    document.body.appendChild(this.ebene);
    this.events.once('shutdown', () => this.ebene.remove());

    this.schiffAntippenEinrichten(this.ebene.querySelector('.logo-schiff'));
    werkstattWiederOeffnenFallsNoetig();
  }

  // Finger aufs Schiff und wieder loslassen = Spiel starten
  schiffAntippenEinrichten(schiff) {
    let gedrueckt = false;
    const loslassen = () => {
      gedrueckt = false;
      schiff.classList.remove('gedrueckt');
    };
    schiff.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (document.querySelector('.werkstatt')) return;
      gedrueckt = true;
      schiff.classList.add('gedrueckt'); // Schiff leuchtet kurz auf
    });
    schiff.addEventListener('pointerup', () => {
      if (!gedrueckt) return;
      loslassen();
      this.scene.start('Spiel');
    });
    schiff.addEventListener('pointerleave', loslassen);
    schiff.addEventListener('pointercancel', loslassen);
    schiff.addEventListener('contextmenu', (e) => e.preventDefault());
  }
}
