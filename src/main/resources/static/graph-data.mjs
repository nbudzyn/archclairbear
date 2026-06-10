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
    ...normalizedGraph.edges.map((edge, index) => createEdgeElement(edge, index)),
  ];
}

export function diffGraphNodes(previousNodes, nextNodes) {
  const previousNodeMap = new Map(previousNodes.map((node) => [node.id, node]));
  const nextNodeMap = new Map(nextNodes.map((node) => [node.id, node]));

  return {
    added: nextNodes.filter((node) => !previousNodeMap.has(node.id)),
    removed: previousNodes.filter((node) => !nextNodeMap.has(node.id)),
    updated: nextNodes.filter((node) => {
      const previousNode = previousNodeMap.get(node.id);
      return previousNode != null && !areNodesEqual(previousNode, node);
    }),
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
    },
  };
}

function createEdgeElement(edge, index) {
  return {
    data: {
      id: createEdgeId(edge, index),
      source: edge.source,
      target: edge.target,
    },
  };
}

function createEdgeId(edge, index) {
  const source = edge?.source ?? 'source';
  const target = edge?.target ?? 'target';

  return `edge-${index}-${source}-${target}`;
}

function isString(value) {
  return typeof value === 'string' && value.length > 0;
}

function areNodesEqual(previousNode, nextNode) {
  return previousNode.id === nextNode.id
    && previousNode.label === nextNode.label
    && previousNode.type === nextNode.type;
}
