// Holt automatisch die neueste Version des Spiels.
// Eine App auf dem Home-Bildschirm vom iPad behält sonst manchmal eine alte Version.
// Beim Öffnen und beim Zurückkehren in die App wird geprüft, ob es online etwas Neueres gibt.
// Läuft gerade eine Schlacht oder das Aufstellen, wird nicht neu geladen (sonst wäre das Spiel weg).

function spielLaeuft() {
  return !!document.querySelector('.aufstellen, .kampf');
}

async function pruefen() {
  try {
    const antwort = await fetch(`./?neu=${Date.now()}`, { cache: 'no-store' });
    if (!antwort.ok) return;
    const neu = (await antwort.text()).match(/assets\/index-[\w-]+\.js/)?.[0];
    const jetzt = document.querySelector('script[src*="assets/index-"]')?.getAttribute('src') ?? '';
    if (neu && jetzt && !jetzt.endsWith(neu) && !spielLaeuft()) location.reload();
  } catch {
    /* kein Internet: einfach mit der jetzigen Version weiterspielen */
  }
}

export function aktualisierenEinrichten() {
  if (import.meta.env.DEV) return; // am Dev-Server lädt Vite ohnehin alles neu
  pruefen();
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') pruefen();
  });
}
