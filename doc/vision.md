# Vision

## Zweck

Das Tool visualisiert die Architektur von Java-Anwendungen aus dem Quellcode.

Es hilft beim:

- Verstehen von Kernbereichen,
- Sehen statischer Abhängigkeiten,
- Erkennen von Hotspots und Refactoring-Kandidaten,
- Erkennen vorhandener Modularisierung,
- Navigieren von der groben Struktur bis zu einzelnen Typen.

## Knotentypen

- Package
- Klasse
- Interface
- Enum
- Record
- Annotation

## Interaktionsmodell

- Jeder Knoten kann unabhängig auf- und zugeklappt werden.
- Mehrere Knoten können gleichzeitig in unterschiedlichen Detailstufen offen sein.
- Der Nutzer soll sich beim Hineinzoomen keinen äußeren Kontext merken müssen.
- Zoom und Drag werden unterstützt.

## Abhängigkeitsdarstellung

- Kanten verbinden immer genau einen Quellknoten mit genau einem Zielknoten.
- Der Graph zeigt echte statische Abhängigkeiten aus der Codebasis.
- Die optische Darstellung kann Stärke (geplant) oder Typ ausdrücken.
