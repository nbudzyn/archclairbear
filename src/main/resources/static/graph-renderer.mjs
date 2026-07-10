import { createGraphElements, getGraphNodeDimensions } from './graph-data.mjs?v=manual-node-position-29';

const BASE_NODE_FONT_SIZE = 12;
const MIN_RENDERED_NODE_FONT_SIZE = 10;
const BASE_NODE_TEXT_MAX_WIDTH = 150;
const MIN_RENDERED_NODE_TEXT_MAX_WIDTH = 132;
const BASE_TYPE_NODE_FONT_SIZE = 11;
const MIN_RENDERED_TYPE_NODE_FONT_SIZE = 9;
const BASE_TYPE_NODE_TEXT_MAX_WIDTH = 126;
const MIN_RENDERED_TYPE_NODE_TEXT_MAX_WIDTH = 112;
const PACKAGE_BOX_WIDTH = 220;
const PACKAGE_BOX_HEIGHT = 92;
const LAYOUT_ANIMATION_DURATION_MS = 320;

export async function renderGraph(graph, { cytoscape, container, windowObject = window }) {
  if (!cytoscape) {
    throw new Error('Cytoscape is not available.');
  }

  const elk = createElkLayoutEngine(windowObject);
  const manuallyMovedNodePositions = new Map();
  const positionedElements = applyLayoutToElements(
      createGraphElements(graph),
      await layoutGraph(graph, elk),
  );

  const cy = cytoscape({
    container,
    elements: positionedElements,
    layout: {
      name: 'preset',
    },
    wheelSensitivity: 0.18,
    minZoom: 0.4,
    maxZoom: 2.4,
    style: buildGraphStyle(),
  });

  const resizeHandler = () => {
    cy.resize();
    fitGraph(cy);
    updateNodeLabelSizing(cy);
  };

  cy.ready(() => {
    updateNodeLabelSizing(cy);
    updateGraphStateAttributes(container, cy);
    fitGraph(cy);
  });
  cy.on('zoom', () => {
    updateNodeLabelSizing(cy);
  });
  installManualNodePositionTracking(cy, manuallyMovedNodePositions);

  windowObject.addEventListener('resize', resizeHandler);

  return {
    cy,
    async appendGraph(nextGraph, { focusNodeId = null } = {}) {
      if (nextGraph.nodes.length === 0 && nextGraph.edges.length === 0) {
        return;
      }

      const positionedGraphElements = applyLayoutToElements(
          createGraphElements(nextGraph),
          await layoutGraph(nextGraph, elk),
      );
      const anchoredGraphElements = keepNodeAtCurrentPosition(cy, positionedGraphElements, focusNodeId);
      const manualPositionedGraphElements = applyManualNodePositions(anchoredGraphElements, manuallyMovedNodePositions);
      await updateGraphElements(cy, manualPositionedGraphElements, { focusNodeId, manuallyMovedNodePositions });
      updateNodeLabelSizing(cy);
      updateGraphStateAttributes(container, cy);
    },
    destroy() {
      windowObject.removeEventListener('resize', resizeHandler);
      cy.destroy();
    },
  };
}

