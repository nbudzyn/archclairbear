package de.nb.archclairbear.graph;

import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.ast.expr.Name;
import com.github.javaparser.ast.modules.ModuleDeclaration;
import com.github.javaparser.ast.modules.ModuleExportsDirective;
import com.github.javaparser.ast.modules.ModuleOpensDirective;
import com.github.javaparser.ast.modules.ModuleProvidesDirective;
import com.github.javaparser.ast.modules.ModuleRequiresDirective;
import com.github.javaparser.ast.modules.ModuleUsesDirective;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.stream.Stream;

/**
 * Modul-Info-Abhängigkeitsanalyse.
 */
class ModuleInfoDependencyAnalyzer {

  List<RawDependency> analyze(final CompilationUnit compilationUnit) {
    return compilationUnit.getModule()
        .map(this::analyze)
        .orElseGet(List::of);
  }

  private List<RawDependency> analyze(final ModuleDeclaration moduleDeclaration) {
    var sourceModule = moduleDeclaration.getNameAsString();

    return Stream
        .of(
            requiredModules(moduleDeclaration),
            exportedPackagesAndTargetModules(moduleDeclaration),
            openedPackagesAndTargetModules(moduleDeclaration),
            usedTypePackages(moduleDeclaration),
            providedTypePackages(moduleDeclaration))
        .flatMap(targets -> targets)
        .filter(target -> !sourceModule.equals(target))
        .map(target -> new RawDependency(sourceModule, target))
        .distinct()
        .sorted(Comparator
            .comparing(RawDependency::sourcePackage)
            .thenComparing(RawDependency::targetPackage))
        .toList();
  }

  private Stream<String> requiredModules(final ModuleDeclaration moduleDeclaration) {
    return moduleDeclaration.findAll(ModuleRequiresDirective.class).stream()
        .map(ModuleRequiresDirective::getNameAsString);
  }

  private Stream<String> exportedPackagesAndTargetModules(final ModuleDeclaration moduleDeclaration) {
    return moduleDeclaration.findAll(ModuleExportsDirective.class).stream()
        .flatMap(exportsDirective -> Stream.concat(
            Stream.of(exportsDirective.getNameAsString()),
            exportsDirective.getModuleNames().stream().map(Name::asString)));
  }

  private Stream<String> openedPackagesAndTargetModules(final ModuleDeclaration moduleDeclaration) {
    return moduleDeclaration.findAll(ModuleOpensDirective.class).stream()
        .flatMap(opensDirective -> Stream.concat(
            Stream.of(opensDirective.getNameAsString()),
            opensDirective.getModuleNames().stream().map(Name::asString)));
  }

  private Stream<String> usedTypePackages(final ModuleDeclaration moduleDeclaration) {
    return moduleDeclaration.findAll(ModuleUsesDirective.class).stream()
        .map(ModuleUsesDirective::getNameAsString)
        .map(this::packageFromQualifiedTypeName)
        .filter(Objects::nonNull);
  }

  private Stream<String> providedTypePackages(final ModuleDeclaration moduleDeclaration) {
    return moduleDeclaration.findAll(ModuleProvidesDirective.class).stream()
        .flatMap(providesDirective -> Stream.concat(
            Stream.of(providesDirective.getNameAsString()),
            providesDirective.getWith().stream().map(Name::asString)))
        .map(this::packageFromQualifiedTypeName)
        .filter(Objects::nonNull);
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

  private boolean startsWithUppercase(final String segment) {
    return !segment.isEmpty() && Character.isUpperCase(segment.charAt(0));
  }
}
