package de.nb.archclairbear.graph;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Graph-Controller.
 */
@RestController
class GraphController {
  private final GraphService service;

  GraphController(final GraphService service) {
    this.service = service;
  }

  @GetMapping("/api/graph/root")
  GraphResponse rootGraph() {
    return service.rootGraph();
  }
}
