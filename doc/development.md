# Entwicklung

## Gradle

- Vor Gradle-Aufrufen immer explizit Freigabe holen.
- Das gilt für `gradle`, `gradlew.bat`, `.\localTest.ps1`, `.\localJsTest.ps1` und `.\localBrowserTest.ps1`.
- Die Wrapper verwenden das Standard-Gradle-User-Home im Benutzerverzeichnis (`C:\Users\...\ .gradle`).
- Bei `functions.exec_command` keine PowerShell-Exe in `cmd` hinein verschachteln, wenn der PowerShell-Interpreter bereits der Shell-Kontext ist.
  Statt `C:\Program Files\PowerShell\7\pwsh.exe -Command ...` den PowerShell-Befehl direkt übergeben oder den `shell`-Parameter nutzen.

## Arbeitsweise

- Vor Änderungen die verbindlichen Dokumente lesen.
- Der Code liegt unter dem Paket `de.nb.archclairbear`. Wenn noch `aitddadventure`-Pakete, Imports oder Tests auftauchen, zuerst nach `de.nb.archclairbear` umstellen statt die alte Struktur weiterzuführen.
- Kurzer Architektur-Orientierungsanker:
  - Server: `src/main/java/de/nb/archclairbear/graph` analysiert Java-Quelltext und liefert JSON-Graphdaten.
  - Client: `src/main/resources/static/graph-client.mjs` steuert Laden, Auf-/Zuklappen und Fehlermeldungen.
  - Renderer: `src/main/resources/static/graph-renderer.mjs` baut Cytoscape-Elemente und ELK-Layout.
  - Tests: Java-Tests unter `src/test/java/de/nb/archclairbear`, JS-Tests unter `src/js-test`, Browser-Tests unter `src/browser-test`.
- Neue Skripte und Build-Aufrufe nicht auf ein projektlokales Gradle-User-Home umbiegen.
- Entwicklungswissen hier bündeln, nicht in Produktdokumenten oder im README doppeln.
- Wenn ein Package leer wird, das leere Package-Verzeichnis löschen.
- Wenn das oberste Backlog-Item umgesetzt scheint, Bescheid sagen und fragen, ob es aus dem Backlog entfernt werden soll.
- Bei Review-Findings erst Lokalität prüfen: projektspezifische Test-/Reporter-Logik möglichst dort halten, wo die zugehörige Toolwelt lebt
  (z. B. Playwright-Auswertung in Node/JS statt im Gradle-Buildscript).
- Für Layoutänderungen bevorzugt erst die Layout-Engine bestimmen und dann die Renderer-Integration bauen; manuelle Reflow-Heuristiken nur als
  Übergangslösung.
- Port-Strategie:
  - `8080` ist für menschliche manuelle GUI-Starts reserviert.
  - `8081` ist für automatisierte Tests und testgetriebene Browserläufe reserviert.
  - `8082` ist für manuelle Browser-Checks durch die KI reserviert.
- Für `localTest.ps1` in `functions.exec_command` die PowerShell direkt ausführen, nicht die EXE als normalen `cmd`-Text behandeln. Der sichere Aufruf ist z. B. `C:\Program Files\PowerShell\7\pwsh.exe -NoProfile -Command ".\localTest.ps1; exit $LASTEXITCODE"`.
- Für `localJsTest.ps1` und `localBrowserTest.ps1` in `functions.exec_command` ebenfalls den Scriptaufruf direkt im bestehenden PowerShell-Kontext starten, nicht die PowerShell-EXE als Text im `cmd`-Kontext verschachteln.
- Wenn ein lokales Browser- oder Test-Server-Skript über Port `8081` oder `8082` scheitert, zuerst prüfen, ob noch ein alter Serverprozess
  läuft.
- Wenn ein Tool oder Script temporäre Dateien braucht, diese nach Möglichkeit im Projektverzeichnis ablegen, zum Beispiel unter `tmp/`, statt auf `C:\TMP` auszuweichen.
- Das gilt auch für Screenshots, Browser-Artefakte und andere Prüfdateien.
- Bei statischen Browser-Modulen immer Cache-Busting und alle abhängigen Versionen gemeinsam aktualisieren
  (`graph-app.js`, `graph-client.mjs`, `graph-renderer.mjs`, Landing-Page-Test).
- Cache-Busting-Regel: Jede Änderung an statischen Browser-Assets bekommt eine neue gemeinsame Versionskennung; die zusammengehörigen
  Imports, HTML-Referenzen und betroffenen Tests werden immer im selben Schritt mitgezogen.

## Tests

### Allgemeines

- `Jsoup` prüft nur gerendertes HTML, nicht JavaScript-Ausführung oder Browser-Verhalten.
- Beim GUI-Start auch die statischen Client-Assets mitprüfen.
- Frontend-Logik in kleine, importierbare Module schneiden und mit schnellen JS-Tests absichern.
- Browser-Tests nur für wenige kritische Flows einsetzen.
- Screenshot-Tests nur sparsam verwenden; flexible Layouts machen sie schnell fragil.
- Browser-Tests laufen mit Playwright gegen eine lokal gestartete Anwendung auf Port `8081`.
- Browser-Tests prüfen robuste Zustände statt pixelgenauer Layouts. Pixelprüfungen bleiben klein und dienen nur dazu, leere Canvas-Renderings
  zu erkennen.
