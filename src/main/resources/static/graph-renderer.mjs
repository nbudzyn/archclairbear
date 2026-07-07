import { createGraphElements } from './graph-data.mjs?v=package-boxes-15';

const BASE_NODE_FONT_SIZE = 12;
const MIN_RENDERED_NODE_FONT_SIZE = 10;
const BASE_NODE_TEXT_MAX_WIDTH = 150;
const MIN_RENDERED_NODE_TEXT_MAX_WIDTH = 132;
const PACKAGE_BOX_WIDTH = 220;
const PACKAGE_BOX_HEIGHT = 92;

export async function renderGraph(graph, { cytoscape, container, windowObject = window }) {
  if (!cytoscape) {
    throw new Error('Cytoscape is not available.');
  }

  const elk = createElkLayoutEngine(windowObject);
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
    fitGraph(cy);
  });
  cy.on('zoom', () => {
    updateNodeLabelSizing(cy);
  });

  windowObject.addEventListener('resize', resizeHandler);

  return {
    cy,
    async appendGraph(nextGraph) {
      if (nextGraph.nodes.length === 0 && nextGraph.edges.length === 0) {
        return;
      }

      const positionedGraphElements = applyLayoutToElements(
          createGraphElements(nextGraph),
          await layoutGraph(nextGraph, elk),
      );
      cy.elements().remove();
      cy.add(positionedGraphElements);
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

    return {
      id: node.id,
      width: node.type === 'package' ? PACKAGE_BOX_WIDTH : 260,
      height: node.type === 'package' ? PACKAGE_BOX_HEIGHT : 120,
      ...(childNodes.length === 0 ? {} : { children: childNodes.map((childNode) => buildElkNode(childNode)) }),
    };
  };

  return {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': 'DOWN',
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

export function calculateZoomAdjustedNodeTextStyle(zoom) {
  const effectiveZoom = zoom > 0 ? zoom : 1;

  return {
    fontSize: Math.max(BASE_NODE_FONT_SIZE, MIN_RENDERED_NODE_FONT_SIZE / effectiveZoom),
    textMaxWidth: Math.max(BASE_NODE_TEXT_MAX_WIDTH, MIN_RENDERED_NODE_TEXT_MAX_WIDTH / effectiveZoom),
  };
}
