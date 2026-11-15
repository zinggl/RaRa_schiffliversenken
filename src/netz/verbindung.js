// Direkte Verbindung zwischen zwei Geräten (PeerJS, ohne Konto).
// Ein Gratis-Vermittler hilft nur beim Finden; danach reden die Geräte direkt miteinander.
// Jedes Spiel hat einen 4-stelligen Code. Der Eröffner meldet sich unter diesem Code an,
// der Gast verbindet sich mit dem Code.
import Peer from 'peerjs';

const PRAEFIX = 'rara-seeschlacht-'; // damit unsere Codes nicht mit anderen Spielen zusammenstossen
const PULS_MS = 2500; // so oft sagen sich die Geräte «ich bin noch da»
const STILLE_MS = 10000; // so lange ohne Nachricht = Verbindung weg
const WARTEN_MS = 15000; // so lange versucht der Gast, das Spiel zu finden

// Für Tests: ?vermittler=localhost:9000 benutzt einen eigenen Vermittler
function vermittler() {
  const v = new URLSearchParams(location.search).get('vermittler');
  if (!v) return {};
  const [host, port] = v.split(':');
  return { host, port: Number(port), path: '/', secure: false };
}

class Verbindung {
  constructor() {
    this.zuhoerer = new Map(); // typ → Set von Funktionen
    this.verlustZuhoerer = new Set();
    this.zuruecksetzen();
  }

  zuruecksetzen() {
    this.peer = null;
    this.kanal = null;
    this.code = null;
    this.verloren = false;
    clearInterval(this.puls);
    clearInterval(this.wache);
  }

  get aktiv() {
    return !!this.kanal && !this.verloren;
  }

  // Spiel eröffnen: gibt den Code zurück. beiGast wird aufgerufen, sobald jemand beitritt.
  async eroeffnen(beiGast) {
    this.altesAufraeumen();
    for (let versuch = 0; versuch < 6; versuch++) {
      const code = String(1000 + Math.floor(Math.random() * 9000));
      try {
        this.peer = await this.anmelden(PRAEFIX + code);
        this.code = code;
        this.peer.on('connection', (kanal) => {
          if (this.kanal) return kanal.close(); // schon jemand da
          kanal.on('open', () => {
            this.einrichten(kanal);
            beiGast?.();
          });
        });
        this.peer.on('disconnected', () => this.peer?.reconnect?.()); // Vermittler kurz weg: neu anmelden
        return code;
      } catch (fehler) {
        this.peer?.destroy();
        this.peer = null;
        if (fehler?.type !== 'unavailable-id') throw fehler; // Code schon vergeben: anderen probieren
      }
    }
    throw new Error('Kein freier Code gefunden');
  }

  // Einem Spiel beitreten
  async beitreten(code) {
    this.altesAufraeumen();
    this.peer = await this.anmelden();
    this.code = code;
    return new Promise((fertig, fehler) => {
      const zeit = setTimeout(() => fehler(new Error('niemand')), WARTEN_MS);
      this.peer.on('error', (f) => {
        clearTimeout(zeit);
        fehler(new Error(f?.type === 'peer-unavailable' ? 'niemand' : 'netz'));
      });
      const kanal = this.peer.connect(PRAEFIX + code, { reliable: true });
      kanal.on('open', () => {
        clearTimeout(zeit);
        this.einrichten(kanal);
        fertig();
      });
    });
  }

  // Alte Verbindung weg, angemeldete Zuhörer bleiben
  altesAufraeumen() {
    this.kanal?.close();
    this.peer?.destroy();
    this.zuruecksetzen();
  }

  anmelden(id) {
    return new Promise((fertig, fehler) => {
      const peer = id ? new Peer(id, vermittler()) : new Peer(vermittler());
      peer.once('open', () => fertig(peer));
      peer.once('error', fehler);
    });
  }

  einrichten(kanal) {
    this.kanal = kanal;
    this.verloren = false;
    this.letzte = performance.now();
    kanal.on('data', (nachricht) => {
      this.letzte = performance.now();
      if (!nachricht || nachricht.typ === 'puls') return;
      if (nachricht.typ === 'tschuess') return this.verlust('verlassen');
      for (const f of this.zuhoerer.get(nachricht.typ) ?? []) f(nachricht);
    });
    kanal.on('close', () => this.verlust('weg'));
    kanal.on('error', () => this.verlust('weg'));
    this.puls = setInterval(() => this.senden({ typ: 'puls' }), PULS_MS);
    this.wache = setInterval(() => {
      if (performance.now() - this.letzte > STILLE_MS) this.verlust('weg');
    }, 1000);
  }

  senden(nachricht) {
    try {
      if (this.kanal?.open) this.kanal.send(nachricht);
    } catch {
      this.verlust('weg');
    }
  }

  // Auf eine Nachricht hören. Gibt eine Funktion zum Aufhören zurück.
  auf(typ, f) {
    if (!this.zuhoerer.has(typ)) this.zuhoerer.set(typ, new Set());
    this.zuhoerer.get(typ).add(f);
    return () => this.zuhoerer.get(typ)?.delete(f);
  }

  beiVerlust(f) {
    this.verlustZuhoerer.add(f);
    return () => this.verlustZuhoerer.delete(f);
  }

  verlust(grund) {
    if (this.verloren || !this.kanal) return;
    this.verloren = true;
    for (const f of [...this.verlustZuhoerer]) f(grund);
    this.trennen(false);
  }

  // Verbindung beenden. mitAbschied: dem anderen Gerät noch «tschüss» sagen.
  trennen(mitAbschied = true) {
    if (mitAbschied && this.kanal?.open) this.senden({ typ: 'tschuess' });
    const kanal = this.kanal;
    const peer = this.peer;
    this.zuhoerer.clear();
    this.zuruecksetzen();
    setTimeout(() => {
      kanal?.close();
      peer?.destroy();
    }, 150);
  }
}

export const netz = new Verbindung();