function buildGraphStyle() {
  return [
    {
      selector: 'core',
      style: {
        'selection-box-color': '#7cd4ff',
        'selection-box-opacity': 0.08,
        'selection-box-border-color': '#7cd4ff',
      },
    },
    {
      selector: 'node',
      style: {
        label: 'data(displayLabel)',
        color: '#f3f7ff',
        'font-size': BASE_NODE_FONT_SIZE,
        'font-weight': '600',
        'text-valign': 'center',
        'text-halign': 'center',
        'text-wrap': 'wrap',
        'text-max-width': BASE_NODE_TEXT_MAX_WIDTH,
        'background-color': '#1b2643',
        'border-color': 'rgba(171, 191, 255, 0.28)',
        'border-width': 1.5,
        width: 'data(width)',
        height: 'data(height)',
        'shadow-blur': 18,
        'shadow-color': 'rgba(0, 0, 0, 0.32)',
        'shadow-opacity': 0.56,
        'shadow-offset-x': 0,
        'shadow-offset-y': 5,
      },
    },
    {
      selector: 'node[type = "package"]',
      style: {
        shape: 'round-rectangle',
        'background-color': '#271d12',
        'border-color': 'rgba(255, 184, 107, 0.42)',
      },
    },
    {
      selector: 'node[type = "package"]:parent',
      style: {
        'text-valign': 'top',
        'text-halign': 'center',
        'text-margin-y': 18,
        'background-opacity': 0.42,
        'border-width': 1.8,
        'compound-sizing-wrt-labels': 'include',
      },
    },
    {
      selector: 'node[type = "type"]',
      style: {
        shape: 'round-rectangle',
        'background-color': '#162b3a',
        'border-color': 'rgba(124, 212, 255, 0.3)',
        'border-width': 1.2,
        color: '#ecf4ff',
        'font-size': 11,
        'font-weight': '500',
        'text-max-width': 126,
        'text-valign': 'center',
        'text-margin-y': 0,
      },
    },
    {
      selector: 'node[type = "type"]:parent',
      style: {
        'text-valign': 'top',
        'text-halign': 'center',
        'text-margin-y': 18,
      },
    },
    {
      selector: 'node[type = "package"]:childless',
      style: {
        'text-valign': 'center',
        'text-margin-y': 0,
      },
    },
    {
      selector: 'edge',
      style: {
        width: 2,
        'line-color': 'rgba(124, 212, 255, 0.64)',
        'target-arrow-color': 'rgba(124, 212, 255, 0.86)',
        'target-arrow-shape': 'triangle',
        'curve-style': 'bezier',
        'arrow-scale': 1.1,
        'opacity': 0.82,
        'events': 'no',
      },
    },
  ];
}

function fitGraph(cy) {
  cy.fit(cy.elements(), 120);
}

function updateNodeLabelSizing(cy) {
  const zoom = cy.zoom();
  const textStyle = calculateZoomAdjustedNodeTextStyle(zoom);
  const typeTextStyle = calculateZoomAdjustedTypeNodeTextStyle(zoom);

  cy.style()
      .selector('node')
      .style('font-size', textStyle.fontSize)
      .style('text-max-width', textStyle.textMaxWidth)
      .selector('node[type = "type"]')
      .style('font-size', typeTextStyle.fontSize)
      .style('text-max-width', typeTextStyle.textMaxWidth)
      .update();
}

function createElkLayoutEngine(windowObject) {
  const ElkConstructor = windowObject.ELK;

  if (typeof ElkConstructor !== 'function') {
    throw new Error('ELK is not available.');
  }

  return new ElkConstructor();
}

export async function layoutGraph(graph, elk) {
  const elkGraph = buildElkGraph(graph);
  const layout = await elk.layout(elkGraph);

  return collectLayoutPositions(layout);
}

export function buildElkGraph(graph) {
  const nodesByParentId = new Map();

  graph.nodes.forEach((node) => {
    const childNodes = nodesByParentId.get(node.parentId ?? null) ?? [];
    childNodes.push(node);
    nodesByParentId.set(node.parentId ?? null, childNodes);
  });

  const buildElkNode = (node) => {
    const childNodes = nodesByParentId.get(node.id) ?? [];
    const dimensions = getGraphNodeDimensions(node.type);

    return {
      id: node.id,
      width: dimensions.width,
      height: dimensions.height,
      ...(childNodes.length === 0 ? {} : { children: childNodes.map((childNode) => buildElkNode(childNode)) }),
    };
  };

  return {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': 'DOWN',
      'elk.hierarchyHandling': 'INCLUDE_CHILDREN',
      'elk.spacing.nodeNode': 40,
    },
    children: (nodesByParentId.get(null) ?? []).map((node) => buildElkNode(node)),
    edges: graph.edges.map((edge) => ({
      id: `edge-${edge.source}-${edge.target}`,
      sources: [edge.source],
      targets: [edge.target],
    })),
  };
}

function collectLayoutPositions(layoutNode, offsetX = 0, offsetY = 0, positions = new Map()) {
  if (layoutNode.id !== 'root') {
    const width = layoutNode.width ?? PACKAGE_BOX_WIDTH;
    const height = layoutNode.height ?? PACKAGE_BOX_HEIGHT;
    positions.set(layoutNode.id, {
      x: offsetX + (layoutNode.x ?? 0) + (width / 2),
      y: offsetY + (layoutNode.y ?? 0) + (height / 2),
      width,
      height,
    });
  }

  const nextOffsetX = offsetX + (layoutNode.x ?? 0);
  const nextOffsetY = offsetY + (layoutNode.y ?? 0);

  (layoutNode.children ?? []).forEach((childNode) => {
    collectLayoutPositions(childNode, nextOffsetX, nextOffsetY, positions);
  });

  return positions;
}