- Bei Fehlerfällen erst die echte HTTP-Antwort prüfen, dann die GUI. Gemockte Browser-Routen beweisen nur die Client-Reaktion, nicht den
  echten Weg von Spring über HTTP und Fetch bis ins Layout.
- Wenn zusätzliche Browser-Abhängigkeiten aus `node_modules` kommen, sie über Spring Resource Handler unter einem stabilen Pfad exponieren
  und im HTML explizit einbinden.
- Wenn statische JS-Module geändert werden und manuell im Browser geprüft wird, Cache-Busting oder frische Asset-URLs verwenden.
- Für manuelle Browser-Checks nicht zuerst Playwright starten: direkt Chrome/Devtools verwenden und die App auf `server.port=8082` starten. Der Boot-Run-Aufruf ist dafür `.\gradlew.bat bootRun --args=--server.port=8082`.
- Windows-Pfade in Properties mit echten Backslashes testen; Escaping-Fallen nicht nur über `TempDir` abdecken.
- Playwright-spezifische Auswertung und Output-Filterung in kleinen Node-Skripten halten; Gradle soll diese Skripte nur aufrufen.
- Auf Windows `.cmd`-Starter aus Node nicht direkt spawnen, wenn es vermeidbar ist. Für lokale Node-Tools lieber deren JS-Entry-Point mit
  `process.execPath` starten.
- Für manuelle Browser-Checks die Chrome-Devtools-MCP-Werkzeuge verwenden, also `mcp__chrome_devtools` mit Page-Snapshot, Click,
  Screenshot und `evaluate_script`, statt Playwright als Umweg für die Handprüfung zu benutzen.

### Verifikationsroute

- Die Verifikationsroute richtet sich nach der Art der Änderung.
- Grundregel: immer mit der kleinsten fachlich sinnvollen Teststufe beginnen und nur bei Bedarf breiter werden.
- Bei reiner JavaScript- oder Client-Logik zuerst `localJsTest`.
- Bei reinen Server- oder API-Änderungen zuerst `localTest`.
- Bei Browser- oder GUI-Änderungen zuerst die fachlich kleinste passende Teststufe, danach die weiteren betroffenen Stufen.
- Bei GUI-Änderungen am Ende immer alle relevanten Testarten laufen lassen:
  - `localJsTest`
  - `localTest`
  - `localBrowserTest`
  - manueller KI-Browser-Test auf Port `8082`
- Ein manueller KI-Browser-Test ersetzt keine automatisierten Tests, sondern ergänzt sie.
- Playwright gehört zur automatisierten Browser-Teststrecke; für den manuellen KI-Browser-Test ist es keine Pflicht, solange der Browser lokal direkt prüfbar ist.

### Tests durch die KI

- Im ersten Schritt immer die passenden token-sparenden lokalen Testskripte verwenden, bei Bedarf mit `-Stacktrace`.
- Direkte Testaufrufe über Gradle nur nach ausdrücklicher Nachfrage beim User.
- Java: `.\localTest.ps1`, bei Bedarf `.\localTest.ps1 -Stacktrace`.
- JavaScript: `.\localJsTest.ps1`, bei Bedarf `.\localJsTest.ps1 -Stacktrace`. Die JS-Tests laufen mit `node:test` im Einprozessmodus `--test-isolation=none`.
- Browser: `.\localBrowserTest.ps1`, bei Bedarf mit `-Stacktrace`.
- Für automatisierte Browser-Prüfstarts `server.port=8081`.
- Für manuelle Browser-Checks durch die KI `server.port=8082`.

### Browser-Tests

- Einmalig die npm-Abhängigkeiten mit `npm install` installieren.
- Wenn Playwright noch keinen Chromium-Browser findet, einmalig `npx playwright install chromium` ausführen.
- Der lokale Browser-Testlauf startet die Anwendung selbst und beendet sie nach dem Testlauf wieder.
- Für token-sparende automatisierte Browser-Prüfläufe immer `.\localBrowserTest.ps1` verwenden. Bei Erfolg gibt das Skript nur `OK` aus; bei Fehlern nennt es
  die fehlgeschlagenen Browser-Tests mit einer kurzen Fehlermeldung.
- Für Details zu Playwright-Fehlern, Trace-Pfaden und vollständiger Ausgabe `.\localBrowserTest.ps1 -Stacktrace` verwenden.
- Gradle-Task: `.\gradlew.bat --console=plain browserTest`.
- Ruhiger Gradle-Task: `.\gradlew.bat --console=plain -q browserTestQuiet`.

### Manuell gestartete Tests (aus IntelliJ)

- Java-Tests in IntelliJ: `src\test` -> `Run Tests in...`
- JavaScript-Tests in IntelliJ: `src\js-test` -> `Run Tests in...`
- Für manuelle GUI-Starts `server.port=8080`.
