// Der Startbildschirm: Meer, Logo mit Titel und «Tippen zum Starten».
// Geheimtipp: 2 Sekunden aufs Schiff drücken öffnet die Werkstatt.
import Phaser from 'phaser';
import { wert, beiAenderung } from '../werkstatt/werte.js';
import { werkstattOeffnen, werkstattWiederOeffnenFallsNoetig } from '../werkstatt/werkstatt.js';
import { zeichneMeer } from '../meer.js';
import { DREIMASTER_SVG } from '../dreimaster.js';

const DRUECKEN_MS = 2000; // so lange muss man aufs Logo drücken

export class StartSzene extends Phaser.Scene {
  constructor() {
    super('Start');
  }

  create() {
    this.meer = this.add.graphics();
    this.logo = this.baueLogo();
    this.hinweis = this.add
      .text(0, 0, 'Tippen zum Starten', {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '40px',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setShadow(0, 3, 'rgba(0,0,0,0.35)', 6);

    // «Tippen zum Starten» pulsiert leicht
    this.tweens.add({ targets: this.hinweis, alpha: 0.4, duration: 900, yoyo: true, repeat: -1 });

    this.anordnen();
    this.scale.on('resize', this.anordnen, this);

    // Meer neu malen, wenn die Farbe in der Werkstatt geändert wird
    const aufhoeren = beiAenderung((schluessel) => {
      if (schluessel === 'meerfarbe') this.maleMeer();
    });
    this.events.once('shutdown', () => {
      aufhoeren();
      this.logo.remove();
      this.scale.off('resize', this.anordnen, this);
    });

    this.langDrueckenEinrichten();

    // Irgendwo tippen (nicht aufs Logo und nicht auf einen Fisch) startet das Spiel
    this.input.on('pointerup', (zeiger) => {
      if (zeiger.event?.target?.closest?.('.start-logo, .fisch')) return;
      if (document.querySelector('.werkstatt')) return;
      this.scene.start('Spiel');
    });

    werkstattWiederOeffnenFallsNoetig();
  }

  // Logo und Titel sind kein Phaser-Bild, sondern HTML über dem Spiel.
  // So sind Schiff und Schrift auf dem iPad gestochen scharf.
  baueLogo() {
    const logo = document.createElement('div');
    logo.className = 'start-logo';
    logo.innerHTML = `
      <div class="logo-schiff">
        <svg class="logo-ring" viewBox="0 0 100 100" aria-hidden="true">
          <circle class="logo-ring-kreis" cx="50" cy="50" r="47" pathLength="100"/>
        </svg>
        ${DREIMASTER_SVG}
      </div>
      <h1 class="logo-titel">Schiffli versenken</h1>`;
    logo.style.setProperty('--meer', wert('meerfarbe'));
    document.body.appendChild(logo);
    return logo;
  }

  langDrueckenEinrichten() {
    const kreis = this.logo.querySelector('.logo-ring-kreis');
    let start = null;
    let bild = null;

    const abbrechen = () => {
      start = null;
      cancelAnimationFrame(bild);
      kreis.style.strokeDashoffset = 100;
      this.logo.classList.remove('drueckt');
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

    this.logo.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      start = performance.now();
      this.logo.classList.add('drueckt');
      bild = requestAnimationFrame(weiter);
    });
    for (const art of ['pointerup', 'pointerleave', 'pointercancel']) {
      this.logo.addEventListener(art, abbrechen);
    }
    this.logo.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  anordnen() {
    const { width, height } = this.scale;
    this.maleMeer();
    this.hinweis.setPosition(width / 2, height * 0.8);
  }

  maleMeer() {
    const { width, height } = this.scale;
    zeichneMeer(this.meer, width, height, wert('meerfarbe'));
    this.logo.style.setProperty('--meer', wert('meerfarbe'));
  }
}
