package de.nb.archclairbear.config;

import java.nio.file.Path;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web-Konfiguration für statische Ressourcen.
 */
@Configuration
class WebConfig implements WebMvcConfigurer {

  @Override
  public void addResourceHandlers(final ResourceHandlerRegistry registry) {
    registry.addResourceHandler("/webjars/**")
        .addResourceLocations("classpath:/META-INF/resources/webjars/");

    registry.addResourceHandler("/vendor/elkjs/**")
        .addResourceLocations(Path.of(System.getProperty("user.dir"), "node_modules", "elkjs", "lib").toUri().toString());
  }
}
