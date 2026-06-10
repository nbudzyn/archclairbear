# Backlog

Dieses Backlog beschreibt die nächsten Umsetzungsschritte für den Architektur-Explorer.  
Die Reihenfolge ist so gewählt, dass möglichst schnell ein laufendes Skeleton entsteht, das im Browser sichtbar und überprüfbar ist.

## Einen schlanken Browser-Testpfad für kritische UI-Flows ergänzen

Ziel:
Die wichtigsten End-to-End-Pfade sollen einmal im echten Browser abgesichert werden.

Warum:
JS-Tests schützen die Logik, aber nicht die Browser-Integration. Klicks, Nachladen und sichtbare DOM-Zustände brauchen eine kleine Zahl
gezielter Browser-Tests.

Ergebnis:

- Ein Browser-Test prüft den erfolgreichen Initial-Load.
- Ein Browser-Test prüft den Fehlerfall nach gefälschtem Backend-Fehler.
- Weitere Browser-Tests decken nur wirklich kritische Interaktionen ab.

## Einfache Status- und Fehlermeldungen ergänzen

Ziel:
Der Client soll sichtbar machen, ob Daten geladen wurden oder ob ein Fehler aufgetreten ist.

Warum:
Schon im Skeleton ist wichtig, dass man Ladefehler oder leere Antworten sofort erkennt.

Ergebnis:

- Während des Ladens gibt es einen klaren Statushinweis, der danach wieder entfernt wird.
- Bei einem Fehler wird eine verständliche Meldung angezeigt.

## Einen kleinen Service zwischen Controller und Datenquelle einführen

Ziel:
Der Controller soll nicht direkt die Antwort zusammensetzen, sondern einen kleinen Service verwenden.

Warum:
So bleibt die Struktur erweiterbar. Die Dummy-Daten können später durch echte Analyse ersetzt werden, ohne die HTTP-Schnittstelle umzubauen.

Ergebnis:

- Der Controller delegiert an einen Service.
- Der Service liefert aktuell noch feste Testdaten.

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

## Einen Smoke-Test für den kompletten Startpfad ergänzen

Ziel:
Es soll einen automatisierten Test geben, der den Startpunkt der Anwendung und den Graph-Endpunkt absichert.

Warum:
Schon kleine UI- und API-Änderungen dürfen das Skeleton nicht unbeabsichtigt brechen.

Ergebnis:

- Die Anwendung startet im Testkontext.
- Der API-Endpunkt liefert eine gültige Antwort.

## Die nächste Ausbaustufe vorbereiten

Ziel:
Nach dem ersten sichtbaren Skeleton sollen Package- und Typ-Knoten folgen.

Warum:
Das ist der eigentliche Nutzen des Werkzeugs: von grober Struktur zu feineren Ebenen navigieren.

Ergebnis:

- Das Modell kann um Packages erweitert werden.
- Danach können konkrete Typen ergänzt werden.
- Die Client-Darstellung bleibt dabei unverändert nutzbar.
