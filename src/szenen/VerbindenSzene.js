// Zu zweit mit zwei Geräten: Spiel eröffnen (QR-Code + 4-stelliger Code) oder beitreten (Code eintippen).
// Wer den QR-Code mit der Kamera scannt, landet direkt hier und tritt automatisch bei.
import Phaser from 'phaser';
import QRCode from 'qrcode';
import { wert } from '../werkstatt/werte.js';
import { MEER_MIN, MEER_MAX } from '../logik/flotte.js';
import { spielstand } from '../logik/spielstand.js';
import { netz } from '../netz/verbindung.js';
import { onlineEinrichten } from '../netz/ablauf.js';
import { verlustMelden } from '../netz/verlust.js';

const SPERRE_MS = 400;

export class VerbindenSzene extends Phaser.Scene {
  constructor() {
    super('Verbinden');
  }

  init(daten) {
    this.startCode = daten?.code ?? null; // vom QR-Code
  }

  create() {
    this.ab = performance.now() + SPERRE_MS;
    netz.trennen();
    this.ebene = document.createElement('div');
    this.ebene.className = 'modus verbinden';
    this.ebene.innerHTML = `
      <h1 class="start-titel">RaRa Seeschlacht</h1>
      <button class="knopf knopf-zurueck">Zurück</button>
      <div class="modus-box"></div>`;
    document.body.appendChild(this.ebene);
    this.box = this.ebene.querySelector('.modus-box');
    this.events.once('shutdown', () => {
      this.ebene.remove();
      this.weg = true;
    });
    verlustMelden(this);

    this.ebene.querySelector('.knopf-zurueck').addEventListener('click', () => {
      if (performance.now() < this.ab) return;
      netz.trennen();
      if (this.schritt === 'wahl') this.scene.start('Modus');
      else this.wahlZeigen();
    });
    this.box.addEventListener('click', (e) => this.geklickt(e));

    if (this.startCode) this.beitreten(this.startCode);
    else this.wahlZeigen();
  }

  geklickt(e) {
    if (performance.now() < this.ab) return;
    const knopf = e.target.closest('button');
    if (!knopf) return;
    const { aktion, ziffer } = knopf.dataset;
    if (aktion === 'eroeffnen') this.eroeffnen();
    if (aktion === 'beitreten') this.eingabeZeigen();
    if (aktion === 'nochmal') this.eingabeZeigen();
    if (ziffer !== undefined) this.tippen(ziffer);
  }

  // ---------- Wahl ----------

  wahlZeigen() {
    this.schritt = 'wahl';
    netz.trennen();
    this.box.innerHTML = `
      <div class="modus-titel">Zu zweit mit zwei Geräten</div>
      <button class="modus-knopf" data-aktion="eroeffnen">
        <span class="modus-symbol"><svg viewBox="0 0 48 48"><rect x="8" y="8" width="13" height="13" rx="2"/><rect x="27" y="8" width="13" height="13" rx="2"/><rect x="8" y="27" width="13" height="13" rx="2"/><path d="M27 27h5v5h-5zM35 35h5v5h-5zM35 27h5M27 40h4"/></svg></span>
        <span class="modus-text"><span class="modus-name">Spiel eröffnen</span><span class="modus-info">Zeigt einen QR-Code und einen Code</span></span>
      </button>
      <button class="modus-knopf" data-aktion="beitreten">
        <span class="modus-symbol"><svg viewBox="0 0 48 48"><rect x="12" y="5" width="24" height="38" rx="3"/><path d="M19 15h2M27 15h2M19 22h2M27 22h2M19 29h2M27 29h2M23 36h2"/></svg></span>
        <span class="modus-text"><span class="modus-name">Spiel beitreten</span><span class="modus-info">Code eintippen – oder QR-Code mit der Kamera scannen</span></span>
      </button>`;
  }

  // ---------- Eröffnen ----------

