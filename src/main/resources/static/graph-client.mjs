import { createGraphStatusController } from './graph-status.mjs?v=workspace-path-30';
import { GraphDataValidationError, calculateVisiblePackageEdges, collapseGraph, mergeGraphs, normalizeGraph } from './graph-data.mjs?v=workspace-path-30';
import { renderGraph } from './graph-renderer.mjs?v=workspace-path-30';

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
  rootRequestUrlFactory = createRootRequestUrl,
  packageRequestUrlFactory = createPackageRequestUrl,
  typeRequestUrlFactory = createTypeRequestUrl,
  workspaceForm = globalThis.document?.getElementById('workspace-form'),
  workspacePathInput = globalThis.document?.getElementById('workspace-path'),
  timeSource = () => Date.now(),
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
    let workspacePath = loadedGraph.workspacePath;
    updateWorkspacePathInput(workspacePathInput, workspacePath);
    let rawDependencies = loadedGraph.rawDependencies ?? [];
    let graph = withVisiblePackageEdges(normalizeGraph(loadedGraph), rawDependencies);
    let renderState = await renderGraphImpl(graph, {
      cytoscape,
      container,
      windowObject,
    });

    const loadNode = async (nodeId, nodeType) => {
      try {
        if (hasVisibleChildNodes(graph, nodeId)) {
          graph = withVisiblePackageEdges(collapseGraph(graph, nodeId), rawDependencies);
          await renderState.appendGraph(graph, { focusNodeId: nodeId });
          return;
        }

        if (!isNodeExpandable(graph, nodeId)) {
          return;
        }

        const requestUrlToLoad = nodeType === 'type'
            ? typeRequestUrlFactory(nodeId, workspacePath)
            : packageRequestUrlFactory(nodeId, workspacePath);
        const expandedLoadedGraph = await loadGraphImpl(fetchImpl, requestUrlToLoad);
        const expandedGraph = normalizeGraph(expandedLoadedGraph);
        graph = withVisiblePackageEdges(mergeGraphs(graph, expandedGraph), rawDependencies);
        await renderState.appendGraph(graph, { focusNodeId: nodeId });
        updateGraphStatus(graphStatusController, expandedLoadedGraph);
      } catch (error) {
        console.error(`Failed to toggle node ${nodeId}.`, error);
        graphStatusController.showError(createUserFacingErrorMessage(error));
      }
    };
    const installNodeHandler = () => {
      if (renderState?.cy != null && typeof renderState.appendGraph === 'function') {
        installNodeDoubleClickHandler(renderState.cy, loadNode, timeSource);
      }
    };

    installNodeHandler();
    installWorkspaceFormHandler(workspaceForm, async () => {
      graphStatusController.showLoading('Graphdaten werden geladen ...');

      try {
        const loadedWorkspaceGraph = await loadGraphImpl(
            fetchImpl,
            rootRequestUrlFactory(workspacePathInput?.value ?? ''));
        const nextRawDependencies = loadedWorkspaceGraph.rawDependencies ?? [];
        const nextGraph = withVisiblePackageEdges(normalizeGraph(loadedWorkspaceGraph), nextRawDependencies);

        renderState?.destroy?.();
        renderState = await renderGraphImpl(nextGraph, {
          cytoscape,
          container,
          windowObject,
        });
        workspacePath = loadedWorkspaceGraph.workspacePath;
        updateWorkspacePathInput(workspacePathInput, workspacePath);
        rawDependencies = nextRawDependencies;
        graph = nextGraph;
        installNodeHandler();
        updateGraphStatus(graphStatusController, loadedWorkspaceGraph);
      } catch (error) {
        console.error('Failed to load workspace graph.', error);
        graphStatusController.showError(createUserFacingErrorMessage(error));
      }
    });
    updateGraphStatus(graphStatusController, loadedGraph);
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

export function createRootRequestUrl(workspacePath) {
  return createRequestUrl('/api/graph/root', { workspacePath });
}

export function createPackageRequestUrl(packageName, workspacePath) {
  return createRequestUrl('/api/graph/package', { packageName, workspacePath });
}

export function createTypeRequestUrl(typeId, workspacePath) {
  return createRequestUrl('/api/graph/type', { typeId, workspacePath });
}

export function installWorkspaceFormHandler(workspaceForm, onWorkspaceSubmit) {
  if (workspaceForm == null) {
    return;
  }

  workspaceForm.addEventListener('submit', (event) => {
    event.preventDefault();
    void onWorkspaceSubmit();
  });
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

function isNodeExpandable(graph, nodeId) {
  return graph.nodes.some((node) => node.id === nodeId && node.expandable === true);
}

function withVisiblePackageEdges(graph, rawDependencies) {
  return {
    nodes: graph.nodes,
    edges: calculateVisiblePackageEdges(rawDependencies, graph),
  };
}

function updateGraphStatus(graphStatusController, loadedGraph) {
  if (typeof loadedGraph.statusMessage === 'string' && loadedGraph.statusMessage.length > 0) {
    graphStatusController.showStatus(loadedGraph.statusMessage);
  } else {
    graphStatusController.hideStatus();
  }
}

function createRequestUrl(path, parameters) {
  const searchParameters = new URLSearchParams();

  Object.entries(parameters).forEach(([name, value]) => {
    if (typeof value === 'string' && value.length > 0) {
      searchParameters.set(name, value);
    }
  });

  const query = searchParameters.toString();
  return query.length === 0 ? path : `${path}?${query}`;
}

function updateWorkspacePathInput(workspacePathInput, workspacePath) {
  if (workspacePathInput != null && typeof workspacePath === 'string') {
    workspacePathInput.value = workspacePath;
  }
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
