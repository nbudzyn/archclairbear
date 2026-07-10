# Entwicklung

## Erster Schritt: Prüfung der Anforderungen

Wenn das beauftrage Backlog-Item in sich widersprüchlich ist, brich die Entwicklung ab und informiere den User.
Wenn das beauftrage Backlog-Item den Projekt-Vorgaben widerspricht, frage vor der Entwicklung den User: Sollen die Projekt-Vorgaben
angepasst
werden, soll das Backlog-Item angepasst werden oder handelt es sich um eine Ausnahme?

## Gradle

- Vor Gradle-Aufrufen immer explizit Freigabe holen (über den Tool-Aufruf).
    - Das gilt für `gradle`, `gradlew.bat`, `.\localTest.ps1`, `.\localJsTest.ps1` und `.\localBrowserTest.ps1`.
- Die Wrapper verwenden das Standard-Gradle-User-Home im Benutzerverzeichnis (`C:\Users\...\ .gradle`).
- Bei `functions.exec_command` keine PowerShell-Exe in `cmd` hinein verschachteln, wenn der PowerShell-Interpreter bereits der Shell-Kontext
  ist.
  Statt `C:\Program Files\PowerShell\7\pwsh.exe -Command ...` den PowerShell-Befehl direkt übergeben oder den `shell`-Parameter nutzen.
    - Nicht vergessen, Kommandos zu quoten (`Program Files` enthält ein Leerzeichen!)

## Arbeitsweise

- Vor Änderungen die verbindlichen Dokumente lesen.
- Der Code liegt unter dem Paket `de.nb.archclairbear`.
- Neue Skripte und Build-Aufrufe nicht auf ein projektlokales Gradle-User-Home umbiegen.
- Entwicklungswissen hier bündeln, nicht in Produktdokumenten oder im README doppeln.
- Wenn ein Package leer wird, das leere Package-Verzeichnis löschen.
- Bei Review-Findings erst Lokalität prüfen: projektspezifische Test-/Reporter-Logik möglichst dort halten, wo die zugehörige Toolwelt lebt
  (z. B. Playwright-Auswertung in Node/JS statt im Gradle-Buildscript).
- Layoutänderungen über die Layout-Engine! Manuelle Reflow-Heuristiken nur als Übergangslösung.
- Port-Strategie:
    - `8080` ist für menschliche manuelle GUI-Starts reserviert.
    - `8081` ist für automatisierte Tests und testgetriebene Browserläufe reserviert.
    - `8082` ist für manuelle Browser-Checks durch die KI reserviert. Port BEIM Start des Servers für manuelle Tests explizit angeben:
      `server.port=8081`.
- Für `localTest.ps1` in `functions.exec_command` die PowerShell direkt ausführen, nicht die EXE als normalen `cmd`-Text behandeln. Der
  sichere Aufruf ist z. B. `C:\Program Files\PowerShell\7\pwsh.exe -NoProfile -Command ".\localTest.ps1; exit $LASTEXITCODE"`. (Quoting
  wegen Leerzeigchen!)
- Für `localJsTest.ps1` und `localBrowserTest.ps1` in `functions.exec_command` ebenfalls den Scriptaufruf direkt im bestehenden
  PowerShell-Kontext starten, nicht die PowerShell-EXE als Text im `cmd`-Kontext verschachteln.
- Wenn ein lokales Browser- oder Test-Server-Skript über Port `8081` oder `8082` scheitert, zuerst prüfen, ob noch ein alter Serverprozess
  läuft.
- Wenn ein Tool oder Script temporäre Dateien braucht,oder erzeugt, diese nach Möglichkeit im Projektverzeichnis ablegen, zum Beispiel unter
  `tmp/`,
  statt auf `C:\TMP` auszuweichen.
    - Das gilt auch für Screenshots, Browser-Artefakte und andere Prüfdateien.
- Bei statischen Browser-Modulen immer Cache-Busting und alle abhängigen Versionen gemeinsam aktualisieren
  (`graph-app.js`, `graph-client.mjs`, `graph-renderer.mjs`, Integration Test `LandingPageIT`).
    - Cache-Busting-Regel: Jede Änderung an statischen Browser-Assets bekommt eine neue gemeinsame Versionskennung; die zusammengehörigen
      Imports, HTML-Referenzen und betroffenen Tests werden immer im selben Schritt mitgezogen.

