package de.nb.archclairbear.graph;

import com.github.javaparser.JavaParser;
import com.github.javaparser.ParserConfiguration;

/**
 * JavaParser-Erzeugung.
 */
class JavaParserFactory {

  JavaParser create() {
    var configuration = new ParserConfiguration();
    try {
      configuration.setLanguageLevel(ParserConfiguration.LanguageLevel.valueOf("JAVA_26"));
    } catch (final IllegalArgumentException exception) {
      try {
        configuration.setLanguageLevel(ParserConfiguration.LanguageLevel.valueOf("JAVA_25"));
      } catch (final IllegalArgumentException ignored) {
        try {
          configuration.setLanguageLevel(ParserConfiguration.LanguageLevel.valueOf("JAVA_21"));
        } catch (final IllegalArgumentException alsoIgnored) {
          // Falls die Library keine neuere Sprachstufe kennt, bleibt die Default-Konfiguration aktiv.
        }
      }
    }

    return new JavaParser(configuration);
  }
}
