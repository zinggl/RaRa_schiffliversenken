---
name: feedback
description: Raphaels Notizen aus feedback.md in Aufgaben übersetzen, nach OK umsetzen und Erledigtes abhaken.
---

# /feedback – Raphaels Feedback umsetzen

Steht nach `/feedback` noch Text, ist das neues Feedback: zuerst unter «Offen» in `feedback.md` eintragen.

## Ablauf
1. Lies `CLAUDE.md` und `feedback.md` (Abschnitt «Offen»).
2. Übersetze jede Notiz in eine konkrete, kleine Aufgabe. Zeig die Liste in einfachen Sätzen, nummeriert, mit Einschätzung klein/mittel/gross.
   - Ist eine Notiz unklar («fühlt sich komisch an»), frag Raphael gezielt nach, was er meint (als Auswahl).
   - Ist etwas eigentlich ein neues Modul, schlag einen Steckbrief in `module/` vor, statt es hier zu bauen.
   - Kann Raphael etwas selbst mit einem Werkstatt-Regler lösen, sag ihm, welcher.
3. **Warten auf OK** (Raphael darf Aufgaben streichen oder die Reihenfolge ändern).
4. Umsetzen. Neue einstellbare Werte kommen in `src/config/werkstatt.json`.
5. `npm run build` muss durchlaufen; kurz testen (Browser-Pane oder Playwright-Screenshot).
6. In `feedback.md` erledigte Punkte von «Offen» nach «Erledigt» verschieben, mit Datum (YYYY-MM-DD) und einem Halbsatz, was gemacht wurde.
7. Auf `main` committen mit deutscher Nachricht, z. B. «Feedback: Treffer-Explosion grösser». Nicht pushen.
8. Kurz sagen, was Raphael jetzt auf dem iPad ausprobieren soll.
