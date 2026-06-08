package de.nb.archclairbear.assertion;

import org.jsoup.nodes.Document;

public class ArchClairBearAssertions {
  private ArchClairBearAssertions() {
  }

  public static DocumentAssert assertThat(final Document actual) {
    return new DocumentAssert(actual);
  }
}
