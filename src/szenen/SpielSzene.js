// Platzhalter fürs Spielfeld. Hier kommt in Modul 1 das Raster mit den Schiffen dazu.
import Phaser from 'phaser';
import { wert } from '../werkstatt/werte.js';
import { zeichneMeer } from '../meer.js';

export class SpielSzene extends Phaser.Scene {
  constructor() {
    super('Spiel');
  }

  create() {
    const { width, height } = this.scale;
    zeichneMeer(this.add.graphics(), width, height, wert('meerfarbe'));

    this.add
      .text(width / 2, height / 2, '🚢 Hier kommt Modul 1', {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '44px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 + 80, 'Tippen = zurück', {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '28px',
        color: '#ffffffaa',
      })
      .setOrigin(0.5);

    this.input.once('pointerup', () => this.scene.start('Start'));
  }
}
