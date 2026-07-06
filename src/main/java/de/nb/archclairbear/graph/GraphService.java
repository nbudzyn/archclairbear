package de.nb.archclairbear.graph;

import java.util.List;

import org.springframework.stereotype.Service;

/**
 * Graph-Service.
 */
@Service
class GraphService {

  GraphResponse rootGraph() {
    return new GraphResponse(
        List.of(new GraphNode("root-directory", "directory", "Workspace")),
        List.of());
  }
}
