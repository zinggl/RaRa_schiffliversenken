// Der Startbildschirm: Meer, Logo mit Titel und «Tippen zum Starten».
// Geheimtipp: 3 Sekunden aufs Logo drücken öffnet die Werkstatt.
import Phaser from 'phaser';
import { wert, beiAenderung } from '../werkstatt/werte.js';
import { werkstattOeffnen, werkstattWiederOeffnenFallsNoetig } from '../werkstatt/werkstatt.js';
import { zeichneMeer } from '../meer.js';

const DRUECKEN_MS = 3000; // so lange muss man aufs Logo drücken

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
      this.scale.off('resize', this.anordnen, this);
    });

    this.langDrueckenEinrichten();

    // Irgendwo tippen (nicht aufs Logo) startet das Spiel
    this.input.on('pointerup', (zeiger, getroffen) => {
      if (getroffen.includes(this.logoFlaeche)) return;
      if (document.querySelector('.werkstatt')) return;
      this.scene.start('Spiel');
    });

    werkstattWiederOeffnenFallsNoetig();
  }

  baueLogo() {
    const logo = this.add.container(0, 0);
    // Ein einfaches Schiff als Logo (Rumpf, Aufbau, Kamin)
    const schiff = this.add.graphics();
    schiff.fillStyle(0x495057).fillPoints(
      [
        new Phaser.Math.Vector2(-70, 0),
        new Phaser.Math.Vector2(70, 0),
        new Phaser.Math.Vector2(50, 28),
        new Phaser.Math.Vector2(-55, 28),
      ],
      true,
    );
    schiff.fillStyle(0xc92a2a).fillRect(-62, 18, 118, 6); // roter Streifen
    schiff.fillStyle(0xf1f3f5).fillRect(-35, -26, 60, 26); // Aufbau
    schiff.fillStyle(0x212529).fillRect(-25, -18, 8, 8).fillRect(-10, -18, 8, 8).fillRect(5, -18, 8, 8);
    schiff.fillStyle(0xffd43b).fillRect(-5, -48, 18, 22); // Kamin
    schiff.setPosition(0, -70).setScale(1.6);

    const titel = this.add
      .text(0, 40, 'Schiffli versenken', {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '84px',
        fontStyle: '900',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setShadow(0, 5, 'rgba(0,0,0,0.4)', 10);

    // Der Ring zeigt an, wie lange man schon drückt
    this.ring = this.add.graphics();
    this.ring.setPosition(0, -70);

    logo.add([this.ring, schiff, titel]);

    // Unsichtbare Fläche über dem Logo, die auf Drücken reagiert
    this.logoFlaeche = this.add.zone(0, -10, 620, 260).setInteractive();
    logo.add(this.logoFlaeche);
    return logo;
  }

  langDrueckenEinrichten() {
    let start = null;
    const abbrechen = () => {
      start = null;
      this.ring.clear();
    };
    this.logoFlaeche.on('pointerdown', () => (start = this.time.now));
    this.logoFlaeche.on('pointerup', abbrechen);
    this.logoFlaeche.on('pointerout', abbrechen);
    this.input.on('pointerup', abbrechen);

    this.events.on('update', () => {
      if (start === null) return;
      const anteil = Math.min((this.time.now - start) / DRUECKEN_MS, 1);
      this.ring.clear();
      this.ring.lineStyle(8, 0xffd43b);
      this.ring.beginPath();
      this.ring.arc(0, 0, 125, -Math.PI / 2, -Math.PI / 2 + anteil * Math.PI * 2);
      this.ring.strokePath();
      if (anteil >= 1) {
        abbrechen();
        if (navigator.vibrate) navigator.vibrate(50);
        werkstattOeffnen();
      }
    });
  }

  anordnen() {
    const { width, height } = this.scale;
    this.maleMeer();
    this.logo.setPosition(width / 2, height * 0.42);
    this.hinweis.setPosition(width / 2, height * 0.8);
  }

  maleMeer() {
    const { width, height } = this.scale;
    zeichneMeer(this.meer, width, height, wert('meerfarbe'));
  }
}
