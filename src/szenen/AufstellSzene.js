// Flotte aufstellen: Schiffe mit dem Finger aufs Meer ziehen, antippen zum Drehen.
// Passt ein Schiff nicht (drauf, daneben oder hinaus), wird es rot und springt zurück.
// Stehen alle Schiffe, erscheint «Bereit!».
// Zu zweit auf einem iPad: danach «Nicht schauen!» und Spieler 2 stellt auf.
import Phaser from 'phaser';
import { wert, beiAenderung } from '../werkstatt/werte.js';
import { FLOTTE, MEER_MIN, MEER_MAX } from '../logik/flotte.js';
import { Spielfeld } from '../logik/spielfeld.js';
import { spielstand } from '../logik/spielstand.js';
import { kriegsschiffSvg } from '../kriegsschiff.js';
import { fischeZeigen } from '../fische.js';

const BUCHSTABEN = 'ABCDEFGHIJKL';
const BEWEGUNG_AB = 8; // so viele Pixel, dann ist es Ziehen statt Antippen
const ROT_MS = 380; // so lange bleibt ein Schiff rot, bevor es zurückspringt
const GLEITEN_MS = 260;
const SPERRE_MS = 400; // kurz nach dem Wechsel keine Tipps annehmen

export class AufstellSzene extends Phaser.Scene {
  constructor() {
    super('Aufstellen');
  }

  init(daten) {
    this.modus = daten?.modus ?? 'computer';
    this.spieler = daten?.spieler ?? 1;
  }

  create() {
    this.ab = performance.now() + SPERRE_MS;
    fischeZeigen(false);

    const titel =
      this.modus === 'zwei' ? `Spieler ${this.spieler} · Stelle deine Flotte auf` : 'Stelle deine Flotte auf';
    this.ebene = document.createElement('div');
    this.ebene.className = 'aufstellen';
    this.ebene.innerHTML = `
      <button class="knopf knopf-zurueck">Zurück</button>
      <div class="aufstellen-titel">${titel}</div>
      <div class="brett"></div>
      <div class="dock"><div class="dock-titel">Flotte</div></div>
      <button class="knopf knopf-gold knopf-bereit">Bereit!</button>
      <div class="vorschau"></div>
      <div class="aufstellen-hinweis">Ziehen zum Platzieren · Antippen zum Drehen</div>`;
    document.body.appendChild(this.ebene);
    this.brett = this.ebene.querySelector('.brett');
    this.dock = this.ebene.querySelector('.dock');
    this.vorschau = this.ebene.querySelector('.vorschau');
    this.knopfBereit = this.ebene.querySelector('.knopf-bereit');

    // Ein HTML-Element pro Schiff
    this.schiffe = FLOTTE.map((daten, nummer) => {
      const element = document.createElement('div');
      element.className = 'schiff';
      this.ebene.appendChild(element);
      const schiff = { ...daten, nummer, element };
      this.ziehenEinrichten(schiff);
      return schiff;
    });
    this.schiffeMalen();
    this.neuesFeld();

    this.ebene.querySelector('.knopf-zurueck').addEventListener('click', () => {
      if (performance.now() < this.ab) return;
      this.scene.start('Modus');
    });
    this.knopfBereit.addEventListener('click', () => this.bereit());

    // Werkstatt: neue Meergrösse = neu aufstellen, neue Farben = neu malen
    const aufhoeren = beiAenderung((schluessel) => {
      if (schluessel === 'meerGroesse') this.neuesFeld();
      else if (/Farbe[12]$/.test(schluessel)) this.schiffeMalen();
    });
    const neuAnordnen = () => this.anordnen();
    window.addEventListener('resize', neuAnordnen);

    this.events.once('shutdown', () => {
      aufhoeren();
      window.removeEventListener('resize', neuAnordnen);
      this.ebene.remove();
      fischeZeigen(true);
    });
  }

