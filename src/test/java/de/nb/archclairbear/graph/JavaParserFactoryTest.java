package de.nb.archclairbear.graph;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class JavaParserFactoryTest {
  private final JavaParserFactory factory = new JavaParserFactory();

  @Test
  void createReturnsParserForCurrentPatternSyntax() {
    // GIVEN
    var source = """
        package a.foo;
        class Source {
          String describe(Object value) {
            return switch (value) {
              case b.bar.Target(c.qux.Inner(String name)) -> name;
              default -> "";
            };
          }
        }
        """;

    // WHEN
    var result = factory.create().parse(source);

    // THEN
    assertThat(result.isSuccessful()).isTrue();
    assertThat(result.getResult()).isPresent();
  }
}
