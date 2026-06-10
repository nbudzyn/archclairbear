const graphContainer = document.getElementById('cy');
const graphStatus = document.getElementById('graph-status');
const graphStatusMessage = graphStatus.querySelector('[data-message]');
const graphError = document.getElementById('graph-error');
const graphErrorMessage = graphError.querySelector('[data-message]');

main();

async function main() {
  showStatus('Graphdaten werden geladen ...');

  try {
    const graph = await loadGraph();
    renderGraph(graph);
    hideStatus();
  } catch (error) {
    console.error('Failed to load root graph.', error);
    showError('Der Graph konnte nicht geladen werden. Bitte versuche es erneut.');
  }
}

async function loadGraph() {
  const response = await fetch('/api/graph/root', {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Graph request failed with status ${response.status}.`);
  }

  return response.json();
}

function renderGraph(graph) {
  if (!window.cytoscape) {
    throw new Error('Cytoscape is not available.');
  }

  const nodes = Array.isArray(graph?.nodes) ? graph.nodes : [];
  const edges = Array.isArray(graph?.edges) ? graph.edges : [];
  const elements = [
    ...nodes.map((node) => ({
      data: {
        id: node.id,
        label: node.label,
        type: node.type,
      },
    })),
    ...edges.map((edge, index) => ({
      data: {
        id: `edge-${index}`,
        source: edge.source,
        target: edge.target,
      },
    })),
  ];

  const cy = window.cytoscape({
    container: graphContainer,
    elements,
    layout: {
      name: 'preset',
    },
    wheelSensitivity: 0.18,
    minZoom: 0.4,
    maxZoom: 2.4,
    style: [
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
        selector: '[type = "directory"]',
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
    ],
  });

  cy.ready(() => {
    const nodes = cy.nodes();
    const center = {
      x: cy.width() / 2,
      y: cy.height() / 2,
    };

    nodes.positions(() => center);
    cy.fit(cy.elements(), 120);
  });

  window.addEventListener('resize', () => {
    cy.resize();
    cy.fit(cy.elements(), 120);
  });
}

function showStatus(message) {
  graphError.hidden = true;
  graphStatusMessage.textContent = message;
  graphStatus.hidden = false;
}

function hideStatus() {
  graphStatus.hidden = true;
}

function showError(message) {
  graphStatus.hidden = true;
  graphErrorMessage.textContent = message;
  graphError.hidden = false;
}
