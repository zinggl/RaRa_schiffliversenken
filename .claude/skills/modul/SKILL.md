---
name: modul
description: Nächstes Modul von Schiffli versenken bauen – Steckbrief lesen, Plan in einfachen Sätzen zeigen, nach OK bauen, «Fertig, wenn …» prüfen, committen.
---

# /modul – das nächste Modul bauen

Optional mit Argument: Nummer oder Name des Moduls (z. B. `/modul 02`). Ohne Argument: der Steckbrief mit der tiefsten Nummer in `module/`, der noch nicht als erledigt markiert ist (erledigt = Zeile `Status: ✅ fertig` am Ende der Datei).

## Ablauf
1. Lies `CLAUDE.md` und den Steckbrief `module/NN-*.md`. Fehlt ein Steckbrief, hilf Raphael, ihn anhand von `module/_vorlage.md` zu schreiben. Stelle dafür einfache Fragen, eine nach der anderen, als Auswahl (AskUserQuestion), damit Papi sie auf dem iPhone/iPad antippen kann.
2. Ist etwas im Steckbrief unklar, frag nach. Nicht raten (Raphaels Design-Entscheidungen gelten).
3. Zeig den Plan in **3–5 einfachen Sätzen**, die ein 8- bis 9-Jähriger versteht. Nenne die neuen Werkstatt-Regler. Dann **warten auf OK**.
4. Bauen. Regeln:
   - Ein Spielelement pro Datei in `src/`. Spiellogik (Raster, Schiffe, Treffer) getrennt von Grafik und Gegner.
   - Jeder einstellbare Wert kommt in `src/config/werkstatt.json` (Felder: `name`, `typ` = `zahl`|`farbe`|`schalter`, `wert`, bei Zahlen `min`, `max`, `schritt`). Die Werkstatt baut den Regler automatisch.
   - Code-Kommentare auf Deutsch, einfach, Schweizer Schreibweise (ss).
5. `npm run build` muss ohne Fehler durchlaufen. Testen: lokal im Browser-Pane (Dev-Server `schiffli`), in der Cloud mit Playwright-Screenshot im iPad-Querformat (1180×820, Touch an).
6. Gehe «Fertig, wenn …» Punkt für Punkt durch und hake ab, was erfüllt ist. Was nur auf dem iPad prüfbar ist, offen lassen und sagen.
7. Wenn alles erfüllt ist: `Status: ✅ fertig` an den Steckbrief anhängen und auf `main` committen (deutsche Commit-Nachricht, z. B. «Modul 1: Meine Flotte»). Nicht pushen, das macht `/release`.
8. Zum Schluss kurz für Raphael: Was ist neu? Wie testet er es auf dem iPad? Welche Regler gibt es neu in der Werkstatt? Frag, ob gleich `/release` laufen soll.
