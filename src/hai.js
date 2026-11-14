// Ein Weisser Hai, der langsam durchs Meer zieht (unter dem Schiff durch).
// Dunkler Rücken, heller Bauch – so wie echte Haie.

const HAI_SVG = `
<svg viewBox="0 0 300 120" aria-hidden="true">
  <defs>
    <linearGradient id="hai-ruecken" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#2e4250"/>
      <stop offset="0.55" stop-color="#5d7686"/>
      <stop offset="1" stop-color="#7f97a5"/>
    </linearGradient>
    <linearGradient id="hai-bauch" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#c9d6dc"/>
      <stop offset="1" stop-color="#eef3f5"/>
    </linearGradient>
  </defs>
  <!-- Schwanzflosse (oben grösser als unten), bewegt sich leicht -->
  <g class="hai-schwanz">
    <path d="M58,60 Q40,40 18,8 Q30,40 34,60 Q30,74 22,96 Q42,78 58,64 Z" fill="#3d5464"/>
  </g>
  <!-- Rückenflosse -->
  <path d="M150,40 Q160,14 178,4 Q172,24 176,42 Z" fill="#33495a"/>
  <!-- Körper -->
  <path d="M54,62 Q90,40 150,38 Q220,36 262,50 Q284,57 292,64 Q280,72 258,78
           Q210,88 150,86 Q92,84 54,62 Z" fill="url(#hai-ruecken)"/>
  <!-- Heller Bauch mit unregelmässiger Grenze -->
  <path d="M92,74 Q120,70 150,74 Q190,69 226,72 Q246,70 268,74 Q252,80 222,84
           Q180,89 140,86 Q110,83 92,74 Z" fill="url(#hai-bauch)"/>
  <!-- Bauchflosse und Afterflosse -->
  <path d="M110,82 L100,96 L124,84 Z" fill="#3d5464"/>
  <path d="M78,72 L70,82 L88,74 Z" fill="#3d5464"/>
  <!-- Brustflosse, lang nach hinten -->
  <path d="M206,78 Q196,96 176,112 Q200,100 222,82 Z" fill="#3a5060"/>
  <!-- Kiemenspalten -->
  <path d="M222,56 Q220,64 222,73 M228,55 Q226,64 228,73 M234,55 Q232,63 234,72 M240,55 Q238,63 240,71"
        stroke="#2b3c48" stroke-width="1.2" fill="none" opacity="0.7"/>
  <!-- Auge und Maul -->
  <circle cx="264" cy="58" r="2.2" fill="#0b1015"/>
  <path d="M256,72 Q272,74 286,67" stroke="#2b3c48" stroke-width="1.3" fill="none"/>
</svg>`;

export function haiStarten(unterwasser) {
  const hai = document.createElement('div');
  hai.className = 'hai';
  hai.innerHTML = HAI_SVG;
  unterwasser.appendChild(hai);
}
