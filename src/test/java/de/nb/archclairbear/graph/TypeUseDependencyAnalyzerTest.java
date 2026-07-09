package de.nb.archclairbear.graph;

import static org.assertj.core.api.Assertions.assertThat;

import com.github.javaparser.StaticJavaParser;
import com.github.javaparser.ast.CompilationUnit;
import org.junit.jupiter.api.Test;

class TypeUseDependencyAnalyzerTest {
  private final TypeUseDependencyAnalyzer analyzer = new TypeUseDependencyAnalyzer();

  @Test
  void analyzeReturnsNoDependencyForSourceWithoutExternalTypeUse() {
    // GIVEN
    var compilationUnit = parse("package a.foo; class Source { String text; }");

    // WHEN
    var dependencies = analyzer.analyze(compilationUnit);

    // THEN
    assertThat(dependencies).isEmpty();
  }

  @Test
  void analyzeReturnsDependencyForImportedFieldType() {
    // GIVEN
    var compilationUnit = parse("""
        package a.foo;
        import b.bar.Target;
        class Source {
          Target target;
        }
        """);

    // WHEN
    var dependencies = analyzer.analyze(compilationUnit);

    // THEN
    assertThat(dependencies)
        .containsExactly(new RawDependency("a.foo", "b.bar"));
  }

  @Test
  void analyzeReturnsDependencyForQualifiedFieldTypeWithoutImport() {
    // GIVEN
    var compilationUnit = parse("""
        package a.foo;
        class Source {
          b.bar.Target target;
        }
        """);

    // WHEN
    var dependencies = analyzer.analyze(compilationUnit);

    // THEN
    assertThat(dependencies)
        .containsExactly(new RawDependency("a.foo", "b.bar"));
  }

  @Test
  void analyzeReturnsDependencyForImportedMethodParameterType() {
    // GIVEN
    var compilationUnit = parse("""
        package a.foo;
        import b.bar.Target;
        class Source {
          void act(Target target) {
          }
        }
        """);

    // WHEN
    var dependencies = analyzer.analyze(compilationUnit);

    // THEN
    assertThat(dependencies)
        .containsExactly(new RawDependency("a.foo", "b.bar"));
  }

  @Test
  void analyzeReturnsDependencyForQualifiedMethodParameterTypeWithoutImport() {
    // GIVEN
    var compilationUnit = parse("""
        package a.foo;
        class Source {
          void act(b.bar.Target target) {
          }
        }
        """);

    // WHEN
    var dependencies = analyzer.analyze(compilationUnit);

    // THEN
    assertThat(dependencies)
        .containsExactly(new RawDependency("a.foo", "b.bar"));
  }

  @Test
  void analyzeReturnsDependencyForImportedMethodReturnType() {
    // GIVEN
    var compilationUnit = parse("""
        package a.foo;
        import b.bar.Target;
        class Source {
          Target create() {
            return null;
          }
        }
        """);

    // WHEN
    var dependencies = analyzer.analyze(compilationUnit);

    // THEN
    assertThat(dependencies)
        .containsExactly(new RawDependency("a.foo", "b.bar"));
  }

  @Test
  void analyzeReturnsDependencyForQualifiedMethodReturnTypeWithoutImport() {
    // GIVEN
    var compilationUnit = parse("""
        package a.foo;
        class Source {
          b.bar.Target create() {
            return null;
          }
        }
        """);

    // WHEN
    var dependencies = analyzer.analyze(compilationUnit);

    // THEN
    assertThat(dependencies)
        .containsExactly(new RawDependency("a.foo", "b.bar"));
  }

  @Test
  void analyzeReturnsDependencyForImportedGenericTypeUse() {
    // GIVEN
    var compilationUnit = parse("""
        package a.foo;
        import b.bar.Target;
        class Source {
          Box<Target> target;
        }
        """);

    // WHEN
    var dependencies = analyzer.analyze(compilationUnit);

    // THEN
    assertThat(dependencies)
        .containsExactly(new RawDependency("a.foo", "b.bar"));
  }

  @Test
  void analyzeReturnsDependencyForQualifiedGenericTypeUseWithoutImport() {
    // GIVEN
    var compilationUnit = parse("""
        package a.foo;
        class Source {
          Box<b.bar.Target> target;
        }
        """);

    // WHEN
    var dependencies = analyzer.analyze(compilationUnit);

    // THEN
    assertThat(dependencies)
        .containsExactly(new RawDependency("a.foo", "b.bar"));
  }

  @Test
  void analyzeDeduplicatesEqualTypeUseDependencies() {
    // GIVEN
    var compilationUnit = parse("""
        package a.foo;
        import b.bar.Target;
        class Source {
          Target field;
          Target create(Target target) {
            return target;
          }
        }
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
        class Source {
          a.foo.Target target;
        }
        """);

    // WHEN
    var dependencies = analyzer.analyze(compilationUnit);

    // THEN
    assertThat(dependencies).isEmpty();
  }

  private CompilationUnit parse(final String source) {
    return StaticJavaParser.parse(source);
  }
}
