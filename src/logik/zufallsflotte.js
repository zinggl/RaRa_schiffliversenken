// Stellt eine Flotte zufällig auf (für den Computer). Hält sich an alle Regeln.
import { Spielfeld } from './spielfeld.js';

export function zufallsFlotte(groesse, flotte) {
  for (let versuch = 0; versuch < 500; versuch++) {
    const feld = new Spielfeld(groesse);
    // Lange Schiffe zuerst, die brauchen am meisten Platz
    const reihe = [...flotte].sort((a, b) => b.laenge - a.laenge);
    const alleGesetzt = reihe.every((schiff) => {
      for (let i = 0; i < 300; i++) {
        const quer = Math.random() < 0.5;
        const x = Math.floor(Math.random() * groesse);
        const y = Math.floor(Math.random() * groesse);
        if (feld.setzen(schiff.id, schiff.laenge, x, y, quer)) return true;
      }
      return false;
    });
    if (alleGesetzt) return feld;
  }
  throw new Error('Flotte passt nicht aufs Meer');
}
