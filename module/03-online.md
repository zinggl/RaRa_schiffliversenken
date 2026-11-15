# Modul 03 – Zu zweit mit zwei Geräten

## Ziel
Raphael auf dem iPad und Papi auf dem iPhone spielen übers Internet gegeneinander – jeder auf seinem eigenen Gerät, ohne «Nicht schauen!».

## So soll es sich anfühlen
- **Verbinden:** «Zu zweit mit zwei Geräten» → **Spiel eröffnen** oder **Spiel beitreten**.
  - Eröffnen: Das Gerät zeigt einen **QR-Code** und einen **4-stelligen Code** (z. B. 4 7 1 2).
  - Beitreten: QR-Code mit der Kamera scannen (öffnet das Spiel direkt) **oder** den Code auf einem Zahlenfeld eintippen.
- **Aufstellen:** Beide stellen gleichzeitig auf ihrem Gerät auf. Wer fertig ist, sieht «Warte auf den Gegner …». Das Meer ist so gross, wie es beim Eröffner eingestellt ist.
- **Wer beginnt:** Eine Münze entscheidet (kurze Animation, auf beiden Geräten gleich).
- **Schlacht:** wie gegen den Computer – gross das Meer des Gegners, klein die eigene Flotte. Treffer = nochmals. Wer nicht dran ist, sieht «Der Gegner zielt …» und die Einschläge auf der eigenen Flotte.
- **Fair:** Die Schiffe bleiben auf dem eigenen Gerät; der Gegner erfährt nur Treffer/Wasser/Versenkt. Erst am Ende sieht der Verlierer, wo die Schiffe lagen.
- **Verbindung weg:** klare Meldung «Verbindung unterbrochen» mit Knopf zum Start – kein eingefrorenes Spiel.
- **Nochmals:** nach dem Spiel direkt nochmals gegeneinander, ohne neuen Code.
- **Technik:** direkte Verbindung (PeerJS), kein Konto, nichts wird gespeichert.

## Getestet in der Cloud
Zwei Geräte (iPad + iPhone) im Testbrowser mit eigenem Vermittler: ganze Partie mit Wechseln, Sieg/Niederlage, Aufdecken der Flotte, Nochmals, falscher Code, Gegner verlässt das Spiel, Verbindung weg (Meldung nach ~10 s). Offen: echter Gratis-Vermittler 0.peerjs.com und echte Geräte.

## Fertig, wenn …
- [ ] Raphael auf dem iPad und Papi auf dem iPhone spielen eine ganze Schlacht bis zum Feuerwerk
- [x] Beide stellen gleichzeitig auf, das Spiel beginnt, wenn beide «Bereit!» gedrückt haben
- [x] Bricht die Verbindung ab, kommt eine klare Meldung
- [x] Nach dem Spiel kann man direkt nochmals spielen, ohne neuen Code
- [ ] Auf iPad und iPhone getestet
