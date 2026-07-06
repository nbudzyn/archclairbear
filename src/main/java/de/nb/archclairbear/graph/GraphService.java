package de.nb.archclairbear.graph;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import org.springframework.stereotype.Service;

/**
 * Graph-Service.
 */
@Service
class GraphService {
  private static final Path WORKSPACE_PATH = Path.of("C:\\projects\\2003\\aventiure");

  private final Path workspacePath;

  GraphService() {
    this(WORKSPACE_PATH);
  }

  GraphService(final Path workspacePath) {
    this.workspacePath = workspacePath;
  }

  GraphResponse rootGraph() {
    if (!Files.isDirectory(workspacePath)) {
      throw new IllegalStateException("Workspace-Verzeichnis nicht gefunden: " + workspacePath);
    }

    return new GraphResponse(List.of(new GraphNode("root-directory", "directory", workspacePath.getFileName().toString())), List.of());
  }
}
