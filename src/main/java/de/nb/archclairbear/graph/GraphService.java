package de.nb.archclairbear.graph;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Graph-Service.
 */
@Service
class GraphService {
  private final Path workspacePath;

  @Autowired
  GraphService(@Value("${archclairbear.workspace.path}") final String workspacePath) {
    this(Path.of(workspacePath));
  }

  GraphService(final Path workspacePath) {
    this.workspacePath = workspacePath;
  }

  GraphResponse rootGraph() {
    if (!Files.exists(workspacePath)) {
      throw new WorkspacePathNotFoundException(workspacePath);
    }

    if (!Files.isDirectory(workspacePath)) {
      throw new IllegalStateException("Workspace-Pfad ist kein Verzeichnis: " + workspacePath);
    }

    return new GraphResponse(List.of(new GraphNode("root-directory", "directory", workspacePath.getFileName().toString())), List.of());
  }
}
