# ArchClairBear

**English**

ArchClairBear is a browser-based architecture explorer for Java codebases.

It:

- reads Java source code from a fixed, configured workspace path,
- analyzes the code on the server with JavaParser,
- builds a hierarchical graph of packages and top-level types from `package` declarations,
- sends graph data to the browser,
- and lets the client render and navigate the structure with expand/collapse, hover, zoom, pan, and drag.

**Deutsch**

ArchClairBear ist ein browserbasierter Architektur-Explorer für Java-Codebasen.

Er:

- liest Java-Quelltext aus einem fest konfigurierten Workspace-Pfad,
- analysiert den Quelltext serverseitig mit JavaParser,
- baut einen hierarchischen Graphen aus Packages und Top-Level-Typen auf Basis der `package`-Deklaration auf,
- sendet Graphdaten an den Browser,
- und stellt dort die Struktur mit Auf- und Zuklappen, Hover, Zoom, Pan und Drag dar.

## Entwicklung

Hinweise zu lokalen Builds, Tests und Gradle-Aufrufen stehen in [doc/development.md](/C:/projects/2026/archclairbear/archclairbear/doc/development.md).

Die Anwendung ist lokal im Browser unter `http://localhost:8080/` erreichbar, sobald der Server läuft.
