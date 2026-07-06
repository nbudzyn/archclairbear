package de.nb.archclairbear.graph;

import static de.nb.archclairbear.assertion.ArchClairBearAssertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.nio.file.Files;
import java.nio.file.Path;

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
    Files.createDirectories(tempDir.resolve(Path.of("de", "aventiure", "common")));
    Files.writeString(tempDir.resolve(Path.of("de", "aventiure", "common", "CommonType.java")), "class CommonType {}");
    Files.createDirectories(tempDir.resolve(Path.of("de", "aventiure", "story")));
    Files.writeString(tempDir.resolve(Path.of("de", "aventiure", "story", "StoryType.java")), "class StoryType {}");
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
        .hasNoEdges();
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
