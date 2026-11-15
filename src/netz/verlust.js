// Zeigt eine klare Meldung, wenn die Verbindung abbricht (statt eines eingefrorenen Spiels).
import { netz } from './verbindung.js';
import { zwischenbild } from '../zwischenbild.js';

export function verlustMelden(szene) {
  const aufhoeren = netz.beiVerlust((grund) => {
    zwischenbild(szene.ebene, {
      titel: grund === 'verlassen' ? 'Dein Gegner ist weg' : 'Verbindung unterbrochen',
      text:
        grund === 'verlassen'
          ? 'Dein Gegner hat das Spiel verlassen.'
          : 'Die Verbindung zum anderen Gerät ist abgebrochen.<br>Beide Geräte müssen die App offen lassen und Internet haben.',
      knoepfe: [{ text: 'Zum Start', gold: true, los: () => szene.scene.start('Start') }],
    });
  });
  szene.events.once('shutdown', aufhoeren);
}
