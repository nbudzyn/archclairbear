package de.nb.archclairbear.graph;

/**
 * Graph-Knoten.
 */
record GraphNode(String id, String type, String label, boolean expandable, String parentId) {
  GraphNode(final String id, final String type, final String label, final String parentId) {
    this(id, type, label, false, parentId);
  }

  GraphNode(final String id, final String type, final String label) {
    this(id, type, label, false, null);
  }
}
