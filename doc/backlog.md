# Backlog

Dieses Backlog beschreibt die nächsten Umsetzungsschritte für den Architektur-Explorer.
Die Reihenfolge ist so gewählt, dass möglichst schnell ein laufendes Skeleton entsteht, das im Browser sichtbar und überprüfbar ist.

## Erste Package-Übersicht aus Aventiure anzeigen

Ziel:
Der Nutzer sieht am aktuellen Analysepfad erstmals eine fachliche Package-Übersicht statt technischer Verzeichnisse.

Warum:
Das ist der erste fachliche Nutzwert des Tools: Die Architektur wird in Java-Begriffen sichtbar und nicht mehr als Dateisystemstruktur.

Rahmen:

- Die Package-Hierarchie darf zunächst aus der Verzeichnisstruktur abgeleitet werden.
- Mittelfristig soll sie aus den echten Java-`package`-Deklarationen entstehen.
- Ein Package gilt in dieser Story als nichtleer, wenn es direkt `.java`-Dateien enthält.
- Leere Packages werden nicht als eigene Knoten angezeigt.
- Der erste sichtbare Knoten ist das erste nichtleere Package.
- Packages mit nur einem relevanten Kind werden sofort zu einem Package-Knoten zusammengefasst.
- Der erste sichtbare Package-Knoten zeigt den notwendigen fachlichen Kontext, z. B. `de.aventiure`.
- Der sichtbare Graph enthält keinen Knotentyp `Verzeichnis` mehr.
- Es werden noch keine Klassen, Interfaces, Enums oder Abhängigkeiten angezeigt.

Akzeptanzkriterien:

- Beim Start ist das erste nichtleere Package sichtbar.
- Der Graph enthält keine Verzeichnis-Knoten.
- Der erste sichtbare Package-Knoten enthält den nötigen Package-Kontext, z. B. `de.aventiure`.
- Die erste relevante Verzweigung unterhalb dieses Knotens ist sichtbar, z. B. `lay05_being` und `lay06b_world`.
- Der Knotentyp "Verzeichnis" ist entfernt.

## In ein Package-Gebiet per Doppelklick weiter hinein navigieren

Ziel:
Der Nutzer kann aus der ersten Package-Übersicht in ein Teilgebiet tiefer hinein navigieren, ohne andere sichtbare Bereiche zu verlieren.

Warum:
Erst damit wird aus der Übersicht eine echte Erkundung der Architektur.

Rahmen:

- Ein Doppelklick klappt immer bis zur nächsten Verzweigung oder bis zum nächsten nichtleeren Package auf.
- Package-Knoten unterhalb des Einstiegsknotens zeigen nur den relevanten restlichen Namensteil, z. B. `model.being`.
- Andere bereits sichtbare Package-Gebiete bleiben sichtbar.
- Zuklappen gehört ausdrücklich nicht zu dieser Story.
- Es werden noch keine Klassen, Interfaces, Enums oder Abhängigkeiten angezeigt.

Akzeptanzkriterien:

- Per Doppelklick auf einen geschlossenen expandierbaren Package-Knoten werden seine nächsten relevanten Package-Kinder angezeigt.
- Andere sichtbare Package-Gebiete bleiben unverändert sichtbar.
- Ein Package wie `de.aventiure.lay06b_world` kann sichtbar bleiben, während `de.aventiure.lay05_being` weiter aufgeklappt wird.
- Beim Öffnen von `de.aventiure.lay05_being` kann ein Kind wie `model.being` sichtbar werden.

## Aufklappbare Package-Knoten erkennbar machen

Der Nutzer kann erkennen, welche Package-Knoten weitere sichtbare Package-Kinder haben.
Package-Knoten ohne weitere Kinder wirken nicht wie interaktive Aufklapp-Knoten.

## Package-Knoten wieder zuklappen

Der Nutzer kann einen geöffneten Package-Knoten wieder schließen.
Dabei verschwinden die aktuell sichtbaren Nachfahren dieses Knotens, während andere geöffnete Bereiche des Graphen sichtbar bleiben.
Es wird zunächst kein Aufklappzustand über erneutes Öffnen hinweg gemerkt.

## Packages aus Java-Code lesen

Die Package-Struktur wird nicht mehr nur aus Verzeichnissen abgeleitet, sondern aus den `package`-Deklarationen der Java-Dateien aufgebaut.
Dadurch entspricht der Graph der fachlichen Java-Struktur auch dann, wenn Verzeichnisse und Package-Deklarationen auseinanderlaufen.

## Java-Typen in Packages anzeigen

Der Graph kann zusätzlich zu Packages auch Java-Typen anzeigen.
Zu den Typen gehören zunächst Klassen, später bei Bedarf auch Interfaces und Enums.

## Abhängigkeiten als Pfeile darstellen

Der Graph zeigt statische Abhängigkeiten als gerichtete Pfeile.
Zuerst können Abhängigkeiten zwischen Java-Typen sichtbar werden; anschließend können zugeklappte Packages aggregierte
Package-Abhängigkeiten darstellen.

## Workspace-Pfad konfigurierbar machen

Der zu analysierende Java-Workspace wird konfigurierbar.
Die Konfiguration kommt erst dann in den Fokus, wenn die Navigation am festen Aventiure-Testpfad fachlich trägt.

## Source-Root-Knoten bei mehreren Source Roots anzeigen

Der Graph bekommt einen fachlichen Knotentyp `Source Root`.
Source-Root-Knoten werden nur angezeigt, wenn mehrere Source Roots analysiert werden, z. B. Produktivcode, Testcode, Client und Server.
Gibt es nur einen Source Root, startet der sichtbare Graph weiterhin direkt bei der Package-Hierarchie.
