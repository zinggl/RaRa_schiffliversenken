// Der gemeinsame Ablauf eines Online-Spiels: beide «Bereit!», Münzwurf, Nochmals.
// Der Eröffner wirft die Münze und sagt dem Gast, wer beginnt.
import { netz } from './verbindung.js';
import { spielstand } from '../logik/spielstand.js';

// Nach dem Verbinden einmal aufrufen
export function onlineEinrichten(rolle, groesse) {
  const o = {
    rolle, // 'eroeffner' | 'gast'
    groesse, // Meergrösse (vom Eröffner)
    ichBereit: false,
    gegnerBereit: false,
    beginner: null, // 'eroeffner' | 'gast'
    selbstNeu: false,
    beiStart: null, // wird von der Aufstell-Szene gesetzt
    beiNochmals: null, // wird von der Kampf-Szene gesetzt
  };
  spielstand.online = o;
  netz.auf('bereit', () => {
    o.gegnerBereit = true;
    pruefen();
  });
  netz.auf('start', (n) => {
    o.beginner = n.beginner;
    o.beiStart?.();
  });
  netz.auf('nochmals', () => {
    if (o.selbstNeu) return; // ich habe selbst schon «Nochmals» gedrückt
    neueRunde();
    o.beiNochmals?.();
  });
}

export function ichBinBereit() {
  const o = spielstand.online;
  o.ichBereit = true;
  netz.senden({ typ: 'bereit' });
  pruefen();
}

export function nochmalsWuenschen() {
  neueRunde();
  spielstand.online.selbstNeu = true;
  netz.senden({ typ: 'nochmals' });
}

export function neueRunde() {
  const o = spielstand.online;
  Object.assign(o, { ichBereit: false, gegnerBereit: false, beginner: null });
}

// Beginne ich? (aus Sicht dieses Geräts)
export function ichBeginne() {
  return spielstand.online.beginner === spielstand.online.rolle;
}

function pruefen() {
  const o = spielstand.online;
  if (o.rolle !== 'eroeffner' || !o.ichBereit || !o.gegnerBereit || o.beginner) return;
  o.beginner = Math.random() < 0.5 ? 'eroeffner' : 'gast'; // die Münze
  netz.senden({ typ: 'start', beginner: o.beginner });
  o.beiStart?.();
}