function applyLayoutToElements(elements, positions) {
  return elements.map((element) => {
    const nodeId = element?.data?.id;
    const position = positions.get(nodeId);

    if (position == null) {
      return element;
    }

    return {
      ...element,
      data: {
        ...element.data,
        width: position.width,
        height: position.height,
      },
      position: {
        x: position.x,
        y: position.y,
      },
    };
  });
}

function installManualNodePositionTracking(cy, manuallyMovedNodePositions) {
  cy.on('dragfree', 'node', (event) => {
    const node = event.target;
    const nodeId = typeof node.data === 'function' ? node.data('id') : null;
    const position = typeof node.position === 'function' ? node.position() : null;

    if (typeof nodeId !== 'string' || !isPosition(position)) {
      return;
    }

    manuallyMovedNodePositions.set(nodeId, {
      x: position.x,
      y: position.y,
    });
  });
}

function keepNodeAtCurrentPosition(cy, elements, focusNodeId) {
  if (focusNodeId == null) {
    return elements;
  }

  const focusedElement = getElementById(cy, focusNodeId);
  const nextFocusedElement = elements.find((element) => element?.data?.id === focusNodeId);
  if (
    isEmptyElement(focusedElement)
    || nextFocusedElement?.position == null
    || typeof focusedElement.position !== 'function'
  ) {
    return elements;
  }

  const currentPosition = focusedElement.position();
  if (!isPosition(currentPosition)) {
    return elements;
  }

  const offsetX = currentPosition.x - nextFocusedElement.position.x;
  const offsetY = currentPosition.y - nextFocusedElement.position.y;

  return elements.map((element) => {
    if (element.position == null) {
      return element;
    }

    return {
      ...element,
      position: {
        x: element.position.x + offsetX,
        y: element.position.y + offsetY,
      },
    };
  });
}

function applyManualNodePositions(elements, manuallyMovedNodePositions) {
  return elements.map((element) => {
    const nodeId = element?.data?.id;
    const manualPosition = manuallyMovedNodePositions.get(nodeId);

    if (manualPosition == null || element.position == null) {
      return element;
    }

    return {
      ...element,
      position: {
        x: manualPosition.x,
        y: manualPosition.y,
      },
    };
  });
}

async function updateGraphElements(cy, nextElements, { focusNodeId = null, manuallyMovedNodePositions = new Map() } = {}) {
  const nextElementIds = new Set(nextElements.map((element) => element.data.id));
  const existingElements = elementsAsArray(cy.elements());

  const nextNodeElements = nextElements.filter((element) => element.data.source == null);
  const nextEdgeElements = nextElements.filter((element) => element.data.source != null);

  const nodeAnimations = nextNodeElements.map((element) => upsertGraphElement(cy, element, focusNodeId));
  nextEdgeElements.forEach((element) => upsertGraphElement(cy, element));
  await Promise.all(nodeAnimations);

  existingElements
      .filter((element) => !nextElementIds.has(element.id()))
      .forEach((element) => {
        manuallyMovedNodePositions.delete(element.id());
        element.remove();
      });
}

async function upsertGraphElement(cy, nextElement, focusNodeId = null) {
  const existingElement = getElementById(cy, nextElement.data.id);

  if (isEmptyElement(existingElement)) {
    const addedElement = addGraphElementNearFocus(cy, nextElement, focusNodeId);
    if (nextElement.data.parent != null) {
      return;
    }

    if (nextElement.position != null && addedElement != null) {
      await moveGraphNodeToPosition(addedElement, nextElement.position);
      applyGraphElementData(addedElement, nextElement.data);
      addedElement.position(nextElement.position);
    }

    return;
  }

  applyGraphElementData(existingElement, nextElement.data);
  if (nextElement.position != null) {
    const currentPosition = typeof existingElement.position === 'function' ? existingElement.position() : null;
    if (hasSamePosition(currentPosition, nextElement.position)) {
      return;
    }

    return moveGraphNodeToPosition(existingElement, nextElement.position);
  }

  return;
}

function addGraphElementNearFocus(cy, nextElement, focusNodeId) {
  if (nextElement.data.parent != null) {
    cy.add(nextElement);
    return getElementById(cy, nextElement.data.id);
  }

  const targetPosition = nextElement.position;
  const insertionPosition = targetPosition == null
      ? null
      : findInsertionPosition(cy, nextElement, focusNodeId) ?? targetPosition;
  cy.add(insertionPosition == null ? nextElement : {
    ...nextElement,
    position: insertionPosition,
  });

  return getElementById(cy, nextElement.data.id);
}

