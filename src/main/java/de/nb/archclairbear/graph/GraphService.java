package de.nb.archclairbear.graph;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Stream;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Graph-Service.
 */
@Service
class GraphService {
  private final Path workspacePath;

  @Autowired
  GraphService(@Value("${archclairbear.workspace.path}") final String workspacePath) {
    this(Path.of(workspacePath));
  }

  GraphService(final Path workspacePath) {
    this.workspacePath = workspacePath;
  }

  GraphResponse rootGraph() {
    if (!Files.exists(workspacePath)) {
      throw new WorkspacePathNotFoundException(workspacePath);
    }

    if (!Files.isDirectory(workspacePath)) {
      throw new IllegalStateException("Workspace-Pfad ist kein Verzeichnis: " + workspacePath);
    }

    var rootPackage = buildVisibleRootPackage(workspacePath);
    if (rootPackage == null) {
      return new GraphResponse(List.of(), List.of());
    }

    var packageName = rootPackage.packageName();
    return new GraphResponse(List.of(new GraphNode(packageName, "package", packageName)), List.of());
  }

  private PackageTreeNode buildVisibleRootPackage(final Path directory) {
    var relevantChildren = collectRelevantChildren(directory);
    if (relevantChildren.isEmpty()) {
      return null;
    }

    var current = relevantChildren.getFirst();
    while (current.shouldBeCollapsed()) {
      current = current.relevantChildren().getFirst();
    }

    return current;
  }

  private List<PackageTreeNode> collectRelevantChildren(final Path directory) {
    try (var childPaths = Files.list(directory)) {
      return childPaths
          .filter(Files::isDirectory)
          .sorted(Comparator.comparing(path -> path.getFileName().toString()))
          .map(this::buildPackageTree)
          .flatMap(Stream::ofNullable)
          .toList();
    } catch (final IOException e) {
      throw new IllegalStateException("Workspace-Pfad konnte nicht gelesen werden: " + directory, e);
    }
  }

  private PackageTreeNode buildPackageTree(final Path directory) {
    var relevantChildren = collectRelevantChildren(directory);
    var hasDirectJavaFiles = hasDirectJavaFiles(directory);
    var packageName = directory.getFileName().toString();

    if (!hasDirectJavaFiles && relevantChildren.isEmpty()) {
      return null;
    }

    if (!hasDirectJavaFiles && relevantChildren.size() == 1) {
      return relevantChildren.getFirst().prepend(packageName);
    }

    if (!hasDirectJavaFiles && relevantChildren.size() < 2) {
      return null;
    }

    return new PackageTreeNode(packageName, relevantChildren);
  }

  private boolean hasDirectJavaFiles(final Path directory) {
    try (var childPaths = Files.list(directory)) {
      return childPaths
          .filter(Files::isRegularFile)
          .map(path -> path.getFileName().toString())
          .anyMatch(fileName -> fileName.endsWith(".java"));
    } catch (final IOException e) {
      throw new IllegalStateException("Workspace-Pfad konnte nicht gelesen werden: " + directory, e);
    }
  }

  /**
   * Verdichteter Package-Baumknoten.
   */
  private record PackageTreeNode(String packageName, List<PackageTreeNode> relevantChildren) {
    private PackageTreeNode {
      relevantChildren = List.copyOf(relevantChildren);
    }

    private PackageTreeNode prepend(final String packageSegment) {
      return new PackageTreeNode(packageSegment + "." + packageName, relevantChildren);
    }

    private boolean shouldBeCollapsed() {
      return relevantChildren.size() == 1;
    }
  }
}