  async eroeffnen() {
    this.schritt = 'eroeffnen';
    this.box.innerHTML = `
      <div class="modus-titel">Spiel eröffnen</div>
      <div class="verbinden-text">Verbinde mit dem Vermittler …</div>`;
    const groesse = Phaser.Math.Clamp(Math.round(wert('meerGroesse') ?? 10), MEER_MIN, MEER_MAX);
    try {
      const code = await netz.eroeffnen(() => {
        // Der Gegner ist da!
        onlineEinrichten('eroeffner', groesse);
        netz.senden({ typ: 'einstellungen', groesse });
        this.losgehen();
      });
      if (this.weg) return;
      const link = `${location.origin}${location.pathname}?spiel=${code}`;
      const qr = await QRCode.toString(link, { type: 'svg', margin: 1, color: { dark: '#0b1d33', light: '#f3ead6' } });
      this.box.innerHTML = `
        <div class="modus-titel">Spiel eröffnen</div>
        <div class="verbinden-eroeffnen">
          <div class="qr">${qr}</div>
          <div class="verbinden-rechts">
            <div class="verbinden-text">Mit der Kamera vom anderen Gerät den QR-Code scannen – oder dort diesen Code eintippen:</div>
            <div class="code">${code.split('').map((z) => `<span>${z}</span>`).join('')}</div>
            <div class="verbinden-warten"><i></i>Warte auf deinen Gegner …</div>
          </div>
        </div>`;
    } catch {
      if (this.weg) return;
      this.fehlerZeigen('Der Vermittler ist gerade nicht erreichbar. Hat das iPad Internet?', 'eroeffnen');
    }
  }

  // ---------- Beitreten ----------

  eingabeZeigen() {
    this.schritt = 'eingabe';
    this.eingabe = '';
    this.box.innerHTML = `
      <div class="modus-titel">Spiel beitreten</div>
      <div class="verbinden-text">Tippe den Code vom anderen Gerät ein:</div>
      <div class="code eingabe">${'<span></span>'.repeat(4)}</div>
      <div class="ziffern">
        ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((z) => `<button class="ziffer" data-ziffer="${z}">${z}</button>`).join('')}
        <span></span><button class="ziffer" data-ziffer="0">0</button><button class="ziffer klein" data-ziffer="x">Löschen</button>
      </div>`;
  }

  tippen(ziffer) {
    if (ziffer === 'x') this.eingabe = this.eingabe.slice(0, -1);
    else if (this.eingabe.length < 4) this.eingabe += ziffer;
    this.box.querySelectorAll('.code span').forEach((s, i) => (s.textContent = this.eingabe[i] ?? ''));
    if (this.eingabe.length === 4) this.beitreten(this.eingabe);
  }

  async beitreten(code) {
    this.schritt = 'beitreten';
    this.box.innerHTML = `
      <div class="modus-titel">Spiel beitreten</div>
      <div class="code">${code.split('').map((z) => `<span>${z}</span>`).join('')}</div>
      <div class="verbinden-warten"><i></i>Verbinde …</div>`;
    // Zuerst zuhören, dann verbinden – die Einstellungen kommen sofort
    netz.auf('einstellungen', (n) => {
      onlineEinrichten('gast', n.groesse);
      this.losgehen();
    });
    try {
      await netz.beitreten(code);
    } catch (fehler) {
      if (this.weg) return;
      this.fehlerZeigen(
        fehler.message === 'niemand'
          ? `Kein offenes Spiel mit dem Code ${code} gefunden. Ist es auf dem anderen Gerät noch offen?`
          : 'Keine Verbindung möglich. Haben beide Geräte Internet?',
        'nochmal',
      );
    }
  }

  fehlerZeigen(text, aktion) {
    this.box.innerHTML = `
      <div class="modus-titel">Hat nicht geklappt</div>
      <div class="verbinden-text">${text}</div>
      <div class="zwischenbild-knoepfe"><button class="knopf knopf-gold" data-aktion="${aktion}">Nochmals versuchen</button></div>`;
  }

  losgehen() {
    if (this.weg) return;
    spielstand.modus = 'online';
    spielstand.flotten = [null, null];
    this.scene.start('Aufstellen', { modus: 'online', spieler: 1 });
  }
}
