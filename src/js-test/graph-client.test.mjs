import assert from 'node:assert/strict';
import test from 'node:test';

import { GraphDataValidationError } from '../main/resources/static/graph-data.mjs';
import { createPackageRequestUrl, createTypeRequestUrl, installNodeDoubleClickHandler, startGraphApp } from '../main/resources/static/graph-client.mjs';

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
              id: 'de.aventiure',
              label: 'de.aventiure',
              type: 'package',
              expandable: true,
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
        id: 'de.aventiure',
        label: 'de.aventiure',
        type: 'package',
        expandable: true,
        parentId: null,
      },
    ],
    edges: [],
  });
});

test('startGraphApp zeigt einen kleinen Statushinweis aus den Graphdaten', async () => {
  // GIVEN
  const statusMessage = { textContent: '' };
  const errorMessage = { textContent: '' };
  const statusElement = { hidden: true, querySelector: () => statusMessage };
  const errorElement = { hidden: true, querySelector: () => errorMessage };
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
            id: 'de.aventiure',
            label: 'de.aventiure',
            type: 'package',
            expandable: true,
          },
        ],
        edges: [],
        statusMessage: 'Teilweise analysiert: 1 Datei konnte nicht vollständig gelesen werden.',
      }),
      renderGraphImpl: () => ({
        destroy() {},
      }),
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
  assert.equal(statusElement.hidden, false);
  assert.equal(errorElement.hidden, true);
  assert.equal(statusMessage.textContent, 'Teilweise analysiert: 1 Datei konnte nicht vollständig gelesen werden.');
});

test('startGraphApp lädt bei Doppelklick ein Package nach und ergänzt den sichtbaren Graphen als Kind-Box', async () => {
  // GIVEN
  const statusMessage = { textContent: '' };
  const errorMessage = { textContent: '' };
  const statusElement = { hidden: true, querySelector: () => statusMessage };
  const errorElement = { hidden: true, querySelector: () => errorMessage };
  const appendCalls = [];
  const loadCalls = [];
  const tapHandlers = [];
  const originalConsoleError = console.error;
  let now = 1000;
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
        if (requestUrl === '/api/graph/root') {
          return {
            nodes: [
            {
              id: 'de.aventiure',
              label: 'de.aventiure',
              type: 'package',
              expandable: true,
            },
            ],
            edges: [],
          };
        }

        return {
          nodes: [
            {
              id: 'de.aventiure.lay05_being',
              label: 'lay05_being',
              type: 'package',
              expandable: false,
              parentId: 'de.aventiure',
            },
          ],
          edges: [],
        };
      },
      renderGraphImpl: () => ({
        appendGraph(graph) {
          appendCalls.push(graph);
        },
        cy: {
          on(eventName, selector, handler) {
            tapHandlers.push({ eventName, selector, handler });
          },
        },
        destroy() {},
      }),
      timeSource: () => now,
      requestUrl: '/api/graph/root',
      windowObject: {
        addEventListener() {},
        removeEventListener() {},
      },
      cytoscape: {},
    });

    tapHandlers[0].handler({
      target: {
        data(fieldName) {
          return fieldName === 'id' ? 'de.aventiure' : undefined;
        },
      },
    });
    now += 150;
    tapHandlers[0].handler({
      target: {
        data(fieldName) {
          return fieldName === 'id' ? 'de.aventiure' : undefined;
        },
      },
    });
    await new Promise((resolve) => setTimeout(resolve, 0));
  } finally {
    console.error = originalConsoleError;
  }

  // THEN
  assert.deepEqual(loadCalls, [
    '/api/graph/root',
    '/api/graph/package?packageName=de.aventiure',
  ]);
  assert.deepEqual(appendCalls, [
    {
      nodes: [
        {
          id: 'de.aventiure',
          label: 'de.aventiure',
          type: 'package',
          expandable: true,
          parentId: null,
        },
        {
          id: 'de.aventiure.lay05_being',
          label: 'lay05_being',
          type: 'package',
          expandable: false,
          parentId: 'de.aventiure',
        },
      ],
      edges: [],
    },
  ]);
});

