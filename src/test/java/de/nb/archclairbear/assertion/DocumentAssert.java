package de.nb.archclairbear.assertion;

import org.assertj.core.api.AbstractAssert;
import org.jsoup.nodes.Document;
import org.jsoup.select.Elements;

@SuppressWarnings("UnusedReturnValue")
public class DocumentAssert extends AbstractAssert<DocumentAssert, Document> {

  public DocumentAssert(final Document actual) {
    super(actual, DocumentAssert.class);
  }

  public DocumentAssert hasElement(final String cssQuery) {
    isNotNull();

    Elements matches = actual.select(cssQuery);
    if (matches.isEmpty()) {
      failWithMessage("Expected document to contain element matching <%s>, but found none.", cssQuery);
    }

    return this;
  }

  public DocumentAssert doesNotHaveElement(final String cssQuery) {
    isNotNull();

    Elements matches = actual.select(cssQuery);
    if (!matches.isEmpty()) {
      failWithMessage("Expected NO element matching <%s>, but found %d such elements.", cssQuery, matches.size());
    }

    return this;
  }

  public DocumentAssert contains(final String text) {
    isNotNull();

    String actualText = actual.toString();
    if (!actualText.contains(text)) {
      failWithMessage("Expected document to contain <%s>, which it did not.", text);
    }

    return this;
  }
}
