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
