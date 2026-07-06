# Backlog

Dieses Backlog beschreibt die nächsten Umsetzungsschritte für den Architektur-Explorer.
Die Reihenfolge ist so gewählt, dass möglichst schnell ein laufendes Skeleton entsteht, das im Browser sichtbar und überprüfbar ist.

## Aventiure-Quellpfad als Analysebasis verwenden

Ziel:
Die Anwendung verwendet vorerst fest `C:\projects\2003\aventiure\av-server\src\java` als Einstiegspunkt für die Analyse.

Warum:
Die nächsten Navigationsstories brauchen einen realen, fachlich relevanten Java-Quellbaum.
Konfigurierbarkeit hat erst später Wert.

Rahmen:

- Der Pfad wird als Root-Package-Pfad verstanden.
- Es wird noch keine allgemeine Pfad-Konfiguration gebaut.

Akzeptanzkriterien:

- Der Server nutzt `C:\projects\2003\aventiure\av-server\src\java` als aktuellen Analysepfad.
- Die Anwendung startet weiterhin lokal.

## Package-Hierarchie aus Aventiure anzeigen und per Doppelklick aufklappen

Ziel:
Der Nutzer kann am aktuellen Analysepfad die Package-Struktur erkunden, ohne den sichtbaren Kontext anderer Packages zu verlieren.

Warum:
Das ist die erste wertvolle Navigationsscheibe aus der Vision: Jeder Knoten kann unabhängig auf- und zugeklappt werden, mehrere
Detailstufen können parallel sichtbar sein.

Rahmen:

- Die Package-Hierarchie darf zunächst aus der Verzeichnisstruktur abgeleitet werden.
- Mittelfristig soll sie aus den echten Java-`package`-Deklarationen entstehen.
- Ein Package gilt in dieser Story als nichtleer, wenn es direkt `.java`-Dateien enthält.
- Leere Packages werden nicht als eigene Knoten angezeigt.
- Der erste sichtbare Knoten ist das erste nichtleere Package.
- Ein Doppelklick klappt immer bis zur nächsten Verzweigung oder bis zum nächsten nichtleeren Package auf.
- Packages mit nur einem relevanten Kind werden sofort zu einem Package-Knoten zusammengefasst.
- Package-Knoten zeigen nur den letzten relevanten Namensteil, z. B. `model.being`.
- Zuklappen gehört ausdrücklich nicht zu dieser Story.
- Es werden noch keine Klassen, Interfaces, Enums oder Abhängigkeiten angezeigt.

Akzeptanzkriterien:

- Beim Start ist das erste nichtleere Package sichtbar.
- Per Doppelklick auf einen geschlossenen expandierbaren Package-Knoten werden seine nächsten relevanten Package-Kinder angezeigt.
- Andere aufgeklappte Packages bleiben unverändert sichtbar.
- Ein Package wie `de.aventiure.lay06b_world` kann geschlossen sichtbar bleiben, während `de.aventiure.lay05_being` geöffnet ist.
- Beim Öffnen von `de.aventiure.lay05_being` kann ein Kind wie `de.aventiure.lay05_being.model.being` sichtbar werden.

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
Zuerst können Abhängigkeiten zwischen Java-Typen sichtbar werden; anschließend können zugeklappte Packages aggregierte Package-Abhängigkeiten darstellen.

## Workspace-Pfad konfigurierbar machen

Der zu analysierende Java-Workspace wird konfigurierbar.
Die Konfiguration kommt erst dann in den Fokus, wenn die Navigation am festen Aventiure-Testpfad fachlich trägt.
