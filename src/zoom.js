// Zoomen mit zwei Fingern – fürs iPhone auf grossen Meeren, wo die Felder sonst winzig sind.
// Mit einem Finger zieht man weiterhin Schiffe oder schiesst; mit zwei Fingern vergrössert
// und verschiebt man die Ansicht (eingebautes Zoomen von Safari).
const OHNE_ZOOM = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover';
const MIT_ZOOM = 'width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=5, user-scalable=yes, viewport-fit=cover';
const AB_FELDERN = 13; // ab dieser Meergrösse darf man auf dem Handy zoomen

export function istHandy() {
  return Math.min(window.screen.width, window.screen.height) < 600;
}

export function zoomNoetig(groesse) {
  return istHandy() && groesse >= AB_FELDERN;
}

export function zoomErlauben(ja) {
  const meta = document.querySelector('meta[name="viewport"]');
  if (meta) meta.setAttribute('content', ja ? MIT_ZOOM : OHNE_ZOOM);
  document.documentElement.classList.toggle('zoom-erlaubt', ja);
}
