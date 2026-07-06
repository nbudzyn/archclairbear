package de.nb.archclairbear.graph;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Comparator;
import java.util.List;

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
    ensureWorkspaceDirectoryExists();

    var rootPackage = buildVisibleRootPackage(workspacePath);
    if (rootPackage == null) {
      return new GraphResponse(List.of(), List.of());
    }

    var packageName = rootPackage.packageName();
    return new GraphResponse(List.of(new GraphNode(packageName, "package", packageName)), List.of());
  }

  GraphResponse packageGraph(final String packageName) {
    ensureWorkspaceDirectoryExists();

    var packageDirectory = resolvePackageDirectory(packageName);
    if (packageDirectory == null) {
      return new GraphResponse(List.of(), List.of());
    }

    var nodes = collectImmediateChildPackages(packageDirectory, packageName);

    return new GraphResponse(nodes, List.of());
  }

  private void ensureWorkspaceDirectoryExists() {
    if (!Files.exists(workspacePath)) {
      throw new WorkspacePathNotFoundException(workspacePath);
    }

    if (!Files.isDirectory(workspacePath)) {
      throw new IllegalStateException("Workspace-Pfad ist kein Verzeichnis: " + workspacePath);
    }
  }

  private PackageTreeNode buildVisibleRootPackage(final Path directory) {
    var relevantChildren = collectRelevantChildren(directory, null);
    if (relevantChildren.isEmpty()) {
      return null;
    }

    var current = relevantChildren.getFirst();
    while (current.shouldBeCollapsed()) {
      current = current.relevantChildren().getFirst();
    }

    return current;
  }

  private List<PackageTreeNode> collectRelevantChildren(final Path directory, final String parentPackageName) {
    try (var childPaths = Files.list(directory)) {
      return childPaths
          .filter(Files::isDirectory)
          .sorted(Comparator.comparing(path -> path.getFileName().toString()))
          .map(path -> buildPackageTree(path, parentPackageName))
          .flatMap(java.util.stream.Stream::ofNullable)
          .toList();
    } catch (final IOException e) {
      throw new IllegalStateException("Workspace-Pfad konnte nicht gelesen werden: " + directory, e);
    }
  }

  private PackageTreeNode buildPackageTree(final Path directory, final String parentPackageName) {
    var packageName = createPackageName(directory, parentPackageName);
    var relevantChildren = collectRelevantChildren(directory, packageName);
    var hasDirectJavaFiles = hasDirectJavaFiles(directory);

    if (!hasDirectJavaFiles && relevantChildren.isEmpty()) {
      return null;
    }

    if (!hasDirectJavaFiles && relevantChildren.size() == 1) {
      return relevantChildren.getFirst();
    }

    return new PackageTreeNode(packageName, hasDirectJavaFiles, relevantChildren);
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

  private String createPackageName(final Path directory, final String parentPackageName) {
    var packageSegment = directory.getFileName().toString();
    return parentPackageName == null ? packageSegment : parentPackageName + "." + packageSegment;
  }

  private Path resolvePackageDirectory(final String packageName) {
    if (packageName == null || packageName.isBlank()) {
      return null;
    }

    var current = workspacePath;
    for (var segment : packageName.split("\\.")) {
      if (segment.isBlank()) {
        return null;
      }

      current = current.resolve(segment);
      if (!Files.exists(current) || !Files.isDirectory(current)) {
        return null;
      }
    }

    return current;
  }

  private List<GraphNode> collectImmediateChildPackages(final Path packageDirectory, final String packageName) {
    try (var childPaths = Files.list(packageDirectory)) {
      return childPaths
          .filter(Files::isDirectory)
          .sorted(Comparator.comparing(path -> path.getFileName().toString()))
          .map(path -> createPackageNode(packageName, path))
          .toList();
    } catch (final IOException e) {
      throw new IllegalStateException("Workspace-Pfad konnte nicht gelesen werden: " + packageDirectory, e);
    }
  }

  private GraphNode createPackageNode(final String parentPackageName, final Path childDirectory) {
    var childPackageName = parentPackageName + "." + childDirectory.getFileName().toString();
    return new GraphNode(childPackageName, "package", childDirectory.getFileName().toString(), parentPackageName);
  }

  /**
   * Verdichteter Package-Baumknoten.
   */
  private record PackageTreeNode(String packageName, boolean hasDirectJavaFiles, List<PackageTreeNode> relevantChildren) {
    private PackageTreeNode {
      relevantChildren = List.copyOf(relevantChildren);
    }

    private boolean shouldBeCollapsed() {
      return !hasDirectJavaFiles && relevantChildren.size() == 1;
    }

    private String relativeNameFrom(final String parentPackageName) {
      return packageName.substring(parentPackageName.length() + 1);
    }
  }
}