test('startGraphApp lädt bei Doppelklick auf einen Typ dessen verschachtelte Typen nach', async () => {
  // GIVEN
  const statusMessage = { textContent: '' };
  const errorMessage = { textContent: '' };
  const statusElement = { hidden: true, querySelector: () => statusMessage };
  const errorElement = { hidden: true, querySelector: () => errorMessage };
  const appendCalls = [];
  const loadCalls = [];
  const tapHandlers = [];
  const originalConsoleError = console.error;
  let now = 1000;

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
        if (requestUrl === '/api/graph/root') {
          return {
            nodes: [
            {
              id: 'de.aventiure',
              label: 'de.aventiure',
              type: 'package',
              expandable: true,
            },
            ],
            edges: [],
          };
        }

        if (requestUrl === '/api/graph/package?packageName=de.aventiure') {
          return {
            nodes: [
            {
              id: 'de.aventiure.Outer',
              label: 'Outer',
              type: 'type',
              expandable: true,
              parentId: 'de.aventiure',
            },
            ],
            edges: [],
          };
        }

        return {
          nodes: [
            {
              id: 'de.aventiure.Outer.Inner',
              label: 'Inner',
              type: 'type',
              expandable: true,
              parentId: 'de.aventiure.Outer',
            },
          ],
          edges: [],
        };
      },
      renderGraphImpl: () => ({
        appendGraph(graph) {
          appendCalls.push(graph);
        },
        cy: {
          on(eventName, selector, handler) {
            tapHandlers.push({ eventName, selector, handler });
          },
        },
        destroy() {},
      }),
      timeSource: () => now,
      requestUrl: '/api/graph/root',
      windowObject: {
        addEventListener() {},
        removeEventListener() {},
      },
      cytoscape: {},
    });

    const handler = tapHandlers[0].handler;
    handler({
      target: {
        data(fieldName) {
          if (fieldName === 'id') {
            return 'de.aventiure';
          }

          return fieldName === 'type' ? 'package' : undefined;
        },
      },
    });
    now += 150;
    handler({
      target: {
        data(fieldName) {
          if (fieldName === 'id') {
            return 'de.aventiure';
          }

          return fieldName === 'type' ? 'package' : undefined;
        },
      },
    });
    await new Promise((resolve) => setTimeout(resolve, 0));

    now += 50;
    handler({
      target: {
        data(fieldName) {
          if (fieldName === 'id') {
            return 'de.aventiure.Outer';
          }

          return fieldName === 'type' ? 'type' : undefined;
        },
      },
    });
    now += 150;
    handler({
      target: {
        data(fieldName) {
          if (fieldName === 'id') {
            return 'de.aventiure.Outer';
          }

          return fieldName === 'type' ? 'type' : undefined;
        },
      },
    });
    await new Promise((resolve) => setTimeout(resolve, 0));
  } finally {
    console.error = originalConsoleError;
  }

  // THEN
  assert.deepEqual(loadCalls, [
    '/api/graph/root',
    '/api/graph/package?packageName=de.aventiure',
    '/api/graph/type?typeId=de.aventiure.Outer',
  ]);
  assert.deepEqual(appendCalls, [
    {
      nodes: [
        {
          id: 'de.aventiure',
          label: 'de.aventiure',
          type: 'package',
          expandable: true,
          parentId: null,
        },
        {
          id: 'de.aventiure.Outer',
          label: 'Outer',
          type: 'type',
          expandable: true,
          parentId: 'de.aventiure',
        },
      ],
      edges: [],
    },
    {
      nodes: [
        {
          id: 'de.aventiure',
          label: 'de.aventiure',
          type: 'package',
          expandable: true,
          parentId: null,
        },
        {
          id: 'de.aventiure.Outer',
          label: 'Outer',
          type: 'type',
          expandable: true,
          parentId: 'de.aventiure',
        },
        {
          id: 'de.aventiure.Outer.Inner',
          label: 'Inner',
          type: 'type',
          expandable: true,
          parentId: 'de.aventiure.Outer',
        },
      ],
      edges: [],
    },
  ]);
});

test('startGraphApp lädt keinen nicht aufklappbaren Knoten nach', async () => {
  // GIVEN
  const statusMessage = { textContent: '' };
  const errorMessage = { textContent: '' };
  const statusElement = { hidden: true, querySelector: () => statusMessage };
  const errorElement = { hidden: true, querySelector: () => errorMessage };
  const appendCalls = [];
  const loadCalls = [];
  const tapHandlers = [];
  const originalConsoleError = console.error;
  let now = 1000;

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
              id: 'de.aventiure',
              label: 'de.aventiure',
              type: 'package',
              expandable: false,
            },
          ],
          edges: [],
        };
      },
      renderGraphImpl: () => ({
        appendGraph(graph) {
          appendCalls.push(graph);
        },
        cy: {
          on(eventName, selector, handler) {
            tapHandlers.push({ eventName, selector, handler });
          },
        },
        destroy() {},
      }),
      timeSource: () => now,
      requestUrl: '/api/graph/root',
      windowObject: {
        addEventListener() {},
        removeEventListener() {},
      },
      cytoscape: {},
    });

    const handler = tapHandlers[0].handler;
    handler({
      target: {
        data(fieldName) {
          return fieldName === 'id' ? 'de.aventiure' : undefined;
        },
      },
    });
    now += 150;
    handler({
      target: {
        data(fieldName) {
          return fieldName === 'id' ? 'de.aventiure' : undefined;
        },
      },
    });
    await new Promise((resolve) => setTimeout(resolve, 0));
  } finally {
    console.error = originalConsoleError;
  }

  // THEN
  assert.deepEqual(loadCalls, ['/api/graph/root']);
  assert.deepEqual(appendCalls, []);
});

