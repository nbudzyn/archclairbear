import { createGraphStatusController } from './graph-status.mjs?v=package-boxes-17';
import { GraphDataValidationError, collapseGraph, mergeGraphs, normalizeGraph } from './graph-data.mjs?v=package-boxes-17';
import { renderGraph } from './graph-renderer.mjs?v=package-boxes-17';

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
  typeRequestUrlFactory = createTypeRequestUrl,
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
    const loadedGraph = await loadGraphImpl(fetchImpl, requestUrl);
    let graph = normalizeGraph(loadedGraph);
    const renderState = await renderGraphImpl(graph, {
      cytoscape,
      container,
      windowObject,
    });
    if (renderState?.cy != null && typeof renderState.appendGraph === 'function') {
      installNodeDoubleClickHandler(renderState.cy, async (nodeId, nodeType) => {
        try {
          if (hasVisibleChildNodes(graph, nodeId)) {
            graph = collapseGraph(graph, nodeId);
            await renderState.appendGraph(graph);
            return;
          }

          const requestUrlToLoad = nodeType === 'type'
              ? typeRequestUrlFactory(nodeId)
              : packageRequestUrlFactory(nodeId);
          const expandedLoadedGraph = await loadGraphImpl(fetchImpl, requestUrlToLoad);
          const expandedGraph = normalizeGraph(expandedLoadedGraph);
          graph = mergeGraphs(graph, expandedGraph);
          await renderState.appendGraph(graph);
          if (typeof expandedLoadedGraph.statusMessage === 'string' && expandedLoadedGraph.statusMessage.length > 0) {
            graphStatusController.showStatus(expandedLoadedGraph.statusMessage);
          } else {
            graphStatusController.hideStatus();
          }
        } catch (error) {
          console.error(`Failed to toggle node ${nodeId}.`, error);
          graphStatusController.showError(createUserFacingErrorMessage(error));
        }
      });
    }
    if (typeof loadedGraph.statusMessage === 'string' && loadedGraph.statusMessage.length > 0) {
      graphStatusController.showStatus(loadedGraph.statusMessage);
    } else {
      graphStatusController.hideStatus();
    }
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

export function createTypeRequestUrl(typeId) {
  return `/api/graph/type?typeId=${encodeURIComponent(typeId)}`;
}

export function installNodeDoubleClickHandler(cy, onNodeDoubleClick, timeSource = () => Date.now()) {
  let lastTap = null;

  cy.on('tap', 'node', (event) => {
    const nodeId = event.target.data('id');
    const nodeType = event.target.data('type');
    const now = timeSource();

    if (lastTap != null && lastTap.nodeId === nodeId && now - lastTap.timestamp <= 400) {
      lastTap = null;
      void onNodeDoubleClick(nodeId, nodeType);
      return;
    }

    lastTap = {
      nodeId,
      timestamp: now,
    };
  });
}

function hasVisibleChildNodes(graph, nodeId) {
  return graph.nodes.some((node) => node.parentId === nodeId);
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
