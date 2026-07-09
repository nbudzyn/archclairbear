package de.nb.archclairbear.graph;

import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.ast.ImportDeclaration;
import com.github.javaparser.ast.expr.AnnotationExpr;
import com.github.javaparser.ast.expr.FieldAccessExpr;
import com.github.javaparser.ast.expr.MethodCallExpr;
import com.github.javaparser.ast.expr.MethodReferenceExpr;
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
        .of(
            classOrInterfaceTypeNames(compilationUnit),
            annotationNames(compilationUnit),
            fieldAccessScopes(compilationUnit),
            methodCallScopes(compilationUnit),
            methodReferenceScopes(compilationUnit))
        .flatMap(typeNames -> typeNames)
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

  private Stream<String> classOrInterfaceTypeNames(final CompilationUnit compilationUnit) {
    return compilationUnit.findAll(ClassOrInterfaceType.class).stream()
        .map(ClassOrInterfaceType::getNameWithScope);
  }

  private Stream<String> annotationNames(final CompilationUnit compilationUnit) {
    return compilationUnit.findAll(AnnotationExpr.class).stream()
        .map(annotation -> annotation.getName().asString());
  }

  private Stream<String> fieldAccessScopes(final CompilationUnit compilationUnit) {
    return compilationUnit.findAll(FieldAccessExpr.class).stream()
        .map(fieldAccess -> fieldAccess.getScope().toString())
        .filter(this::isName);
  }

  private Stream<String> methodCallScopes(final CompilationUnit compilationUnit) {
    return compilationUnit.findAll(MethodCallExpr.class).stream()
        .flatMap(methodCall -> methodCall.getScope().stream())
        .map(Object::toString)
        .filter(this::isName);
  }

  private Stream<String> methodReferenceScopes(final CompilationUnit compilationUnit) {
    return compilationUnit.findAll(MethodReferenceExpr.class).stream()
        .map(methodReference -> methodReference.getScope().toString())
        .filter(this::isName);
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
      var packageName = packageFromQualifiedTypeName(typeName);
      if (packageName != null) {
        return packageName;
      }

      return importedPackageFromQualifiedMemberAccess(typeName, importedPackagesBySimpleName);
    }

    return importedPackagesBySimpleName.get(typeName);
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

    return null;
  }

  private String importedPackageFromQualifiedMemberAccess(
      final String qualifiedMemberAccess,
      final Map<String, String> importedPackagesBySimpleName) {
    var firstDotIndex = qualifiedMemberAccess.indexOf('.');
    var firstSegment = qualifiedMemberAccess.substring(0, firstDotIndex);
    if (!startsWithUppercase(firstSegment)) {
      return null;
    }

    return importedPackagesBySimpleName.get(firstSegment);
  }

  private boolean startsWithUppercase(final String segment) {
    return !segment.isEmpty() && Character.isUpperCase(segment.charAt(0));
  }

  private boolean isName(final String value) {
    return Stream.of(value.split("\\."))
        .allMatch(this::isIdentifier);
  }

  private boolean isIdentifier(final String value) {
    if (value.isEmpty() || !Character.isJavaIdentifierStart(value.charAt(0))) {
      return false;
    }

    for (var index = 1; index < value.length(); index += 1) {
      if (!Character.isJavaIdentifierPart(value.charAt(index))) {
        return false;
      }
    }

    return true;
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
