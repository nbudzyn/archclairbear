package de.nb.archclairbear.graph;

import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.ast.ImportDeclaration;
import com.github.javaparser.ast.expr.AnnotationExpr;
import com.github.javaparser.ast.type.ClassOrInterfaceType;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Typverwendungs-Abhängigkeitsanalyse.
 */
class TypeUseDependencyAnalyzer {

  List<RawDependency> analyze(final CompilationUnit compilationUnit) {
    var sourcePackage = compilationUnit.getPackageDeclaration()
        .map(packageDeclaration -> packageDeclaration.getNameAsString())
        .orElse("");
    var importedPackagesBySimpleName = importedPackagesBySimpleName(compilationUnit);

    return Stream
        .concat(
            compilationUnit.findAll(ClassOrInterfaceType.class).stream()
                .map(ClassOrInterfaceType::getNameWithScope),
            compilationUnit.findAll(AnnotationExpr.class).stream()
                .map(annotation -> annotation.getName().asString()))
        .map(typeName -> targetPackage(typeName, importedPackagesBySimpleName))
        .filter(Objects::nonNull)
        .filter(targetPackage -> !sourcePackage.equals(targetPackage))
        .map(targetPackage -> new RawDependency(sourcePackage, targetPackage))
        .distinct()
        .sorted(Comparator
            .comparing(RawDependency::sourcePackage)
            .thenComparing(RawDependency::targetPackage))
        .toList();
  }

  private Map<String, String> importedPackagesBySimpleName(final CompilationUnit compilationUnit) {
    return compilationUnit.getImports().stream()
        .filter(importDeclaration -> !importDeclaration.isStatic())
        .filter(importDeclaration -> !importDeclaration.isAsterisk())
        .collect(Collectors.toMap(
            this::simpleName,
            this::packageName,
            (firstPackage, secondPackage) -> firstPackage));
  }

  private String targetPackage(
      final String typeName,
      final Map<String, String> importedPackagesBySimpleName) {
    if (typeName.contains(".")) {
      return packageFromQualifiedTypeName(typeName);
    }

    return importedPackagesBySimpleName.get(typeName);
  }

  private String packageFromQualifiedTypeName(final String qualifiedTypeName) {
    var segments = qualifiedTypeName.split("\\.");
    var packageSegmentCount = segments.length;
    while (packageSegmentCount > 0 && startsWithUppercase(segments[packageSegmentCount - 1])) {
      packageSegmentCount -= 1;
    }

    if (packageSegmentCount == 0 || packageSegmentCount == segments.length) {
      return null;
    }

    return String.join(".", java.util.Arrays.copyOf(segments, packageSegmentCount));
  }

  private boolean startsWithUppercase(final String segment) {
    return !segment.isEmpty() && Character.isUpperCase(segment.charAt(0));
  }

  private String simpleName(final ImportDeclaration importDeclaration) {
    var importedName = importDeclaration.getNameAsString();
    var lastDotIndex = importedName.lastIndexOf('.');
    return lastDotIndex < 0 ? importedName : importedName.substring(lastDotIndex + 1);
  }

  private String packageName(final ImportDeclaration importDeclaration) {
    var importedName = importDeclaration.getNameAsString();
    var lastDotIndex = importedName.lastIndexOf('.');
    return lastDotIndex < 0 ? "" : importedName.substring(0, lastDotIndex);
  }
}
