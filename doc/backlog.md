# Backlog

Dieses Backlog beschreibt die nächsten Umsetzungsschritte für den Architektur-Explorer.
Die Reihenfolge ist so gewählt, dass möglichst schnell ein laufendes Skeleton entsteht, das im Browser sichtbar und überprüfbar ist.

## Smooth animation when layout changes

When the layout changes (box moves somewhere else on double-click), the layout should perform a smooth transition.

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
