// Die geheime Werkstatt: ein Menü mit Reglern für alle Werte aus werkstatt.json.
// Für jeden Wert wird automatisch der passende Regler gebaut:
//   typ "farbe" → Farbwähler
//   typ "zahl"  → Schieberegler (mit min, max, schritt)
//   typ "schalter" → Ein/Aus
import { alleEinstellungen, setzeWert, zuruecksetzen, beiAenderung } from './werte.js';

// Läuft das Spiel am Dev-Server auf dem Mac? Dann kann «Speichern» direkt in die Datei schreiben.
const AM_DEV_SERVER = import.meta.env.DEV;
const MERKER = 'werkstatt-offen';

let fenster = null;

export function werkstattOeffnen() {
  if (fenster) return;
  fenster = document.createElement('div');
  fenster.className = 'werkstatt';
  fenster.innerHTML = `
    <div class="werkstatt-box">
      <div class="werkstatt-kopf">
        <h2>Werkstatt</h2>
        <button class="knopf-x" data-aktion="schliessen" aria-label="Schliessen">✕</button>
      </div>
      <div class="werkstatt-regler"></div>
      <div class="werkstatt-knoepfe">
        ${AM_DEV_SERVER ? '<button data-aktion="speichern" class="knopf-haupt">Speichern</button>' : ''}
        <button data-aktion="kopieren" class="${AM_DEV_SERVER ? '' : 'knopf-haupt'}">Kopieren</button>
        <button data-aktion="zuruecksetzen">Zurücksetzen</button>
      </div>
      <div class="werkstatt-meldung" aria-live="polite"></div>
    </div>`;

  reglerBauen(fenster.querySelector('.werkstatt-regler'));
  fenster.addEventListener('click', knopfGedrueckt);
  // Tippen neben die Box schliesst die Werkstatt
  fenster.addEventListener('pointerdown', (e) => {
    if (e.target === fenster) werkstattSchliessen();
  });
  document.body.appendChild(fenster);
}

export function werkstattSchliessen() {
  fenster?.remove();
  fenster = null;
  sessionStorageSetzen(false);
}

// Nach dem Speichern lädt die Seite neu. So merken wir uns, dass die Werkstatt offen bleiben soll.
export function werkstattWiederOeffnenFallsNoetig() {
  try {
    if (sessionStorage.getItem(MERKER) === 'ja') werkstattOeffnen();
  } catch { /* egal */ }
}

function sessionStorageSetzen(offen) {
  try {
    if (offen) sessionStorage.setItem(MERKER, 'ja');
    else sessionStorage.removeItem(MERKER);
  } catch { /* egal */ }
}

function reglerBauen(ziel) {
  ziel.innerHTML = '';
  for (const [schluessel, e] of Object.entries(alleEinstellungen())) {
    const zeile = document.createElement('label');
    zeile.className = 'regler-zeile';
    const name = document.createElement('span');
    name.className = 'regler-name';
    name.textContent = e.name ?? schluessel;
    const anzeige = document.createElement('span');
    anzeige.className = 'regler-wert';

    const eingabe = document.createElement('input');
    if (e.typ === 'farbe') {
      eingabe.type = 'color';
      eingabe.value = e.wert;
      anzeige.textContent = e.wert;
      eingabe.addEventListener('input', () => {
        anzeige.textContent = eingabe.value;
        setzeWert(schluessel, eingabe.value);
      });
    } else if (e.typ === 'schalter') {
      eingabe.type = 'checkbox';
      eingabe.checked = !!e.wert;
      eingabe.addEventListener('change', () => setzeWert(schluessel, eingabe.checked));
    } else {
      eingabe.type = 'range';
      eingabe.min = e.min ?? 0;
      eingabe.max = e.max ?? 100;
      eingabe.step = e.schritt ?? 1;
      eingabe.value = e.wert;
      anzeige.textContent = e.wert;
      eingabe.addEventListener('input', () => {
        const zahl = Number(eingabe.value);
        anzeige.textContent = zahl;
        setzeWert(schluessel, zahl);
      });
    }
    eingabe.dataset.schluessel = schluessel;
    zeile.append(name, eingabe, anzeige);
    ziel.appendChild(zeile);
  }
}

async function knopfGedrueckt(e) {
  const aktion = e.target.closest('button')?.dataset.aktion;
  if (!aktion) return;
  if (aktion === 'schliessen') werkstattSchliessen();
  if (aktion === 'zuruecksetzen') {
    zuruecksetzen();
    reglerBauen(fenster.querySelector('.werkstatt-regler'));
    melden('Zurück auf die gespeicherten Werte.');
  }
  if (aktion === 'kopieren') await kopieren();
  if (aktion === 'speichern') await speichern();
}

async function kopieren() {
  const text = JSON.stringify(alleEinstellungen(), null, 2);
  try {
    await navigator.clipboard.writeText(text);
    melden('Kopiert – schick die Werte an Papi.');
  } catch {
    melden('Kopieren hat nicht geklappt.', true);
  }
}

async function speichern() {
  melden('Speichere …');
  try {
    const antwort = await fetch('/api/werkstatt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alleEinstellungen()),
    });
    if (!antwort.ok) throw new Error(await antwort.text());
    // Die Seite lädt gleich neu, weil sich werkstatt.json geändert hat.
    sessionStorageSetzen(true);
    melden('Gespeichert in werkstatt.json.');
  } catch (fehler) {
    melden('Speichern hat nicht geklappt: ' + fehler.message, true);
  }
}

function melden(text, istFehler = false) {
  const m = fenster?.querySelector('.werkstatt-meldung');
  if (!m) return;
  m.textContent = text;
  m.classList.toggle('fehler', istFehler);
}

// Wenn sich ein Wert anderswo ändert, Regler nachführen
beiAenderung((schluessel, neuerWert) => {
  const eingabe = fenster?.querySelector(`[data-schluessel="${schluessel}"]`);
  if (!eingabe) return;
  if (eingabe.type === 'checkbox') eingabe.checked = !!neuerWert;
  else if (eingabe.value !== String(neuerWert)) eingabe.value = neuerWert;
});
