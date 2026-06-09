# Entwicklung

## Gradle

- Lokale Gradle-Aufrufe laufen immer über `.\gradle-local.ps1`.
- Dieser Wrapper setzt `GRADLE_USER_HOME` auf `.\.gradle-user`.
- Tests laufen immer über `.\localTest.ps1`.
- Falls ein Test mehr Fehlerdetails braucht, danach `.\localTest.ps1 -Stacktrace`.
- Direkte Testläufe über `gradle-local.ps1` oder `gradlew.bat` nur nach Rückfrage beim User.

## IDE

- Wenn IntelliJ mit Gradle baut, muss das Gradle-User-Home projektlokal sein.
- `.\.gradle-user` und `.\.gradle-home` sind Arbeitsverzeichnisse und gehören nicht ins Git.

## Arbeitsweise

- Vor Änderungen die verbindlichen Dokumente lesen.
- Neue Skripte und Build-Aufrufe so anlegen, dass sie ohne Zugriff auf `C:\Users\...\ .gradle` laufen.
- Entwicklungswissen hier bündeln, nicht in Produktdokumenten oder im README doppeln.
