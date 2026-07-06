import { createGraphElements } from './graph-data.mjs';

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
  };

  cy.ready(() => {
    centerGraph(cy);
  });

  windowObject.addEventListener('resize', resizeHandler);

  return {
    cy,
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
        'font-size': 16,
        'font-weight': '700',
        'text-valign': 'center',
        'text-halign': 'center',
        'text-wrap': 'wrap',
        'text-max-width': 180,
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
        width: 280,
        height: 128,
      },
    },
    {
      selector: 'edge',
      style: {
        'curve-style': 'bezier',
        width: 2.2,
        opacity: 0.82,
        'line-color': '#7cd4ff',
        'target-arrow-color': '#7cd4ff',
        'target-arrow-shape': 'triangle',
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
