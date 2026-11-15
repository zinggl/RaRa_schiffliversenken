// Das Meer des Gegners bei einem Online-Spiel.
// Wo seine Schiffe liegen, wissen wir nicht – nur, was unsere Schüsse ergeben haben.
// Versenkte Schiffe meldet der Gegner mit ihrer Lage, damit sie auftauchen können.
export class FernesSpielfeld {
  constructor(groesse) {
    this.groesse = groesse;
    this.schiffe = new Map();
    this.schuesse = new Map();
    this.versenkt = new Set();
    this.alle = false;
  }

  hole(id) {
    return this.schiffe.get(id);
  }

  schonBeschossen(x, y) {
    return this.schuesse.has(`${x},${y}`);
  }

  // Antwort des Gegners eintragen: { x, y, ergebnis, id, schiff, alle }
  eintragen({ x, y, ergebnis, id, schiff, alle }) {
    this.schuesse.set(`${x},${y}`, ergebnis === 'wasser' ? 'wasser' : 'treffer');
    if (ergebnis === 'versenkt') {
      this.versenkt.add(id);
      this.schiffe.set(id, schiff);
    }
    if (alle) this.alle = true;
  }

  // Am Spielende: so lagen alle Schiffe
  flotteZeigen(liste) {
    for (const [id, s] of liste) if (!this.schiffe.has(id)) this.schiffe.set(id, s);
  }

  alleVersenkt() {
    return this.alle;
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
