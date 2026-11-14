// Der Kampf: abwechselnd aufs Meer des Gegners schiessen, bis eine Flotte versenkt ist.
// Gross: das Meer des Gegners (dort tippt man hin). Klein: die eigene Flotte.
// Regel: Wer trifft, darf nochmals. Bei einem Schuss ins Wasser ist der andere dran.
// Gegen den Computer oder zu zweit auf einem iPad (mit «Nicht schauen!» bei jedem Wechsel).
import Phaser from 'phaser';
import { wert } from '../werkstatt/werte.js';
import { FLOTTE } from '../logik/flotte.js';
import { spielstand } from '../logik/spielstand.js';
import { computerZiel } from '../logik/computer.js';
import { kriegsschiffSvg } from '../kriegsschiff.js';
import { fischeZeigen } from '../fische.js';
import { zwischenbild } from '../zwischenbild.js';
import { feuerwerkStarten } from '../feuerwerk.js';
import * as ton from '../geraeusche.js';

const BUCHSTABEN = 'ABCDEFGHIJKL';
const KLEIN = 0.42; // eigenes Feld im Verhältnis zum grossen
const FLUGZEIT_MS = 550; // vom Kanonendonner bis zum Einschlag
const SPERRE_MS = 400;

const warte = (ms) => new Promise((fertig) => setTimeout(fertig, ms));

export class KampfSzene extends Phaser.Scene {
  constructor() {
    super('Kampf');
  }

  init(daten) {
    this.modus = daten?.modus ?? 'computer';
  }

  create() {
    this.felder = spielstand.flotten; // [Spieler 1, Spieler 2 bzw. Computer]
    this.aktiv = 0; // wer schiesst gerade (0 = Spieler 1)
    this.vorbei = false;
    this.sperre = false;
    this.enthuellen = false;
    this.frischVersenkt = new Set();
    this.ab = performance.now() + SPERRE_MS;
    fischeZeigen(false);

    this.ebene = document.createElement('div');
    this.ebene.className = 'kampf';
    this.ebene.innerHTML = `
      <button class="knopf knopf-zurueck">Zurück</button>
      <div class="kampf-status"></div>
      <div class="brett brett-gross"></div>
      <div class="brett brett-klein"></div>
      <div class="kampf-titel titel-klein">Deine Flotte</div>
      <div class="gegner-liste"></div>`;
    document.body.appendChild(this.ebene);
    this.gross = this.ebene.querySelector('.brett-gross');
    this.klein = this.ebene.querySelector('.brett-klein');
    this.status = this.ebene.querySelector('.kampf-status');
    this.liste = this.ebene.querySelector('.gegner-liste');

    this.gross.addEventListener('pointerup', (e) => this.angetippt(e));
    this.ebene.querySelector('.knopf-zurueck').addEventListener('click', () => this.abbrechenFragen());
    const neuAnordnen = () => this.malen();
    window.addEventListener('resize', neuAnordnen);
    this.events.once('shutdown', () => {
      window.removeEventListener('resize', neuAnordnen);
      this.stopFeuerwerk?.();
      this.ebene.remove();
      fischeZeigen(true);
    });

    this.malen();
    this.statusSetzen();
  }

  // Wer schaut aufs iPad? Gegen den Computer immer Spieler 1, zu zweit der, der dran ist.
  betrachter() {
    return this.modus === 'computer' ? 0 : this.aktiv;
  }

  name(i) {
    if (this.modus === 'computer') return i === 0 ? 'Du' : 'Der Computer';
    return `Spieler ${i + 1}`;
  }

  // ---------- Zeichnen ----------

