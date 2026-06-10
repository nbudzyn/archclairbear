import assert from 'node:assert/strict';
import test from 'node:test';

import { GraphDataValidationError } from '../main/resources/static/graph-data.mjs';
import { startGraphApp } from '../main/resources/static/graph-client.mjs';

test('startGraphApp zeigt den Ladezustand und rendert den Graphen bei Erfolg', async () => {
  // GIVEN
  const statusMessage = { textContent: '' };
  const errorMessage = { textContent: '' };
  const statusElement = { hidden: true, querySelector: () => statusMessage };
  const errorElement = { hidden: true, querySelector: () => errorMessage };
  const renderCalls = [];
  const loadCalls = [];
  const originalConsoleError = console.error;

  // WHEN
  console.error = () => {};

  try {
    await startGraphApp({
      container: { id: 'cy' },
      errorElement,
      fetchImpl: async () => {
        throw new Error('fetchImpl should not be used in this test.');
      },
      graphErrorMessage: errorMessage,
      graphStatus: statusElement,
      graphStatusMessage: statusMessage,
      loadGraphImpl: async (_fetchImpl, requestUrl) => {
        loadCalls.push(requestUrl);
        return {
          nodes: [
            {
              id: 'root-directory',
              label: 'Workspace',
              type: 'directory',
            },
          ],
          edges: [],
        };
      },
      renderGraphImpl: (graph, options) => {
        renderCalls.push({ graph, options });
        return {
          destroy() {},
        };
      },
      requestUrl: '/api/graph/root',
      windowObject: {
        addEventListener() {},
        removeEventListener() {},
      },
      cytoscape: {},
    });
  } finally {
    console.error = originalConsoleError;
  }

  // THEN
  assert.deepEqual(loadCalls, ['/api/graph/root']);
  assert.equal(statusElement.hidden, true);
  assert.equal(errorElement.hidden, true);
  assert.equal(statusMessage.textContent, 'Graphdaten werden geladen ...');
  assert.equal(errorMessage.textContent, '');
  assert.equal(renderCalls.length, 1);
  assert.deepEqual(renderCalls[0].graph, {
    nodes: [
      {
        id: 'root-directory',
        label: 'Workspace',
        type: 'directory',
      },
    ],
    edges: [],
  });
});

test('startGraphApp zeigt bei ungültigen Daten eine verständliche Fehlermeldung', async () => {
  // GIVEN
  const statusMessage = { textContent: '' };
  const errorMessage = { textContent: '' };
  const statusElement = { hidden: true, querySelector: () => statusMessage };
  const errorElement = { hidden: true, querySelector: () => errorMessage };
  const renderCalls = [];
  const originalConsoleError = console.error;

  // WHEN
  console.error = () => {};

  try {
    await startGraphApp({
      container: { id: 'cy' },
      errorElement,
      fetchImpl: async () => {
        throw new Error('fetchImpl should not be used in this test.');
      },
      graphErrorMessage: errorMessage,
      graphStatus: statusElement,
      graphStatusMessage: statusMessage,
      loadGraphImpl: async () => ({
        nodes: [
          {
            id: 'root-directory',
            label: 'Workspace',
            type: 'directory',
          },
        ],
        edges: [
          {
            source: 'root-directory',
          },
        ],
      }),
      renderGraphImpl: () => {
        renderCalls.push(true);
        return {
          destroy() {},
        };
      },
      requestUrl: '/api/graph/root',
      windowObject: {
        addEventListener() {},
        removeEventListener() {},
      },
      cytoscape: {},
    });
  } finally {
    console.error = originalConsoleError;
  }

  // THEN
  assert.equal(renderCalls.length, 0);
  assert.equal(statusElement.hidden, true);
  assert.equal(errorElement.hidden, false);
  assert.equal(errorMessage.textContent, 'Die Graphdaten vom Server sind ungültig. Bitte lade die Seite neu.');
  assert.equal(statusMessage.textContent, 'Graphdaten werden geladen ...');
});

test('startGraphApp zeigt bei Ladefehlern eine allgemeine Fehlermeldung', async () => {
  // GIVEN
  const statusMessage = { textContent: '' };
  const errorMessage = { textContent: '' };
  const statusElement = { hidden: true, querySelector: () => statusMessage };
  const errorElement = { hidden: true, querySelector: () => errorMessage };
  const renderCalls = [];
  const originalConsoleError = console.error;

  // WHEN
  console.error = () => {};

  try {
    await startGraphApp({
      container: { id: 'cy' },
      errorElement,
      fetchImpl: async () => {
        throw new Error('fetchImpl should not be used in this test.');
      },
      graphErrorMessage: errorMessage,
      graphStatus: statusElement,
      graphStatusMessage: statusMessage,
      loadGraphImpl: async () => {
        throw new Error('Backend unavailable.');
      },
      renderGraphImpl: () => {
        renderCalls.push(true);
        return {
          destroy() {},
        };
      },
      requestUrl: '/api/graph/root',
      windowObject: {
        addEventListener() {},
        removeEventListener() {},
      },
      cytoscape: {},
    });
  } finally {
    console.error = originalConsoleError;
  }

  // THEN
  assert.equal(renderCalls.length, 0);
  assert.equal(statusElement.hidden, true);
  assert.equal(errorElement.hidden, false);
  assert.equal(errorMessage.textContent, 'Der Graph konnte nicht geladen werden. Bitte versuche es erneut.');
});
