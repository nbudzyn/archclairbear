package de.nb.archclairbear.assertion;

import org.assertj.core.api.AbstractAssert;
import com.fasterxml.jackson.databind.JsonNode;

@SuppressWarnings("UnusedReturnValue")
public class GraphJsonAssert extends AbstractAssert<GraphJsonAssert, JsonNode> {

  public GraphJsonAssert(final JsonNode actual) {
    super(actual, GraphJsonAssert.class);
  }

  public GraphJsonAssert hasSingleDirectoryNode(final String expectedId, final String expectedLabel) {
    isNotNull();

    var nodes = requireArray("nodes");
    if (nodes.size() != 1) {
      failWithMessage("Expected graph response to contain exactly one node, but found %d.", nodes.size());
    }

    var node = nodes.get(0);
    assertFieldEquals(node, "type", "directory");
    assertFieldEquals(node, "id", expectedId);
    assertFieldEquals(node, "label", expectedLabel);

    return this;
  }

  public GraphJsonAssert hasNoEdges() {
    isNotNull();

    var edges = requireArray("edges");
    if (!edges.isEmpty()) {
      failWithMessage("Expected graph response to contain no edges, but found %d.", edges.size());
    }

    return this;
  }

  private JsonNode requireArray(final String fieldName) {
    var field = actual.path(fieldName);
    if (!field.isArray()) {
      failWithMessage("Expected graph response field <%s> to be an array.", fieldName);
    }

    return field;
  }

  private void assertFieldEquals(final JsonNode node, final String fieldName, final String expectedValue) {
    var actualValue = node.path(fieldName).asText();
    if (!expectedValue.equals(actualValue)) {
      failWithMessage("Expected node field <%s> to be <%s>, but was <%s>.", fieldName, expectedValue, actualValue);
    }
  }
}
