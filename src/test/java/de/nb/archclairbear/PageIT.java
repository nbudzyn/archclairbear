package de.nb.archclairbear;

import static de.nb.archclairbear.assertion.ArchclairbearAssertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PageIT {
  @Autowired
  private MockMvc mockMvc;

  @Test
  void slashOnlyReturnsAPage() throws Exception {
    // WENN
    String html = mockMvc.perform(get("/"))//
        // THEN
        .andExpect(status().isOk()) //
        .andReturn().getResponse().getContentAsString();

    Document doc = Jsoup.parse(html);

    assertThat(doc) //
        // Can't test more here.
        .contains("<html>");
  }

  @Test
  void indexShowsSomePage() throws Exception {
    // WENN
    String html = mockMvc.perform(get("/index.html"))//
        // THEN
        .andExpect(status().isOk()) //
        .andReturn().getResponse().getContentAsString();

    Document doc = Jsoup.parse(html);

    assertThat(doc) //
        .contains("ArchClairBear") //
        .contains("Running Skeleton: Startseite aktiv");
  }
}