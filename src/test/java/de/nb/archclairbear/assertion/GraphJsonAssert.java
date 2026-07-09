package de.nb.archclairbear.assertion;

import org.assertj.core.api.AbstractAssert;
import com.fasterxml.jackson.databind.JsonNode;

@SuppressWarnings("UnusedReturnValue")
public class GraphJsonAssert extends AbstractAssert<GraphJsonAssert, JsonNode> {

  public GraphJsonAssert(final JsonNode actual) {
    super(actual, GraphJsonAssert.class);
  }

  public GraphJsonAssert hasSinglePackageNode(final String expectedId, final String expectedLabel) {
    isNotNull();

    var nodes = requireArray("nodes");
    if (nodes.size() != 1) {
      failWithMessage("Expected graph response to contain exactly one node, but found %d.", nodes.size());
    }

    var node = nodes.get(0);
    assertFieldEquals(node, "type", "package");
    assertFieldEquals(node, "id", expectedId);
    assertFieldEquals(node, "label", expectedLabel);

    return this;
  }

  public GraphJsonAssert hasNoEdgesField() {
    isNotNull();

    if (actual.has("edges")) {
      failWithMessage("Expected graph response to contain no edges field.");
    }

    return this;
  }

  public GraphJsonAssert hasEmptyRawDependenciesField() {
    isNotNull();

    var rawDependencies = requireArray("rawDependencies");
    if (!rawDependencies.isEmpty()) {
      failWithMessage(
          "Expected graph response field <rawDependencies> to be empty, but found %d entries.",
          rawDependencies.size());
    }

    return this;
  }

  public GraphJsonAssert hasSingleRawDependency(final String expectedSourcePackage, final String expectedTargetPackage) {
    isNotNull();

    var rawDependencies = requireArray("rawDependencies");
    if (rawDependencies.size() != 1) {
      failWithMessage(
          "Expected graph response to contain exactly one raw dependency, but found %d.",
          rawDependencies.size());
    }

    var rawDependency = rawDependencies.get(0);
    assertFieldEquals(rawDependency, "sourcePackage", expectedSourcePackage);
    assertFieldEquals(rawDependency, "targetPackage", expectedTargetPackage);

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
