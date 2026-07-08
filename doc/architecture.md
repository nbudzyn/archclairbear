# Architektur

## Ziel

Einen browserbasierten Architektur-Explorer für Java-Codebasen bauen.

## Grobe Aufteilung

- Server: Spring Boot
- Client: HTML/CSS/JavaScript mit Cytoscape

## Zuständigkeiten

### Server

- Spring Boot
- Liest Java-Quelltext aus einem fest konfigurierten Workspace-Pfad.
- Analysiert den Quelltext mit JavaParser und extrahiert statische Abhängigkeiten.
- Baut ein hierarchisches Graphmodell aus Packages und Top-Level-Typen auf Basis der `package`-Deklaration.
- Stellt die Graphdaten bereit.
- Unterstützt Initial-Load und Nachladen.
- Bleibt im Web-/Session-Sinn stateless: kein `HttpSession`-Zustand, kein serverseitiges Merken von Aufklappzuständen oder benutzerspezifischem Graphzustand.

### Client

- Rendert den Graphen.
- Behandelt Aufklappen, Zuklappen, Hover, Zoom, Pan und Drag.
- Hält mehrere Detailstufen gleichzeitig sichtbar.
- Fragt bei Bedarf zusätzliche Graphdaten ab.
- Cytoscape für Interaktion und Graph-Rendering verwenden.
- ELK als Layout-Engine verwenden, wenn der Graph schichtweise und möglichst kollisionsfrei angeordnet werden soll.
- Der Renderer bleibt leicht: ELK berechnet Positionen, Cytoscape rendert nur noch die fertigen Boxen und Kanten.
- Der Client soll leicht bleiben; die Analyse gehört auf den Server.
- Die reine Frontend-Logik liegt in importierbaren Modulen; DOM-Zugriffe bleiben in einer dünnen Integrationsschicht.
- Die erste Implementierung bleibt einfach und stabil.
- Angular gehört nicht zur ersten Version.

## Datenübertragung

- Kein roher Quelltext als primäre Nutzlast an den Browser.
- Stattdessen analysierte Graphdaten mit Packages und Top-Level-Typen.
- Zuerst ein Initial-Graph für die Übersicht.
- Danach Nachladeanfragen für direkt geöffnete Packages und deren Inhalte.

## Graphmodell

- Knoten stehen für Packages und konkrete Top-Level-Typen.
- Kanten stehen für statische Abhängigkeiten zwischen einzelnen Knoten.
- Der Graph ist hierarchisch und kann pro Knoten auf- und zugeklappt werden.
- Geöffnete Packages dürfen als Boxen in Boxen dargestellt werden; Überlappungen zwischen Geschwistern sollen vermieden werden.


