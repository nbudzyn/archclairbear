package de.nb.archclairbear.graph;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.jupiter.api.Test;

class InitialRawDependencyFilterTest {
  private final InitialRawDependencyFilter filter = new InitialRawDependencyFilter();

  @Test
  void analyzedRootPackageNameReturnsTheInitialPackageNodeId() {
    // GIVEN
    var initialNodes = List.of(new GraphNode("a.b", "package", "a.b", true, null));

    // WHEN
    var analyzedRootPackageName = filter.analyzedRootPackageName(initialNodes);

    // THEN
    assertThat(analyzedRootPackageName).isEqualTo("a.b");
  }

  @Test
  void filterDropsRawDependencyWhenTargetPackageIsOutsideTheAnalyzedPackageTree() {
    // GIVEN
    var rawDependencies = List.of(new RawDependency("a.b.source", "a.c.target"));

    // WHEN
    var filteredDependencies = filter.filter(rawDependencies, "a.b");

    // THEN
    assertThat(filteredDependencies).isEmpty();
  }

  @Test
  void filterDropsRawDependencyWhenSourcePackageIsOutsideTheAnalyzedPackageTree() {
    // GIVEN
    var rawDependencies = List.of(new RawDependency("a.c.source", "a.b.target"));

    // WHEN
    var filteredDependencies = filter.filter(rawDependencies, "a.b");

    // THEN
    assertThat(filteredDependencies).isEmpty();
  }

  @Test
  void filterKeepsRawDependencyWhenSourceAndTargetAreTheAnalyzedPackageTreeRoot() {
    // GIVEN
    var rawDependency = new RawDependency("a.b", "a.b");

    // WHEN
    var filteredDependencies = filter.filter(List.of(rawDependency), "a.b");

    // THEN
    assertThat(filteredDependencies).containsExactly(rawDependency);
  }

  @Test
  void filterKeepsRawDependencyWhenSourceAndTargetAreInsideTheAnalyzedPackageTree() {
    // GIVEN
    var rawDependency = new RawDependency("a.b.source", "a.b.target");

    // WHEN
    var filteredDependencies = filter.filter(List.of(rawDependency), "a.b");

    // THEN
    assertThat(filteredDependencies).containsExactly(rawDependency);
  }

  @Test
  void filterKeepsAllRawDependenciesWhenTheInitialTreeContainsTheDefaultPackage() {
    // GIVEN
    var rawDependencies = List.of(
        new RawDependency("", "outside.target"),
        new RawDependency("outside.source", "a.b.target"));

    // WHEN
    var filteredDependencies = filter.filter(rawDependencies, "(default)");

    // THEN
    assertThat(filteredDependencies).containsExactlyElementsOf(rawDependencies);
  }
}
