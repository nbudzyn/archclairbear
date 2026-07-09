# Manuelle Browser-Tests durch die KI

Diese Checkliste beschreibt das Vorgehen für manuelle Browser-Tests **durch die KI**.

- Vor dem Start prüfen, ob `8082` frei ist.
- Den Server für den manuellen Check auf `8082` im Hintergrund starten.
- Für den Browserlauf Playwright verwenden, nicht die Chrome-Devtools-Extensions.
- Beim Codex-In-App-Browser steht nur die Playwright-API des Browser-Plugins zur Verfügung; `waitForLoadState` unterstützt dort kein
  `networkidle`. Stattdessen `load` verwenden und anschließend auf konkrete Seitenzustände warten, z. B. sichtbares Canvas, erwartete
  HTTP-Antwort oder sichtbare Pixel.
- Wenn das Playwright-Browser-Binary fehlt, einmalig `npx playwright install chromium` ausführen.
- Wenn möglich das lokale Chrome nutzen; nur auf ein anderes Playwright-Executable ausweichen, wenn das lokale Chrome nicht verfügbar ist.
- Die Seite auf `http://localhost:8082/` öffnen.
- Auf das sichtbare Canvas warten, bevor geklickt wird.
- Den gewünschten Knoten per Doppelklick im Canvas auslösen.
- Auf die fachlich erwartete Nachladeanfrage warten, bevor der Screenshot aufgenommen wird.
- Den Screenshot erst nach dem finalen Layout-Zustand aufnehmen.
- Den Server nach dem Check wieder stoppen und den Port erneut prüfen.
