import { createGraphStatusController } from './graph-status.mjs?v=package-boxes-14';
import { GraphDataValidationError, mergeGraphs, normalizeGraph } from './graph-data.mjs?v=package-boxes-14';
import { renderGraph } from './graph-renderer.mjs?v=package-boxes-14';

/**
 * Startet die Client-Anwendung für den Graphen.
 */
export async function startGraphApp({
  container = document.getElementById('cy'),
  errorElement = document.getElementById('graph-error'),
  fetchImpl = fetch,
  graphErrorMessage = errorElement?.querySelector('[data-message]'),
  graphStatus = document.getElementById('graph-status'),
  graphStatusMessage = graphStatus?.querySelector('[data-message]'),
  loadGraphImpl = loadGraph,
  renderGraphImpl = renderGraph,
  requestUrl = '/api/graph/root',
  packageRequestUrlFactory = createPackageRequestUrl,
  windowObject = window,
  cytoscape = window.cytoscape,
} = {}) {
  const graphStatusController = createGraphStatusController({
    statusElement: graphStatus,
    statusMessageElement: graphStatusMessage,
    errorElement,
    errorMessageElement: graphErrorMessage,
  });

  graphStatusController.showLoading('Graphdaten werden geladen ...');

  try {
    let graph = normalizeGraph(await loadGraphImpl(fetchImpl, requestUrl));
    const renderState = await renderGraphImpl(graph, {
      cytoscape,
      container,
      windowObject,
    });
    if (renderState?.cy != null && typeof renderState.appendGraph === 'function') {
      installNodeDoubleClickHandler(renderState.cy, async (nodeId) => {
        try {
          const expandedGraph = normalizeGraph(await loadGraphImpl(fetchImpl, packageRequestUrlFactory(nodeId)));
          const mergedGraph = mergeGraphs(graph, expandedGraph);

          graph = mergedGraph;
          await renderState.appendGraph(graph);
        } catch (error) {
          console.error(`Failed to expand package ${nodeId}.`, error);
          graphStatusController.showError(createUserFacingErrorMessage(error));
        }
      });
    }
    graphStatusController.hideStatus();
    return renderState;
  } catch (error) {
    console.error('Failed to load root graph.', error);
    graphStatusController.showError(createUserFacingErrorMessage(error));
    return null;
  }
}

/**
 * Lädt die Graphdaten vom Server.
 */
export async function loadGraph(fetchImpl = fetch, requestUrl = '/api/graph/root') {
  const response = await fetchImpl(requestUrl, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new GraphRequestError(await readErrorMessage(response), response.status);
  }

  return response.json();
}

export function createPackageRequestUrl(packageName) {
  return `/api/graph/package?packageName=${encodeURIComponent(packageName)}`;
}

export function installNodeDoubleClickHandler(cy, onNodeDoubleClick, timeSource = () => Date.now()) {
  let lastTap = null;

  cy.on('tap', 'node', (event) => {
    const nodeId = event.target.data('id');
    const now = timeSource();

    if (lastTap != null && lastTap.nodeId === nodeId && now - lastTap.timestamp <= 400) {
      lastTap = null;
      void onNodeDoubleClick(nodeId);
      return;
    }

    lastTap = {
      nodeId,
      timestamp: now,
    };
  });
}

function createUserFacingErrorMessage(error) {
  if (error instanceof GraphDataValidationError) {
    return 'Die Graphdaten vom Server sind ungültig. Bitte lade die Seite neu.';
  }

  if (error instanceof GraphRequestError && error.userFacingMessage !== '') {
    return error.userFacingMessage;
  }

  return 'Der Graph konnte nicht geladen werden. Bitte versuche es erneut.';
}

async function readErrorMessage(response) {
  try {
    const body = await response.json();
    return typeof body.message === 'string' ? body.message : '';
  } catch (_error) {
    return '';
  }
}

class GraphRequestError extends Error {
  constructor(userFacingMessage, status) {
    super(`Graph request failed with status ${status}.`);
    this.name = 'GraphRequestError';
    this.userFacingMessage = userFacingMessage;
    this.status = status;
  }
}
