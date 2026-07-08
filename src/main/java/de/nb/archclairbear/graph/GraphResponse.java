package de.nb.archclairbear.graph;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;

/**
 * Graph-Antwort.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
record GraphResponse(List<GraphNode> nodes, List<GraphEdge> edges, String statusMessage) {
  GraphResponse(final List<GraphNode> nodes, final List<GraphEdge> edges) {
    this(nodes, edges, null);
  }
}
