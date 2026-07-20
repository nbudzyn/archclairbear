package de.nb.archclairbear.graph;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Graph-Controller.
 */
@RestController
class GraphController {
  private final GraphService service;

  GraphController(final GraphService service) {
    this.service = service;
  }

  @GetMapping("/api/graph/root")
  GraphResponse rootGraph(@RequestParam(required = false) final String workspacePath) {
    return service.rootGraph(workspacePath);
  }

  @GetMapping("/api/graph/package")
  GraphResponse packageGraph(
      @RequestParam final String packageName,
      @RequestParam(required = false) final String workspacePath) {
    return service.packageGraph(packageName, workspacePath);
  }

  @GetMapping("/api/graph/type")
  GraphResponse typeGraph(
      @RequestParam final String typeId,
      @RequestParam(required = false) final String workspacePath) {
    return service.typeGraph(typeId, workspacePath);
  }
}
