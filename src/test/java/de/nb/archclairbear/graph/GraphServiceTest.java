package de.nb.archclairbear.graph;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatIllegalStateException;

import java.nio.file.Path;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class GraphServiceTest {

  @TempDir
  private Path tempDir;

  @Test
  void rootGraphReturnsDirectoryFromFilesystem() {
    // GIVEN
    var graphService = new GraphService(tempDir);

    // WHEN
    var graph = graphService.rootGraph();

    // THEN
    assertThat(graph.nodes())
        .containsExactly(new GraphNode("root-directory", "directory", tempDir.getFileName().toString()));
    assertThat(graph.edges()).isEmpty();
  }

  @Test
  void rootGraphFailsForMissingWorkspaceDirectory() {
    // GIVEN
    var missingDirectory = tempDir.resolve("missing");
    var graphService = new GraphService(missingDirectory);

    // WHEN/THEN
    assertThatIllegalStateException()
        .isThrownBy(graphService::rootGraph)
        .withMessage("Workspace-Verzeichnis nicht gefunden: " + missingDirectory);
  }
}
