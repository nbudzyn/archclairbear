package de.nb.archclairbear.graph;

import java.nio.file.Path;

/**
 * Fehlender Workspace-Pfad.
 */
class WorkspacePathNotFoundException extends RuntimeException {

  WorkspacePathNotFoundException(final Path workspacePath) {
    super("Der Workspace-Pfad " + workspacePath + " wurde nicht gefunden.");
  }
}
