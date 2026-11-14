# Schiffli versenken
Schiffe versenken fürs iPad. Raphael (geboren 2017) ist Game Designer und Chef-Tester, Lukas (Papi) ist Producer.
Raphael liebt Fussball und Singen und ist sportbegeistert. Ideen in diese Richtung sind willkommen, entscheiden tut er.

## Technik
- Phaser, JavaScript, Vite (gleicher Aufbau wie Matteos «freistoss-profi»)
- Safari auf iPad und iPhone, Querformat, Steuerung per Tippen
- Installierbar als Web-App (Manifest, Icon, Vollbild)
- Keine Werbung, kein Tracking, keine persönlichen Daten

## Spielmodi (Grobplan, Raphael darf ändern)
1. Gegen den Computer – zuerst bauen
2. Zwei Spieler am gleichen iPad – abwechselnd, mit «Nicht schauen!»-Bildschirm
3. Zwei Spieler online, zwei Geräte – zuletzt; braucht einen Gratis-Dienst, Wahl erst dann treffen
Den Code von Anfang an so bauen, dass die Spiellogik (Raster, Schiffe, Treffer) nicht an Grafik oder Gegner gebunden ist. So lassen sich die Modi 2 und 3 später einfach anhängen.

## Ordner
- module/ – ein Steckbrief pro Modul (01-….md), Vorlage _vorlage.md
- feedback.md – Raphaels Notizen nach jedem Test
- src/config/werkstatt.json – alle einstellbaren Spielwerte
- src/ – Spielcode, eine Datei pro Spielelement

## Arbeitsweise
1. Immer nur ein Modul aufs Mal.
2. Zuerst den Plan in 3–5 einfachen Sätzen zeigen, die ein 8- bis 9-Jähriger versteht. Erst nach OK bauen.
3. Spielwerte nie im Code verstecken: Alles Einstellbare kommt in werkstatt.json und bekommt einen Regler in der Werkstatt.
4. Nach jedem Modul «Fertig, wenn …» aus dem Steckbrief prüfen, dann committen (deutsche Commit-Nachricht).
5. Zum Schluss kurz sagen, was neu ist und wie man es auf dem iPad testet.
6. Raphaels Design-Entscheidungen gelten. Bei Unklarheit fragen, nicht raten.
7. Deutsch, Schweizer Schreibweise (ss statt ß), einfache Code-Kommentare.
8. Fragen an Lukas als Auswahl stellen (AskUserQuestion), damit er sie unterwegs auf iPhone/iPad antippen kann.

## Git
- Direkt auf `main` arbeiten, keine Branches und Pull Requests: Jeder Push auf `main` veröffentlicht automatisch auf GitHub Pages.
- Committen nach jedem fertigen Modul oder Feedback. Gepusht wird nur mit `/release`.

## Werkstatt
Geheimes Menü im Spiel: 2 Sekunden aufs Schiff-Logo drücken.
- Regler für alle Werte aus werkstatt.json
- Am Dev-Server: «Speichern» schreibt direkt in werkstatt.json
- Online-Version: «Kopieren» legt die Werte in die Zwischenablage

## Testen
- Online (immer, auch unterwegs): `/release` veröffentlicht auf https://zinggl.github.io/RaRa_schiffliversenken/
- Zuhause am Mac: `npm run dev`, das iPad öffnet die Adresse des Mac im WLAN, jede Änderung lädt neu
- In der Cloud-Sitzung: `npm run build`, dann mit Playwright einen Screenshot im iPad-Querformat (1180×820) prüfen
