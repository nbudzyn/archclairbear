package de.nb.archclairbear.graph;

import static org.assertj.core.api.Assertions.assertThat;

import com.github.javaparser.StaticJavaParser;
import com.github.javaparser.ast.CompilationUnit;
import org.junit.jupiter.api.Test;

class ImportDependencyAnalyzerTest {
  private final ImportDependencyAnalyzer analyzer = new ImportDependencyAnalyzer();

  @Test
  void analyzeReturnsNoDependencyForSourceWithoutImports() {
    // GIVEN
    var compilationUnit = parse("package a.foo; class Source {}");

    // WHEN
    var dependencies = analyzer.analyze(compilationUnit);

    // THEN
    assertThat(dependencies).isEmpty();
  }

  @Test
  void analyzeReturnsDependencyForImportFromAnotherPackage() {
    // GIVEN
    var compilationUnit = parse("""
        package a.foo;
        import b.bar.Target;
        class Source {}
        """);

    // WHEN
    var dependencies = analyzer.analyze(compilationUnit);

    // THEN
    assertThat(dependencies)
        .containsExactly(new RawDependency("a.foo", "b.bar"));
  }

  @Test
  void analyzeReturnsMultipleDependenciesFromOneClass() {
    // GIVEN
    var compilationUnit = parse("""
        package a.foo;
        import b.bar.First;
        import c.baz.Second;
        class Source {}
        """);

    // WHEN
    var dependencies = analyzer.analyze(compilationUnit);

    // THEN
    assertThat(dependencies)
        .containsExactly(
            new RawDependency("a.foo", "b.bar"),
            new RawDependency("a.foo", "c.baz"));
  }

  @Test
  void analyzeReturnsMultipleDependenciesFromDifferentClasses() {
    // GIVEN
    var firstCompilationUnit = parse("""
        package a.foo;
        import b.bar.First;
        class FirstSource {}
        """);
    var secondCompilationUnit = parse("""
        package c.baz;
        import d.qux.Second;
        class SecondSource {}
        """);

    // WHEN
    var dependencies = java.util.stream.Stream
        .concat(analyzer.analyze(firstCompilationUnit).stream(), analyzer.analyze(secondCompilationUnit).stream())
        .toList();

    // THEN
    assertThat(dependencies)
        .containsExactly(
            new RawDependency("a.foo", "b.bar"),
            new RawDependency("c.baz", "d.qux"));
  }

  @Test
  void analyzeDeduplicatesEqualDependencies() {
    // GIVEN
    var compilationUnit = parse("""
        package a.foo;
        import b.bar.First;
        import b.bar.Second;
        class Source {}
        """);

    // WHEN
    var dependencies = analyzer.analyze(compilationUnit);

    // THEN
    assertThat(dependencies)
        .containsExactly(new RawDependency("a.foo", "b.bar"));
  }

  @Test
  void analyzeRemovesDirectLoops() {
    // GIVEN
    var compilationUnit = parse("""
        package a.foo;
        import a.foo.Target;
        class Source {}
        """);

    // WHEN
    var dependencies = analyzer.analyze(compilationUnit);

    // THEN
    assertThat(dependencies).isEmpty();
  }

  @Test
  void analyzeUsesWildcardImportPackageAsTargetPackage() {
    // GIVEN
    var compilationUnit = parse("""
        package a.foo;
        import b.bar.*;
        class Source {}
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