  malen() {
    const n = this.felder[0].groesse;
    const B = window.innerWidth;
    const H = window.innerHeight;
    const kopf = Math.max(56, H * 0.12);
    const fuss = Math.max(24, H * 0.05);
    const rand = 0.6;
    const c = Math.floor(Math.min((H - kopf - fuss) / (n + rand), (B * 0.94) / (n + rand + 1 + n * KLEIN)));
    const c2 = c * KLEIN;
    const gesamt = (n + rand) * c + c + n * c2;
    const links = (B - gesamt) / 2;
    const bx = links + rand * c;
    const by = kopf + (H - kopf - fuss - (n + rand) * c) / 2 + rand * c;
    const kx = bx + n * c + c;
    this.lage = { n, c, c2, bx, by, kx };

    const ich = this.betrachter();
    const gegner = 1 - ich;

    // Grosses Brett: Meer des Gegners
    this.brettStellen(this.gross, bx, by, c, n);
    this.ebene.querySelectorAll('.beschriftung').forEach((e) => e.remove());
    for (let i = 0; i < n; i++) {
      this.beschriftung(BUCHSTABEN[i], bx + i * c, by - rand * c, c, rand * c, c);
      this.beschriftung(String(i + 1), bx - rand * c, by + i * c, rand * c, c, c);
    }
    this.brettFuellen(this.gross, this.felder[gegner], gegner, c, false);

    // Kleines Brett: eigene Flotte mit den Schüssen des Gegners
    this.brettStellen(this.klein, kx, by, c2, n);
    this.brettFuellen(this.klein, this.felder[ich], ich, c2, true);
    const titelKlein = this.ebene.querySelector('.titel-klein');
    titelKlein.textContent = this.modus === 'computer' ? 'Deine Flotte' : `Flotte von Spieler ${ich + 1}`;
    Object.assign(titelKlein.style, { left: `${kx}px`, top: `${by - rand * c}px`, width: `${n * c2}px`, height: `${rand * c}px` });

    // Liste der gegnerischen Schiffe
    const feldGegner = this.felder[gegner];
    this.liste.innerHTML = `
      <div class="kampf-titel">${this.modus === 'computer' ? 'Flotte des Computers' : `Flotte von Spieler ${gegner + 1}`}</div>
      ${FLOTTE.map((s) => `
        <div class="liste-schiff ${feldGegner.versenkt.has(s.id) ? 'versenkt' : ''}">
          <span class="liste-name">${s.name}</span>
          <span class="liste-felder">${'<i></i>'.repeat(s.laenge)}</span>
        </div>`).join('')}`;
    Object.assign(this.liste.style, { left: `${kx}px`, top: `${by + n * c2 + c * 0.45}px`, width: `${n * c2}px` });
  }

  brettStellen(brett, x, y, c, n) {
    Object.assign(brett.style, { left: `${x}px`, top: `${y}px`, width: `${n * c}px`, height: `${n * c}px` });
    brett.style.setProperty('--zelle', `${c}px`);
    brett.innerHTML = '';
  }

  beschriftung(text, x, y, b, h, c) {
    const e = document.createElement('div');
    e.className = 'beschriftung';
    e.textContent = text;
    Object.assign(e.style, { left: `${x}px`, top: `${y}px`, width: `${b}px`, height: `${h}px`, fontSize: `${Math.max(11, c * 0.32)}px` });
    this.ebene.appendChild(e);
  }

  // Schiffe und Schuss-Markierungen auf ein Brett legen
  brettFuellen(brett, feld, besitzer, c, eigenes) {
    for (const { id, name } of FLOTTE) {
      const s = feld.hole(id);
      const versenkt = feld.versenkt.has(id);
      // Beim Gegner sieht man nur versenkte Schiffe (am Spielende nach einer Niederlage alle)
      if (!eigenes && !versenkt && !this.enthuellen) continue;
      const e = document.createElement('div');
      e.className = 'schiff-bild';
      if (versenkt) e.classList.add('wrack');
      else if (!eigenes) e.classList.add('enthuellt');
      const schluessel = `${besitzer}:${id}`;
      if (versenkt && this.frischVersenkt.has(schluessel)) {
        e.classList.add('sinkt');
        this.frischVersenkt.delete(schluessel);
      }
      Object.assign(e.style, {
        left: `${s.x * c}px`,
        top: `${s.y * c}px`,
        width: `${s.laenge * c}px`,
        height: `${c}px`,
        transformOrigin: `${c / 2}px ${c / 2}px`,
        transform: s.quer ? 'none' : 'rotate(90deg)',
      });
      e.innerHTML = kriegsschiffSvg(s.laenge, name, wert(`${id}Farbe1`), wert(`${id}Farbe2`));
      brett.appendChild(e);
    }
    for (const [schluessel, ergebnis] of feld.schuesse) {
      const [x, y] = schluessel.split(',').map(Number);
      brett.appendChild(this.marke(ergebnis, x, y, c, eigenes));
    }
  }

  // Bleibende Markierung: Ringe im Wasser oder brennendes Feld
  marke(ergebnis, x, y, c, klein) {
    const e = document.createElement('div');
    e.className = `marke ${ergebnis} ${klein ? 'klein' : ''}`;
    Object.assign(e.style, { left: `${x * c}px`, top: `${y * c}px`, width: `${c}px`, height: `${c}px` });
    e.innerHTML =
      ergebnis === 'wasser'
        ? '<span class="ring"></span><span class="ring r2"></span><span class="punkt"></span>'
        : `<span class="glut"></span><span class="flamme"></span><span class="flamme f2"></span>${klein ? '' : '<span class="rauch"></span><span class="rauch r2"></span><span class="rauch r3"></span>'}`;
    return e;
  }

  // ---------- Effekte (verschwinden wieder) ----------

  effekt(brett, art, x, y, c, dauer, inhalt) {
    const e = document.createElement('div');
    e.className = `effekt ${art}`;
    Object.assign(e.style, { left: `${(x + 0.5) * c}px`, top: `${(y + 0.5) * c}px`, '--z': `${c}px` });
    e.innerHTML = inhalt;
    brett.appendChild(e);
    setTimeout(() => e.remove(), dauer);
  }

