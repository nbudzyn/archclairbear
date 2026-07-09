# Backlog

Dieses Backlog beschreibt die nächsten Umsetzungsschritte für den Architektur-Explorer.
Die Reihenfolge ist so gewählt, dass jeder Schritt einen im Browser sichtbaren und prüfbaren fachlichen Mehrwert liefert.

## Package-Pfeile rendern

Die berechneten Package-Kanten werden in der GUI als gerichtete Pfeile angezeigt (nach jeder Änderung).

- Cytoscape fügt Kanten zwischen den sichtbaren Package-Knoten ein.
- Der Renderer stellt die Kanten als Pfeile dar.
- Der ELK-Graph enthält die sichtbaren Kanten für das Layout.
- Das Verhalten ist durch JS-Renderer-Tests und einen manuellen Browser-Check prüfbar.

## Weitere Typverwendungen als Package-Abhängigkeiten erkennen

Der Server erkennt weitere direkte statische Typverwendungen als Roh-Abhängigkeiten.

- Felder
- Methodenparameter
- Rückgabewerte
- generische Typverwendungen
- Jeder erkannte Fall ist durch fokussierte Java-Unit-Tests der Analyseklasse oder package-private Methoden prüfbar.

## Vererbung, Interfaces und Annotationen als Package-Abhängigkeiten erkennen

Der Server erkennt weitere Architekturbezüge als Roh-Abhängigkeiten.

- `extends`
- `implements`
- Annotationen auf Typen, Feldern, Methoden und Parametern
- Jeder erkannte Fall ist durch fokussierte Java-Unit-Tests der Analyseklasse oder package-private Methoden prüfbar.

## Typen unterscheiden

Der Client erfährt, ob ein Typ ein `class`, `interface`, `enum`, `record` oder Annotation-Typ ist.

- Die Typen werden in diesem Schritt noch nicht unterschiedlich gerendert.
- Die Information wird nur fachlich transportiert und für spätere Darstellungen vorbereitet.

## Smooth animation when layout changes

When the layout changes (box moves somewhere else on double-click), the layout should perform a smooth transition.

## Workspace-Pfad konfigurierbar machen

Der zu analysierende Java-Workspace wird konfigurierbar.
Die Konfiguration kommt erst dann in den Fokus, wenn die Navigation am festen Aventiure-Testpfad fachlich trägt.

## Source-Root-Knoten bei mehreren Source Roots anzeigen

Der Graph bekommt einen fachlichen Knotentyp `Source Root`.
Source-Root-Knoten werden nur angezeigt, wenn mehrere Source Roots analysiert werden, z. B. Produktivcode und Testcode oder Client und
Server.
Gibt es nur einen Source Root, startet der sichtbare Graph weiterhin direkt bei der Package-Hierarchie.

## Beschriftung (Label) von AUFGEKLAPPTEN Knoten lesbar

Die Beschriftung (Label) von AUFGEKLAPPTEN Knoten soll ganz lesbar sein - im Moment wird die untere Hälfte durch die inneren Knoten
überdeckt.

- Das Label des aufgeklappten äußeren Knotens ist im Browser vollständig lesbar.
- Innere Knoten dürfen das Label des äußeren Knotens nicht überdecken.
- Die Story gilt erst als erfüllt, wenn der Effekt im manuellen Browser-Check sichtbar weg ist.

(Leider ist das sehr schwer umzusetzen.)
