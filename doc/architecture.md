# Architektur

## Ziel

Einen browserbasierten Architektur-Explorer für Java-Codebasen bauen.

## Grobe Aufteilung

- Server: Spring Boot
- Client: pures HTML/CSS/TypeScript oder JavaScript mit Cytoscape

## Zuständigkeiten

### Server

- Spring Boot
- Liest Java-Quelltext aus einem lokalen Workspace-Pfad.
- Analysiert den Quelltext und extrahiert statische Abhängigkeiten.
- Baut ein hierarchisches Graphmodell.
- Stellt die Graphdaten bereit.
- Unterstützt Initial-Load und Nachladen.

### Client

- Rendert den Graphen.
- Behandelt Aufklappen, Zuklappen, Hover, Zoom, Pan und Drag.
- Hält mehrere Detailstufen gleichzeitig sichtbar.
- Fragt bei Bedarf zusätzliche Graphdaten ab.
- Cytoscape für Interaktion und Graph-Rendering verwenden.
- Der Client soll leicht bleiben; die Analyse gehört auf den Server.
- Die erste Implementierung bleibt einfach und stabil.
- Angular gehört nicht zur ersten Version.

## Datenübertragung

- Kein roher Quelltext als primäre Nutzlast an den Browser.
- Stattdessen analysierte Graphdaten.
- Zuerst ein Initial-Graph für die Übersicht.
- Danach Nachladeanfragen für tiefere Ebenen und Details.

## Graphmodell

- Knoten stehen für Verzeichnisbäume, Packages und konkrete Typen.
- Kanten stehen für statische Abhängigkeiten zwischen einzelnen Knoten.
- Der Graph ist hierarchisch und kann pro Knoten auf- und zugeklappt werden.

## Vorgehen

- Toten oder nur historisch motivierten Code konsequent entfernen.
- Alle Änderungen werden durch Test(s) abgesichert, sodass später keine Regressionen vorkommen.
- Der Standard-Testlauf erfolgt immer über `.\localTest.ps1`.
    - Falls nach einem Fehlschlag mehr Details nötig sind, danach `.\localTest.ps1 -Stacktrace` ausführen.
- Ein direkter Gradle-Testlauf über den Task `test` darf nur nach Rückfrage beim User durchgeführt werden.


