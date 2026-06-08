package de.nb.archclairbear.assertion;

import com.fasterxml.jackson.databind.JsonNode;
import org.jsoup.nodes.Document;

public class ArchClairBearAssertions {
  private ArchClairBearAssertions() {
  }

  public static DocumentAssert assertThat(final Document actual) {
    return new DocumentAssert(actual);
  }

  public static GraphJsonAssert assertThat(final JsonNode actual) {
    return new GraphJsonAssert(actual);
  }
}
