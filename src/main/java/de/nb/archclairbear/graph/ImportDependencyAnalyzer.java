package de.nb.archclairbear.graph;

import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.ast.ImportDeclaration;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

/**
 * Import-Abhängigkeitsanalyse.
 */
class ImportDependencyAnalyzer {

  List<RawDependency> analyze(final CompilationUnit compilationUnit) {
    var sourcePackage = compilationUnit.getPackageDeclaration()
        .map(packageDeclaration -> packageDeclaration.getNameAsString())
        .orElse("");

    return compilationUnit.getImports().stream()
        .map(importDeclaration -> createRawDependency(sourcePackage, importDeclaration))
        .filter(Objects::nonNull)
        .distinct()
        .sorted(Comparator
            .comparing(RawDependency::sourcePackage)
            .thenComparing(RawDependency::targetPackage))
        .toList();
  }

  private RawDependency createRawDependency(final String sourcePackage, final ImportDeclaration importDeclaration) {
    var targetPackage = targetPackage(importDeclaration);
    if (targetPackage == null || sourcePackage.equals(targetPackage)) {
      return null;
    }

    return new RawDependency(sourcePackage, targetPackage);
  }

  private String targetPackage(final ImportDeclaration importDeclaration) {
    var importedName = importDeclaration.getNameAsString();
    if (!importDeclaration.isStatic() && !importDeclaration.isAsterisk()) {
      return packageFromQualifiedTypeName(importedName);
    }

    if (importDeclaration.isStatic()) {
      return targetPackageFromStaticImport(importDeclaration, importedName);
    }

    var segmentsToRemove = importDeclaration.isAsterisk() ? 0 : 1;
    var targetPackageEnd = importedName.length();

    for (var removedSegments = 0; removedSegments < segmentsToRemove; removedSegments += 1) {
      targetPackageEnd = importedName.lastIndexOf('.', targetPackageEnd - 1);
      if (targetPackageEnd < 0) {
        return null;
      }
    }

    return importedName.substring(0, targetPackageEnd);
  }

  private String targetPackageFromStaticImport(
      final ImportDeclaration importDeclaration,
      final String importedName) {
    var importedTypeName = importDeclaration.isAsterisk() ? importedName : removeLastSegment(importedName);
    if (importedTypeName == null) {
      return null;
    }

    return packageFromQualifiedTypeName(importedTypeName);
  }

  private String removeLastSegment(final String qualifiedName) {
    var lastDotIndex = qualifiedName.lastIndexOf('.');
    return lastDotIndex < 0 ? null : qualifiedName.substring(0, lastDotIndex);
  }

  private String packageFromQualifiedTypeName(final String qualifiedTypeName) {
    var segments = qualifiedTypeName.split("\\.");
    for (var segmentIndex = 0; segmentIndex < segments.length; segmentIndex += 1) {
      if (startsWithUppercase(segments[segmentIndex])) {
        if (segmentIndex == 0) {
          return null;
        }

        return String.join(".", java.util.Arrays.copyOf(segments, segmentIndex));
      }
    }

    var lastDotIndex = qualifiedTypeName.lastIndexOf('.');
    return lastDotIndex < 0 ? null : qualifiedTypeName.substring(0, lastDotIndex);
  }

  private boolean startsWithUppercase(final String segment) {
    return !segment.isEmpty() && Character.isUpperCase(segment.charAt(0));
  }

}
