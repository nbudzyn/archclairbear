package de.nb.archclairbear.graph;

import static de.nb.archclairbear.assertion.ArchClairBearAssertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class GraphControllerIT {
  @Autowired
  private MockMvc mockMvc;

  @TempDir
  private Path tempDir;

  private final ObjectMapper objectMapper = new ObjectMapper();

  @Test
  void rootGraphReturnsMinimalGraphJson() throws Exception {
    // GIVEN
    Files.createDirectories(tempDir.resolve(Path.of("nested", "layout", "common")));
    Files.writeString(
        tempDir.resolve(Path.of("nested", "layout", "common", "CommonType.java")),
        "package de.aventiure.common; class CommonType {}");
    Files.createDirectories(tempDir.resolve(Path.of("nested", "layout", "story")));
    Files.writeString(
        tempDir.resolve(Path.of("nested", "layout", "story", "StoryType.java")),
        "package de.aventiure.story; class StoryType {}");
    var controller = new GraphController(new GraphService(tempDir));
    var standaloneMockMvc = MockMvcBuilders.standaloneSetup(controller)
        .setControllerAdvice(new GraphExceptionHandler())
        .build();

    // WHEN
    var response = standaloneMockMvc.perform(get("/api/graph/root"))
        // THEN
        .andExpect(status().isOk())
        .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
        .andReturn()
        .getResponse()
        .getContentAsString();

    var root = objectMapper.readTree(response);
    assertThat(root) //
        .hasSinglePackageNode("de.aventiure", "de.aventiure") //
        .hasEmptyRawDependenciesField() //
        .hasNoEdgesField();
  }

  @Test
  void rootGraphTransportsRawDependencies() throws Exception {
    // GIVEN
    var controller = new GraphController(new GraphService(tempDir) {
      @Override
      GraphResponse rootGraph() {
        return new GraphResponse(
            List.of(new GraphNode("de.aventiure", "package", "de.aventiure", true, null)),
            List.of(new RawDependency("de.aventiure.story", "de.aventiure.common")),
            null);
      }
    });
    var standaloneMockMvc = MockMvcBuilders.standaloneSetup(controller)
        .setControllerAdvice(new GraphExceptionHandler())
        .build();

    // WHEN
    var response = standaloneMockMvc.perform(get("/api/graph/root"))
        // THEN
        .andExpect(status().isOk())
        .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
        .andReturn()
        .getResponse()
        .getContentAsString();

    var root = objectMapper.readTree(response);
    assertThat(root) //
        .hasSinglePackageNode("de.aventiure", "de.aventiure") //
        .hasSingleRawDependency("de.aventiure.story", "de.aventiure.common") //
        .hasNoEdgesField();
  }

  @Test
  void packageGraphReturnsChildrenForExpandedPackage() throws Exception {
    // GIVEN
    Files.createDirectories(tempDir.resolve(Path.of("nested", "layout", "lay05_being", "model", "being")));
    Files.writeString(
        tempDir.resolve(Path.of("nested", "layout", "lay05_being", "BeingLayer.java")),
        "package de.aventiure.lay05_being; class BeingLayer {}");
    Files.writeString(
        tempDir.resolve(Path.of("nested", "layout", "lay05_being", "model", "being", "Being.java")),
        "package de.aventiure.lay05_being.model.being; class Being {}");
    Files.createDirectories(tempDir.resolve(Path.of("nested", "layout", "lay06b_world")));
    Files.writeString(
        tempDir.resolve(Path.of("nested", "layout", "lay06b_world", "World.java")),
        "package de.aventiure.lay06b_world; class World {}");
    var controller = new GraphController(new GraphService(tempDir));
    var standaloneMockMvc = MockMvcBuilders.standaloneSetup(controller)
        .setControllerAdvice(new GraphExceptionHandler())
        .build();

    // WHEN
    var response = standaloneMockMvc.perform(get("/api/graph/package").param("packageName", "de.aventiure"))
        // THEN
        .andExpect(status().isOk())
        .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
        .andReturn()
        .getResponse()
        .getContentAsString();

    var root = objectMapper.readTree(response);
    org.assertj.core.api.Assertions.assertThat(root.path("nodes")).hasSize(2);
    org.assertj.core.api.Assertions.assertThat(root.path("nodes").get(0).path("label").asText()).isEqualTo("lay05_being");
    org.assertj.core.api.Assertions.assertThat(root.path("nodes").get(1).path("label").asText()).isEqualTo("lay06b_world");
    org.assertj.core.api.Assertions.assertThat(root.path("nodes").get(0).path("parentId").asText()).isEqualTo("de.aventiure");
    org.assertj.core.api.Assertions.assertThat(root.path("nodes").get(1).path("parentId").asText()).isEqualTo("de.aventiure");
    org.assertj.core.api.Assertions.assertThat(root.has("rawDependencies")).isFalse();
    org.assertj.core.api.Assertions.assertThat(root.has("edges")).isFalse();
  }

  @Test
  void packageGraphReturnsImmediateChildPackagesAndTypes() throws Exception {
    // GIVEN
    Files.createDirectories(tempDir.resolve(Path.of("nested", "layout", "lay05_being", "model", "being")));
    Files.writeString(
        tempDir.resolve(Path.of("nested", "layout", "lay05_being", "BeingLayer.java")),
        "package de.aventiure.lay05_being; class BeingLayer {}");
    Files.writeString(
        tempDir.resolve(Path.of("nested", "layout", "lay05_being", "model", "being", "Being.java")),
        "package de.aventiure.lay05_being.model.being; class Being {}");
    Files.writeString(
        tempDir.resolve(Path.of("nested", "layout", "lay05_being", "Action.java")),
        "package de.aventiure.lay05_being; class Action {}");
    var controller = new GraphController(new GraphService(tempDir));
    var standaloneMockMvc = MockMvcBuilders.standaloneSetup(controller)
        .setControllerAdvice(new GraphExceptionHandler())
        .build();

    // WHEN
    var response = standaloneMockMvc.perform(get("/api/graph/package").param("packageName", "de.aventiure.lay05_being"))
        // THEN
        .andExpect(status().isOk())
        .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
        .andReturn()
        .getResponse()
        .getContentAsString();

    var root = objectMapper.readTree(response);
    org.assertj.core.api.Assertions.assertThat(root.path("nodes")).hasSize(3);
    org.assertj.core.api.Assertions.assertThat(root.path("nodes").get(0).path("type").asText()).isEqualTo("package");
    org.assertj.core.api.Assertions.assertThat(root.path("nodes").get(0).path("label").asText()).isEqualTo("model");
    org.assertj.core.api.Assertions.assertThat(root.path("nodes").get(0).path("parentId").asText()).isEqualTo("de.aventiure.lay05_being");
    org.assertj.core.api.Assertions.assertThat(root.path("nodes").get(1).path("type").asText()).isEqualTo("type");
    org.assertj.core.api.Assertions.assertThat(root.path("nodes").get(1).path("label").asText()).isEqualTo("Action");
    org.assertj.core.api.Assertions.assertThat(root.path("nodes").get(1).path("parentId").asText()).isEqualTo("de.aventiure.lay05_being");
    org.assertj.core.api.Assertions.assertThat(root.path("nodes").get(2).path("type").asText()).isEqualTo("type");
    org.assertj.core.api.Assertions.assertThat(root.path("nodes").get(2).path("label").asText()).isEqualTo("BeingLayer");
    org.assertj.core.api.Assertions.assertThat(root.path("nodes").get(2).path("parentId").asText()).isEqualTo("de.aventiure.lay05_being");
    org.assertj.core.api.Assertions.assertThat(root.has("rawDependencies")).isFalse();
    org.assertj.core.api.Assertions.assertThat(root.has("edges")).isFalse();
  }

  @Test
  void typeGraphReturnsImmediateNestedTypes() throws Exception {
    // GIVEN
    Files.createDirectories(tempDir.resolve(Path.of("nested", "layout", "de", "aventiure")));
    Files.writeString(
        tempDir.resolve(Path.of("nested", "layout", "de", "aventiure", "Types.java")),
        """
            package de.aventiure;

            class Outer {
              class Inner {
                class Deep {
                }
              }

              private class PrivateInner {
              }
            }
            """);
    var controller = new GraphController(new GraphService(tempDir));
    var standaloneMockMvc = MockMvcBuilders.standaloneSetup(controller)
        .setControllerAdvice(new GraphExceptionHandler())
        .build();

    // WHEN
    var response = standaloneMockMvc.perform(get("/api/graph/type").param("typeId", "de.aventiure.Outer"))
        // THEN
        .andExpect(status().isOk())
        .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
        .andReturn()
        .getResponse()
        .getContentAsString();

    var root = objectMapper.readTree(response);
    org.assertj.core.api.Assertions.assertThat(root.path("nodes")).hasSize(2);
    org.assertj.core.api.Assertions.assertThat(root.path("nodes").get(0).path("type").asText()).isEqualTo("type");
    org.assertj.core.api.Assertions.assertThat(root.path("nodes").get(0).path("label").asText()).isEqualTo("Inner");
    org.assertj.core.api.Assertions.assertThat(root.path("nodes").get(0).path("parentId").asText()).isEqualTo("de.aventiure.Outer");
    org.assertj.core.api.Assertions.assertThat(root.path("nodes").get(1).path("type").asText()).isEqualTo("type");
    org.assertj.core.api.Assertions.assertThat(root.path("nodes").get(1).path("label").asText()).isEqualTo("PrivateInner");
    org.assertj.core.api.Assertions.assertThat(root.path("nodes").get(1).path("parentId").asText()).isEqualTo("de.aventiure.Outer");
    org.assertj.core.api.Assertions.assertThat(root.has("rawDependencies")).isFalse();
    org.assertj.core.api.Assertions.assertThat(root.has("edges")).isFalse();
  }

  @Test
  void cytoscapeWebjarIsServedFromClasspath() throws Exception {
    // WHEN
    mockMvc.perform(get("/webjars/cytoscape/3.33.1/dist/cytoscape.min.js"))
        // THEN
        .andExpect(status().isOk()) //
        .andExpect(content().contentTypeCompatibleWith(MediaType.valueOf("text/javascript")));
  }

  @Test
  void rootGraphReturnsMessageForMissingWorkspacePath() throws Exception {
    // GIVEN
    var missingDirectory = tempDir.resolve("missing");
    var controller = new GraphController(new GraphService(missingDirectory));
    var standaloneMockMvc = MockMvcBuilders.standaloneSetup(controller)
        .setControllerAdvice(new GraphExceptionHandler())
        .build();

    // WHEN
    var response = standaloneMockMvc.perform(get("/api/graph/root"))
        // THEN
        .andExpect(status().isNotFound())
        .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
        .andReturn()
        .getResponse()
        .getContentAsString();

    var root = objectMapper.readTree(response);
    org.assertj.core.api.Assertions.assertThat(root.path("message").asText())
        .isEqualTo("Der Workspace-Pfad " + missingDirectory + " wurde nicht gefunden.");
  }
}
