package de.nb.archclairbear.graph;

import com.github.javaparser.JavaParser;
import com.github.javaparser.ParseProblemException;
import com.github.javaparser.ParseResult;
import com.github.javaparser.ParserConfiguration;
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.ast.body.AnnotationDeclaration;
import com.github.javaparser.ast.body.ClassOrInterfaceDeclaration;
import com.github.javaparser.ast.body.EnumDeclaration;
import com.github.javaparser.ast.body.RecordDeclaration;
import com.github.javaparser.ast.body.TypeDeclaration;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Graph-Service.
 */
@Service
class GraphService {
  private static final String DEFAULT_PACKAGE_LABEL = "(default)";
  private static final String JAVA_FILE_EXTENSION = ".java";

  private final Path workspacePath;
  private volatile WorkspaceIndex cachedIndex;

  @Autowired
  GraphService(@Value("${archclairbear.workspace.path}") final String workspacePath) {
    this(Path.of(workspacePath));
  }

  GraphService(final Path workspacePath) {
    this.workspacePath = workspacePath;
  }

  GraphResponse rootGraph() {
    ensureWorkspaceDirectoryExists();

    var workspaceIndex = getWorkspaceIndex();
    if (workspaceIndex.visibleRootPackageName() == null) {
      return new GraphResponse(List.of(), List.of(), workspaceIndex.statusMessage());
    }

    return new GraphResponse(
        List.of(createPackageNode(workspaceIndex.visibleRootPackageName(), null)),
        List.of(),
        workspaceIndex.statusMessage());
  }

  GraphResponse packageGraph(final String packageName) {
    ensureWorkspaceDirectoryExists();

    var workspaceIndex = getWorkspaceIndex();
    var normalizedPackageName = normalizePackageName(packageName);
    var packageContent = workspaceIndex.packages().get(normalizedPackageName);
    if (packageContent == null) {
      return new GraphResponse(List.of(), List.of(), workspaceIndex.statusMessage());
    }

    var nodes = new ArrayList<GraphNode>();
    packageContent.childPackageNames().stream()
        .map(childPackageName -> createPackageNode(childPackageName, normalizedPackageName))
        .forEach(nodes::add);
    packageContent.types().stream()
        .map(typeInfo -> createTypeNode(typeInfo, normalizedPackageName))
        .forEach(nodes::add);

    return new GraphResponse(List.copyOf(nodes), List.of(), workspaceIndex.statusMessage());
  }

  private void ensureWorkspaceDirectoryExists() {
    if (!Files.exists(workspacePath)) {
      throw new WorkspacePathNotFoundException(workspacePath);
    }

    if (!Files.isDirectory(workspacePath)) {
      throw new IllegalStateException("Workspace-Pfad ist kein Verzeichnis: " + workspacePath);
    }
  }

  private WorkspaceIndex getWorkspaceIndex() {
    var index = cachedIndex;
    if (index != null) {
      return index;
    }

    synchronized (this) {
      index = cachedIndex;
      if (index == null) {
        index = buildWorkspaceIndex();
        cachedIndex = index;
      }
      return index;
    }
  }

  private WorkspaceIndex buildWorkspaceIndex() {
    var parser = createJavaParser();
    var packageContents = new HashMap<String, MutablePackageContent>();
    var parseProblemCount = 0;

    try (var sourceFiles = Files.walk(workspacePath)) {
      var orderedSourceFiles = sourceFiles
          .filter(this::isVisibleJavaFile)
          .sorted(Comparator.comparing(Path::toString))
          .toList();

      for (var sourceFile : orderedSourceFiles) {
        parseProblemCount += readSourceFile(parser, sourceFile, packageContents);
      }
    } catch (final IOException e) {
      throw new IllegalStateException("Workspace-Pfad konnte nicht gelesen werden: " + workspacePath, e);
    }

    ensureParentPackages(packageContents);
    linkChildPackages(packageContents);

    var immutablePackages = freezePackageContents(packageContents);
    var visibleRootPackageName = selectVisibleRootPackageName(immutablePackages);

    return new WorkspaceIndex(
        immutablePackages,
        visibleRootPackageName,
        createStatusMessage(parseProblemCount));
  }

