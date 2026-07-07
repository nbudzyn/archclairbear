package de.nb.archclairbear.graph;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class GraphServiceTest {

  @TempDir
  private Path tempDir;

  @Test
  void rootGraphReturnsCollapsedFirstVisiblePackage() throws IOException {
    // GIVEN
    createJavaFile("de", "aventiure", "common", "CommonType.java");
    createJavaFile("de", "aventiure", "story", "StoryType.java");
    var graphService = new GraphService(tempDir);

    // WHEN
    var graph = graphService.rootGraph();

    // THEN
    assertThat(graph.nodes())
        .containsExactly(new GraphNode("de.aventiure", "package", "de.aventiure"));
    assertThat(graph.edges()).isEmpty();
  }

  @Test
  void rootGraphSkipsEmptyPackagesWithoutJavaAndWithoutSeveralSubpackages() throws IOException {
    // GIVEN
    Files.createDirectories(tempDir.resolve(Path.of("de", "aventiure", "empty", "nested")));
    createJavaFile("de", "aventiure", "core", "CoreType.java");
    createJavaFile("de", "aventiure", "world", "WorldType.java");
    var graphService = new GraphService(tempDir);

    // WHEN
    var graph = graphService.rootGraph();

    // THEN
    assertThat(graph.nodes())
        .containsExactly(new GraphNode("de.aventiure", "package", "de.aventiure"));
    assertThat(graph.edges()).isEmpty();
  }

  @Test
  void packageGraphReturnsVisibleChildrenForExpandedPackage() throws IOException {
    // GIVEN
    createJavaFile("de", "aventiure", "lay05_being", "BeingLayer.java");
    createJavaFile("de", "aventiure", "lay05_being", "model", "being", "Being.java");
    createJavaFile("de", "aventiure", "lay06b_world", "World.java");
    var graphService = new GraphService(tempDir);

    // WHEN
    var graph = graphService.packageGraph("de.aventiure");

    // THEN
    assertThat(graph.nodes())
        .containsExactly(
            new GraphNode("de.aventiure.lay05_being", "package", "lay05_being", "de.aventiure"),
            new GraphNode("de.aventiure.lay06b_world", "package", "lay06b_world", "de.aventiure"));
    assertThat(graph.edges()).isEmpty();
  }

  @Test
  void packageGraphReturnsImmediateChildPackagesAndTypes() throws IOException {
    // GIVEN
    createJavaFile("de", "aventiure", "lay05_being", "BeingLayer.java");
    createJavaFile("de", "aventiure", "lay05_being", "model", "being", "Being.java");
    createJavaFile("de", "aventiure", "lay05_being", "Action.java");
    var graphService = new GraphService(tempDir);

    // WHEN
    var graph = graphService.packageGraph("de.aventiure.lay05_being");

    // THEN
    assertThat(graph.nodes())
        .containsExactly(
            new GraphNode("de.aventiure.lay05_being.model", "package", "model", "de.aventiure.lay05_being"),
            new GraphNode("de.aventiure.lay05_being.Action", "type", "Action", "de.aventiure.lay05_being"),
            new GraphNode("de.aventiure.lay05_being.BeingLayer", "type", "BeingLayer", "de.aventiure.lay05_being"));
    assertThat(graph.edges()).isEmpty();
  }

  @Test
  void rootGraphFailsForMissingWorkspaceDirectory() {
    // GIVEN
    var missingDirectory = tempDir.resolve("missing");
    var graphService = new GraphService(missingDirectory);

    // WHEN/THEN
    assertThatExceptionOfType(WorkspacePathNotFoundException.class)
        .isThrownBy(graphService::rootGraph)
        .withMessage("Der Workspace-Pfad " + missingDirectory + " wurde nicht gefunden.");
  }

  private void createJavaFile(final String... pathSegments) throws IOException {
    var path = tempDir.resolve(Path.of(pathSegments[0], java.util.Arrays.copyOfRange(pathSegments, 1, pathSegments.length)));
    Files.createDirectories(path.getParent());
    Files.writeString(path, "class Test {}");
  }
}
