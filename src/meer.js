// Malt das Meer: Grundfarbe mit hellen Wellenlinien.
import Phaser from 'phaser';

const WELLEN_ABSTAND = 70; // so viele Pixel zwischen zwei Wellenreihen

export function zeichneMeer(grafik, breite, hoehe, farbeText) {
  const grundfarbe = Phaser.Display.Color.HexStringToColor(farbeText);
  const hell = grundfarbe.clone().lighten(12).color;

  grafik.clear();
  grafik.fillStyle(grundfarbe.color);
  grafik.fillRect(0, 0, breite, hoehe);

  // Kleine Wellen «~», versetzt in jeder zweiten Reihe
  grafik.lineStyle(4, hell, 0.6);
  for (let reihe = 0, y = 40; y < hoehe; reihe++, y += WELLEN_ABSTAND) {
    const versatz = reihe % 2 ? WELLEN_ABSTAND : 0;
    for (let x = -WELLEN_ABSTAND + versatz; x < breite; x += WELLEN_ABSTAND * 2) {
      grafik.beginPath();
      grafik.arc(x + 10, y, 10, Math.PI, 0, false);
      grafik.arc(x + 30, y, 10, Math.PI, 0, true);
      grafik.strokePath();
    }
  }
  document.body.style.backgroundColor = farbeText;
}
