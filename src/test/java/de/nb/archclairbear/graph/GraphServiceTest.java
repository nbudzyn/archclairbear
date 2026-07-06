package de.nb.archclairbear.graph;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class GraphServiceTest {

  @Test
  void rootGraphReturnsMinimalWorkspaceGraph() {
    // GIVEN
    var graphService = new GraphService();

    // WHEN
    var graph = graphService.rootGraph();

    // THEN
    assertThat(graph.nodes())
        .containsExactly(new GraphNode("root-directory", "directory", "Workspace"));
    assertThat(graph.edges()).isEmpty();
  }
}
