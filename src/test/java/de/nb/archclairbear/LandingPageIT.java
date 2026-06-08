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
        .contains("Platzhalter für den Graphen");

    assertThat(doc) //
        .hasElement("h1.app-title") //
        .hasElement("main.graph-area") //
        .hasElement(".placeholder");
  }
}
