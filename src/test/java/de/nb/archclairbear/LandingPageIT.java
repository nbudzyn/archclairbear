package de.nb.archclairbear;

import static de.nb.archclairbear.assertion.ArchClairBearAssertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.forwardedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.nio.charset.StandardCharsets;

import org.jsoup.Jsoup;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class LandingPageIT {
  @Autowired
  private MockMvc mockMvc;

  @Test
  void slashOnlyReturnsTheLandingPage() throws Exception {
    // WHEN
    mockMvc.perform(get("/"))
        // THEN
        .andExpect(status().isOk()) //
        .andExpect(forwardedUrl("index.html"));
  }

  @Test
  void indexShowsLandingPage() throws Exception {
    // WHEN
    var html = mockMvc.perform(get("/index.html"))//
        // THEN
        .andExpect(status().isOk()) //
        .andReturn().getResponse().getContentAsString(StandardCharsets.UTF_8);

    var doc = Jsoup.parse(html);

    assertThat(doc) //
        .contains("ArchClairBear") //
        .contains("Cytoscape") //
        .contains("Packages und Typen lassen sich per Doppelklick auf- und wieder zuklappen.") //
        .contains("Graphdaten werden geladen") //
        .doesNotHaveElement(".placeholder");

    assertThat(doc) //
        .hasElement("h1") //
        .hasElement("main.graph-frame") //
        .hasElement("#graph-status[role=\"status\"]") //
        .hasElement("#graph-error[role=\"alert\"]") //
        .hasElement("#graph-error[hidden]") //
        .hasElement("#cy") //
        .hasElement("script[src=\"/webjars/cytoscape/3.33.1/dist/cytoscape.min.js\"]") //
        .hasElement("script[src=\"/vendor/elkjs/elk.bundled.js\"]") //
        .hasElement("script[src=\"/graph-app.js?v=package-boxes-16\"]");
  }

  @Test
  void indexContainsErrorFallbackMarkup() throws Exception {
    // WHEN
    var html = mockMvc.perform(get("/index.html"))//
        // THEN
        .andExpect(status().isOk()) //
        .andReturn().getResponse().getContentAsString(StandardCharsets.UTF_8);

    var doc = Jsoup.parse(html);

    assertThat(doc) //
        .contains("Der Graph konnte nicht geladen werden") //
        .hasElement("#graph-error[role=\"alert\"]") //
        .hasElement("#graph-error[hidden]");
  }
}
