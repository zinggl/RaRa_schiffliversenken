// Hier startet das Spiel.
import Phaser from 'phaser';
import './stil.css';
import { StartSzene } from './szenen/StartSzene.js';
import { SpielSzene } from './szenen/SpielSzene.js';

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'spiel',
  backgroundColor: '#0b3d6e',
  scale: {
    // EXPAND: Das Spiel füllt den ganzen Bildschirm, egal ob iPad oder iPhone
    mode: Phaser.Scale.EXPAND,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1200,
    height: 800,
  },
  scene: [StartSzene, SpielSzene],
});
