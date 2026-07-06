import { createGraphElements } from './graph-data.mjs?v=package-boxes-8';

const BASE_NODE_FONT_SIZE = 12;
const MIN_RENDERED_NODE_FONT_SIZE = 10;
const BASE_NODE_TEXT_MAX_WIDTH = 150;
const MIN_RENDERED_NODE_TEXT_MAX_WIDTH = 132;
const PACKAGE_BOX_WIDTH = 220;
const PACKAGE_BOX_HEIGHT = 92;
const PACKAGE_EXPANSION_CLEARANCE = 24;

export function renderGraph(graph, { cytoscape, container, windowObject = window }) {
  if (!cytoscape) {
    throw new Error('Cytoscape is not available.');
  }

  const cy = cytoscape({
    container,
    elements: createGraphElements(graph),
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
    centerGraph(cy);
    updateNodeLabelSizing(cy);
  });
  cy.on('zoom', () => {
    updateNodeLabelSizing(cy);
  });

  windowObject.addEventListener('resize', resizeHandler);

  return {
    cy,
    appendGraph(graph) {
      if (graph.nodes.length === 0 && graph.edges.length === 0) {
        return;
      }

      const parentCenters = captureParentCenters(cy, graph.nodes);
      cy.add(createGraphElements(graph));
      positionAppendedNodes(cy, graph.nodes, parentCenters);
      nudgeNodesAwayFromExpandedPackages(cy, graph.nodes);
      fitGraph(cy);
      updateNodeLabelSizing(cy);
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
        label: 'data(label)',
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
        width: 260,
        height: 120,
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
        width: PACKAGE_BOX_WIDTH,
        height: PACKAGE_BOX_HEIGHT,
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
        'min-width': 320,
        'min-height': 180,
        'padding-top': 62,
        'padding-bottom': 28,
        'padding-left': 28,
        'padding-right': 28,
        'compound-sizing-wrt-labels': 'include',
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
        display: 'none',
      },
    },
  ];
}

function centerGraph(cy) {
  const nodes = cy.nodes();
  const center = {
    x: cy.width() / 2,
    y: cy.height() / 2,
  };

  nodes.positions(() => center);
  fitGraph(cy);
}

function fitGraph(cy) {
  cy.fit(cy.elements(), 120);
}

function updateNodeLabelSizing(cy) {
  const zoom = cy.zoom();
  const textStyle = calculateZoomAdjustedNodeTextStyle(zoom);

  cy.style()
      .selector('node')
      .style('font-size', textStyle.fontSize)
      .style('text-max-width', textStyle.textMaxWidth)
      .update();
}

export function calculateZoomAdjustedNodeTextStyle(zoom) {
  const effectiveZoom = zoom > 0 ? zoom : 1;

  return {
    fontSize: Math.max(BASE_NODE_FONT_SIZE, MIN_RENDERED_NODE_FONT_SIZE / effectiveZoom),
    textMaxWidth: Math.max(BASE_NODE_TEXT_MAX_WIDTH, MIN_RENDERED_NODE_TEXT_MAX_WIDTH / effectiveZoom),
  };
}

function positionAppendedNodes(cy, nodes, parentCenters) {
  const childNodeIdsByParentId = new Map();

  nodes
      .filter((node) => node.parentId != null)
      .forEach((node) => {
        const childNodeIds = childNodeIdsByParentId.get(node.parentId) ?? [];
        childNodeIds.push(node.id);
        childNodeIdsByParentId.set(node.parentId, childNodeIds);
  });

  childNodeIdsByParentId.forEach((childNodeIds, parentNodeId) => {
    const parentNode = cy.getElementById(parentNodeId);
    if (parentNode.empty()) {
      return;
    }

    const parentCenter = parentCenters.get(parentNodeId) ?? parentNode.position();
    const columns = Math.max(1, Math.ceil(Math.sqrt(childNodeIds.length)));
    const rows = Math.ceil(childNodeIds.length / columns);
    const horizontalGap = PACKAGE_BOX_WIDTH + 24;
    const verticalGap = PACKAGE_BOX_HEIGHT + 20;
    const gridWidth = (columns - 1) * horizontalGap;
    const gridHeight = (rows - 1) * verticalGap;

    childNodeIds.forEach((childNodeId, index) => {
      const column = index % columns;
      const row = Math.floor(index / columns);
      const childNode = cy.getElementById(childNodeId);
      childNode.position({
        x: parentCenter.x - (gridWidth / 2) + (column * horizontalGap),
        y: parentCenter.y - (gridHeight / 2) + (row * verticalGap) + 24,
      });
    });
  });
}