function applyGraphElementData(element, data) {
  element.data(data);
  if (typeof element.move === 'function') {
    element.move(data.parent == null ? { parent: null } : { parent: data.parent });
  }
}

function findInsertionPosition(cy, nextElement, focusNodeId) {
  const focusPosition = findCurrentNodePosition(cy, focusNodeId);
  if (focusPosition != null) {
    return focusPosition;
  }

  const parentPosition = findCurrentNodePosition(cy, nextElement.data.parent);
  if (parentPosition != null) {
    return parentPosition;
  }

  return null;
}

function findCurrentNodePosition(cy, nodeId) {
  if (nodeId == null) {
    return null;
  }

  const element = getElementById(cy, nodeId);
  if (isEmptyElement(element) || typeof element.position !== 'function') {
    return null;
  }

  const position = element.position();
  return isPosition(position) ? position : null;
}

function moveGraphNodeToPosition(element, position) {
  if (typeof element.animate !== 'function') {
    element.position(position);
    return Promise.resolve();
  }

  let animationCompleted = false;
  return new Promise((resolve) => {
    let fallbackTimeout = null;

    const finishAnimation = () => {
      if (animationCompleted) {
        return;
      }

      animationCompleted = true;
      clearTimeout(fallbackTimeout);
      resolve();
    };

    fallbackTimeout = setTimeout(finishAnimation, LAYOUT_ANIMATION_DURATION_MS + 80);

    const animation = element.animate({
      position,
    }, {
      duration: LAYOUT_ANIMATION_DURATION_MS,
      easing: 'ease-in-out',
      complete: finishAnimation,
    });

    if (animation == null || typeof animation.promise !== 'function') {
      return;
    }

    animation.promise('complete').then(finishAnimation, finishAnimation);
  });
}

function getElementById(cy, elementId) {
  if (typeof cy.getElementById === 'function') {
    return cy.getElementById(elementId);
  }

  return typeof cy.$id === 'function' ? cy.$id(elementId) : null;
}

function elementsAsArray(elements) {
  if (typeof elements.toArray === 'function') {
    return elements.toArray();
  }

  return Array.from(elements);
}

function updateGraphStateAttributes(container, cy) {
  if (container?.dataset == null || typeof cy.nodes !== 'function' || typeof cy.edges !== 'function') {
    return;
  }

  const nodes = elementsAsArray(cy.nodes());
  const edges = elementsAsArray(cy.edges());
  const positions = nodes
      .map((node) => (typeof node.position === 'function' ? node.position() : null))
      .filter(isPosition);
  const distinctPositions = new Set(positions.map((position) => `${Math.round(position.x)}:${Math.round(position.y)}`));

  container.dataset.renderedNodeCount = String(nodes.length);
  container.dataset.renderedEdgeCount = String(edges.length);
  container.dataset.renderedDistinctNodePositionCount = String(distinctPositions.size);
}

function isEmptyElement(element) {
  return element == null || (typeof element.empty === 'function' && element.empty());
}

function isPosition(value) {
  return typeof value?.x === 'number' && typeof value?.y === 'number';
}

function hasSamePosition(left, right) {
  return isPosition(left) && isPosition(right) && left.x === right.x && left.y === right.y;
}

export function calculateZoomAdjustedNodeTextStyle(zoom) {
  const effectiveZoom = zoom > 0 ? zoom : 1;

  return {
    fontSize: Math.max(BASE_NODE_FONT_SIZE, MIN_RENDERED_NODE_FONT_SIZE / effectiveZoom),
    textMaxWidth: Math.max(BASE_NODE_TEXT_MAX_WIDTH, MIN_RENDERED_NODE_TEXT_MAX_WIDTH / effectiveZoom),
  };
}

export function calculateZoomAdjustedTypeNodeTextStyle(zoom) {
  const effectiveZoom = zoom > 0 ? zoom : 1;

  return {
    fontSize: Math.max(BASE_TYPE_NODE_FONT_SIZE, MIN_RENDERED_TYPE_NODE_FONT_SIZE / effectiveZoom),
    textMaxWidth: Math.max(BASE_TYPE_NODE_TEXT_MAX_WIDTH, MIN_RENDERED_TYPE_NODE_TEXT_MAX_WIDTH / effectiveZoom),
  };
}