  groesse() {
    return Phaser.Math.Clamp(Math.round(wert('meerGroesse') ?? 10), MEER_MIN, MEER_MAX);
  }

  neuesFeld() {
    this.feld = new Spielfeld(this.groesse());
    this.anordnen();
  }

  schiffeMalen() {
    for (const s of this.schiffe) {
      s.element.innerHTML = kriegsschiffSvg(s.laenge, s.name, wert(`${s.id}Farbe1`), wert(`${s.id}Farbe2`));
    }
  }

  // ---------- Platz auf dem Bildschirm ----------

  // Rechnet Feldgrösse und Positionen aus und stellt alles hin
  anordnen() {
    const n = this.feld.groesse;
    const B = window.innerWidth;
    const H = window.innerHeight;
    const kopf = Math.max(48, H * 0.1);
    const fuss = Math.max(36, H * 0.08);
    const rand = 0.6; // Platz für Buchstaben und Zahlen, in Feldern
    // Spielfeld + Abstand (1 Feld) + Ablage (6 Felder) müssen nebeneinander Platz haben
    const c = Math.floor(Math.min((H - kopf - fuss) / (n + rand), (B * 0.94) / (n + rand + 1 + 6)));
    const dockB = 6 * c;
    const gesamt = (n + rand) * c + c + dockB;
    const links = Math.max(8, (B - gesamt) / 2);
    const bx = links + rand * c;
    const by = kopf + (H - kopf - fuss - (n + rand) * c) / 2 + rand * c;
    const dx = bx + n * c + c;
    this.lage = { n, c, bx, by, dx, dy: by, dockB };

    // Spielfeld mit Gitter und Beschriftung
    Object.assign(this.brett.style, { left: `${bx}px`, top: `${by}px`, width: `${n * c}px`, height: `${n * c}px` });
    this.brett.style.setProperty('--zelle', `${c}px`);
    this.ebene.querySelectorAll('.beschriftung').forEach((e) => e.remove());
    for (let i = 0; i < n; i++) {
      this.beschriftung(BUCHSTABEN[i], bx + i * c, by - rand * c, c, rand * c);
      this.beschriftung(String(i + 1), bx - rand * c, by + i * c, rand * c, c);
    }

    // Flotten-Ablage rechts daneben
    Object.assign(this.dock.style, { left: `${dx}px`, top: `${by}px`, width: `${dockB}px`, height: `${n * c}px` });
    this.dock.style.setProperty('--zelle', `${c}px`);
    Object.assign(this.knopfBereit.style, { left: `${dx + dockB / 2}px`, top: `${by + (n * c) / 2}px` });

    for (const s of this.schiffe) this.hinstellen(s, false);
    this.bereitZeigen();
  }

  beschriftung(text, x, y, b, h) {
    const e = document.createElement('div');
    e.className = 'beschriftung';
    e.textContent = text;
    Object.assign(e.style, { left: `${x}px`, top: `${y}px`, width: `${b}px`, height: `${h}px`, fontSize: `${Math.max(11, this.lage.c * 0.32)}px` });
    this.ebene.appendChild(e);
  }

  // Ablageplatz eines Schiffs in der Flotte rechts
  dockPlatz(s) {
    const { c, dx, dy, n } = this.lage;
    const schritt = Math.min(1.4 * c, (n * c - 0.8 * c) / FLOTTE.length);
    return { left: dx + 0.5 * c, top: dy + 0.6 * c + s.nummer * schritt, quer: true };
  }

  // Schiff an seinen Platz stellen: aufs Feld (wenn gesetzt) oder in die Ablage
  hinstellen(s, gleiten = true) {
    const { c, bx, by } = this.lage;
    const gesetzt = this.feld.hole(s.id);
    const ziel = gesetzt
      ? { left: bx + gesetzt.x * c, top: by + gesetzt.y * c, quer: gesetzt.quer }
      : this.dockPlatz(s);
    s.element.classList.toggle('gleitet', gleiten);
    s.element.classList.toggle('gesetzt', !!gesetzt);
    this.position(s, ziel.left, ziel.top, ziel.quer);
    if (gleiten) setTimeout(() => s.element.classList.remove('gleitet'), GLEITEN_MS);
  }