  zielen(brett, x, y, c) {
    this.effekt(brett, 'zielen', x, y, c, FLUGZEIT_MS + 100, '<span></span>');
  }

  explosionZeigen(brett, x, y, c) {
    let funken = '';
    for (let i = 0; i < 12; i++) {
      const w = (i / 12) * 360 + Math.random() * 20;
      funken += `<i class="funke" style="--w:${w}deg; --d:${0.6 + Math.random() * 0.7}"></i>`;
    }
    this.effekt(brett, 'explosion', x, y, c, 1500, `<span class="blitz"></span><span class="feuerball"></span>${funken}<span class="wolke"></span>`);
  }

  fontaeneZeigen(brett, x, y, c) {
    let tropfen = '';
    for (let i = 0; i < 14; i++) {
      tropfen += `<i class="tropfen" style="--dx:${(Math.random() - 0.5) * 1.4}; --h:${0.8 + Math.random() * 1.2}; --v:${Math.random() * 0.15}s"></i>`;
    }
    this.effekt(brett, 'fontaene', x, y, c, 1400, `<span class="saeule"></span>${tropfen}<span class="spritzring"></span>`);
  }

  meldung(text) {
    const e = document.createElement('div');
    e.className = 'meldung';
    e.textContent = text;
    this.ebene.appendChild(e);
    setTimeout(() => e.remove(), 2600);
  }

  statusSetzen(text) {
    if (text) {
      this.status.textContent = text;
      return;
    }
    if (this.modus === 'computer') {
      this.status.textContent = this.aktiv === 0 ? 'Du bist dran · Tippe aufs Meer des Computers' : 'Der Computer zielt …';
    } else {
      this.status.textContent = `Spieler ${this.aktiv + 1} ist dran · Tippe aufs Meer des Gegners`;
    }
  }

  // ---------- Spielablauf ----------

  angetippt(e) {
    if (this.sperre || this.vorbei || performance.now() < this.ab) return;
    if (this.modus === 'computer' && this.aktiv !== 0) return;
    const r = this.gross.getBoundingClientRect();
    const { c, n } = this.lage;
    const x = Math.floor((e.clientX - r.left) / c);
    const y = Math.floor((e.clientY - r.top) / c);
    if (x < 0 || y < 0 || x >= n || y >= n) return;
    if (this.felder[1 - this.aktiv].schonBeschossen(x, y)) {
      this.statusSetzen('Dort hast du schon hingeschossen');
      setTimeout(() => !this.sperre && !this.vorbei && this.statusSetzen(), 1400);
      return;
    }
    this.menschZug(x, y);
  }

  // Ein Schuss mit allem Drum und Dran. Gibt das Ergebnis zurück.
  async schuss(schuetze, x, y) {
    const ziel = this.felder[1 - schuetze];
    const aufsGrosse = schuetze === this.betrachter();
    const brett = aufsGrosse ? this.gross : this.klein;
    const c = aufsGrosse ? this.lage.c : this.lage.c2;

    this.zielen(brett, x, y, c);
    ton.kanone();
    await warte(FLUGZEIT_MS);

    const r = ziel.schiessen(x, y);
    if (r.ergebnis === 'wasser') {
      this.fontaeneZeigen(brett, x, y, c);
      ton.platsch();
    } else {
      this.explosionZeigen(brett, x, y, c);
      ton.explosion();
    }
    await warte(250);
    if (r.ergebnis === 'versenkt') this.frischVersenkt.add(`${1 - schuetze}:${r.id}`);
    this.malen();

    if (r.ergebnis === 'versenkt') {
      const name = FLOTTE.find((s) => s.id === r.id).name;
      await warte(300);
      ton.horn();
      this.meldung(`${name} versenkt!`);
      await warte(900);
    } else {
      await warte(r.ergebnis === 'wasser' ? 650 : 450);
    }
    return r;
  }

  async menschZug(x, y) {
    this.sperre = true;
    this.statusSetzen('Feuer!');
    const schuetze = this.aktiv;
    const r = await this.schuss(schuetze, x, y);
    if (this.felder[1 - schuetze].alleVersenkt()) return this.ende(schuetze);

    if (r.ergebnis !== 'wasser') {
      this.statusSetzen(r.ergebnis === 'versenkt' ? 'Versenkt! Du darfst nochmals' : 'Treffer! Du darfst nochmals');
      this.sperre = false;
      return;
    }

    // Daneben: der andere ist dran
    if (this.modus === 'computer') {
      this.aktiv = 1;
      await this.computerZug();
      return;
    }
    const naechster = 1 - schuetze;
    await warte(500);
    zwischenbild(this.ebene, {
      titel: `Spieler ${naechster + 1} ist dran`,
      text: `Gib das iPad an Spieler ${naechster + 1}.<br>Spieler ${schuetze + 1}: nicht schauen!`,
      knoepfe: [
        {
          text: `Ich bin Spieler ${naechster + 1}`,
          gold: true,
          los: () => {
            this.aktiv = naechster;
            this.malen();
            this.statusSetzen();
            this.ab = performance.now() + SPERRE_MS;
            this.sperre = false;
          },
        },
      ],
    });
  }

