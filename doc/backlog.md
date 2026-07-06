# Backlog

Dieses Backlog beschreibt die nächsten Umsetzungsschritte für den Architektur-Explorer.  
Die Reihenfolge ist so gewählt, dass möglichst schnell ein laufendes Skeleton entsteht, das im Browser sichtbar und überprüfbar ist.

## Den Workspace-Pfad konfigurierbar machen

Ziel:
Der Server soll wissen, aus welchem lokalen Pfad der Java-Quellcode gelesen wird.

Warum:
Die eigentliche Analyse braucht eine konfigurierbare Quelle, damit das Tool nicht an einen festen Pfad gebunden ist.

Ergebnis:

- Ein Konfigurationswert definiert den Workspace.
- Die Anwendung startet auch dann, wenn der Pfad noch nicht für die Analyse verwendet wird.

## Den ersten echten Verzeichnisknoten aus dem Dateisystem ableiten

Ziel:
Statt Dummy-Daten soll der erste Knoten aus einem echten Verzeichnis des Workspaces kommen.

Warum:
Damit beginnt der Übergang vom Skeleton zur echten Analyse. Das System zeigt dann bereits reale Projektstruktur.

Ergebnis:

- Der erste Knoten repräsentiert ein echtes Verzeichnis.
- Der Knotenname und die Struktur stammen aus dem Dateisystem.

## Die nächste Ausbaustufe vorbereiten

Ziel:
Nach dem ersten sichtbaren Skeleton sollen Package- und Typ-Knoten folgen.

Warum:
Das ist der eigentliche Nutzen des Werkzeugs: von grober Struktur zu feineren Ebenen navigieren.

Ergebnis:

- Das Modell kann um Packages erweitert werden.
- Danach können konkrete Typen ergänzt werden.
- Die Client-Darstellung bleibt dabei unverändert nutzbar.
