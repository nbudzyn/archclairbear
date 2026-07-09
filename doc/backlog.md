# Backlog

Dieses Backlog beschreibt die nächsten Umsetzungsschritte für den Architektur-Explorer.
Die Reihenfolge ist so gewählt, dass jeder Schritt einen im Browser sichtbaren und prüfbaren fachlichen Mehrwert liefert.

## Manuell verschobene Knoten beim Layoutwechsel erhalten

Wenn der Nutzer einen Knoten per Drag verschoben hat, bleibt diese Position bei späterem Auf- oder Zuklappen erhalten.
Das automatische Layout darf solche Knoten nicht wieder an ihre ELK-Position zurücksetzen.

- Nach Drag eines Knotens wird dessen Position im Client unter der Knoten-ID gemerkt.
- Beim Auf- oder Zuklappen behalten manuell verschobene sichtbare Knoten ihre Position.
- Nicht manuell verschobene Knoten dürfen weiterhin von ELK neu positioniert werden.
- Beim Neuladen der Seite darf der Zustand verloren gehen; keine Server- oder LocalStorage-Persistenz in diesem Item.
- Verschwindet ein Knoten (Zuklappen eines Vorfahren), wird auch seine gemerkte Position gelöscht.

Technische Hinweise:

- Das Item ist mit der bestehenden Architektur aus Cytoscape und ELK umsetzbar.
- Die gemerkten Positionen sind reiner Client-Zustand im Renderer, zum Beispiel als `Map` von Knoten-ID auf Cytoscape-Modellposition.
- Cytoscape liefert die manuelle Endposition nach Drag; diese Position kann beim Drag-Ende des Knotens gespeichert werden.
- ELK berechnet weiterhin das automatische Ziel-Layout für den sichtbaren Graphen.
- Nach der ELK-Berechnung überschreibt der Renderer die ELK-Zielpositionen für manuell verschobene Knoten mit den gemerkten Positionen.
- Manuell verschobene Knoten dürfen bei späteren Layoutwechseln nicht zur ELK-Zielposition animiert werden; sie bleiben an ihrer gemerkten
  Position.
- Für neu sichtbare oder nicht manuell verschobene Knoten bleibt das ELK-Ergebnis maßgeblich.
- Bei aufgeklappten Compound-Knoten muss die Implementierung die Verschiebung als Gruppenverschiebung behandeln: Wird ein sichtbarer
  Container verschoben, sollen seine sichtbaren Kinder relativ dazu konsistent bleiben.
- Die Lösung darf Layoutqualität lokal verschlechtern, wenn der Nutzer Knoten bewusst verschiebt; das ist Teil der manuellen Kontrolle.

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