  // Senkrechte Schiffe werden um die Mitte ihres ersten Feldes gedreht
  position(s, left, top, quer) {
    const { c } = this.lage;
    Object.assign(s.element.style, {
      left: `${left}px`,
      top: `${top}px`,
      width: `${s.laenge * c}px`,
      height: `${c}px`,
      transformOrigin: `${c / 2}px ${c / 2}px`,
      transform: quer ? 'none' : 'rotate(90deg)',
    });
  }

  bereitZeigen() {
    const alle = this.feld.anzahl() === FLOTTE.length;
    this.knopfBereit.classList.toggle('sichtbar', alle);
    this.dock.classList.toggle('leer', alle);
  }

  // ---------- Ziehen und Drehen ----------

  ziehenEinrichten(s) {
    let zug = null;

    s.element.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (performance.now() < this.ab || zug || s.gesperrt) return; // gesperrt: springt gerade zurück
      s.element.setPointerCapture(e.pointerId);
      const box = { left: parseFloat(s.element.style.left), top: parseFloat(s.element.style.top) };
      const gesetzt = this.feld.hole(s.id);
      zug = {
        startX: e.clientX,
        startY: e.clientY,
        abstandX: e.clientX - box.left,
        abstandY: e.clientY - box.top,
        quer: gesetzt ? gesetzt.quer : true,
        bewegt: false,
        ziel: null,
      };
      s.element.classList.remove('gleitet');
      s.element.classList.add('gezogen');
    });

    s.element.addEventListener('pointermove', (e) => {
      if (!zug) return;
      if (!zug.bewegt && Math.hypot(e.clientX - zug.startX, e.clientY - zug.startY) < BEWEGUNG_AB) return;
      zug.bewegt = true;
      const left = e.clientX - zug.abstandX;
      const top = e.clientY - zug.abstandY;
      this.position(s, left, top, zug.quer);
      zug.ziel = this.zielFeld(s, left, top, zug.quer);
      this.vorschauZeigen(s, zug.ziel, zug.quer);
    });

    const ende = () => {
      if (!zug) return;
      const { bewegt, ziel, quer } = zug;
      zug = null;
      s.element.classList.remove('gezogen');
      this.vorschau.className = 'vorschau';
      if (!bewegt) return this.drehen(s);
      if (!ziel) {
        // Zurück in die Ablage gezogen
        this.feld.entfernen(s.id);
        this.hinstellen(s);
      } else if (ziel.passt) {
        this.feld.setzen(s.id, s.laenge, ziel.x, ziel.y, quer);
        this.hinstellen(s);
      } else {
        // Passt nicht: kurz rot, dann zurück an den alten Platz
        this.rotZeigen(s, () => this.hinstellen(s));
      }
      this.bereitZeigen();
    };
    s.element.addEventListener('pointerup', ende);
    s.element.addEventListener('pointercancel', ende);
    s.element.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  // Welches Feld liegt unter dem Schiff? null = nicht über dem Meer (also Ablage)
  zielFeld(s, left, top, quer) {
    const { n, c, bx, by } = this.lage;
    const mitteX = left + c / 2;
    const mitteY = top + c / 2;
    if (mitteX < bx - c || mitteY < by - c || mitteX > bx + (n + 0.5) * c || mitteY > by + (n + 0.5) * c) return null;
    const x = Math.round((left - bx) / c);
    const y = Math.round((top - by) / c);
    return { x, y, passt: this.feld.passt(s.id, s.laenge, x, y, quer) };
  }

  vorschauZeigen(s, ziel, quer) {
    s.element.classList.toggle('passt-nicht', !!ziel && !ziel.passt);
    if (!ziel) {
      this.vorschau.className = 'vorschau';
      return;
    }
    const { c, bx, by } = this.lage;
    Object.assign(this.vorschau.style, {
      left: `${bx + ziel.x * c}px`,
      top: `${by + ziel.y * c}px`,
      width: `${(quer ? s.laenge : 1) * c}px`,
      height: `${(quer ? 1 : s.laenge) * c}px`,
    });
    this.vorschau.className = `vorschau sichtbar ${ziel.passt ? 'gut' : 'schlecht'}`;
  }

  drehen(s) {
    const gesetzt = this.feld.hole(s.id);
    if (!gesetzt) return; // in der Ablage wird nicht gedreht
    if (this.feld.passt(s.id, s.laenge, gesetzt.x, gesetzt.y, !gesetzt.quer)) {
      this.feld.setzen(s.id, s.laenge, gesetzt.x, gesetzt.y, !gesetzt.quer);
      this.hinstellen(s);
    } else {
      this.rotZeigen(s);
    }
  }

  // Kurz rot zeigen; währenddessen und beim Zurückgleiten kann man das Schiff nicht packen
  rotZeigen(s, danach) {
    s.gesperrt = true;
    s.element.classList.add('passt-nicht');
    if (navigator.vibrate) navigator.vibrate([30, 40, 30]);
    setTimeout(() => {
      s.element.classList.remove('passt-nicht');
      danach?.();
      setTimeout(() => (s.gesperrt = false), danach ? GLEITEN_MS : 0);
    }, ROT_MS);
  }

  // ---------- Bereit ----------

  bereit() {
    if (this.feld.anzahl() !== FLOTTE.length) return;
    spielstand.modus = this.modus;
    spielstand.flotten[this.spieler - 1] = this.feld.kopie();

    if (this.modus === 'zwei' && this.spieler === 1) {
      this.zwischenbild({
        titel: 'Spieler 2 ist dran',
        text: 'Die Flotte von Spieler 1 steht. Gib das iPad an Spieler 2 weiter.<br>Spieler 1: nicht schauen!',
        knoepfe: [{ text: 'Ich bin Spieler 2', gold: true, los: () => this.scene.start('Aufstellen', { modus: 'zwei', spieler: 2 }) }],
      });
      return;
    }

    const titel = this.modus === 'zwei' ? 'Beide Flotten sind bereit' : 'Deine Flotte ist bereit';
    const text =
      this.modus === 'online'
        ? 'Das Spiel mit zwei Geräten kommt bald.'
        : 'Das Schiessen kommt in Modul 2.';
    this.zwischenbild({
      titel,
      text,
      knoepfe: [
        { text: 'Neu aufstellen', los: () => this.scene.start('Aufstellen', { modus: this.modus, spieler: 1 }) },
        { text: 'Zum Start', gold: true, los: () => this.scene.start('Start') },
      ],
    });
  }

  // Bildschirm dazwischen (deckt das Spielfeld ganz zu, damit niemand spicken kann)
  zwischenbild({ titel, text, knoepfe }) {
    const bild = document.createElement('div');
    bild.className = 'zwischenbild';
    bild.innerHTML = `
      <div class="zwischenbild-box">
        <div class="zwischenbild-titel">${titel}</div>
        <div class="zwischenbild-text">${text}</div>
        <div class="zwischenbild-knoepfe">
          ${knoepfe.map((k, i) => `<button class="knopf ${k.gold ? 'knopf-gold' : ''}" data-nr="${i}">${k.text}</button>`).join('')}
        </div>
      </div>`;
    const ab = performance.now() + SPERRE_MS;
    bild.addEventListener('click', (e) => {
      const knopf = e.target.closest('button');
      if (!knopf || performance.now() < ab) return;
      knoepfe[Number(knopf.dataset.nr)].los();
    });
    this.ebene.appendChild(bild);
  }
}
