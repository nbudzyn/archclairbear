# Backlog

Dieses Backlog beschreibt die nächsten Umsetzungsschritte für den Architektur-Explorer.
Die Reihenfolge ist so gewählt, dass jeder Schritt einen im Browser sichtbaren und prüfbaren fachlichen Mehrwert liefert.

## Graph-Update erhält bestehende Elemente und Viewport

Beim Auf- oder Zuklappen eines Knotens bleibt der bisher sichtbare Graph als Kontext erhalten.
Bereits sichtbare Knoten werden nicht abrupt entfernt und neu gezeichnet.

- Beim Auf- und Zuklappen werden bereits sichtbare Knoten und Kanten anhand ihrer IDs im Renderer wiederverwendet.
- Neue sichtbare Knoten und Kanten werden ergänzt.
- Nicht mehr sichtbare Knoten und Kanten werden entfernt.
- Der Zoom- und Pan-Zustand des Nutzers bleibt während des Auf-/Zuklappens erhalten; es gibt kein automatisches `fit` nach jeder Interaktion.
- Der aufgeklappte oder zugeklappte Knoten bleibt während und nach dem Graph-Update sichtbar.
- Die Lösung bleibt rein clientseitig; der Server merkt sich keinen UI-Zustand.

Technische Hinweise:

- Das Item ist mit der bestehenden Architektur aus Cytoscape und ELK umsetzbar.
- Der Renderer sollte sichtbare Cytoscape-Elemente beim Graph-Update wiederverwenden, statt alle Elemente zu entfernen und neu hinzuzufügen.
- ELK berechnet weiterhin das neue Ziel-Layout; Cytoscape rendert den bestehenden Graphen mit den neuen Zielpositionen.
- Nach dem Initial-Load und nach Browser-Resize darf weiterhin automatisch gefittet werden; nach Auf-/Zuklappen soll kein automatisches
  `fit` laufen, damit Zoom und Pan des Nutzers stabil bleiben.
- Die fachliche Layout-Entscheidung bleibt bei ELK. Cytoscape übernimmt nur Darstellung und Elementpflege.

## Bestehende Knoten beim Layoutwechsel animieren

Beim Auf- oder Zuklappen eines Knotens bewegen sich bereits sichtbare Knoten sanft von ihrer bisherigen Position zur neuen Layout-Position.

- Beim Auf- und Zuklappen werden bereits sichtbare Knoten animiert zur neuen Position bewegt.
- Die Animation verwendet eine Ease-in-out-Bewegung: langsamer Start, schneller Mittelteil, langsames Ende.
- Bereits sichtbare Kanten bleiben während der Bewegung konsistent sichtbar.
- Der Zoom- und Pan-Zustand des Nutzers bleibt während der Animation erhalten.
- Der aufgeklappte oder zugeklappte Knoten bleibt während und nach der Animation sichtbar.
- Die Lösung bleibt rein clientseitig; der Server merkt sich keinen UI-Zustand.

Technische Hinweise:

- Das Item ist mit der bestehenden Architektur aus Cytoscape und ELK umsetzbar.
- ELK berechnet weiterhin das neue Ziel-Layout; Cytoscape rendert den bestehenden Graphen und animiert Knoten zu den neuen Zielpositionen.
- Bereits vorhandene Knoten bekommen ihre aktuelle Cytoscape-Position als Animationsstart und die von ELK berechnete Position als Ziel.
- Kanten werden nicht separat gelayoutet; sie folgen den animierten Cytoscape-Knoten.
- Nach dem Initial-Load und nach Browser-Resize darf weiterhin automatisch gefittet werden; nach Auf-/Zuklappen soll kein automatisches
  `fit` laufen, damit Zoom und Pan des Nutzers stabil bleiben.
- Die fachliche Layout-Entscheidung bleibt bei ELK. Cytoscape übernimmt nur Darstellung, Elementpflege und Animation.

## Neue und entfernte Knoten beim Layoutwechsel überführen

Beim Auf- oder Zuklappen erscheinen und verschwinden Knoten so, dass der räumliche Zusammenhang des Graphen nachvollziehbar bleibt.

- Neu sichtbare Kind-Knoten erscheinen in der Nähe des aufgeklappten Knotens und bewegen sich in ihre Zielposition.
- Beim Zuklappen verschwinden nicht mehr sichtbare Knoten erst nach der sichtbaren Übergangsbewegung.
- Der aufgeklappte oder zugeklappte Knoten bleibt während und nach der Animation sichtbar.
- Der Zoom- und Pan-Zustand des Nutzers bleibt während der Animation erhalten.
- Die Lösung bleibt rein clientseitig; der Server merkt sich keinen UI-Zustand.

Technische Hinweise:

- Das Item ist mit der bestehenden Architektur aus Cytoscape und ELK umsetzbar.
- ELK berechnet weiterhin das neue Ziel-Layout; Cytoscape rendert den bestehenden Graphen und animiert Knoten zu den neuen Zielpositionen.
- Neue Knoten können initial nahe am aufgeklappten Elternknoten eingefügt und anschließend zur ELK-Zielposition animiert werden.
- Entfernte Knoten sollten beim Zuklappen erst nach der sichtbaren Übergangsbewegung aus Cytoscape entfernt werden.
- Kanten zu neuen oder entfernten Knoten werden passend zur Elementpflege ergänzt oder entfernt.
- Die fachliche Layout-Entscheidung bleibt bei ELK. Cytoscape übernimmt nur Darstellung, Elementpflege und Animation.

## Manuell verschobene Knoten beim Layoutwechsel erhalten

Wenn der Nutzer einen Knoten per Drag verschoben hat, bleibt diese Position bei späterem Auf- oder Zuklappen erhalten.
Das automatische Layout darf solche Knoten nicht wieder an ihre ELK-Position zurücksetzen.

- Nach Drag eines Knotens wird dessen Position im Client unter der Knoten-ID gemerkt.
- Beim Auf- oder Zuklappen behalten manuell verschobene sichtbare Knoten ihre Position.
- Nicht manuell verschobene Knoten dürfen weiterhin von ELK neu positioniert werden.
- Beim Neuladen der Seite darf der Zustand verloren gehen; keine Server- oder LocalStorage-Persistenz in diesem Item.

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
- Beim Zuklappen können gemerkte Positionen für unsichtbar gewordene Nachfahren im Client erhalten bleiben, solange die Seite nicht neu
  geladen wird.
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
