export function normalizeGraph(graph) {
  if (!isRecord(graph)) {
    throw new GraphDataValidationError('Die Graphdaten vom Server sind ungültig.');
  }

  if (!Array.isArray(graph.nodes)) {
    throw new GraphDataValidationError('Die Graphdaten vom Server sind ungültig.');
  }

  const edges = graph.edges ?? [];
  if (!Array.isArray(edges)) {
    throw new GraphDataValidationError('Die Graphdaten vom Server sind ungültig.');
  }

  return {
    nodes: graph.nodes.map((node) => normalizeNode(node)),
    edges: edges.map((edge) => normalizeEdge(edge)),
  };
}

export function createGraphElements(graph) {
  const normalizedGraph = normalizeGraph(graph);
  const expandedNodeIds = new Set(
      normalizedGraph.nodes
          .filter((node) => node.parentId != null)
          .map((node) => node.parentId),
  );

  return [
    ...normalizedGraph.nodes.map((node) => createNodeElement(node, expandedNodeIds.has(node.id))),
    ...normalizedGraph.edges.map((edge) => createEdgeElement(edge)),
  ];
}

export function mergeGraphs(previousGraph, graphToMerge) {
  const previous = normalizeGraph(previousGraph);
  const next = normalizeGraph(graphToMerge);
  const mergedNodes = new Map(previous.nodes.map((node) => [node.id, node]));
  const mergedEdges = new Map(previous.edges.map((edge) => [createEdgeId(edge), edge]));

  next.nodes.forEach((node) => {
    mergedNodes.set(node.id, node);
  });
  next.edges.forEach((edge) => {
    mergedEdges.set(createEdgeId(edge), edge);
  });

  return {
    nodes: [...mergedNodes.values()],
    edges: [...mergedEdges.values()],
  };
}

export function collapseGraph(graph, rootNodeId) {
  const normalizedGraph = normalizeGraph(graph);
  const idsToRemove = collectDescendantIds(normalizedGraph, rootNodeId);

  return {
    nodes: normalizedGraph.nodes.filter((node) => !idsToRemove.has(node.id)),
    edges: normalizedGraph.edges.filter((edge) => !idsToRemove.has(edge.source) && !idsToRemove.has(edge.target)),
  };
}

export function calculateVisiblePackageEdges(rawDependencies, graph) {
  if (!Array.isArray(rawDependencies)) {
    throw new GraphDataValidationError('Die Graphdaten vom Server sind ungültig.');
  }

  const normalizedGraph = normalizeGraph(graph);
  const visiblePackageIds = new Set(
      normalizedGraph.nodes
          .filter((node) => node.type === 'package')
          .map((node) => node.id),
  );
  const visibleEdges = new Map();

  rawDependencies
      .map((rawDependency) => normalizeRawDependency(rawDependency))
      .forEach((rawDependency) => {
        const source = findVisiblePackageId(rawDependency.sourcePackage, visiblePackageIds);
        const target = findVisiblePackageId(rawDependency.targetPackage, visiblePackageIds);

        if (source == null || target == null || source === target) {
          return;
        }

        visibleEdges.set(`${source}->${target}`, {
          source,
          target,
        });
      });

  return [...visibleEdges.values()];
}

export class GraphDataValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'GraphDataValidationError';
  }
}

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeNode(node) {
  if (!isRecord(node)) {
    throw new GraphDataValidationError('Die Graphdaten vom Server sind ungültig.');
  }

  if (!isString(node.id) || !isString(node.label) || !isString(node.type)) {
    throw new GraphDataValidationError('Die Graphdaten vom Server sind ungültig.');
  }

  return {
    id: node.id,
    label: node.label,
    type: node.type,
    expandable: isOptionalBoolean(node.expandable) ? Boolean(node.expandable) : false,
    parentId: isString(node.parentId) ? node.parentId : null,
  };
}

function normalizeEdge(edge) {
  if (!isRecord(edge)) {
    throw new GraphDataValidationError('Die Graphdaten vom Server sind ungültig.');
  }

  if (!isString(edge.source) || !isString(edge.target)) {
    throw new GraphDataValidationError('Die Graphdaten vom Server sind ungültig.');
  }

  return {
    source: edge.source,
    target: edge.target,
  };
}

function normalizeRawDependency(rawDependency) {
  if (!isRecord(rawDependency)) {
    throw new GraphDataValidationError('Die Graphdaten vom Server sind ungültig.');
  }

  if (!isPackageName(rawDependency.sourcePackage) || !isPackageName(rawDependency.targetPackage)) {
    throw new GraphDataValidationError('Die Graphdaten vom Server sind ungültig.');
  }

  return {
    sourcePackage: rawDependency.sourcePackage,
    targetPackage: rawDependency.targetPackage,
  };
}

function createNodeElement(node, isExpanded) {
  const dimensions = getGraphNodeDimensions(node.type);

  return {
    data: {
      id: node.id,
      label: node.label,
      displayLabel: node.expandable && !isExpanded ? `${node.label}…` : node.label,
      type: node.type,
      expandable: node.expandable,
      width: dimensions.width,
      height: dimensions.height,
      ...(node.parentId == null ? {} : { parent: node.parentId }),
    },
  };
}

function createEdgeElement(edge) {
  return {
    data: {
      id: createEdgeId(edge),
      source: edge.source,
      target: edge.target,
    },
  };
}

function createEdgeId(edge) {
  const source = edge?.source ?? 'source';
  const target = edge?.target ?? 'target';

  return `edge-${source}-${target}`;
}

function collectDescendantIds(graph, rootNodeId) {
  const idsToRemove = new Set();
  let changed = true;

  while (changed) {
    changed = false;

    graph.nodes.forEach((node) => {
      if (
        node.id !== rootNodeId
        && !idsToRemove.has(node.id)
        && (node.parentId === rootNodeId || (node.parentId != null && idsToRemove.has(node.parentId)))
      ) {
        idsToRemove.add(node.id);
        changed = true;
      }
    });
  }

  return idsToRemove;
}

function isString(value) {
  return typeof value === 'string' && value.length > 0;
}

function isOptionalBoolean(value) {
  return value == null || typeof value === 'boolean';
}

function isPackageName(value) {
  return typeof value === 'string';
}

function findVisiblePackageId(packageName, visiblePackageIds) {
  const displayedPackageName = displayPackageName(packageName);

  if (visiblePackageIds.has(displayedPackageName)) {
    return displayedPackageName;
  }

  const segments = packageName.split('.');
  for (let segmentCount = segments.length - 1; segmentCount > 0; segmentCount -= 1) {
    const parentPackageName = segments.slice(0, segmentCount).join('.');
    if (visiblePackageIds.has(parentPackageName)) {
      return parentPackageName;
    }
  }

  return visiblePackageIds.has('(default)') ? '(default)' : null;
}

function displayPackageName(packageName) {
  return packageName === '' ? '(default)' : packageName;
}

export function getGraphNodeDimensions(nodeType) {
  if (nodeType === 'package') {
    return {
      width: 220,
      height: 92,
    };
  }

  return {
    width: 180,
    height: 64,
  };
}
