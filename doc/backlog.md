# Backlog

Dieses Backlog beschreibt die nächsten Umsetzungsschritte für den Architektur-Explorer.
Die Reihenfolge ist so gewählt, dass jeder Schritt einen im Browser sichtbaren und prüfbaren fachlichen Mehrwert liefert.

## Abhängigkeiten als Pfeile darstellen

In der GUI werden jetzt auch Abhängigkeiten dargestellt:

- Durch Pfeile A->B, wenn A von B direkt statisch abhängig ist.
- Als statische Abhängigkeiten zählen alle direkten statischen Verweise, insbesondere Typverwendungen in Feldern, Parametern,
  Rückgabewerten, `extends`/`implements`, Annotationen, Imports und generischen Typverwendungen.
- Abhängigkeiten werden immer nur zwischen Packages gezeigt, niemals zwischen Typen.
- Wenn ein Paket nicht angezeigt wird, weil ein direktes oder mittelbares Oberpaket nicht aufgeklappt ist, wird der Pfeil mit dem
  niedrigsten angezeigten Oberpaket verbunden.
    - Wenn mehrere Ebenen verborgen sind, wird der Pfeil immer am nächstsichtbaren Oberpackage befestigt.
- Je sichtbares Paketpaar und Richtung gibt es maximal einen Pfeil, auch wenn mehrere Typabhängigkeiten dahinterliegen.
- Wir zeigen keine Schleifen.
- Immer, wenn ein Paket auf- oder zugeklappt wird, wird die Anzeige so aktualisiert, dass sie vollständig stimmt.
- Die fachliche Darstellung ist rein visuell, aber auf dem Server durch Unit- und Mock-Tests prüfbar.

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
