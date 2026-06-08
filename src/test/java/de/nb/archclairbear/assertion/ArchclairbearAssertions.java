package de.nb.archclairbear.assertion;

import org.jsoup.nodes.Document;

public class ArchclairbearAssertions {
  private ArchclairbearAssertions() {
  }

  public static DocumentAssert assertThat(final Document actual) {
    return new DocumentAssert(actual);
  }
}
