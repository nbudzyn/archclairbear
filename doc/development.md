# Entwicklung

## Gradle

- Bei allen Gradle-Aufrufen muss vorher explizit eine Freigabe des Users eingeholt werden, damit es nicht an Berechtigungen scheitert.
- Das gilt für `gradle`, `gradlew.bat` und `.\localTest.ps1`.
- Die Gradle-Wrapper-Aufrufe verwenden das Standard-Gradle-User-Home im Benutzerverzeichnis (`C:\Users\...\ .gradle`).
- Tests laufen über `.\localTest.ps1`.
- Falls ein Test mehr Fehlerdetails braucht, danach `.\localTest.ps1 -Stacktrace`.

## Arbeitsweise

- Vor Änderungen die verbindlichen Dokumente lesen.
- Neue Skripte und Build-Aufrufe nicht auf ein projektlokales Gradle-User-Home umbiegen.
- Entwicklungswissen hier bündeln, nicht in Produktdokumenten oder im README doppeln.

## Tests

- `Jsoup` prüft nur gerendertes HTML, nicht JavaScript-Ausführung oder Browser-Verhalten.
- Der GUI-Start hängt an der Auslieferung der statischen Client-Assets; Browser-Checks sollen deshalb auch die Asset-Requests mitprüfen.
- Frontend-Logik nach Möglichkeit in kleine, importierbare Module schneiden und dort mit schnellen JS-Tests absichern.
- Browser-Tests nur für wenige kritische Flows einsetzen.
- Screenshot-Tests nur sparsam verwenden; flexible Layouts machen sie schnell fragil.