  private int readSourceFile(
      final JavaParser parser,
      final Path sourceFile,
      final Map<String, MutablePackageContent> packageContents) {
    try {
      var parseResult = parser.parse(sourceFile);
      var compilationUnit = parseResult.getResult().orElse(null);
      if (compilationUnit == null) {
        return 1;
      }

      var packageName = normalizePackageName(
          compilationUnit.getPackageDeclaration()
              .map(packageDeclaration -> packageDeclaration.getNameAsString())
              .orElse(null));
      var packageContent = packageContents.computeIfAbsent(packageName, MutablePackageContent::new);

      addTypes(packageContent, compilationUnit);
      return parseResult.isSuccessful() ? 0 : 1;
    } catch (final ParseProblemException exception) {
      return 1;
    } catch (final IOException exception) {
      throw new IllegalStateException("Java-Quelldatei konnte nicht gelesen werden: " + sourceFile, exception);
    }
  }

  private void addTypes(final MutablePackageContent packageContent, final CompilationUnit compilationUnit) {
    for (var typeDeclaration : compilationUnit.getTypes()) {
      if (!typeDeclaration.isTopLevelType()) {
        continue;
      }

      packageContent.addType(TypeInfo.from(typeDeclaration));
    }
  }

  private void ensureParentPackages(final Map<String, MutablePackageContent> packageContents) {
    var packageNames = List.copyOf(packageContents.keySet());
    for (var packageName : packageNames) {
      var parentPackageName = parentPackageName(packageName);
      while (parentPackageName != null) {
        packageContents.computeIfAbsent(parentPackageName, MutablePackageContent::new);
        parentPackageName = parentPackageName(parentPackageName);
      }
    }
  }

  private void linkChildPackages(final Map<String, MutablePackageContent> packageContents) {
    for (var packageName : packageContents.keySet()) {
      var parentPackageName = parentPackageName(packageName);
      if (parentPackageName != null) {
        packageContents.get(parentPackageName).addChildPackage(packageName);
      }
    }
  }

  private Map<String, PackageContent> freezePackageContents(final Map<String, MutablePackageContent> packageContents) {
    var frozenPackages = new HashMap<String, PackageContent>();

    for (var entry : packageContents.entrySet()) {
      frozenPackages.put(entry.getKey(), entry.getValue().toPackageContent());
    }

    return Map.copyOf(frozenPackages);
  }

  private String selectVisibleRootPackageName(final Map<String, PackageContent> packageContents) {
    var namedPackageNames = packageContents.values().stream()
        .filter(packageContent -> !packageContent.packageName().isEmpty())
        .filter(packageContent -> !packageContent.types().isEmpty())
        .map(PackageContent::packageName)
        .sorted()
        .toList();

    if (namedPackageNames.isEmpty()) {
      return packageContents.containsKey("") ? "" : null;
    }

    var commonPrefix = commonPackagePrefix(namedPackageNames);
    if (commonPrefix != null && packageContents.containsKey(commonPrefix)) {
      return commonPrefix;
    }

    return namedPackageNames.getFirst();
  }

  private String commonPackagePrefix(final List<String> packageNames) {
    if (packageNames.isEmpty()) {
      return null;
    }

    var prefixSegments = packageNames.getFirst().split("\\.");
    for (var index = 1; index < packageNames.size(); index += 1) {
      var currentSegments = packageNames.get(index).split("\\.");
      var commonLength = 0;
      while (commonLength < prefixSegments.length
          && commonLength < currentSegments.length
          && prefixSegments[commonLength].equals(currentSegments[commonLength])) {
        commonLength += 1;
      }
      prefixSegments = java.util.Arrays.copyOf(prefixSegments, commonLength);
      if (prefixSegments.length == 0) {
        return null;
      }
    }

    return String.join(".", prefixSegments);
  }

  private GraphNode createPackageNode(final String packageName, final String parentPackageName) {
    var packageLabel = parentPackageName == null
        ? displayPackageName(packageName)
        : relativePackageName(packageName, parentPackageName);
    var packageId = displayPackageName(packageName);

    return parentPackageName == null
        ? new GraphNode(packageId, "package", packageLabel)
        : new GraphNode(packageId, "package", packageLabel, displayPackageName(parentPackageName));
  }

