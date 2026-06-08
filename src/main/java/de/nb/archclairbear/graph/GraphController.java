package de.nb.archclairbear.graph;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
class GraphController {

  @GetMapping("/api/graph/root")
  GraphResponse rootGraph() {
    return new GraphResponse(
        List.of(new GraphNode("root-directory", "directory", "Workspace")),
        List.of());
  }

  record GraphResponse(List<GraphNode> nodes, List<GraphEdge> edges) {
  }

  record GraphNode(String id, String type, String label) {
  }

  record GraphEdge(String source, String target) {
  }
}
