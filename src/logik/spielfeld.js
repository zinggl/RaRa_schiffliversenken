// Das Spielfeld eines Spielers: ein Meer mit groesse × groesse Feldern und die gesetzten Schiffe.
// Nur Regeln, keine Grafik. So können später Computer-Gegner und Online-Spiel dieselben Regeln nutzen.
//
// Ein Schiff liegt ab Feld (x, y): quer = waagrecht nach rechts, sonst senkrecht nach unten.
// Regeln: ganz im Meer, nicht übereinander und auch nicht berühren (auch nicht über Eck).

export class Spielfeld {
  constructor(groesse) {
    this.groesse = groesse;
    this.schiffe = new Map(); // id → { laenge, x, y, quer }
    this.schuesse = new Map(); // "x,y" → 'wasser' | 'treffer'
    this.versenkt = new Set(); // ids der versenkten Schiffe
  }

  // Alle Felder, die ein Schiff belegt
  static felder(laenge, x, y, quer) {
    const liste = [];
    for (let i = 0; i < laenge; i++) liste.push(quer ? [x + i, y] : [x, y + i]);
    return liste;
  }

  // Darf das Schiff «id» hier liegen? (Es selbst wird beim Prüfen nicht mitgezählt.)
  passt(id, laenge, x, y, quer) {
    const neu = Spielfeld.felder(laenge, x, y, quer);
    const imMeer = neu.every(([a, b]) => a >= 0 && b >= 0 && a < this.groesse && b < this.groesse);
    if (!imMeer) return false;
    for (const [andereId, s] of this.schiffe) {
      if (andereId === id) continue;
      for (const [a, b] of Spielfeld.felder(s.laenge, s.x, s.y, s.quer)) {
        for (const [c, d] of neu) {
          if (Math.abs(a - c) <= 1 && Math.abs(b - d) <= 1) return false; // drauf oder daneben
        }
      }
    }
    return true;
  }

  setzen(id, laenge, x, y, quer) {
    if (!this.passt(id, laenge, x, y, quer)) return false;
    this.schiffe.set(id, { laenge, x, y, quer });
    return true;
  }

  entfernen(id) {
    this.schiffe.delete(id);
  }

  hole(id) {
    return this.schiffe.get(id);
  }

  anzahl() {
    return this.schiffe.size;
  }

  // Kopie der Aufstellung (ohne Schüsse)
  kopie() {
    const neu = new Spielfeld(this.groesse);
    for (const [id, s] of this.schiffe) neu.schiffe.set(id, { ...s });
    return neu;
  }

  // ---------- Schiessen (Modul 2) ----------

  // Welches Schiff liegt auf Feld (x, y)? null = Wasser
  schiffAn(x, y) {
    for (const [id, s] of this.schiffe) {
      if (Spielfeld.felder(s.laenge, s.x, s.y, s.quer).some(([a, b]) => a === x && b === y)) return id;
    }
    return null;
  }

  schonBeschossen(x, y) {
    return this.schuesse.has(`${x},${y}`);
  }

  // Schuss auf Feld (x, y). Ergebnis: 'wasser', 'treffer', 'versenkt' oder 'schon' (dort war schon ein Schuss)
  schiessen(x, y) {
    const schluessel = `${x},${y}`;
    if (this.schuesse.has(schluessel)) return { ergebnis: 'schon' };
    const id = this.schiffAn(x, y);
    if (!id) {
      this.schuesse.set(schluessel, 'wasser');
      return { ergebnis: 'wasser' };
    }
    this.schuesse.set(schluessel, 'treffer');
    const s = this.schiffe.get(id);
    const alleGetroffen = Spielfeld.felder(s.laenge, s.x, s.y, s.quer).every(([a, b]) => this.schuesse.get(`${a},${b}`) === 'treffer');
    if (alleGetroffen) {
      this.versenkt.add(id);
      return { ergebnis: 'versenkt', id };
    }
    return { ergebnis: 'treffer', id };
  }

  alleVersenkt() {
    return this.schiffe.size > 0 && this.versenkt.size === this.schiffe.size;
  }

  anzahlSchuesse() {
    return this.schuesse.size;
  }

  anzahlTreffer() {
    let n = 0;
    for (const e of this.schuesse.values()) if (e === 'treffer') n++;
    return n;
  }
}
