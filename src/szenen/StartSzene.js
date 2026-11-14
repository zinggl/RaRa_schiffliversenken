// Der Startbildschirm: Titel am Abendhimmel, Dreimaster auf dem Wasser, «Tippen zum Starten».
// Geheimtipp: 2 Sekunden aufs Schiff drücken öffnet die Werkstatt.
// Alles Sichtbare ist HTML über dem Spiel, damit es auf dem iPad gestochen scharf ist.
import Phaser from 'phaser';
import { werkstattOeffnen, werkstattWiederOeffnenFallsNoetig } from '../werkstatt/werkstatt.js';
import { DREIMASTER_SVG } from '../dreimaster.js';

const DRUECKEN_MS = 2000; // so lange muss man aufs Schiff drücken

export class StartSzene extends Phaser.Scene {
  constructor() {
    super('Start');
  }

  create() {
    this.ebene = document.createElement('div');
    this.ebene.className = 'start';
    this.ebene.innerHTML = `
      <h1 class="start-titel">Schiffli versenken</h1>
      <div class="logo-schiff">
        <svg class="logo-ring" viewBox="0 0 100 100" aria-hidden="true">
          <circle class="logo-ring-kreis" cx="50" cy="50" r="48" pathLength="100"/>
        </svg>
        ${DREIMASTER_SVG}
      </div>
      <div class="start-hinweis">Tippen zum Starten</div>`;
    document.body.appendChild(this.ebene);
    this.schiff = this.ebene.querySelector('.logo-schiff');

    this.events.once('shutdown', () => this.ebene.remove());

    this.langDrueckenEinrichten();

    // Irgendwo tippen (nicht aufs Schiff und nicht auf einen Fisch) startet das Spiel
    this.input.on('pointerup', (zeiger) => {
      if (zeiger.event?.target?.closest?.('.logo-schiff, .fisch')) return;
      if (document.querySelector('.werkstatt')) return;
      this.scene.start('Spiel');
    });

    werkstattWiederOeffnenFallsNoetig();
  }

  langDrueckenEinrichten() {
    const kreis = this.schiff.querySelector('.logo-ring-kreis');
    let start = null;
    let bild = null;

    const abbrechen = () => {
      start = null;
      cancelAnimationFrame(bild);
      kreis.style.strokeDashoffset = 100;
      this.schiff.classList.remove('drueckt');
    };

    // Ring füllen, solange der Finger drauf bleibt
    const weiter = () => {
      if (start === null) return;
      const anteil = Math.min((performance.now() - start) / DRUECKEN_MS, 1);
      kreis.style.strokeDashoffset = 100 - anteil * 100;
      if (anteil >= 1) {
        abbrechen();
        if (navigator.vibrate) navigator.vibrate(50);
        werkstattOeffnen();
        return;
      }
      bild = requestAnimationFrame(weiter);
    };

    this.schiff.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      start = performance.now();
      this.schiff.classList.add('drueckt');
      bild = requestAnimationFrame(weiter);
    });
    for (const art of ['pointerup', 'pointerleave', 'pointercancel']) {
      this.schiff.addEventListener(art, abbrechen);
    }
    this.schiff.addEventListener('contextmenu', (e) => e.preventDefault());
  }
}
