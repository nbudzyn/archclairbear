# Backlog

Dieses Backlog beschreibt die nächsten Umsetzungsschritte für den Architektur-Explorer.
Die Reihenfolge ist so gewählt, dass jeder Schritt einen im Browser sichtbaren und prüfbaren fachlichen Mehrwert liefert.

## Abhängigkeiten import static b.bar.Outer.Inner.VALUE erkennen

Der Server erkennt die Abhängigkeiten aus statischen Imports auf Member verschachtelter Typen, z. B. import static b.bar.Outer.Inner.VALUE (
bis Java 26).

- Jeder erkannte Fall ist durch fokussierte Java-Unit-Tests der Analyseklasse oder package-private Methoden geprüft. Insbesondere jeweils
  der Fall, dass es *keinen* Import gibt, sondern die Klasse explizit mit Package im Code genannt ist.

## Abhängigkeiten auf Typnamen mit kleinem Anfangsbuchstaben erkennen

Der Server erkennt Java-erlaubte, aber unkonventionelle Typnamen mit kleinem Anfangsbuchstaben (bis Java 26).

- Jeder erkannte Fall ist durch fokussierte Java-Unit-Tests der Analyseklasse oder package-private Methoden geprüft. Insbesondere jeweils
  der Fall, dass es *keinen* Import gibt, sondern die Klasse explizit mit Package im Code genannt ist.

## Abhängigkeiten auf Pattern-/Switch-/Record-Pattern-Fälle erkennen (bis Java 26)

Der Server erkennt Abhängigkeiten auf Pattern-/Switch-/Record-Pattern-Fälle (bis Java 26).

- Jeder erkannte Fall ist durch fokussierte Java-Unit-Tests der Analyseklasse oder package-private Methoden geprüft. Insbesondere jeweils
  der Fall, dass es *keinen* Import gibt, sondern die Klasse explizit mit Package im Code genannt ist. - Systematisch testen!

## Smooth animation when layout changes

When the layout changes (box moves somewhere else on double-click), the layout should perform a smooth transition.

- Der Benutzer soll verstehen, wo sich der aufgeklickte Knoten jetzt befindet.
- Bestenfalls ist die GUI-Änderung nicht sehr groß.

## Workspace-Pfad konfigurierbar machen

Der zu analysierende Java-Workspace wird konfigurierbar.

## Source-Root-Knoten bei mehreren Source Roots anzeigen

Der Graph bekommt einen fachlichen Knotentyp `Source Root`.
Source-Root-Knoten werden nur angezeigt, wenn mehrere Source Roots analysiert werden, z. B. Produktivcode und Testcode oder Client und
Server.
Gibt es nur einen Source Root, startet der sichtbare Graph weiterhin direkt bei der Package-Hierarchie.

## Typen unterscheiden

Der Client erfährt, ob ein Typ ein `class`, `interface`, `enum`, `record` oder Annotation-Typ ist.

- Die Typen werden in diesem Schritt noch nicht unterschiedlich gerendert.
- Die Information wird nur fachlich transportiert und für spätere Darstellungen vorbereitet.

## Typen unterschiedlich rendern

Typen wie `class`, `interface`, `enum`, `record` oder Annotationen unterschiedlich rendern.

## Beschriftung (Label) von AUFGEKLAPPTEN Knoten lesbar

Die Beschriftung (Label) von AUFGEKLAPPTEN Knoten soll ganz lesbar sein - im Moment wird die untere Hälfte durch die inneren Knoten
überdeckt.

- Das Label des aufgeklappten äußeren Knotens ist im Browser vollständig lesbar.
- Innere Knoten dürfen das Label des äußeren Knotens nicht überdecken.
- Die Story gilt erst als erfüllt, wenn der Effekt im manuellen Browser-Check sichtbar weg ist.

(Leider ist das sehr schwer umzusetzen.)
