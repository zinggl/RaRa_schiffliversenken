// Alle Spielwerte aus der Werkstatt.
// Die Datei werkstatt.json beschreibt jeden Wert: Name, Typ und aktueller Wert.
// Das Spiel liest Werte mit wert('meerfarbe') und hört mit beiZuAenderung() auf Änderungen.
import standard from '../config/werkstatt.json';

// Eine Kopie, damit wir die Werte im Spiel ändern können
const einstellungen = structuredClone(standard);
const zuhoerer = new Set();

export function alleEinstellungen() {
  return einstellungen;
}

export function wert(schluessel) {
  return einstellungen[schluessel]?.wert;
}

export function setzeWert(schluessel, neuerWert) {
  if (!einstellungen[schluessel]) return;
  einstellungen[schluessel].wert = neuerWert;
  zuhoerer.forEach((f) => f(schluessel, neuerWert));
}

// Zurück zu den Werten, die in werkstatt.json stehen
export function zuruecksetzen() {
  for (const schluessel of Object.keys(standard)) {
    setzeWert(schluessel, standard[schluessel].wert);
  }
}

// Gibt eine Funktion zurück, die das Zuhören wieder beendet
export function beiAenderung(funktion) {
  zuhoerer.add(funktion);
  return () => zuhoerer.delete(funktion);
}
