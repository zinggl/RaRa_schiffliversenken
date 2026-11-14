// Der Computer-Gegner in drei Stufen:
//   leicht – schiesst zufällig
//   mittel – schiesst zufällig, sucht aber nach einem Treffer rundherum weiter, bis das Schiff versenkt ist
//   schwer – rechnet aus, wo Schiffe am ehesten liegen (siehe unten)
// Er kennt nur, was auch ein Mensch weiss:
// wo er hingeschossen hat, ob es ein Treffer war und welche Schiffe versenkt sind.
//
// So denkt er:
// 1. Wo kann sicher kein Schiff sein? Bei Fehlschüssen, rund um versenkte Schiffe
//    (Schiffe berühren sich nie) und schräg neben jedem Treffer.
// 2. Für jedes Schiff, das noch schwimmt, zählt er alle Lagen, die noch möglich sind.
// 3. Gibt es Treffer, die noch nicht versenkt sind, zählen nur Lagen durch diese Treffer –
//    und zwar viel stärker, je mehr Treffer eine Lage erklärt. So jagt er ein Schiff zu Ende.
// 4. Er schiesst auf das Feld, das in den meisten Lagen vorkommt.
import { Spielfeld } from './spielfeld.js';

export function computerZiel(feld, flotte, stufe = 'schwer') {
  if (stufe === 'leicht') return zufallsZiel(feld);
  if (stufe === 'mittel') return jagdZiel(feld);
  return rechenZiel(feld, flotte);
}

// Irgendein Feld, auf das noch nicht geschossen wurde
function zufallsZiel(feld) {
  const frei = [];
  for (let x = 0; x < feld.groesse; x++) for (let y = 0; y < feld.groesse; y++) if (!feld.schonBeschossen(x, y)) frei.push({ x, y });
  return frei[Math.floor(Math.random() * frei.length)];
}

// Mittel: Gibt es Treffer, die noch nicht versenkt sind, schiesst er gleich daneben.
// Liegen schon zwei Treffer in einer Reihe, macht er in dieser Richtung weiter.
function jagdZiel(feld) {
  const n = feld.groesse;
  const versenktFelder = new Set();
  for (const id of feld.versenkt) {
    const s = feld.hole(id);
    for (const [x, y] of Spielfeld.felder(s.laenge, s.x, s.y, s.quer)) versenktFelder.add(`${x},${y}`);
  }
  const offen = [];
  for (const [schluessel, e] of feld.schuesse) {
    if (e === 'treffer' && !versenktFelder.has(schluessel)) offen.push(schluessel.split(',').map(Number));
  }
  if (offen.length === 0) return zufallsZiel(feld);

  const frei = (x, y) => x >= 0 && y >= 0 && x < n && y < n && !feld.schonBeschossen(x, y);
  let richtungen = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  if (offen.length >= 2) {
    const waagrecht = offen.every(([, y]) => y === offen[0][1]);
    const senkrecht = offen.every(([x]) => x === offen[0][0]);
    if (waagrecht) richtungen = [[1, 0], [-1, 0]];
    else if (senkrecht) richtungen = [[0, 1], [0, -1]];
  }
  const ziele = [];
  for (const [x, y] of offen) for (const [dx, dy] of richtungen) if (frei(x + dx, y + dy)) ziele.push({ x: x + dx, y: y + dy });
  return ziele.length ? ziele[Math.floor(Math.random() * ziele.length)] : zufallsZiel(feld);
}

// Schwer: Wahrscheinlichkeiten ausrechnen
function rechenZiel(feld, flotte) {
  const n = feld.groesse;
  const k = (x, y) => `${x},${y}`;
  const im = (x, y) => x >= 0 && y >= 0 && x < n && y < n;

  // Felder versenkter Schiffe (die sind ja aufgetaucht)
  const versenktFelder = new Set();
  for (const id of feld.versenkt) {
    const s = feld.hole(id);
    for (const [x, y] of Spielfeld.felder(s.laenge, s.x, s.y, s.quer)) versenktFelder.add(k(x, y));
  }

  // Sicher Wasser
  const wasser = new Set();
  const offeneTreffer = [];
  for (const [schluessel, e] of feld.schuesse) {
    const [x, y] = schluessel.split(',').map(Number);
    if (e === 'wasser') wasser.add(schluessel);
    else if (!versenktFelder.has(schluessel)) offeneTreffer.push([x, y]);
    if (e === 'treffer') for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) if (im(x + dx, y + dy)) wasser.add(k(x + dx, y + dy));
  }
  for (const schluessel of versenktFelder) {
    const [x, y] = schluessel.split(',').map(Number);
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
      if (im(x + dx, y + dy) && !versenktFelder.has(k(x + dx, y + dy))) wasser.add(k(x + dx, y + dy));
    }
  }
  const offen = new Set(offeneTreffer.map(([x, y]) => k(x, y)));

  // Wahrscheinlichkeit pro Feld
  const punkte = new Map();
  const nochDa = flotte.filter((s) => !feld.versenkt.has(s.id));
  for (const schiff of nochDa) {
    for (const quer of [true, false]) {
      for (let x = 0; x < n; x++) {
        for (let y = 0; y < n; y++) {
          const zellen = Spielfeld.felder(schiff.laenge, x, y, quer);
          if (!zellen.every(([a, b]) => im(a, b) && !wasser.has(k(a, b)) && !versenktFelder.has(k(a, b)))) continue;
          // Offene Treffer gleich daneben, aber nicht drin? Dann würden sich zwei Schiffe berühren.
          const drin = new Set(zellen.map(([a, b]) => k(a, b)));
          let erklaert = 0;
          let unmoeglich = false;
          for (const t of offen) {
            if (drin.has(t)) erklaert++;
            else {
              const [tx, ty] = t.split(',').map(Number);
              if (zellen.some(([a, b]) => Math.abs(a - tx) <= 1 && Math.abs(b - ty) <= 1)) unmoeglich = true;
            }
          }
          if (unmoeglich) continue;
          if (offen.size > 0 && erklaert === 0) continue;
          const gewicht = offen.size > 0 ? 100 ** erklaert : 1;
          for (const [a, b] of zellen) {
            if (feld.schonBeschossen(a, b)) continue;
            punkte.set(k(a, b), (punkte.get(k(a, b)) ?? 0) + gewicht);
          }
        }
      }
    }
  }

  // Bestes Feld (bei Gleichstand zufällig)
  let beste = [];
  let max = 0;
  for (const [schluessel, p] of punkte) {
    if (p > max) [max, beste] = [p, [schluessel]];
    else if (p === max) beste.push(schluessel);
  }
  if (beste.length === 0) {
    // Sollte nicht vorkommen – dann irgendein freies Feld
    for (let x = 0; x < n; x++) for (let y = 0; y < n; y++) if (!feld.schonBeschossen(x, y)) beste.push(k(x, y));
  }
  const [x, y] = beste[Math.floor(Math.random() * beste.length)].split(',').map(Number);
  return { x, y };
}