  async computerZug() {
    this.statusSetzen();
    const feld = this.felder[0];
    for (;;) {
      await warte((wert('computerDenkzeit') ?? 1) * 1000);
      if (!this.scene.isActive()) return; // Spiel wurde verlassen
      const { x, y } = computerZiel(feld, FLOTTE);
      const r = await this.schuss(1, x, y);
      if (feld.alleVersenkt()) return this.ende(1);
      if (r.ergebnis === 'wasser') break;
      this.statusSetzen(r.ergebnis === 'versenkt' ? 'Der Computer hat versenkt und zielt nochmals …' : 'Der Computer hat getroffen und zielt nochmals …');
    }
    this.aktiv = 0;
    this.statusSetzen();
    this.sperre = false;
  }

  abbrechenFragen() {
    if (performance.now() < this.ab) return;
    if (this.vorbei) return this.scene.start('Start');
    zwischenbild(this.ebene, {
      titel: 'Spiel abbrechen?',
      text: 'Die Schlacht ist noch nicht vorbei.',
      knoepfe: [
        { text: 'Abbrechen', los: () => this.scene.start('Start') },
        { text: 'Weiterspielen', gold: true, los: () => {} },
      ],
    });
  }

  // ---------- Spielende ----------

  ende(gewinner) {
    this.vorbei = true;
    this.sperre = true;
    const niederlage = this.modus === 'computer' && gewinner === 1;
    // Nach einer Niederlage sieht man, wo die Schiffe des Computers lagen
    if (niederlage) this.enthuellen = true;
    this.malen();
    this.status.textContent = niederlage ? 'So lagen die Schiffe des Computers' : 'Die Schlacht ist entschieden';

    if (!niederlage) {
      const farben = ['#ffd38a', '#fff4dc', '#d9b46a'];
      for (const { id } of FLOTTE) {
        for (const f of [wert(`${id}Farbe1`), wert(`${id}Farbe2`)]) {
          // Sehr dunkle Farben leuchten nicht – die lassen wir weg
          const h = parseInt(f.slice(1), 16);
          if (((h >> 16) & 255) + ((h >> 8) & 255) + (h & 255) > 160) farben.push(f);
        }
      }
      this.stopFeuerwerk = feuerwerkStarten(farben);
    }

    const titel = this.modus === 'computer' ? (niederlage ? 'Niederlage' : 'Sieg!') : `Spieler ${gewinner + 1} gewinnt!`;
    const text =
      this.modus === 'computer'
        ? niederlage
          ? 'Der Computer hat deine Flotte versenkt.'
          : 'Du hast die ganze Flotte des Computers versenkt.'
        : `Spieler ${gewinner + 1} hat alle Schiffe von Spieler ${2 - gewinner} versenkt.`;
    const zeile = (i) => {
      const schuesse = this.felder[1 - i].anzahlSchuesse();
      const treffer = this.felder[1 - i].anzahlTreffer();
      const quote = schuesse ? Math.round((treffer / schuesse) * 100) : 0;
      return `<tr><th>${this.name(i)}</th><td>${schuesse}</td><td>${treffer}</td><td>${quote} %</td></tr>`;
    };

    const box = document.createElement('div');
    box.className = `ende ${niederlage ? 'rechts' : ''}`;
    box.innerHTML = `
      <div class="ende-box">
        <div class="ende-titel">${titel}</div>
        <div class="ende-text">${text}</div>
        <table class="ende-statistik">
          <tr><th></th><td>Schüsse</td><td>Treffer</td><td>Quote</td></tr>
          ${zeile(0)}${zeile(1)}
        </table>
        <div class="zwischenbild-knoepfe">
          <button class="knopf" data-ziel="start">Zum Start</button>
          <button class="knopf knopf-gold" data-ziel="nochmals">Nochmals</button>
        </div>
      </div>`;
    const ab = performance.now() + 800;
    box.addEventListener('click', (e) => {
      const knopf = e.target.closest('button');
      if (!knopf || performance.now() < ab) return;
      if (knopf.dataset.ziel === 'start') this.scene.start('Start');
      else {
        spielstand.flotten = [null, null];
        this.scene.start('Aufstellen', { modus: this.modus, spieler: 1 });
      }
    });
    setTimeout(() => this.ebene.appendChild(box), niederlage ? 600 : 1200);
  }
}

