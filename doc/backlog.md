# Backlog

Dieses Backlog beschreibt die nächsten Umsetzungsschritte für den Architektur-Explorer.
Die Reihenfolge ist so gewählt, dass jeder Schritt einen im Browser sichtbaren und prüfbaren fachlichen Mehrwert liefert.

## Abhängigkeiten als Pfeile darstellen

In der GUI werden jetzt auch Abhängigkeiten dargestellt:

- Durch Pfeile A->B, wenn A von B statisch abhängig ist.
- Abhängigkeiten werden immer nur zwischen Packages gezeigt, niemals zwischen Typen (obwohl natürlich in Wirklichkeit die Anforderungen
  zwischen den Typen bestehen)
- Wenn ein Paket nicht angezeigt wird (weil das direkte oder mittelbare Oberpaket nicht geklappt ist), wird der (eingehende oder ausgehende)
  Pfeil mit dem niedrigsten angezeigten Oberpaket verbunden.
- Je Paketpaar und Richtung gibt es maximal einen Pfeil.
- Wir zeigen keine Schleifen.
- Immer, wenn ein Paket auf- oder zugeklappt wird, wird die Anzeige so aktualisiert, dass sie vollständig stimmt.

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
