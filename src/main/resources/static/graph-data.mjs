export function normalizeGraph(graph) {
  if (!isRecord(graph)) {
    throw new GraphDataValidationError('Die Graphdaten vom Server sind ungültig.');
  }

  if (!Array.isArray(graph.nodes)) {
    throw new GraphDataValidationError('Die Graphdaten vom Server sind ungültig.');
  }

  if (!Array.isArray(graph.edges)) {
    throw new GraphDataValidationError('Die Graphdaten vom Server sind ungültig.');
  }

  return {
    nodes: graph.nodes.map((node) => normalizeNode(node)),
    edges: graph.edges.map((edge) => normalizeEdge(edge)),
  };
}

export function createGraphElements(graph) {
  const normalizedGraph = normalizeGraph(graph);

  return [
    ...normalizedGraph.nodes.map((node) => createNodeElement(node)),
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

function createNodeElement(node) {
  return {
    data: {
      id: node.id,
      label: node.label,
      type: node.type,
      width: node.type === 'package' ? 220 : 260,
      height: node.type === 'package' ? 92 : 120,
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

function isString(value) {
  return typeof value === 'string' && value.length > 0;
}

function isOptionalString(value) {
  return value == null || isString(value);
}
