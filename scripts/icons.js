// Malt die App-Icons: Dreimaster bei Abendstimmung, halb im Wasser.
// Braucht Playwright (Chromium): in der Cloud-Sitzung vorhanden, am Mac mit `npx playwright install chromium`.
// Aufruf: npm run icons
import { createRequire } from 'node:module';
import { DREIMASTER_SVG } from '../src/dreimaster.js';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const seite = (groesse) => `<!doctype html><html><head><style>
  :root { --meer:#0f4c6e; --wasser-oben:#2e7f9b; --wasser-flach:#256e8a; }
  html,body { margin:0; width:${groesse}px; height:${groesse}px; overflow:hidden; }
  .bild { position:relative; width:100%; height:100%;
    background:
      radial-gradient(ellipse 60% 40% at 70% 70%, rgba(255,186,116,.55), transparent 70%),
      linear-gradient(to bottom, #0a1729 0%, #1c3654 40%, #6c6874 64%, #c99064 70%, transparent 70%),
      linear-gradient(to bottom, #2e7f9b 70%, #0f4c6e 86%, #06243a 100%); }
  .schiff { position:absolute; left:50%; width:84%; transform:translateX(-50%);
    top:calc(70% - 84% * 0.725); }
  .schiff svg { display:block; width:100%; height:auto; }
</style></head><body><div class="bild"><div class="schiff">${DREIMASTER_SVG}</div></div></body></html>`;

const browser = await chromium.launch();
for (const [datei, groesse] of [['icon-192.png', 192], ['icon-512.png', 512], ['apple-touch-icon.png', 180]]) {
  const page = await browser.newPage({ viewport: { width: groesse, height: groesse } });
  await page.setContent(seite(groesse));
  await page.screenshot({ path: `public/${datei}` });
  await page.close();
}
await browser.close();
console.log('Icons gemalt');
