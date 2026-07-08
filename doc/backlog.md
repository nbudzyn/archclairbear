# Backlog

Dieses Backlog beschreibt die nächsten Umsetzungsschritte für den Architektur-Explorer.
Die Reihenfolge ist so gewählt, dass jeder Schritt einen im Browser sichtbaren und prüfbaren fachlichen Mehrwert liefert.

## Abhängigkeiten als Pfeile darstellen

Der Graph zeigt statische Abhängigkeiten als gerichtete Pfeile.
Zuerst können Abhängigkeiten zwischen Java-Typen sichtbar werden; anschließend können zugeklappte Packages aggregierte
Package-Abhängigkeiten darstellen.

## Top-Level-Typen unterscheiden

Der Client erfährt, ob ein Typ ein `class`, `interface`, `enum`, `record` oder Annotation-Typ ist.

- Die Typen werden in diesem Schritt noch nicht unterschiedlich gerendert.
- Die Information wird nur fachlich transportiert und für spätere Darstellungen vorbereitet.
- Verschachtelte Typen bleiben auch hier zunächst außen vor.

## Verschachtelte Typen verschachelt anzeigen

Verschachtelte Typen (nicht Top-Level) werden verschachtelt angezeigt.

## Smooth animation when layout changes

When the layout changes (box moves somewhere else on double-click), the layout should perform a smooth transition.

## Aufklappbare Package-Knoten erkennbar machen

Der Nutzer kann erkennen, welche Package-Knoten weitere sichtbare Package-Kinder haben.
Package-Knoten ohne weitere Kinder wirken nicht wie interaktive Aufklapp-Knoten.

## Workspace-Pfad konfigurierbar machen

Der zu analysierende Java-Workspace wird konfigurierbar.
Die Konfiguration kommt erst dann in den Fokus, wenn die Navigation am festen Aventiure-Testpfad fachlich trägt.

## Source-Root-Knoten bei mehreren Source Roots anzeigen

Der Graph bekommt einen fachlichen Knotentyp `Source Root`.
Source-Root-Knoten werden nur angezeigt, wenn mehrere Source Roots analysiert werden, z. B. Produktivcode und Testcode oder Client und
Server.
Gibt es nur einen Source Root, startet der sichtbare Graph weiterhin direkt bei der Package-Hierarchie.
