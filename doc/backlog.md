# Backlog

Dieses Backlog beschreibt die nächsten Umsetzungsschritte für den Architektur-Explorer.
Die Reihenfolge ist so gewählt, dass jeder Schritt einen im Browser sichtbaren und prüfbaren fachlichen Mehrwert liefert.

## Keine Server-Edges mehr an den Client liefern

Die Graph-Antworten enthalten vorerst keine renderbaren Kanten mehr.
Das Feld edges wird entfernt.

- Der Server liefert für Root-, Package- und Type-Anfragen weiterhin Knoten.
- Vorhandene Client-Tests bleiben grün.
- Die Änderung ist durch Java-Unit- oder Controller-Tests prüfbar.

## Roh-Abhängigkeiten im Initial-Load transportieren

Der Initial-Load kann Roh-Abhängigkeiten zwischen Packages transportieren, ohne daraus bereits sichtbare Pfeile zu machen.

- Die Root-Antwort enthält ein eigenes Feld für Roh-Abhängigkeiten.
- Eine Roh-Abhängigkeit besteht aus Quellpackage und Zielpackage.
- Package- und Type-Nachladeanfragen liefern keine Roh-Abhängigkeiten.
- Die API-Struktur ist durch Java-Unit- oder Controller-Tests prüfbar.
- Falls dafür eine neue Klasse oder ein package-private Mapper entsteht, wird diese Klasse bzw. Methode isoliert getestet; bei
  Controller-Tests kann der Service gemockt werden.

## Package-Abhängigkeiten aus Imports erkennen

Der Server erkennt direkte Package-Abhängigkeiten aus Java-Imports.

- Ein Import wie `import b.bar.Target;` in Package `a.foo` erzeugt die Roh-Abhängigkeit `a.foo -> b.bar`.
- Imports aus demselben Package erzeugen keine Roh-Abhängigkeit.
- Mehrere gleiche Import-Abhängigkeiten werden serverseitig dedupliziert.
- Die Import-Auswertung ist als kleine Java-Einheit testbar, bevorzugt über eine eigene package-private Klasse oder Methode.

## Roh-Abhängigkeiten auf den sichtbaren Initial-Baum filtern

Der Initial-Load liefert nur Roh-Abhängigkeiten, deren Quelle und Ziel innerhalb des sichtbaren Package-Baums liegen.

- Beginnt der sichtbare Baum bei `a.b`, bleiben nur Roh-Abhängigkeiten erhalten, deren Quell- und Zielpackage `a.b` sind oder mit
  `a.b.` beginnen.
- Roh-Abhängigkeiten nach außen werden nicht ausgeliefert.
- Die Filterlogik ist als Java-Unit-Test isoliert prüfbar.
- Der Root-Endpunkt ist zusätzlich per Controller-Test prüfbar; der Workspace- oder Analyseanteil kann dabei gemockt werden.

## Sichtbare Package-Pfeile im Client aus Roh-Abhängigkeiten berechnen

Der Client kann aus Roh-Abhängigkeiten und aktuell sichtbaren Packages renderbare Kanten berechnen.

- Für jede Roh-Abhängigkeit ermittelt der Client das sichtbare Package, das die Quelle enthält, und das sichtbare Package, das das Ziel
  enthält.
- Wenn Quelle und Ziel auf dasselbe sichtbare Package fallen, wird keine Kante erzeugt.
- Pro sichtbares Packagepaar und Richtung wird maximal eine Kante erzeugt.
- Die Berechnung liegt in einer reinen JS-Funktion und ist per JS-Unit-Test prüfbar.

## Package-Pfeile beim Auf- und Zuklappen neu berechnen

Der Client hält die initial geladenen Roh-Abhängigkeiten und aktualisiert die sichtbaren Kanten nach jeder Änderung des sichtbaren Graphen.

- Nach dem Aufklappen eines Packages werden die sichtbaren Kanten für den gesamten sichtbaren Graphen neu berechnet.
- Nach dem Zuklappen eines Packages werden die sichtbaren Kanten ebenfalls neu berechnet.
- Nachladeanfragen für Packages oder Typen müssen dafür keine Roh-Abhängigkeiten liefern.
- Das Verhalten ist per JS-Unit-Test am Client-Zustand prüfbar.

## Package-Pfeile rendern

Die berechneten Package-Kanten werden in der GUI als gerichtete Pfeile angezeigt.

- Cytoscape erhält Kanten zwischen sichtbaren Package-Knoten.
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
