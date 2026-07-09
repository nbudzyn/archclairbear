# Architektur

## Grobe Aufteilung

- Server: Spring Boot
- Client: HTML/CSS/JavaScript mit Cytoscape
- Code-Orte als Merkhilfe:
    - Server-Logik: `src/main/java/de/nb/archclairbear/graph`
    - Client-Steuerung: `src/main/resources/static/graph-client.mjs`
    - Renderer/Layout: `src/main/resources/static/graph-renderer.mjs`
    - Java-Tests: `src/test/java/de/nb/archclairbear`
    - JS-Tests: `src/js-test`
    - Browser-Tests: `src/browser-test`

## Zuständigkeiten und Technologien

### Server

- Spring Boot
- `src/main/java/de/nb/archclairbear/graph` analysiert Java-Quelltext und liefert JSON-Graphdaten
- Liest Java-Quelltext aus einem fest konfigurierten Workspace-Pfad.
- Analysiert den Quelltext mit JavaParser und extrahiert statische Abhängigkeiten.
- Baut ein hierarchisches Graphmodell aus Packages und Typen auf Basis der `package`-Deklaration.
- Stellt die Graphdaten bereit.
- Unterstützt Initial-Load und Nachladen.
- Bleibt im Web-/Session-Sinn stateless: kein `HttpSession`-Zustand, kein serverseitiges Merken von Aufklappzuständen oder
  benutzerspezifischem Graphzustand.

### Client

- Rendert den Graphen.
- `src/main/resources/static/graph-client.mjs` steuert Laden, Auf-/Zuklappen und Fehlermeldungen
- Renderer: `src/main/resources/static/graph-renderer.mjs` baut Cytoscape-Elemente und ELK-Layout.
- Behandelt Aufklappen, Zuklappen, Zoom, Pan und Drag. Später auch Hover.
- Hält mehrere Detailstufen gleichzeitig sichtbar.
- Fragt bei Bedarf zusätzliche Graphdaten ab.
- Cytoscape für Interaktion und Graph-Rendering verwenden.
- ELK als Layout-Engine verwenden, wenn der Graph schichtweise und möglichst kollisionsfrei angeordnet werden soll.
- Der Renderer bleibt leicht: ELK berechnet Positionen, Cytoscape rendert nur noch die fertigen Boxen und Kanten.
- Der Client soll leicht bleiben; die Analyse gehört auf den Server.
- Die reine Frontend-Logik liegt in importierbaren Modulen; DOM-Zugriffe bleiben in einer dünnen Integrationsschicht.
- Die Implementierung bleibt einfach und stabil.

## Datenübertragung

- Kein roher Quelltext als primäre Nutzlast an den Browser.
- Stattdessen analysierte Graphdaten mit Packages und Top-Level-Typen.
- Zuerst ein Initial-Graph für die Übersicht.
- Danach Nachladeanfragen für direkt geöffnete Packages und deren Inhalte.

## Graphmodell

- Knoten stehen für Packages und Typen.
- Roh-Abhängigkeiten werden im Server aus dem Quelltext berechnet.
- Der Client aggregiert diese Roh-Abhängigkeiten auf die jeweils sichtbaren Package-Knoten und rendert sie als gerichtete Pfeile.
- Der Graph ist hierarchisch und kann pro Knoten auf- und zugeklappt werden.
- Geöffnete Kind-Knoten werden als Boxen in Boxen dargestellt; Überlappungen zwischen Geschwistern sollen vermieden werden.

