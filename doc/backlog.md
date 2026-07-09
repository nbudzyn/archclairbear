# Backlog

Dieses Backlog beschreibt die nächsten Umsetzungsschritte für den Architektur-Explorer.
Die Reihenfolge ist so gewählt, dass jeder Schritt einen im Browser sichtbaren und prüfbaren fachlichen Mehrwert liefert.

## Manuell verschobene Knoten beim Layoutwechsel erhalten

Wenn der Nutzer einen sichtbaren Knoten per Drag verschoben hat, bleibt diese Position bei späterem Auf- oder Zuklappen erhalten.
Das automatische Layout darf diesen Knoten nicht wieder an seine ELK-Position zurücksetzen.

In diesem Item wird nur die Position des direkt verschobenen sichtbaren Knotens gemerkt.
Die spezielle Gruppenbehandlung aufgeklappter Container-Knoten ist ein eigenes Folge-Item.

- Nach Drag eines Knotens wird dessen Position im Client unter der Knoten-ID gemerkt.
- Beim Auf- oder Zuklappen behalten manuell verschobene sichtbare Knoten ihre Position.
- Nicht manuell verschobene Knoten dürfen weiterhin von ELK neu positioniert werden.
- Beim Neuladen der Seite darf der Zustand verloren gehen; keine Server- oder LocalStorage-Persistenz in diesem Item.
- Verschwindet ein Knoten (Zuklappen eines Vorfahren), wird auch seine gemerkte Position gelöscht.
- Wird ein aufgeklappter Container-Knoten verschoben, muss in diesem Item nur dessen eigene Position erhalten bleiben; das konsistente
  Mitverschieben seiner sichtbaren Kinder ist nicht Teil dieses Items.

Technische Hinweise:

- Das Item ist mit der bestehenden Architektur aus Cytoscape und ELK umsetzbar.
- Die gemerkten Positionen sind reiner Client-Zustand im Renderer, zum Beispiel als `Map` von Knoten-ID auf Cytoscape-Modellposition.
- Cytoscape liefert die manuelle Endposition nach Drag; diese Position kann beim Drag-Ende des Knotens gespeichert werden.
- ELK berechnet weiterhin das automatische Ziel-Layout für den sichtbaren Graphen.
- Nach der ELK-Berechnung überschreibt der Renderer die ELK-Zielpositionen für manuell verschobene Knoten mit den gemerkten Positionen.
- Manuell verschobene Knoten dürfen bei späteren Layoutwechseln nicht zur ELK-Zielposition animiert werden; sie bleiben an ihrer gemerkten
  Position.
- Für neu sichtbare oder nicht manuell verschobene Knoten bleibt das ELK-Ergebnis maßgeblich.
- Die Lösung darf Layoutqualität lokal verschlechtern, wenn der Nutzer Knoten bewusst verschiebt; das ist Teil der manuellen Kontrolle.

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
