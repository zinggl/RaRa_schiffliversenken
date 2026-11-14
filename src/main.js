// Hier startet das Spiel.
import Phaser from 'phaser';
import '@fontsource/cinzel/600.css';
import '@fontsource/cinzel/700.css';
import './stil.css';
import { StartSzene } from './szenen/StartSzene.js';
import { ModusSzene } from './szenen/ModusSzene.js';
import { AufstellSzene } from './szenen/AufstellSzene.js';
import { meerStarten } from './meer.js';
import { fischeStarten } from './fische.js';
import { haiStarten } from './hai.js';

// Meer, Hai und Fische liegen als HTML hinter bzw. über dem Spiel, auf allen Bildschirmen
meerStarten();
haiStarten();
fischeStarten();

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'spiel',
  transparent: true, // man sieht das Meer dahinter
  scale: {
    // EXPAND: Das Spiel füllt den ganzen Bildschirm, egal ob iPad oder iPhone
    mode: Phaser.Scale.EXPAND,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1200,
    height: 800,
  },
  scene: [StartSzene, ModusSzene, AufstellSzene],
});
