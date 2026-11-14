// Bildschirm dazwischen: deckt alles zu (damit niemand spicken kann).
// knoepfe: [{ text, gold, los }]
const SPERRE_MS = 400; // kurz nach dem Erscheinen keine Tipps annehmen

export function zwischenbild(eltern, { titel, text, knoepfe }) {
  const bild = document.createElement('div');
  bild.className = 'zwischenbild';
  bild.innerHTML = `
    <div class="zwischenbild-box">
      <div class="zwischenbild-titel">${titel}</div>
      <div class="zwischenbild-text">${text}</div>
      <div class="zwischenbild-knoepfe">
        ${knoepfe.map((k, i) => `<button class="knopf ${k.gold ? 'knopf-gold' : ''}" data-nr="${i}">${k.text}</button>`).join('')}
      </div>
    </div>`;
  const ab = performance.now() + SPERRE_MS;
  bild.addEventListener('click', (e) => {
    const knopf = e.target.closest('button');
    if (!knopf || performance.now() < ab) return;
    bild.remove();
    knoepfe[Number(knopf.dataset.nr)].los();
  });
  eltern.appendChild(bild);
  return bild;
}
