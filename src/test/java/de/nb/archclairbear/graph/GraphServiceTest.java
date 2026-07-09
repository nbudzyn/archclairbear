package de.nb.archclairbear.graph;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class GraphServiceTest {

  @TempDir
  private Path tempDir;

  @Test
  void rootGraphReturnsTheCommonRootPackageFromPackageDeclarations() throws IOException {
    // GIVEN
    createJavaSource(
        "package de.aventiure.lay05_being; class First {}",
        "nested", "layout", "First.java");
    createJavaSource(
        "package de.aventiure.lay05_being.model; class Second {}",
        "another", "layout", "Second.java");
    var graphService = new GraphService(tempDir);

    // WHEN
    var graph = graphService.rootGraph();

    // THEN
    assertThat(graph.nodes())
        .containsExactly(new GraphNode("de.aventiure.lay05_being", "package", "de.aventiure.lay05_being", true, null));
    assertThat(graph.rawDependencies()).isEmpty();
    assertThat(graph.statusMessage()).isNull();
  }

  @Test
  void packageGraphReturnsTopLevelTypesFromThePackageAndSkipsNestedTypes() throws IOException {
    // GIVEN
    createJavaSource(
        """
            package de.aventiure.lay05_being;

            enum Kind {
              A
            }

            record SampleRecord(int value) {
            }

            @interface Marker {
            }

            class PackagePrivateType {
            }

            class Outer {
              class Nested {
              }
            }
            """,
        "wrong", "layout", "Types.java");
    createJavaSource(
        "package de.aventiure.lay05_being.model; class ChildType {}",
        "another", "layout", "ChildType.java");
    var graphService = new GraphService(tempDir);

    // WHEN
    var graph = graphService.packageGraph("de.aventiure.lay05_being");

    // THEN
    assertThat(graph.nodes())
        .containsExactly(
            new GraphNode("de.aventiure.lay05_being.model", "package", "model", true, "de.aventiure.lay05_being"),
            new GraphNode("de.aventiure.lay05_being.Kind", "type", "Kind", false, "de.aventiure.lay05_being"),
            new GraphNode("de.aventiure.lay05_being.Marker", "type", "Marker", false, "de.aventiure.lay05_being"),
            new GraphNode("de.aventiure.lay05_being.Outer", "type", "Outer", true, "de.aventiure.lay05_being"),
            new GraphNode("de.aventiure.lay05_being.PackagePrivateType", "type", "PackagePrivateType", false, "de.aventiure.lay05_being"),
            new GraphNode("de.aventiure.lay05_being.SampleRecord", "type", "SampleRecord", false, "de.aventiure.lay05_being"));
    assertThat(graph.statusMessage()).isNull();
  }

  @Test
  void typeGraphReturnsImmediateNestedTypesRecursively() throws IOException {
    // GIVEN
    createJavaSource(
        """
            package de.aventiure;

            class Outer {
              class Inner {
                class Deep {
                }
              }

              private static class PrivateInner {
              }

              void method() {
                class Local {
                }

                Runnable runnable = new Runnable() {
                  @Override
                  public void run() {
                  }
                };
              }
            }

            class TopLevel {
            }
            """,
        "nested", "layout", "Types.java");
    var graphService = new GraphService(tempDir);

    // WHEN
    var outerGraph = graphService.typeGraph("de.aventiure.Outer");
    var innerGraph = graphService.typeGraph("de.aventiure.Outer.Inner");

    // THEN
    assertThat(outerGraph.nodes())
        .containsExactly(
            new GraphNode("de.aventiure.Outer.Inner", "type", "Inner", true, "de.aventiure.Outer"),
            new GraphNode("de.aventiure.Outer.PrivateInner", "type", "PrivateInner", false, "de.aventiure.Outer"));
    assertThat(outerGraph.statusMessage()).isNull();

    assertThat(innerGraph.nodes())
        .containsExactly(
            new GraphNode("de.aventiure.Outer.Inner.Deep", "type", "Deep", false, "de.aventiure.Outer.Inner"));
    assertThat(innerGraph.statusMessage()).isNull();
  }

  @Test
  void rootGraphReturnsTheDefaultPackageWhenNoPackageDeclarationExists() throws IOException {
    // GIVEN
    createJavaSource("class DefaultThing {}", "DefaultThing.java");
    var graphService = new GraphService(tempDir);

    // WHEN
    var graph = graphService.rootGraph();

    // THEN
    assertThat(graph.nodes())
        .containsExactly(new GraphNode("(default)", "package", "(default)", true, null));
    assertThat(graph.rawDependencies()).isEmpty();
    assertThat(graph.statusMessage()).isNull();
  }

  @Test
  void rootGraphReportsPartialAnalysisWithAStatusHintWhenAFileHasParseProblems() throws IOException {
    // GIVEN
    createJavaSource("package de.aventiure; class ValidType {}", "ValidType.java");
    createJavaSource("package de.aventiure; class BrokenType { void oops( }", "BrokenType.java");
    var graphService = new GraphService(tempDir);

    // WHEN
    var graph = graphService.rootGraph();

    // THEN
    assertThat(graph.nodes())
        .containsExactly(new GraphNode("de.aventiure", "package", "de.aventiure", true, null));
    assertThat(graph.rawDependencies()).isEmpty();
    assertThat(graph.statusMessage())
        .isEqualTo("Teilweise analysiert: 1 Datei konnte nicht vollständig gelesen werden.");
  }

  @Test
  void rootGraphReturnsRawDependenciesFromImports() throws IOException {
    // GIVEN
    createJavaSource(
        """
            package de.aventiure.story;
            import de.aventiure.common.CommonType;
            class StoryType {}
            """,
        "story", "StoryType.java");
    createJavaSource(
        "package de.aventiure.common; class CommonType {}",
        "common", "CommonType.java");
    var graphService = new GraphService(tempDir);

    // WHEN
    var graph = graphService.rootGraph();

    // THEN
    assertThat(graph.rawDependencies())
        .containsExactly(new RawDependency("de.aventiure.story", "de.aventiure.common"));
  }

  @Test
  void rootGraphReturnsOnlyRawDependenciesInsideTheInitialPackageTree() throws IOException {
    // GIVEN
    createJavaSource(
        """
            package de.aventiure.story;
            import de.aventiure.common.CommonType;
            import de.outside.OtherType;
            class StoryType {}
            """,
        "story", "StoryType.java");
    createJavaSource(
        "package de.aventiure.common; class CommonType {}",
        "common", "CommonType.java");
    var graphService = new GraphService(tempDir);

    // WHEN
    var graph = graphService.rootGraph();

    // THEN
    assertThat(graph.rawDependencies())
        .containsExactly(new RawDependency("de.aventiure.story", "de.aventiure.common"));
  }

  @Test
  void rootGraphFailsForMissingWorkspaceDirectory() {
    // GIVEN
    var missingDirectory = tempDir.resolve("missing");
    var graphService = new GraphService(missingDirectory);

    // WHEN/THEN
    assertThatExceptionOfType(WorkspacePathNotFoundException.class)
        .isThrownBy(graphService::rootGraph)
        .withMessage("Der Workspace-Pfad " + missingDirectory + " wurde nicht gefunden.");
  }

  private void createJavaSource(final String source, final String... pathSegments) throws IOException {
    var path = tempDir.resolve(Path.of(pathSegments[0], java.util.Arrays.copyOfRange(pathSegments, 1, pathSegments.length)));
    Files.createDirectories(path.getParent());
    Files.writeString(path, source);
  }
}
