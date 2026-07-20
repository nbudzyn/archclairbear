# Backlog

Dieses Backlog beschreibt die nächsten Umsetzungsschritte für den Architektur-Explorer.
Die Reihenfolge ist so gewählt, dass jeder Schritt einen im Browser sichtbaren und prüfbaren fachlichen Mehrwert liefert.

## Wenn kein Knoten sichtbar ist...

Wenn kein Knoten sichtbar ist, soll die Sicht so verschoben werden, dass 1 äußerster Knoten vollständig sichtbar ist.
Alternative Idee: Wenn 1 äußerster Knoten vollständig sichtbar war und der Knoten wird aufgeklappt, soll die Sicht so angepasst werden, dass
der Knoten nach dem aufklappen vollständig zu sehen ist.

## Statische Code-Analyse im Prozess

Genau wie die Tests sollen als Quality Gate nach Änderung ein oder mehrere statische Code-Analyse Tools (für Java und JavaScript laufen).
Genügt die Qualität nicht den Ansprüchen, muss bei der Umsetzung noch nachgebessert werden.

## Manuell verschobene aufgeklappte Container als Gruppe behandeln

Wenn der Nutzer einen aufgeklappten Container-Knoten per Drag verschiebt, bleiben dessen sichtbare Kinder relativ dazu konsistent.
Der Container soll bei späterem Auf- oder Zuklappen nicht an seine ELK-Position zurückspringen und seine sichtbaren Kinder sollen nicht
scheinbar aus dem Container herauswandern.

- Wird ein sichtbarer aufgeklappter Container verschoben, wird die Verschiebung als Gruppenverschiebung behandelt.
- Sichtbare Kinder des verschobenen Containers behalten ihre relative Lage zum Container.
- Beim späteren Auf- oder Zuklappen wird die Gruppenverschiebung weiterhin berücksichtigt.
- Verschwindet der Container durch Zuklappen eines Vorfahren, wird der zugehörige gemerkte Gruppenzustand gelöscht.

Offene Fragen vor Umsetzung:

- Gilt Drag eines aufgeklappten Containers als manuelle Position nur für den Container oder auch implizit für seine sichtbaren Kinder?
- Wenn ein Kind einzeln verschoben wurde und danach der Container verschoben wird: gewinnt die absolute Kind-Position, oder wird sie relativ
  mitverschoben?
- Soll ein später wieder nachgeladener Kind-Knoten bewusst neu von ELK platziert werden, oder soll eine frühere relative Position wieder
  hergestellt werden?

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
