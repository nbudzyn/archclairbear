package de.nb.archclairbear.graph;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(properties = "archclairbear.workspace.path=C:\\\\TMP\\\\archclairbear-missing-workspace")
@AutoConfigureMockMvc
@ActiveProfiles("test")
class GraphControllerMissingWorkspaceIT {
  @Autowired
  private MockMvc mockMvc;

  private final ObjectMapper objectMapper = new ObjectMapper();

  @Test
  void rootGraphReturnsMessageForConfiguredMissingWorkspacePath() throws Exception {
    // WHEN
    var response = mockMvc.perform(get("/api/graph/root"))
        // THEN
        .andExpect(status().isNotFound())
        .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
        .andReturn()
        .getResponse()
        .getContentAsString();

    var root = objectMapper.readTree(response);
    assertThat(root.path("message").asText())
        .isEqualTo("Der Workspace-Pfad C:\\TMP\\archclairbear-missing-workspace wurde nicht gefunden.");
  }
}
