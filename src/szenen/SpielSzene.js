// Platzhalter fürs Spielfeld. Hier kommt in Modul 1 das Raster mit den Schiffen dazu.
import Phaser from 'phaser';

export class SpielSzene extends Phaser.Scene {
  constructor() {
    super('Spiel');
  }

  create() {
    // Text als HTML, damit er scharf ist
    this.ebene = document.createElement('div');
    this.ebene.className = 'platzhalter';
    this.ebene.innerHTML = `
      <div class="platzhalter-titel">Modul 1 folgt</div>
      <div class="start-hinweis">Tippen für zurück</div>`;
    document.body.appendChild(this.ebene);
    this.events.once('shutdown', () => this.ebene.remove());

    // Tippen (nicht auf einen Fisch oder den Hai) führt zurück
    this.input.on('pointerup', (zeiger) => {
      if (zeiger.event?.target?.closest?.('.fisch, .hai')) return;
      if (document.querySelector('.werkstatt')) return;
      this.scene.start('Start');
    });
  }
}
