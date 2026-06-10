# Entwicklung

## Gradle

- Vor Gradle-Aufrufen immer explizit Freigabe holen.
- Das gilt für `gradle`, `gradlew.bat`, `.\localTest.ps1` und `.\localJsTest.ps1`.
- Die Wrapper verwenden das Standard-Gradle-User-Home im Benutzerverzeichnis (`C:\Users\...\ .gradle`).

## Arbeitsweise

- Vor Änderungen die verbindlichen Dokumente lesen.
- Neue Skripte und Build-Aufrufe nicht auf ein projektlokales Gradle-User-Home umbiegen.
- Entwicklungswissen hier bündeln, nicht in Produktdokumenten oder im README doppeln.

## Tests

### Allgemeines

- `Jsoup` prüft nur gerendertes HTML, nicht JavaScript-Ausführung oder Browser-Verhalten.
- Beim GUI-Start auch die statischen Client-Assets mitprüfen.
- Frontend-Logik in kleine, importierbare Module schneiden und mit schnellen JS-Tests absichern.
- Browser-Tests nur für wenige kritische Flows einsetzen.
- Screenshot-Tests nur sparsam verwenden; flexible Layouts machen sie schnell fragil.

### Tests durch die KI

- Im ersten Schritt immer `.\localTest.ps1` bzw. `.\localJsTest.ps1` verwenden, bei Bedarf mit `-Stacktrace`.
- Direkte Testaufrufe über Gradle nur nach ausdrücklicher Nachfrage beim User.
- Java: `.\localTest.ps1`, bei Bedarf `.\localTest.ps1 -Stacktrace`.
- JavaScript: `.\localJsTest.ps1`, bei Bedarf `.\localJsTest.ps1 -Stacktrace`.
- Gemeinsamer Lauf: `.\gradlew.bat --console=plain allTests`.
- Für KI-Prüfstarts `server.port=8081`.

### Manuell gestartete Tests (aus IntelliJ)

- Java-Tests in IntelliJ: `src\test` -> `Run Tests in...`
- JavaScript-Tests in IntelliJ: `src\js-test` -> `Run Tests in...`
- Für manuelle GUI-Starts `server.port=8080`.