function nudgeNodesAwayFromExpandedPackages(cy, nodes) {
  const expandedPackageIds = new Set(
      nodes
          .filter((node) => node.parentId != null)
          .map((node) => node.parentId),
  );

  if (expandedPackageIds.size === 0) {
    return;
  }

  const expandedBox = calculateExpandedPackageBox(cy, expandedPackageIds);
  if (expandedBox == null) {
    return;
  }

  const nodeSnapshots = cy.nodes()
      .map((node) => ({
        id: node.id(),
        box: boxFromElement(node),
        ancestorIds: node.ancestors().map((ancestor) => ancestor.id()),
      }))
      .filter((snapshot) => snapshot.box != null)
      .filter((snapshot) => !expandedPackageIds.has(snapshot.id))
      .filter((snapshot) => !isDescendantOfAny(snapshot.ancestorIds, expandedPackageIds));

  const translations = calculateLayoutReflowTranslations(expandedBox, nodeSnapshots, expandedPackageIds);
  if (translations.size === 0) {
    return;
  }

  cy.batch(() => {
    translations.forEach((translation, nodeId) => {
      const node = cy.getElementById(nodeId);
      if (node.empty()) {
        return;
      }

      const position = node.position();
      node.position({
        x: position.x + translation.x,
        y: position.y + translation.y,
      });
    });
  });

}

function captureParentCenters(cy, nodes) {
  const parentCenters = new Map();

  nodes
      .filter((node) => node.parentId != null)
      .forEach((node) => {
        if (parentCenters.has(node.parentId)) {
          return;
        }

        const parentNode = cy.getElementById(node.parentId);
        if (!parentNode.empty()) {
          parentCenters.set(node.parentId, parentNode.position());
        }
      });

  return parentCenters;
}

export function calculateExpansionTranslations(expandedBox, nodeSnapshots, expandedPackageIds = new Set()) {
  const avoidanceBox = inflateBox(expandedBox, PACKAGE_EXPANSION_CLEARANCE, PACKAGE_EXPANSION_CLEARANCE);
  const overlappingNodes = nodeSnapshots.filter((snapshot) => boxesOverlap(avoidanceBox, snapshot.box));
  const overlappingNodeIds = new Set(overlappingNodes.map((snapshot) => snapshot.id));
  const movers = overlappingNodes.filter((snapshot) => (
    !expandedPackageIds.has(snapshot.id)
    && !snapshot.ancestorIds.some((ancestorId) => overlappingNodeIds.has(ancestorId))
  ));

  const groupedTranslations = new Map([
    ['left', { shift: 0, ids: [] }],
    ['right', { shift: 0, ids: [] }],
    ['up', { shift: 0, ids: [] }],
    ['down', { shift: 0, ids: [] }],
  ]);

  movers.forEach((snapshot) => {
    const direction = chooseAvoidanceDirection(expandedBox, snapshot.box);
    const shift = calculateAvoidanceShift(avoidanceBox, snapshot.box, direction);
    const group = groupedTranslations.get(direction);
    group.shift = Math.max(group.shift, shift);
    group.ids.push(snapshot.id);
  });

  const translations = new Map();
  groupedTranslations.forEach((group, direction) => {
    if (group.shift <= 0) {
      return;
    }

    const translation = direction === 'left'
      ? { x: -group.shift, y: 0 }
      : direction === 'right'
        ? { x: group.shift, y: 0 }
        : direction === 'up'
          ? { x: 0, y: -group.shift }
          : { x: 0, y: group.shift };

    group.ids.forEach((nodeId) => {
      translations.set(nodeId, translation);
    });
  });

  return translations;
}

