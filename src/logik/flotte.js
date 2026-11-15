// Raphaels Fussball-Flotte: Name und Länge (in Feldern). Messi ist der GOAT – das grösste Schiff.
// Die Streifenfarben stehen in der Werkstatt (z. B. «messiFarbe1» und «messiFarbe2»).
export const FLOTTE_ALLE = [
  { id: 'messi', name: 'Messi', laenge: 6 },
  { id: 'mbappe', name: 'Mbappé', laenge: 5 },
  { id: 'ronaldo', name: 'Ronaldo', laenge: 5 },
  { id: 'yamal', name: 'Yamal', laenge: 4 },
  { id: 'keni', name: 'Keni', laenge: 4 },
  { id: 'haaland', name: 'Haaland', laenge: 4 },
  { id: 'neymar', name: 'Neymar', laenge: 3 },
  { id: 'xhaka', name: 'Xhaka', laenge: 3 },
  { id: 'pedri', name: 'Pedri', laenge: 2 },
  { id: 'musiala', name: 'Musiala', laenge: 2 },
];

export const MEER_MIN = 7;
export const MEER_MAX = 24;

// Wie viele Schiffe passen aufs Meer? Jedes Schiff braucht samt freiem Rand (Schiffe berühren sich nie)
// ungefähr (Länge + 1) × 2 Felder. Damit man noch frei aufstellen kann, soll das höchstens
// zwei Drittel vom Meer (mit Rand) belegen. Auf kleinen Meeren fallen die kleinsten Schiffe weg.
export function flotteFuer(groesse) {
  const platz = (groesse + 1) ** 2 / 1.6;
  const flotte = [];
  let belegt = 0;
  for (const schiff of FLOTTE_ALLE) {
    belegt += (schiff.laenge + 1) * 2;
    if (belegt > platz) break;
    flotte.push(schiff);
  }
  return flotte;
}
