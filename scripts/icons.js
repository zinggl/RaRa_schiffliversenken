// Malt die Platzhalter-Icons (blaues Meer mit grauem Schiff) als PNG.
// Aufruf: npm run icons
import { writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

function png(groesse) {
  const breite = groesse;
  const roh = Buffer.alloc((breite * 4 + 1) * groesse);
  const g = groesse / 100; // alles in Prozent der Icongrösse

  for (let y = 0; y < groesse; y++) {
    roh[y * (breite * 4 + 1)] = 0; // Filter: keiner
    for (let x = 0; x < breite; x++) {
      const px = x / g;
      const py = y / g;
      // Meer: oben heller, unten dunkler
      let [r, g2, b] = py < 62 ? [25, 113, 194] : [11, 61, 110];
      // Rumpf: Trapez zwischen y 50 und 62
      const rand = (py - 50) * 0.8;
      if (py >= 50 && py < 62 && px > 18 + rand && px < 82 - rand) [r, g2, b] = [73, 80, 87];
      if (py >= 58 && py < 61 && px > 18 + rand && px < 82 - rand) [r, g2, b] = [201, 42, 42];
      // Aufbau
      if (py >= 38 && py < 50 && px > 34 && px < 62) [r, g2, b] = [241, 243, 245];
      // Kamin
      if (py >= 26 && py < 38 && px > 46 && px < 55) [r, g2, b] = [255, 212, 59];
      const i = y * (breite * 4 + 1) + 1 + x * 4;
      roh[i] = r;
      roh[i + 1] = g2;
      roh[i + 2] = b;
      roh[i + 3] = 255;
    }
  }

  const kopf = Buffer.alloc(13);
  kopf.writeUInt32BE(breite, 0);
  kopf.writeUInt32BE(groesse, 4);
  kopf[8] = 8; // Bits pro Farbe
  kopf[9] = 6; // RGBA
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    stueck('IHDR', kopf),
    stueck('IDAT', deflateSync(roh)),
    stueck('IEND', Buffer.alloc(0)),
  ]);
}

function stueck(typ, daten) {
  const laenge = Buffer.alloc(4);
  laenge.writeUInt32BE(daten.length);
  const typUndDaten = Buffer.concat([Buffer.from(typ), daten]);
  const pruef = Buffer.alloc(4);
  pruef.writeUInt32BE(crc32(typUndDaten));
  return Buffer.concat([laenge, typUndDaten, pruef]);
}

function crc32(buf) {
  let c = ~0;
  for (const byte of buf) {
    c ^= byte;
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

writeFileSync('public/icon-192.png', png(192));
writeFileSync('public/icon-512.png', png(512));
writeFileSync('public/apple-touch-icon.png', png(180));
console.log('Icons gemalt ✅');