test('startGraphApp klappt ein geöffnetes Package bei erneutem Doppelklick wieder zu', async () => {
  // GIVEN
  const statusMessage = { textContent: '' };
  const errorMessage = { textContent: '' };
  const statusElement = { hidden: true, querySelector: () => statusMessage };
  const errorElement = { hidden: true, querySelector: () => errorMessage };
  const appendCalls = [];
  const loadCalls = [];
  const tapHandlers = [];
  const originalConsoleError = console.error;
  let now = 1000;

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
        if (requestUrl === '/api/graph/root') {
          return {
            nodes: [
            {
              id: 'de.aventiure',
              label: 'de.aventiure',
              type: 'package',
              expandable: true,
            },
            ],
            edges: [],
          };
        }

        return {
          nodes: [
            {
              id: 'de.aventiure.lay05_being',
              label: 'lay05_being',
              type: 'package',
              expandable: false,
              parentId: 'de.aventiure',
            },
          ],
          edges: [],
        };
      },
      renderGraphImpl: () => ({
        appendGraph(graph) {
          appendCalls.push(graph);
        },
        cy: {
          on(eventName, selector, handler) {
            tapHandlers.push({ eventName, selector, handler });
          },
        },
        destroy() {},
      }),
      timeSource: () => now,
      requestUrl: '/api/graph/root',
      windowObject: {
        addEventListener() {},
        removeEventListener() {},
      },
      cytoscape: {},
    });

    const handler = tapHandlers[0].handler;
    handler({
      target: {
        data(fieldName) {
          return fieldName === 'id' ? 'de.aventiure' : undefined;
        },
      },
    });
    now += 150;
    handler({
      target: {
        data(fieldName) {
          return fieldName === 'id' ? 'de.aventiure' : undefined;
        },
      },
    });
    await new Promise((resolve) => setTimeout(resolve, 0));
    now += 50;
    handler({
      target: {
        data(fieldName) {
          return fieldName === 'id' ? 'de.aventiure' : undefined;
        },
      },
    });
    now += 120;
    handler({
      target: {
        data(fieldName) {
          return fieldName === 'id' ? 'de.aventiure' : undefined;
        },
      },
    });
    await new Promise((resolve) => setTimeout(resolve, 0));
  } finally {
    console.error = originalConsoleError;
  }

  // THEN
  assert.deepEqual(loadCalls, [
    '/api/graph/root',
    '/api/graph/package?packageName=de.aventiure',
  ]);
  assert.deepEqual(appendCalls, [
    {
      nodes: [
        {
          id: 'de.aventiure',
          label: 'de.aventiure',
          type: 'package',
          expandable: true,
          parentId: null,
        },
        {
          id: 'de.aventiure.lay05_being',
          label: 'lay05_being',
          type: 'package',
          expandable: false,
          parentId: 'de.aventiure',
        },
      ],
      edges: [],
    },
    {
      nodes: [
        {
          id: 'de.aventiure',
          label: 'de.aventiure',
          type: 'package',
          expandable: true,
          parentId: null,
        },
      ],
      edges: [],
    },
  ]);
});

test('createPackageRequestUrl kodiert den Package-Namen für Nachladeanfragen', () => {
  // WHEN / THEN
  assert.equal(createPackageRequestUrl('de.aventiure.lay05_being'), '/api/graph/package?packageName=de.aventiure.lay05_being');
});

test('createTypeRequestUrl kodiert den Typ-Namen für Nachladeanfragen', () => {
  // WHEN / THEN
  assert.equal(createTypeRequestUrl('de.aventiure.Outer.Inner'), '/api/graph/type?typeId=de.aventiure.Outer.Inner');
});

test('installNodeDoubleClickHandler reagiert nur auf zwei schnelle Taps desselben Knotens', async () => {
  // GIVEN
  const cy = {
    on(_eventName, _selector, handler) {
      this.handler = handler;
    },
  };
  const openedNodeIds = [];
  let now = 1000;
  // WHEN
  installNodeDoubleClickHandler(cy, async (nodeId) => {
    openedNodeIds.push(nodeId);
  }, () => now);

  cy.handler({
    target: {
      data() {
        return 'de.aventiure';
      },
    },
  });
  now += 450;
  cy.handler({
    target: {
      data() {
        return 'de.aventiure';
      },
    },
  });
  now += 100;
  cy.handler({
    target: {
      data() {
        return 'de.aventiure';
      },
    },
  });
  await new Promise((resolve) => setTimeout(resolve, 0));

  // THEN
  assert.deepEqual(openedNodeIds, ['de.aventiure']);
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
              id: 'de.aventiure',
              label: 'de.aventiure',
              type: 'package',
              expandable: true,
            },
        ],
        edges: [
          {
            source: 'de.aventiure',
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

test('startGraphApp zeigt Server-Fehlermeldungen im Fehlerlayout', async () => {
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
      fetchImpl: async () => ({
        ok: false,
        status: 404,
        json: async () => ({
          message: 'Der Workspace-Pfad C:\\projects\\2003\\aventiure wurde nicht gefunden.',
        }),
      }),
      graphErrorMessage: errorMessage,
      graphStatus: statusElement,
      graphStatusMessage: statusMessage,
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
  assert.equal(errorMessage.textContent, 'Der Workspace-Pfad C:\\projects\\2003\\aventiure wurde nicht gefunden.');
});