  private GraphNode createTypeNode(final TypeInfo typeInfo, final String packageName) {
    var packageId = displayPackageName(packageName);
    var typeId = packageId + "." + typeInfo.name();
    return new GraphNode(typeId, "type", typeInfo.name(), packageId);
  }

  private JavaParser createJavaParser() {
    var configuration = new ParserConfiguration();
    try {
      configuration.setLanguageLevel(ParserConfiguration.LanguageLevel.valueOf("JAVA_25"));
    } catch (final IllegalArgumentException exception) {
      try {
        configuration.setLanguageLevel(ParserConfiguration.LanguageLevel.valueOf("JAVA_21"));
      } catch (final IllegalArgumentException ignored) {
        // Falls die Library keine neuere Sprachstufe kennt, bleibt die Default-Konfiguration aktiv.
      }
    }

    return new JavaParser(configuration);
  }

  private boolean isVisibleJavaFile(final Path path) {
    var fileName = path.getFileName().toString();
    return Files.isRegularFile(path)
        && fileName.endsWith(JAVA_FILE_EXTENSION)
        && !"module-info.java".equals(fileName)
        && !"package-info.java".equals(fileName);
  }

  private String createStatusMessage(final int parseProblemCount) {
    if (parseProblemCount == 0) {
      return null;
    }

    return parseProblemCount == 1
        ? "Teilweise analysiert: 1 Datei konnte nicht vollständig gelesen werden."
        : "Teilweise analysiert: " + parseProblemCount + " Dateien konnten nicht vollständig gelesen werden.";
  }

  private String displayPackageName(final String packageName) {
    return packageName == null || packageName.isBlank() ? DEFAULT_PACKAGE_LABEL : packageName;
  }

  private String normalizePackageName(final String packageName) {
    if (packageName == null || packageName.isBlank() || DEFAULT_PACKAGE_LABEL.equals(packageName)) {
      return "";
    }

    return packageName;
  }

  private String parentPackageName(final String packageName) {
    if (packageName == null || packageName.isBlank()) {
      return null;
    }

    var lastDotIndex = packageName.lastIndexOf('.');
    if (lastDotIndex < 0) {
      return "";
    }

    return packageName.substring(0, lastDotIndex);
  }

  private String relativePackageName(final String packageName, final String parentPackageName) {
    if (parentPackageName == null || parentPackageName.isBlank()) {
      return displayPackageName(packageName);
    }

    if (!packageName.startsWith(parentPackageName + ".")) {
      return displayPackageName(packageName);
    }

    return packageName.substring(parentPackageName.length() + 1);
  }

  /**
   * Verdichteter Workspace-Index.
   */
  private record WorkspaceIndex(Map<String, PackageContent> packages, String visibleRootPackageName, String statusMessage) {
  }

  /**
   * Verdichteter Package-Inhalt.
   */
  private static final class MutablePackageContent {
    private final String packageName;
    private final Set<String> childPackageNames = new HashSet<>();
    private final List<TypeInfo> types = new ArrayList<>();

    private MutablePackageContent(final String packageName) {
      this.packageName = packageName;
    }

    private void addChildPackage(final String childPackageName) {
      if (!packageName.equals(childPackageName)) {
        childPackageNames.add(childPackageName);
      }
    }

    private void addType(final TypeInfo typeInfo) {
      types.add(typeInfo);
    }

    private PackageContent toPackageContent() {
      var orderedChildPackageNames = childPackageNames.stream()
          .sorted(Comparator.comparing(String::toString))
          .toList();
      var orderedTypes = types.stream()
          .sorted(Comparator.comparing(TypeInfo::name))
          .toList();

      return new PackageContent(packageName, orderedChildPackageNames, orderedTypes);
    }
  }

  /**
   * Verdichteter Package-Inhalt.
   */
  private record PackageContent(String packageName, List<String> childPackageNames, List<TypeInfo> types) {
  }

  /**
   * Top-Level-Typ.
   */
  private record TypeInfo(String name) {
    private static TypeInfo from(final TypeDeclaration<?> typeDeclaration) {
      return new TypeInfo(typeDeclaration.getNameAsString());
    }
  }
}
