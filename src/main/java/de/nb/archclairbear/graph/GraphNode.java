package de.nb.archclairbear.graph;

/**
 * Graph-Knoten.
 */
record GraphNode(String id, String type, String label, String parentId) {
  GraphNode(final String id, final String type, final String label) {
    this(id, type, label, null);
  }
}
