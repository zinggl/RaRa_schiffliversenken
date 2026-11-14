// Das Spielfeld eines Spielers: ein Meer mit groesse × groesse Feldern und die gesetzten Schiffe.
// Nur Regeln, keine Grafik. So können später Computer-Gegner und Online-Spiel dieselben Regeln nutzen.
//
// Ein Schiff liegt ab Feld (x, y): quer = waagrecht nach rechts, sonst senkrecht nach unten.
// Regeln: ganz im Meer, nicht übereinander und auch nicht berühren (auch nicht über Eck).

export class Spielfeld {
  constructor(groesse) {
    this.groesse = groesse;
    this.schiffe = new Map(); // id → { laenge, x, y, quer }
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

  kopie() {
    const neu = new Spielfeld(this.groesse);
    for (const [id, s] of this.schiffe) neu.schiffe.set(id, { ...s });
    return neu;
  }
}
