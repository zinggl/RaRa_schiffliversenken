// Raphaels Fussball-Flotte: Name und Länge (in Feldern), vom längsten zum kleinsten.
// Aufstellung von Raphael: Zuber (FCZ) ganz oben, dann Mbappé, Haaland, Ronaldo, Yamal, Keni, Messi.
// Die Streifenfarben stehen in der Werkstatt (z. B. «mbappeFarbe1» und «mbappeFarbe2»).
export const FLOTTE_ALLE = [
  { id: 'zuber', name: 'Zuber', laenge: 8 },
  { id: 'mbappe', name: 'Mbappé', laenge: 7 },
  { id: 'haaland', name: 'Haaland', laenge: 6 },
  { id: 'ronaldo', name: 'Ronaldo', laenge: 5 },
  { id: 'yamal', name: 'Yamal', laenge: 4 },
  { id: 'keni', name: 'Keni', laenge: 3 },
  { id: 'messi', name: 'Messi', laenge: 2 },
  // Schnellboote mit 1 Feld
  { id: 'neymar', name: 'Neymar', laenge: 1 },
  { id: 'xhaka', name: 'Xhaka', laenge: 1 },
  { id: 'pedri', name: 'Pedri', laenge: 1 },
  { id: 'musiala', name: 'Musiala', laenge: 1 },
];

export const MEER_MIN = 8; // Zuber hat 8 Felder
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
