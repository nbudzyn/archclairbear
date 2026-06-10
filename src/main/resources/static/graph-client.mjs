import { createGraphStatusController } from './graph-status.mjs';
import { GraphDataValidationError, normalizeGraph } from './graph-data.mjs';
import { renderGraph } from './graph-renderer.mjs';

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
    const graph = normalizeGraph(await loadGraphImpl(fetchImpl, requestUrl));
    renderGraphImpl(graph, {
      cytoscape,
      container,
      windowObject,
    });
    graphStatusController.hideStatus();
  } catch (error) {
    console.error('Failed to load root graph.', error);
    graphStatusController.showError(createUserFacingErrorMessage(error));
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
    throw new Error(`Graph request failed with status ${response.status}.`);
  }

  return response.json();
}

function createUserFacingErrorMessage(error) {
  if (error instanceof GraphDataValidationError) {
    return 'Die Graphdaten vom Server sind ungültig. Bitte lade die Seite neu.';
  }

  return 'Der Graph konnte nicht geladen werden. Bitte versuche es erneut.';
}
