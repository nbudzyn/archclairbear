package de.nb.archclairbear.graph;

import java.util.List;

/**
 * Graph-Antwort.
 */
record GraphResponse(List<GraphNode> nodes, List<GraphEdge> edges) {
}
