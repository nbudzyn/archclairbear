# Code Style

## Java

- `var` wird verwendet, wenn der konkrete Typ aus Initialisierung und Kontext unmittelbar klar ist; explizite Typen bleiben, wenn sie das
  Verständnis verbessern.
- Häufig verwendete fachliche Konstanten dürfen statisch importiert werden, wenn das die Lesbarkeit verbessert.
- Wenn IntelliJ Zeilen automatisch zusammenziehen würde, ` //` an das Zeilenende schreiben, außer die nächste Zeile hat bereits einen
  Kommentar.
    - Nach einer `(` direkt `//` ohne Leerzeichen schreiben.
- Jede Produktivklasse trägt einen deutschen Klassenkommentar: Eine knappe Nominalphrase, die 1 Objekt beschreibt.
- Wenn ein Controller seinen zugehörigen Service injiziert, heißt das Feld schlicht `service`.
- Methoden innerhalb einer Datei sind so sortiert, dass Aufrufe von oben nach unten verlaufen.

### Test

- Tests enthalten keine Klassen- oder Methodenkopfkommentare.
- Tests sind im GIVEN-WHEN-THEN-Stil strukturiert und kommentiert.
    - GIVEN kann entfallen

