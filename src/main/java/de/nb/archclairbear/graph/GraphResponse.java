package de.nb.archclairbear.graph;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;

/**
 * Graph-Antwort.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
record GraphResponse(List<GraphNode> nodes, List<RawDependency> rawDependencies, String statusMessage) {
  GraphResponse(final List<GraphNode> nodes) {
    this(nodes, null, null);
  }

  GraphResponse(final List<GraphNode> nodes, final String statusMessage) {
    this(nodes, null, statusMessage);
  }
}
