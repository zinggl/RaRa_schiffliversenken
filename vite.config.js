// Einstellungen für den Dev-Server und das Bauen.
import { defineConfig } from 'vite';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const WERKSTATT_DATEI = fileURLToPath(new URL('./src/config/werkstatt.json', import.meta.url));

// Kleiner Helfer: Die Werkstatt im Spiel schickt neue Werte, wir schreiben sie in werkstatt.json.
// Gibt es nur am Dev-Server auf dem Mac, nicht in der Online-Version.
function werkstattSpeichern() {
  return {
    name: 'werkstatt-speichern',
    configureServer(server) {
      server.middlewares.use('/api/werkstatt', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          return res.end('Nur POST');
        }
        try {
          let text = '';
          for await (const stueck of req) {
            text += stueck;
            if (text.length > 100_000) throw new Error('Zu gross');
          }
          const neu = JSON.parse(text);
          const alt = JSON.parse(await readFile(WERKSTATT_DATEI, 'utf8'));

          // Nur bekannte Werte übernehmen, und nur den «wert» – Name und Typ bleiben, wie sie sind
          for (const schluessel of Object.keys(alt)) {
            if (!(schluessel in neu)) continue;
            const w = neu[schluessel]?.wert;
            const typ = alt[schluessel].typ;
            const passt =
              (typ === 'farbe' && typeof w === 'string' && /^#[0-9a-f]{6}$/i.test(w)) ||
              (typ === 'zahl' && typeof w === 'number' && Number.isFinite(w)) ||
              (typ === 'schalter' && typeof w === 'boolean');
            if (!passt) throw new Error(`Ungültiger Wert für ${schluessel}`);
            alt[schluessel].wert = w;
          }

          await writeFile(WERKSTATT_DATEI, JSON.stringify(alt, null, 2) + '\n');
          server.config.logger.info('🔧 Werkstatt: werkstatt.json gespeichert');
          res.end('ok');
        } catch (fehler) {
          res.statusCode = 400;
          res.end(fehler.message);
        }
      });
    },
  };
}

export default defineConfig({
  // Relative Pfade, damit es auch auf GitHub Pages unter /RaRa_schiffliversenken/ läuft
  base: './',
  plugins: [werkstattSpeichern()],
  server: { host: true, port: 5173 },
  build: { chunkSizeWarningLimit: 2000 },
});
