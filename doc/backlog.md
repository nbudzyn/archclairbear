# Backlog

Dieses Backlog beschreibt die nächsten Umsetzungsschritte für den Architektur-Explorer.
Die Reihenfolge ist so gewählt, dass jeder Schritt einen im Browser sichtbaren und prüfbaren fachlichen Mehrwert liefert.

## Aufklappbare Knoten erkennbar machen

Der Nutzer kann erkennen, welche Knoten (Package oder Typ) weitere sichtbare Package-Kinder haben (wo ein Aufklappen etwas bewirkt)

## Abhängigkeiten als Pfeile darstellen

Der Graph zeigt statische Abhängigkeiten als gerichtete Pfeile.

- Pfeile gehen immer von einem Package und zu einem Package
- Es gibt Pfeile gehen niemals von Typen aus. Pfeile führen niemals zu Typen hin.

Pfeile zeigen die aggregierten Abhängigkeiten:

- Liegt in einem sichtbaren Package A ein Typ, der von einem Typen B in einem anderen sichtbaren Package abhängig ist, zeigt das System
  einen Pfeil (gerichtet) von Package A zu Package B.
- Das gilt insbesondere auch mittelbar: Die Typen können direkt in einem Package liegen oder in einem Sub-Package.
- Auch, wenn ein INNERER Typ von einem anderen Package verwendet wird, gibt es einen Pfeil zum Packages des (inneren und äußeren) Typs.
- Das System zeigt niemals Schleifen (self-loops). Auch dann nicht, wenn ein Package unaufgeklapptes Package in verschiedenen Sub-Packages
  Typen haben, die voneinander abhängen.

Pfeile sind immer möglichst spezifisch. Sie gehen also immer von dem untersten aufgeklappten Package aus, IN DEM DIE RELEVANTEN JAVA-DATEIEN
LIEGEN, und sie zeigen immer auf das unterste aufgeklappte Package, IN DEM DIE RELEVANTEN JAVA-DATEIEN LIEGEN.

- Beispiel: Wenn Package O aufgeklappt ist und man sieht Package U, so gibt es keine Pfeile zu Package O und keine Pfeile von Package O - es
  kann aber durchaus Pfeile zu oder von Package U geben! AUSNAHME: Im Package O liegen bereits Java-Dateien: Dann kann es zusätzlich Pfeile
  von oder zu Package O geben.

Das System stellt sicher, dass nach jedem Auf- und Zuklappen alle Pfeile aktuell sind.

- Wenn also Package O AUFgeklappt wird, werden die Pfeile von O, nach O und von und nach den aufgeklappten Subpackages neu gezeichnet (und
  es wird danach neu gelayoutet.)
- Wenn ein Package O ZUgeklappt wird, so dass keine Unterpackages mehr sichtbar sind, entfallen den Pfeile von und zu den Subpackages - und
  es kommen in der Regel neue Pfeile von und anch O dazu.

## Abhängigkeiten auch von Typen, zu Typen und zwischen Typen darstellen

Der Graph zeigt statische Abhängigkeiten von Typen, zu Typen und zwischen Typen als gerichtete Pfeile.

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
