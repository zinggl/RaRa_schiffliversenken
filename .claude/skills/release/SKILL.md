---
name: release
description: Neue stabile Version von Schiffli versenken bauen, auf GitHub pushen (GitHub Pages) und für Raphael zusammenfassen, was neu ist.
---

# /release – neue Version online stellen

Läuft auf dem Mac und in der Cloud-Sitzung. Auf dem Mac, falls `npm` nicht gefunden wird:
`export PATH="$HOME/.local/opt/node/bin:$HOME/.local/bin:$PATH"`

## Ablauf
1. `git status` prüfen. Nicht committete Änderungen? Fragen (als Auswahl), ob sie mit in den Release sollen.
2. `npm run build`; bei Fehlern abbrechen und erklären.
3. Was ist neu? Commits seit dem letzten Tag `release-*` lesen (`git log <letzter-tag>..HEAD --oneline`; ohne Tag: alle).
4. Nächste Nummer bestimmen (`release-1`, `release-2`, …), Tag setzen, dann `git push origin main` und `git push origin --tags`.
5. Warten, bis die Action «GitHub Pages» fertig ist:
   - mit `gh run watch`, falls `gh` angemeldet ist,
   - sonst den öffentlichen Status abfragen, bis `status` = `completed` ist (alle ~20 s):
     `curl -s "https://api.github.com/repos/zinggl/RaRa_schiffliversenken/actions/runs?per_page=1" | jq '.workflow_runs[0] | {status, conclusion, html_url}'`
   - Bei `conclusion` ≠ `success` den Fehler erklären.
6. Link zeigen: https://zinggl.github.io/RaRa_schiffliversenken/
7. «Was ist neu» für Raphael in 2–4 kurzen, fröhlichen Sätzen. Hinweis: Auf dem iPad die App vom Home-Bildschirm einmal ganz schliessen und neu öffnen, damit die neue Version lädt.
