# Schiffli versenken
Schiffe versenken fürs iPad. Raphael (geboren 2017) ist Game Designer und Chef-Tester, Lukas (Papi) ist Producer.
Raphael liebt Fussball und Singen und ist sportbegeistert. Ideen in diese Richtung sind willkommen, entscheiden tut er.

## Technik
- Phaser, JavaScript, Vite (gleicher Aufbau wie Matteos «freistoss-profi»)
- Safari auf iPad und iPhone, Querformat, Steuerung per Tippen
- Installierbar als Web-App (Manifest, Icon, Vollbild)
- Keine Werbung, kein Tracking, keine persönlichen Daten

## Design (gilt für alles)
Realistisch und hochwertig, **nicht kindlich**: wie ein gutes Handy-Spiel, nicht wie ein Bilderbuch.
- Szene: Abendhimmel oben, Unterwasserwelt unten (Wasserlinie `--wl`), Licht von rechts (tiefstehende Sonne)
- Farben: Nachtblau `#0b1d33`, Meer `--meer`, Text `#f3ead6`, Akzent Gold `#d9b46a`; keine knalligen Bonbonfarben
- Schrift: Titel in «Cinzel» (Serifen, Grossbuchstaben-Look), sonst System-Schrift; Hinweise klein, gesperrt, in Grossbuchstaben
- Grafik als SVG mit Verläufen, Licht und Schatten; naturgetreue Formen (keine Comic-Augen, keine Emojis in der Oberfläche)
- Bewegungen ruhig und natürlich (Schaukeln, Schwärme), nichts Hüpfendes
- Sichtbares als HTML/SVG über dem Phaser-Canvas, damit es auf dem Retina-iPad scharf ist
- Bedienelemente: dunkles Glas (`rgba(10,24,38,.94)`), feine goldene Linien, abgerundet 10–14px

## Spielmodi (Grobplan, Raphael darf ändern)
1. Gegen den Computer – Stufen Leicht / Mittel / Schwer (src/logik/computer.js)
2. Zwei Spieler am gleichen iPad – abwechselnd, mit «Nicht schauen!»-Bildschirm
3. Zwei Spieler online, zwei Geräte – PeerJS (direkt, ohne Konto, Gratis-Vermittler 0.peerjs.com), Code + QR-Code (src/netz/)
   Testen in der Cloud: eigener Vermittler (npm-Paket «peer») und ?vermittler=127.0.0.1:9000 an der Adresse
Den Code von Anfang an so bauen, dass die Spiellogik (Raster, Schiffe, Treffer) nicht an Grafik oder Gegner gebunden ist. So lassen sich die Modi 2 und 3 später einfach anhängen.

## Flotte
- 10 Fussball-Schiffe in src/logik/flotte.js (Raphaels Aufstellung, vom längsten zum kleinsten):
  Mbappé 7, Haaland 6, Ronaldo 5, Yamal 4, Keni 3, Messi 2, dann Schnellboote mit 1 Feld: Neymar, Xhaka, Pedri, Musiala
- Meergrösse 7–24 (Standard 12, damit alle 10 Schiffe mitspielen). flotteFuer(groesse) nimmt so viele Schiffe, wie Platz haben (10×10: 8, ab 11×11: alle)
- iPhone ab 13×13: Zoomen mit zwei Fingern (src/zoom.js)
- Jubel der Spieler (src/jubel.js): Figur aus Gelenken, eine Pose pro Spieler; Treffer = klein am Rand, Versenkt = gross in der Mitte; nur wenn der schiesst, der aufs iPad schaut

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
Geheimes Menü im Spiel: 2 Sekunden auf den Hai drücken (der Hai hält dabei an).
Aufs Schiff tippen startet das Spiel; anderswo tippen macht auf dem Startbildschirm nichts.
- Regler für alle Werte aus werkstatt.json
- Am Dev-Server: «Speichern» schreibt direkt in werkstatt.json
- Online-Version: «Kopieren» legt die Werte in die Zwischenablage

## Testen
- Online (immer, auch unterwegs): `/release` veröffentlicht auf https://zinggl.github.io/RaRa_schiffliversenken/
- Zuhause am Mac: `npm run dev`, das iPad öffnet die Adresse des Mac im WLAN, jede Änderung lädt neu
- In der Cloud-Sitzung: `npm run build`, dann mit Playwright einen Screenshot im iPad-Querformat (1180×820) prüfen
