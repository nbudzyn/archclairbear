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
  void analyzeReturnsDependencyForQualifiedLowercaseFieldTypeWithoutImport() {
    // GIVEN
    var compilationUnit = parse("""
        package a.foo;
        class Source {
          b.bar.target target;
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
  void analyzeReturnsDependencyForImportedNestedTypeUse() {
    // GIVEN
    var compilationUnit = parse("""
        package a.foo;
        import b.bar.Target;
        class Source {
          Target.Inner target;
        }
        """);

    // WHEN
    var dependencies = analyzer.analyze(compilationUnit);

    // THEN
    assertThat(dependencies)
        .containsExactly(new RawDependency("a.foo", "b.bar"));
  }

  @Test
  void analyzeReturnsDependencyForDirectlyImportedNestedTypeUse() {
    // GIVEN
    var compilationUnit = parse("""
        package a.foo;
        import b.bar.Outer.Inner;
        class Source {
          Inner target;
        }
        """);

    // WHEN
    var dependencies = analyzer.analyze(compilationUnit);

    // THEN
    assertThat(dependencies)
        .containsExactly(new RawDependency("a.foo", "b.bar"));
  }

  @Test
  void analyzeReturnsDependencyForQualifiedNestedTypeUseWithoutImport() {
    // GIVEN
    var compilationUnit = parse("""
        package a.foo;
        class Source {
          b.bar.Target.Inner target;
        }
        """);

    // WHEN
    var dependencies = analyzer.analyze(compilationUnit);

    // THEN
    assertThat(dependencies)
        .containsExactly(new RawDependency("a.foo", "b.bar"));
  }

  @Test
  void analyzeReturnsDependencyForDeepQualifiedNestedTypeUseWithoutImport() {
    // GIVEN
    var compilationUnit = parse("""
        package a.foo;
        class Source {
          b.bar.Outer.Inner target;
        }
        """);

    // WHEN
    var dependencies = analyzer.analyze(compilationUnit);

    // THEN
    assertThat(dependencies)
        .containsExactly(new RawDependency("a.foo", "b.bar"));
  }

  @Test
  void analyzeReturnsDependencyForImportedSuperClass() {
    // GIVEN
    var compilationUnit = parse("""
        package a.foo;
        import b.bar.Target;
        class Source extends Target {
        }
        """);

    // WHEN
    var dependencies = analyzer.analyze(compilationUnit);

    // THEN
    assertThat(dependencies)
        .containsExactly(new RawDependency("a.foo", "b.bar"));
  }

  @Test
  void analyzeReturnsDependencyForQualifiedSuperClassWithoutImport() {
    // GIVEN
    var compilationUnit = parse("""
        package a.foo;
        class Source extends b.bar.Target {
        }
        """);

    // WHEN
    var dependencies = analyzer.analyze(compilationUnit);

    // THEN
    assertThat(dependencies)
        .containsExactly(new RawDependency("a.foo", "b.bar"));
  }

  @Test
  void analyzeReturnsDependencyForImportedImplementedInterface() {
    // GIVEN
    var compilationUnit = parse("""
        package a.foo;
        import b.bar.Target;
        class Source implements Target {
        }
        """);

    // WHEN
    var dependencies = analyzer.analyze(compilationUnit);

    // THEN
    assertThat(dependencies)
        .containsExactly(new RawDependency("a.foo", "b.bar"));
  }

  @Test
  void analyzeReturnsDependencyForQualifiedImplementedInterfaceWithoutImport() {
    // GIVEN
    var compilationUnit = parse("""
        package a.foo;
        class Source implements b.bar.Target {
        }
        """);

    // WHEN
    var dependencies = analyzer.analyze(compilationUnit);

    // THEN
    assertThat(dependencies)
        .containsExactly(new RawDependency("a.foo", "b.bar"));
  }

  @Test
  void analyzeReturnsDependencyForImportedTypeAnnotation() {
    // GIVEN
    var compilationUnit = parse("""
        package a.foo;
        import b.bar.Target;
        @Target
        class Source {
        }
        """);

    // WHEN
    var dependencies = analyzer.analyze(compilationUnit);

    // THEN
    assertThat(dependencies)
        .containsExactly(new RawDependency("a.foo", "b.bar"));
  }

  @Test
  void analyzeReturnsDependencyForQualifiedTypeAnnotationWithoutImport() {
    // GIVEN
    var compilationUnit = parse("""
        package a.foo;
        @b.bar.Target
        class Source {
        }
        """);

    // WHEN
    var dependencies = analyzer.analyze(compilationUnit);

    // THEN
    assertThat(dependencies)
        .containsExactly(new RawDependency("a.foo", "b.bar"));
  }

  @Test
  void analyzeReturnsDependencyForQualifiedLowercaseTypeAnnotationWithoutImport() {
    // GIVEN
    var compilationUnit = parse("""
        package a.foo;
        @b.bar.target
        class Source {
        }
        """);

    // WHEN
    var dependencies = analyzer.analyze(compilationUnit);

    // THEN
    assertThat(dependencies)
        .containsExactly(new RawDependency("a.foo", "b.bar"));
  }

  @Test
  void analyzeReturnsDependencyForImportedFieldAnnotation() {
    // GIVEN
    var compilationUnit = parse("""
        package a.foo;
        import b.bar.Target;
        class Source {
          @Target String value;
        }
        """);

    // WHEN
    var dependencies = analyzer.analyze(compilationUnit);

    // THEN
    assertThat(dependencies)
        .containsExactly(new RawDependency("a.foo", "b.bar"));
  }

  @Test
  void analyzeReturnsDependencyForQualifiedFieldAnnotationWithoutImport() {
    // GIVEN
    var compilationUnit = parse("""
        package a.foo;
        class Source {
          @b.bar.Target String value;
        }
        """);

    // WHEN
    var dependencies = analyzer.analyze(compilationUnit);

    // THEN
    assertThat(dependencies)
        .containsExactly(new RawDependency("a.foo", "b.bar"));
  }

  @Test
  void analyzeReturnsDependencyForImportedMethodAnnotation() {
    // GIVEN
    var compilationUnit = parse("""
        package a.foo;
        import b.bar.Target;
        class Source {
          @Target void act() {
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
  void analyzeReturnsDependencyForQualifiedMethodAnnotationWithoutImport() {
    // GIVEN
    var compilationUnit = parse("""
        package a.foo;
        class Source {
          @b.bar.Target void act() {
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
  void analyzeReturnsDependencyForImportedParameterAnnotation() {
    // GIVEN
    var compilationUnit = parse("""
        package a.foo;
        import b.bar.Target;
        class Source {
          void act(@Target String value) {
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
  void analyzeReturnsDependencyForQualifiedParameterAnnotationWithoutImport() {
    // GIVEN
    var compilationUnit = parse("""
        package a.foo;
        class Source {
          void act(@b.bar.Target String value) {
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
  void analyzeReturnsDependencyForImportedStaticMethodCall() {
    // GIVEN
    var compilationUnit = parse("""
        package a.foo;
        import b.bar.Target;
        class Source {
          void act() {
            Target.create();
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
  void analyzeReturnsDependencyForQualifiedStaticMethodCallWithoutImport() {
    // GIVEN
    var compilationUnit = parse("""
        package a.foo;
        class Source {
          void act() {
            b.bar.Target.create();
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
  void analyzeReturnsDependencyForQualifiedLowercaseStaticMethodCallWithoutImport() {
    // GIVEN
    var compilationUnit = parse("""
        package a.foo;
        class Source {
          void act() {
            b.bar.target.create();
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
  void analyzeReturnsDependencyForImportedStaticFieldAccess() {
    // GIVEN
    var compilationUnit = parse("""
        package a.foo;
        import b.bar.Target;
        class Source {
          String value = Target.VALUE;
        }
        """);

    // WHEN
    var dependencies = analyzer.analyze(compilationUnit);

    // THEN
    assertThat(dependencies)
        .containsExactly(new RawDependency("a.foo", "b.bar"));
  }

  @Test
  void analyzeReturnsDependencyForQualifiedStaticFieldAccessWithoutImport() {
    // GIVEN
    var compilationUnit = parse("""
        package a.foo;
        class Source {
          String value = b.bar.Target.VALUE;
        }
        """);

    // WHEN
    var dependencies = analyzer.analyze(compilationUnit);

    // THEN
    assertThat(dependencies)
        .containsExactly(new RawDependency("a.foo", "b.bar"));
  }

  @Test
  void analyzeReturnsDependencyForQualifiedLowercaseStaticFieldAccessWithoutImport() {
    // GIVEN
    var compilationUnit = parse("""
        package a.foo;
        class Source {
          String value = b.bar.target.VALUE;
        }
        """);

    // WHEN
    var dependencies = analyzer.analyze(compilationUnit);

    // THEN
    assertThat(dependencies)
        .containsExactly(new RawDependency("a.foo", "b.bar"));
  }

  @Test
  void analyzeReturnsDependencyForQualifiedStaticFieldAccessOnNestedTypeWithoutImport() {
    // GIVEN
    var compilationUnit = parse("""
        package a.foo;
        class Source {
          String value = b.bar.Outer.Inner.VALUE;
        }
        """);

    // WHEN
    var dependencies = analyzer.analyze(compilationUnit);

    // THEN
    assertThat(dependencies)
        .containsExactly(new RawDependency("a.foo", "b.bar"));
  }

  @Test
  void analyzeReturnsDependencyForImportedMethodReference() {
    // GIVEN
    var compilationUnit = parse("""
        package a.foo;
        import b.bar.Target;
        class Source {
          Runnable value = Target::create;
        }
        """);

    // WHEN
    var dependencies = analyzer.analyze(compilationUnit);

    // THEN
    assertThat(dependencies)
        .containsExactly(new RawDependency("a.foo", "b.bar"));
  }

  @Test
  void analyzeReturnsDependencyForQualifiedMethodReferenceWithoutImport() {
    // GIVEN
    var compilationUnit = parse("""
        package a.foo;
        class Source {
          Runnable value = b.bar.Target::create;
        }
        """);

    // WHEN
    var dependencies = analyzer.analyze(compilationUnit);

    // THEN
    assertThat(dependencies)
        .containsExactly(new RawDependency("a.foo", "b.bar"));
  }

  @Test
  void analyzeReturnsDependencyForQualifiedLowercaseMethodReferenceWithoutImport() {
    // GIVEN
    var compilationUnit = parse("""
        package a.foo;
        class Source {
          Runnable value = b.bar.target::create;
        }
        """);

    // WHEN
    var dependencies = analyzer.analyze(compilationUnit);

    // THEN
    assertThat(dependencies)
        .containsExactly(new RawDependency("a.foo", "b.bar"));
  }

  @Test
  void analyzeIgnoresLowercaseObjectFieldAccess() {
    // GIVEN
    var compilationUnit = parse("""
        package a.foo;
        class Source {
          String value = target.inner.value;
        }
        """);

    // WHEN
    var dependencies = analyzer.analyze(compilationUnit);

    // THEN
    assertThat(dependencies).isEmpty();
  }

  @Test
  void analyzeIgnoresNonNameMethodCallScopes() {
    // GIVEN
    var compilationUnit = parse("""
        package a.foo;
        class Source {
          void act() {
            new b.bar.Target().act();
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