export function calculateExpandedPackageBox(cy, expandedPackageIds) {
  const expandedBoxes = [...expandedPackageIds]
      .flatMap((packageId) => {
        const packageNode = cy.getElementById(packageId);
        if (packageNode.empty()) {
          return [];
        }

        return [packageNode, ...packageNode.descendants()];
      })
      .map((element) => boxFromElement(element))
      .filter((box) => box != null);

  return mergeBoxes(expandedBoxes);
}

export function calculateLayoutReflowTranslations(expandedBox, nodeSnapshots, expandedPackageIds = new Set()) {
  const translations = new Map();

  nodeSnapshots.forEach((snapshot) => {
    if (expandedPackageIds.has(snapshot.id)) {
      return;
    }

    if (snapshot.ancestorIds.some((ancestorId) => expandedPackageIds.has(ancestorId))) {
      return;
    }

    const direction = chooseAvoidanceDirection(expandedBox, snapshot.box);
    const translation = direction === 'left'
      ? { x: -(PACKAGE_BOX_WIDTH + PACKAGE_EXPANSION_CLEARANCE), y: 0 }
      : direction === 'right'
        ? { x: PACKAGE_BOX_WIDTH + PACKAGE_EXPANSION_CLEARANCE, y: 0 }
        : direction === 'up'
          ? { x: 0, y: -(PACKAGE_BOX_HEIGHT + PACKAGE_EXPANSION_CLEARANCE) }
          : { x: 0, y: PACKAGE_BOX_HEIGHT + PACKAGE_EXPANSION_CLEARANCE };

    translations.set(snapshot.id, translation);
  });

  return translations;
}

function boxFromElement(element) {
  if (element == null || element.empty()) {
    return null;
  }

  const boundingBox = element.boundingBox({
    includeLabels: true,
    includeOverlays: false,
  });

  return {
    x1: boundingBox.x1,
    y1: boundingBox.y1,
    x2: boundingBox.x2,
    y2: boundingBox.y2,
  };
}

function inflateBox(box, xPadding, yPadding) {
  return {
    x1: box.x1 - xPadding,
    y1: box.y1 - yPadding,
    x2: box.x2 + xPadding,
    y2: box.y2 + yPadding,
  };
}

function mergeBoxes(boxes) {
  if (boxes.length === 0) {
    return null;
  }

  return boxes.reduce((mergedBox, box) => ({
    x1: Math.min(mergedBox.x1, box.x1),
    y1: Math.min(mergedBox.y1, box.y1),
    x2: Math.max(mergedBox.x2, box.x2),
    y2: Math.max(mergedBox.y2, box.y2),
  }));
}

function chooseAvoidanceDirection(expandedBox, nodeBox) {
  const expandedCenter = boxCenter(expandedBox);
  const nodeCenter = boxCenter(nodeBox);
  const deltaX = nodeCenter.x - expandedCenter.x;
  const deltaY = nodeCenter.y - expandedCenter.y;

  if (Math.abs(deltaX) >= Math.abs(deltaY)) {
    return deltaX < 0 ? 'left' : 'right';
  }

  return deltaY < 0 ? 'up' : 'down';
}

function calculateAvoidanceShift(expandedBox, nodeBox, direction) {
  if (direction === 'left') {
    return (nodeBox.x2 - expandedBox.x1) + PACKAGE_EXPANSION_CLEARANCE;
  }

  if (direction === 'right') {
    return (expandedBox.x2 - nodeBox.x1) + PACKAGE_EXPANSION_CLEARANCE;
  }

  if (direction === 'up') {
    return (nodeBox.y2 - expandedBox.y1) + PACKAGE_EXPANSION_CLEARANCE;
  }

  return (expandedBox.y2 - nodeBox.y1) + PACKAGE_EXPANSION_CLEARANCE;
}

function isDescendantOfAny(ancestorIds, packageIds) {
  return ancestorIds.some((ancestorId) => packageIds.has(ancestorId));
}

function boxCenter(box) {
  return {
    x: (box.x1 + box.x2) / 2,
    y: (box.y1 + box.y2) / 2,
  };
}

function boxesOverlap(firstBox, secondBox) {
  return firstBox.x1 <= secondBox.x2
    && firstBox.x2 >= secondBox.x1
    && firstBox.y1 <= secondBox.y2
    && firstBox.y2 >= secondBox.y1;
}
