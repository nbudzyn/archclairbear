package de.nb.archclairbear.graph;

import java.util.List;

/**
 * Filter für initiale Roh-Abhängigkeiten.
 */
class InitialRawDependencyFilter {
  private static final String DEFAULT_PACKAGE_LABEL = "(default)";

  String analyzedRootPackageName(final List<GraphNode> initialNodes) {
    if (initialNodes.isEmpty()) {
      return null;
    }

    return initialNodes.getFirst().id();
  }

  List<RawDependency> filter(
      final List<RawDependency> rawDependencies,
      final String analyzedRootPackageName) {
    if (analyzedRootPackageName == null
        || analyzedRootPackageName.isBlank()
        || DEFAULT_PACKAGE_LABEL.equals(analyzedRootPackageName)) {
      return rawDependencies;
    }

    return rawDependencies.stream()
        .filter(rawDependency -> isInsideAnalyzedTree(rawDependency.sourcePackage(), analyzedRootPackageName))
        .filter(rawDependency -> isInsideAnalyzedTree(rawDependency.targetPackage(), analyzedRootPackageName))
        .toList();
  }

  private boolean isInsideAnalyzedTree(final String packageName, final String analyzedRootPackageName) {
    return packageName.equals(analyzedRootPackageName)
        || packageName.startsWith(analyzedRootPackageName + ".");
  }
}