## Tests

### Allgemeines

- `Jsoup` prüft nur gerendertes HTML, nicht JavaScript-Ausführung oder Browser-Verhalten.
- Beim GUI-Start auch die statischen Client-Assets mitprüfen.
- Frontend-Logik in kleine, importierbare Module schneiden und mit schnellen JS-Tests absichern.
- Browser-Tests nur für wenige kritische Flows einsetzen.
- Screenshot-Tests nur sparsam verwenden; flexible Layouts machen sie schnell fragil.
- Automatisiert Browser-Tests laufen mit Playwright.
- Browser-Tests prüfen robuste Zustände statt pixelgenauer Layouts. Pixelprüfungen bleiben klein und dienen nur dazu, leere
  Canvas-Renderings
  zu erkennen.
- Bei Fehlerfällen erst die echte HTTP-Antwort prüfen, dann die GUI. Gemockte Browser-Routen beweisen nur die Client-Reaktion, nicht den
  echten Weg von Spring über HTTP und Fetch bis ins Layout.
- Wenn zusätzliche Browser-Abhängigkeiten aus `node_modules` kommen, sie über Spring Resource Handler unter einem stabilen Pfad exponieren
  und im HTML explizit einbinden.
- Wenn statische JS-Module geändert werden und manuell im Browser geprüft wird, Cache-Busting oder frische Asset-URLs verwenden.
- Windows-Pfade in Properties mit echten Backslashes testen; Escaping-Fallen nicht nur über `TempDir` abdecken.
- Playwright-spezifische Auswertung und Output-Filterung in kleinen Node-Skripten halten; Gradle soll diese Skripte nur aufrufen.
- Auf Windows `.cmd`-Starter aus Node nicht direkt spawnen, wenn es vermeidbar ist. Für lokale Node-Tools lieber deren JS-Entry-Point mit
  `process.execPath` starten.

### Verifikationsroute

- Frühzeitig testen.
- Die Verifikationsroute richtet sich nach der Art der Änderung.
- Grundregel: immer mit der kleinsten fachlich sinnvollen Teststufe beginnen und nur bei Bedarf breiter werden.
- Bei reiner JavaScript- oder Client-Logik zuerst `localJsTest`.
- Bei reinen Server- oder API-Änderungen zuerst `localTest`.
- Bei Browser- oder GUI-Änderungen zuerst die fachlich kleinste passende Teststufe, danach die weiteren betroffenen Stufen.
- Am Ende immer alle relevanten Testarten laufen lassen:
    - `localJsTest`
    - `localTest`
    - `localBrowserTest`
    - manueller KI-Browser-Test auf Port `8082`

### Tests durch die KI

- Im ersten Schritt immer die passenden token-sparenden lokalen Testskripte verwenden, bei Bedarf mit `-Stacktrace`.
    - Direkte Testaufrufe über Gradle nur nach ausdrücklicher Nachfrage beim User.
    - Java: `.\localTest.ps1`, bei Bedarf `.\localTest.ps1 -Stacktrace`.
    - JavaScript: `.\localJsTest.ps1`, bei Bedarf `.\localJsTest.ps1 -Stacktrace`. Die JS-Tests laufen mit `node:test` im Einprozessmodus
      `--test-isolation=none`.
    - Browser: `.\localBrowserTest.ps1`, bei Bedarf mit `-Stacktrace`.
- Das genaue Vorgehen für manuelle Browser-Tests durch die KI steht in [manual-ai-browser-checks.md](manual-ai-browser-checks.md).

### Browser-Tests

- Einmalig die npm-Abhängigkeiten mit `npm install` installieren.
- Wenn Playwright noch keinen Chromium-Browser findet, einmalig `npx playwright install chromium` ausführen.
- Der lokale Browser-Testlauf startet die Anwendung selbst und beendet sie nach dem Testlauf wieder.
- Gradle-Task (nur falls nötig): `.\gradlew.bat --console=plain browserTest`.
- Ruhiger Gradle-Task (nur falls nötig): `.\gradlew.bat --console=plain -q browserTestQuiet`.

### Manuell aus IntelliJ gestartete Tests (nicht für KI)

- Java-Tests in IntelliJ: `src\test` -> `Run Tests in...`
- JavaScript-Tests in IntelliJ: `src\js-test` -> `Run Tests in...`
