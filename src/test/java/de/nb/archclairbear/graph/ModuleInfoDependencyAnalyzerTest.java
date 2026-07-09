package de.nb.archclairbear.graph;

import static org.assertj.core.api.Assertions.assertThat;

import com.github.javaparser.StaticJavaParser;
import com.github.javaparser.ast.CompilationUnit;
import org.junit.jupiter.api.Test;

class ModuleInfoDependencyAnalyzerTest {
  private final ModuleInfoDependencyAnalyzer analyzer = new ModuleInfoDependencyAnalyzer();

  @Test
  void analyzeReturnsNoDependencyForSourceWithoutModuleDeclaration() {
    // GIVEN
    var compilationUnit = parse("package a.foo; class Source {}");

    // WHEN
    var dependencies = analyzer.analyze(compilationUnit);

    // THEN
    assertThat(dependencies).isEmpty();
  }

  @Test
  void analyzeReturnsDependencyForRequiredModule() {
    // GIVEN
    var compilationUnit = parse("""
        module a.foo {
          requires b.bar;
        }
        """);

    // WHEN
    var dependencies = analyzer.analyze(compilationUnit);

    // THEN
    assertThat(dependencies)
        .containsExactly(new RawDependency("a.foo", "b.bar"));
  }

  @Test
  void analyzeReturnsDependencyForExportedPackageAndTargetModule() {
    // GIVEN
    var compilationUnit = parse("""
        module a.foo {
          exports a.foo.api to b.bar;
        }
        """);

    // WHEN
    var dependencies = analyzer.analyze(compilationUnit);

    // THEN
    assertThat(dependencies)
        .containsExactly(
            new RawDependency("a.foo", "a.foo.api"),
            new RawDependency("a.foo", "b.bar"));
  }

  @Test
  void analyzeReturnsDependencyForOpenedPackageAndTargetModule() {
    // GIVEN
    var compilationUnit = parse("""
        module a.foo {
          opens a.foo.internal to b.bar;
        }
        """);

    // WHEN
    var dependencies = analyzer.analyze(compilationUnit);

    // THEN
    assertThat(dependencies)
        .containsExactly(
            new RawDependency("a.foo", "a.foo.internal"),
            new RawDependency("a.foo", "b.bar"));
  }

  @Test
  void analyzeReturnsDependencyForUsedTypePackageWithoutImport() {
    // GIVEN
    var compilationUnit = parse("""
        module a.foo {
          uses b.bar.Target;
        }
        """);

    // WHEN
    var dependencies = analyzer.analyze(compilationUnit);

    // THEN
    assertThat(dependencies)
        .containsExactly(new RawDependency("a.foo", "b.bar"));
  }

  @Test
  void analyzeReturnsDependencyForProvidedServiceAndImplementationPackagesWithoutImport() {
    // GIVEN
    var compilationUnit = parse("""
        module a.foo {
          provides b.bar.Service with a.foo.internal.ServiceImpl, c.baz.SecondServiceImpl;
        }
        """);

    // WHEN
    var dependencies = analyzer.analyze(compilationUnit);

    // THEN
    assertThat(dependencies)
        .containsExactly(
            new RawDependency("a.foo", "a.foo.internal"),
            new RawDependency("a.foo", "b.bar"),
            new RawDependency("a.foo", "c.baz"));
  }

  @Test
  void analyzeDeduplicatesEqualDependenciesAndRemovesDirectLoops() {
    // GIVEN
    var compilationUnit = parse("""
        module a.foo {
          requires a.foo;
          requires b.bar;
          uses b.bar.First;
          uses b.bar.Second;
        }
        """);

    // WHEN
    var dependencies = analyzer.analyze(compilationUnit);

    // THEN
    assertThat(dependencies)
        .containsExactly(new RawDependency("a.foo", "b.bar"));
  }

  private CompilationUnit parse(final String source) {
    return StaticJavaParser.parse(source);
  }
}
