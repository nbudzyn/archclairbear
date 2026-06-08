# Backlog

Dieses Backlog beschreibt die nächsten Umsetzungsschritte für den Architektur-Explorer.  
Die Reihenfolge ist so gewählt, dass möglichst schnell ein laufendes Skeleton entsteht, das im Browser sichtbar und überprüfbar ist.

## Einen ersten API-Endpunkt für Graphdaten bereitstellen

Ziel:
Der Server soll einen kleinen JSON-Endpunkt anbieten, der genau eine minimale Graphantwort zurückgibt.

Warum:
Client und Server sollen früh über einen echten Vertrag gekoppelt werden. Die spätere Analyse kann denselben Vertrag weiterverwenden.

Ergebnis:

- Ein Endpunkt wie `GET /api/graph/root` liefert JSON.
- Die Antwort enthält mindestens einen Knoten vom Typ `directory`.

## Den ersten Knoten im Client rendern

Ziel:
Der Client soll die Graphdaten aus dem API-Endpunkt lesen und den einzelnen Knoten darstellen.

Warum:
Erst wenn die komplette Kette von HTTP über JSON bis zur Darstellung funktioniert, ist das Skeleton wirklich überprüfbar.

Ergebnis:

- Die Seite lädt Daten vom Server.
- Ein einzelner Verzeichnis-Knoten wird in der Visualisierung angezeigt.

## Einfache Status- und Fehlermeldungen ergänzen

Ziel:
Der Client soll sichtbar machen, ob Daten geladen wurden oder ob ein Fehler aufgetreten ist.

Warum:
Schon im Skeleton ist wichtig, dass man Ladefehler oder leere Antworten sofort erkennt.

Ergebnis:

- Während des Ladens gibt es einen klaren Statushinweis.
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
