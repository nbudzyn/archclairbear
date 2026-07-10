import assert from 'node:assert/strict';
import test from 'node:test';

import { buildElkGraph, calculateZoomAdjustedNodeTextStyle, calculateZoomAdjustedTypeNodeTextStyle, renderGraph } from '../main/resources/static/graph-renderer.mjs';

test('calculateZoomAdjustedNodeTextStyle hält die Mindestschriftgröße bei kleinem Zoom', () => {
  // WHEN
  const textStyle = calculateZoomAdjustedNodeTextStyle(0.4);

  // THEN
  assert.deepEqual(textStyle, {
    fontSize: 25,
    textMaxWidth: 330,
  });
});

test('calculateZoomAdjustedNodeTextStyle bleibt bei normalem Zoom auf der Basisgröße', () => {
  // WHEN
  const textStyle = calculateZoomAdjustedNodeTextStyle(1);

  // THEN
  assert.deepEqual(textStyle, {
    fontSize: 12,
    textMaxWidth: 150,
  });
});

test('calculateZoomAdjustedTypeNodeTextStyle bleibt bei normalem Zoom auf der Typ-Basisgröße', () => {
  // WHEN
  const textStyle = calculateZoomAdjustedTypeNodeTextStyle(1);

  // THEN
  assert.deepEqual(textStyle, {
    fontSize: 11,
    textMaxWidth: 126,
  });
});

test('renderGraph richtet offene Typ-Knoten oben und geschlossene Typ-Knoten mittig aus', async () => {
  // GIVEN
  const styleCalls = [];
  const cytoscape = (options) => {
    styleCalls.push(options.style);

    return {
      ready(callback) {
        callback();
      },
      on() {},
      style() {
        return {
          selector() {
            return this;
          },
          style() {
            return this;
          },
          update() {
            return this;
          },
        };
      },
      zoom() {
        return 1;
      },
      fit() {},
      resize() {},
      elements() {
        return {
          remove() {},
        };
      },
      add() {},
      destroy() {},
    };
  };

  // WHEN
  await renderGraph({
    nodes: [
      {
        id: 'de.aventiure',
        label: 'de.aventiure',
        type: 'package',
      },
      {
        id: 'de.aventiure.Outer',
        label: 'Outer',
        type: 'type',
        parentId: 'de.aventiure',
      },
      {
        id: 'de.aventiure.Outer.Inner',
        label: 'Inner',
        type: 'type',
        parentId: 'de.aventiure.Outer',
      },
    ],
    edges: [],
  }, {
    cytoscape,
    container: {},
    windowObject: {
      addEventListener() {},
      removeEventListener() {},
      ELK: class {
        async layout(elkGraph) {
          return addPositions(elkGraph);
        }
      },
    },
  });

  // THEN
  assert.equal(styleCalls.length, 1);
  assert.deepEqual(styleCalls[0].find((entry) => entry.selector === 'node[type = "type"]')?.style, {
    shape: 'round-rectangle',
    'background-color': '#162b3a',
    'border-color': 'rgba(124, 212, 255, 0.3)',
    'border-width': 1.2,
    color: '#ecf4ff',
    'font-size': 11,
    'font-weight': '500',
    'text-max-width': 126,
    'text-valign': 'center',
    'text-margin-y': 0,
  });
  assert.deepEqual(styleCalls[0].find((entry) => entry.selector === 'node[type = "type"]:parent')?.style, {
    'text-valign': 'top',
    'text-halign': 'center',
    'text-margin-y': 18,
  });
  assert.deepEqual(styleCalls[0].find((entry) => entry.selector === 'edge')?.style, {
    width: 2,
    'line-color': 'rgba(124, 212, 255, 0.64)',
    'target-arrow-color': 'rgba(124, 212, 255, 0.86)',
    'target-arrow-shape': 'triangle',
    'curve-style': 'bezier',
    'arrow-scale': 1.1,
    'opacity': 0.82,
    'events': 'no',
  });
});

test('renderGraph rendert Package-Kanten und aktualisiert sie beim Nachladen', async () => {
  // GIVEN
  let initialElements = [];
  let renderedElements = [];
  const cytoscape = (options) => {
    initialElements = options.elements;
    const cy = createCytoscapeUpdateDouble(options);

    return cy;
  };

  // WHEN
  const renderState = await renderGraph({
    nodes: [
      packageNode('de.aventiure.story'),
      packageNode('de.aventiure.common'),
    ],
    edges: [
      {
        source: 'de.aventiure.story',
        target: 'de.aventiure.common',
      },
    ],
  }, {
    cytoscape,
    container: {},
    windowObject: {
      addEventListener() {},
      removeEventListener() {},
      ELK: class {
        async layout(elkGraph) {
          return addPositions(elkGraph);
        }
      },
    },
  });

  await renderState.appendGraph({
    nodes: [
      packageNode('de.aventiure.story'),
      packageNode('de.aventiure.common'),
      packageNode('de.aventiure.ai'),
    ],
    edges: [
      {
        source: 'de.aventiure.story',
        target: 'de.aventiure.ai',
      },
    ],
  });
  renderedElements = renderState.cy.snapshotElements();

  // THEN
  assert.deepEqual(collectEdgeData(initialElements), [
    {
      id: 'edge-de.aventiure.story-de.aventiure.common',
      source: 'de.aventiure.story',
      target: 'de.aventiure.common',
    },
  ]);
  assert.deepEqual(collectEdgeData(renderedElements), [
    {
      id: 'edge-de.aventiure.story-de.aventiure.ai',
      source: 'de.aventiure.story',
      target: 'de.aventiure.ai',
    },
  ]);
});

test('renderGraph verwendet bestehende Elemente beim Nachladen wieder und erhält den Viewport', async () => {
  // GIVEN
  let cy = null;
  const fitCalls = [];
  const removedElementIds = [];
  const layoutPositions = [
    new Map([
      ['de.aventiure.story', { x: 10, y: 20 }],
      ['de.aventiure.common', { x: 240, y: 20 }],
    ]),
    new Map([
      ['de.aventiure.story', { x: 70, y: 80 }],
      ['de.aventiure.common', { x: 300, y: 80 }],
      ['de.aventiure.ai', { x: 530, y: 80 }],
    ]),
  ];
  const cytoscape = (options) => {
    cy = createCytoscapeUpdateDouble(options, {
      fitCalls,
      removedElementIds,
    });

    return cy;
  };

  // WHEN
  const renderState = await renderGraph({
    nodes: [
      packageNode('de.aventiure.story'),
      packageNode('de.aventiure.common'),
    ],
    edges: [
      {
        source: 'de.aventiure.story',
        target: 'de.aventiure.common',
      },
    ],
  }, {
    cytoscape,
    container: {},
    windowObject: {
      addEventListener() {},
      removeEventListener() {},
      ELK: class {
        async layout(elkGraph) {
          return addPositionsFromMap(elkGraph, layoutPositions.shift());
        }
      },
    },
  });
  const existingStoryElement = cy.storedElement('de.aventiure.story');
  const storyPositionBeforeUpdate = { ...existingStoryElement.position };

  await renderState.appendGraph({
    nodes: [
      packageNode('de.aventiure.story'),
      packageNode('de.aventiure.common'),
      packageNode('de.aventiure.ai'),
    ],
    edges: [
      {
        source: 'de.aventiure.story',
        target: 'de.aventiure.ai',
      },
    ],
  }, {
    focusNodeId: 'de.aventiure.story',
  });

  // THEN
  assert.equal(cy.storedElement('de.aventiure.story'), existingStoryElement);
  assert.deepEqual(cy.storedElement('de.aventiure.story').position, storyPositionBeforeUpdate);
  assert.deepEqual(fitCalls, ['fit']);
  assert.deepEqual(removedElementIds, ['edge-de.aventiure.story-de.aventiure.common']);
  assert.deepEqual(collectEdgeData(cy.snapshotElements()), [
    {
      id: 'edge-de.aventiure.story-de.aventiure.ai',
      source: 'de.aventiure.story',
      target: 'de.aventiure.ai',
    },
  ]);
});

test('renderGraph fügt neue Compound-Kinder direkt an ihrer Zielposition ein', async () => {
  // GIVEN
  let cy = null;
  const addedElements = [];
  const animateCalls = [];
  const layoutPositions = [
    new Map([
      ['de.aventiure', { x: 10, y: 20 }],
    ]),
    new Map([
      ['de.aventiure', { x: 40, y: 50 }],
      ['de.aventiure.story', { x: 300, y: 80 }],
    ]),
  ];
  const cytoscape = (options) => {
    cy = createCytoscapeUpdateDouble(options, {
      addedElements,
      animateCalls,
    });

    return cy;
  };

  // WHEN
  const renderState = await renderGraph({
    nodes: [
      packageNode('de.aventiure'),
    ],
    edges: [],
  }, {
    cytoscape,
    container: {},
    windowObject: {
      addEventListener() {},
      removeEventListener() {},
      ELK: class {
        async layout(elkGraph) {
          return addPositionsFromMap(elkGraph, layoutPositions.shift());
        }
      },
    },
  });

  await renderState.appendGraph({
    nodes: [
      packageNode('de.aventiure'),
      {
        ...packageNode('de.aventiure.story'),
        parentId: 'de.aventiure',
      },
    ],
    edges: [],
  }, {
    focusNodeId: 'de.aventiure',
  });

  // THEN
  assert.deepEqual(addedElements.find((element) => element.id === 'de.aventiure.story'), {
    id: 'de.aventiure.story',
    parent: 'de.aventiure',
    position: {
      x: 420,
      y: 146,
    },
  });
  assert.equal(animateCalls.some((call) => call.id === 'de.aventiure.story'), false);
  assert.deepEqual(cy.storedElement('de.aventiure.story').position, {
    x: 420,
    y: 146,
  });
  assert.equal(cy.storedElement('de.aventiure.story').data.parent, 'de.aventiure');
});

test('renderGraph animiert bestehende Knoten beim Nachladen auf ihre neue Layout-Position', async () => {
  // GIVEN
  let cy = null;
  const animateCalls = [];
  const layoutPositions = [
    new Map([
      ['de.aventiure.story', { x: 10, y: 20 }],
      ['de.aventiure.common', { x: 240, y: 20 }],
    ]),
    new Map([
      ['de.aventiure.story', { x: 90, y: 120 }],
      ['de.aventiure.common', { x: 320, y: 120 }],
    ]),
  ];
  const cytoscape = (options) => {
    cy = createCytoscapeUpdateDouble(options, {
      animateCalls,
    });

    return cy;
  };

  // WHEN
  const renderState = await renderGraph({
    nodes: [
      packageNode('de.aventiure.story'),
      packageNode('de.aventiure.common'),
    ],
    edges: [],
  }, {
    cytoscape,
    container: {},
    windowObject: {
      addEventListener() {},
      removeEventListener() {},
      ELK: class {
        async layout(elkGraph) {
          return addPositionsFromMap(elkGraph, layoutPositions.shift());
        }
      },
    },
  });

  await renderState.appendGraph({
    nodes: [
      packageNode('de.aventiure.story'),
      packageNode('de.aventiure.common'),
    ],
    edges: [],
  });

  // THEN
  assert.deepEqual(animateCalls, [
    {
      id: 'de.aventiure.story',
      position: {
        x: 200,
        y: 166,
      },
      duration: 320,
      easing: 'ease-in-out',
    },
    {
      id: 'de.aventiure.common',
      position: {
        x: 430,
        y: 166,
      },
      duration: 320,
      easing: 'ease-in-out',
    },
  ]);
  assert.deepEqual(cy.storedElement('de.aventiure.story').position, {
    x: 200,
    y: 166,
  });
  assert.deepEqual(cy.storedElement('de.aventiure.common').position, {
    x: 430,
    y: 166,
  });
});

test('renderGraph erhält manuell verschobene sichtbare Knoten beim Layoutwechsel', async () => {
  // GIVEN
  let cy = null;
  const animateCalls = [];
  const layoutPositions = [
    new Map([
      ['de.aventiure.story', { x: 10, y: 20 }],
      ['de.aventiure.common', { x: 240, y: 20 }],
    ]),
    new Map([
      ['de.aventiure.story', { x: 90, y: 120 }],
      ['de.aventiure.common', { x: 320, y: 120 }],
    ]),
    new Map([
      ['de.aventiure.common', { x: 320, y: 120 }],
    ]),
    new Map([
      ['de.aventiure.story', { x: 500, y: 120 }],
      ['de.aventiure.common', { x: 320, y: 120 }],
    ]),
  ];
  const cytoscape = (options) => {
    cy = createCytoscapeUpdateDouble(options, {
      animateCalls,
    });

    return cy;
  };

  // WHEN
  const renderState = await renderGraph({
    nodes: [
      packageNode('de.aventiure.story'),
      packageNode('de.aventiure.common'),
    ],
    edges: [],
  }, {
    cytoscape,
    container: {},
    windowObject: {
      addEventListener() {},
      removeEventListener() {},
      ELK: class {
        async layout(elkGraph) {
          return addPositionsFromMap(elkGraph, layoutPositions.shift());
        }
      },
    },
  });

  cy.getElementById('de.aventiure.story').position({
    x: 777,
    y: 888,
  });
  cy.triggerNodeEvent('dragfree', 'de.aventiure.story');

  await renderState.appendGraph({
    nodes: [
      packageNode('de.aventiure.story'),
      packageNode('de.aventiure.common'),
    ],
    edges: [],
  });
  await renderState.appendGraph({
    nodes: [
      packageNode('de.aventiure.common'),
    ],
    edges: [],
  });
  await renderState.appendGraph({
    nodes: [
      packageNode('de.aventiure.story'),
      packageNode('de.aventiure.common'),
    ],
    edges: [],
  });

  // THEN
  assert.deepEqual(animateCalls, [
    {
      id: 'de.aventiure.common',
      position: {
        x: 430,
        y: 166,
      },
      duration: 320,
      easing: 'ease-in-out',
    },
    {
      id: 'de.aventiure.story',
      position: {
        x: 610,
        y: 166,
      },
      duration: 320,
      easing: 'ease-in-out',
    },
  ]);
  assert.deepEqual(cy.storedElement('de.aventiure.story').position, {
    x: 610,
    y: 166,
  });
  assert.deepEqual(cy.storedElement('de.aventiure.common').position, {
    x: 430,
    y: 166,
  });
});

test('renderGraph entfernt nicht mehr sichtbare Knoten einzeln beim Zuklappen', async () => {
  // GIVEN
  const eventLog = [];
  const removedElementIds = [];
  let cy = null;
  const cytoscape = (options) => {
    cy = createCytoscapeUpdateDouble(options, {
      eventLog,
      removedElementIds,
    });

    return cy;
  };

  // WHEN
  const renderState = await renderGraph({
    nodes: [
      packageNode('de.aventiure'),
      {
        ...packageNode('de.aventiure.story'),
        parentId: 'de.aventiure',
      },
    ],
    edges: [],
  }, {
    cytoscape,
    container: {},
    windowObject: {
      addEventListener() {},
      removeEventListener() {},
      ELK: class {
        async layout(elkGraph) {
          return addPositions(elkGraph);
        }
      },
    },
  });

  await renderState.appendGraph({
    nodes: [
      packageNode('de.aventiure'),
    ],
    edges: [],
  }, {
    focusNodeId: 'de.aventiure',
  });

  // THEN
  assert.ok(eventLog.indexOf('remove:de.aventiure.story') > eventLog.indexOf('animate:de.aventiure'));
  assert.deepEqual(removedElementIds, ['de.aventiure.story']);
  assert.deepEqual(cy.snapshotElements().map((element) => element.data.id), ['de.aventiure']);
});

test('buildElkGraph baut verschachtelte Package-Boxen für ELK', () => {
  // WHEN
  const elkGraph = buildElkGraph({
    nodes: [
      {
        id: 'de.aventiure',
        label: 'de.aventiure',
        type: 'package',
      },
      {
        id: 'lay04a_skill',
        label: 'lay04a_skill',
        type: 'package',
        parentId: 'de.aventiure',
      },
      {
        id: 'lay04b_object',
        label: 'lay04b_object',
        type: 'package',
        parentId: 'de.aventiure',
      },
      {
        id: 'model',
        label: 'model',
        type: 'package',
        parentId: 'lay04b_object',
      },
      {
        id: 'lay04b_object.Action',
        label: 'Action',
        type: 'type',
        parentId: 'lay04b_object',
      },
      {
        id: 'lay04b_object.Action.Inner',
        label: 'Inner',
        type: 'type',
        parentId: 'lay04b_object.Action',
      },
    ],
    edges: [],
  });

  // THEN
  assert.deepEqual(elkGraph, {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': 'DOWN',
      'elk.hierarchyHandling': 'INCLUDE_CHILDREN',
      'elk.spacing.nodeNode': 40,
    },
    children: [
      {
        id: 'de.aventiure',
        width: 220,
        height: 92,
        children: [
          {
            id: 'lay04a_skill',
            width: 220,
            height: 92,
          },
          {
            id: 'lay04b_object',
            width: 220,
            height: 92,
            children: [
              {
                id: 'model',
                width: 220,
                height: 92,
              },
              {
                id: 'lay04b_object.Action',
                width: 180,
                height: 64,
                children: [
                  {
                    id: 'lay04b_object.Action.Inner',
                    width: 180,
                    height: 64,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    edges: [],
  });
});

test('buildElkGraph übernimmt sichtbare Package-Kanten für das Layout', () => {
  // WHEN
  const elkGraph = buildElkGraph({
    nodes: [
      packageNode('de.aventiure.story'),
      packageNode('de.aventiure.common'),
    ],
    edges: [
      {
        source: 'de.aventiure.story',
        target: 'de.aventiure.common',
      },
    ],
  });

  // THEN
  assert.deepEqual(elkGraph.edges, [
    {
      id: 'edge-de.aventiure.story-de.aventiure.common',
      sources: ['de.aventiure.story'],
      targets: ['de.aventiure.common'],
    },
  ]);
});

function addPositions(layoutNode) {
  return {
    ...layoutNode,
    x: layoutNode.x ?? 0,
    y: layoutNode.y ?? 0,
    children: (layoutNode.children ?? []).map((childNode) => addPositions(childNode)),
  };
}

function addPositionsFromMap(layoutNode, positionById) {
  const position = positionById.get(layoutNode.id) ?? { x: 0, y: 0 };

  return {
    ...layoutNode,
    x: position.x,
    y: position.y,
    children: (layoutNode.children ?? []).map((childNode) => addPositionsFromMap(childNode, positionById)),
  };
}

function packageNode(id) {
  return {
    id,
    label: id,
    type: 'package',
  };
}

function collectEdgeData(elements) {
  return elements
      .filter((element) => element?.data?.source != null)
      .map((element) => element.data);
}

function createCytoscapeUpdateDouble(options, {
  fitCalls = [],
  removedElementIds = [],
  animateCalls = [],
  addedElements = [],
  eventLog = [],
} = {}) {
  const elementsById = new Map();
  const eventHandlers = [];
  const emptyElement = {
    empty() {
      return true;
    },
  };
  const cy = {
    ready(callback) {
      callback();
    },
    on(eventName, selector, handler) {
      eventHandlers.push({
        eventName,
        selector,
        handler,
      });
    },
    style() {
      return {
        selector() {
          return this;
        },
        style() {
          return this;
        },
        update() {
          return this;
        },
      };
    },
    zoom() {
      return 1;
    },
    fit() {
      fitCalls.push('fit');
    },
    resize() {},
    elements() {
      return {
        toArray() {
          return [...elementsById.values()].map((element) => createElementApi(
              element,
              elementsById,
              removedElementIds,
              animateCalls,
              eventLog,
          ));
        },
        remove() {
          elementsById.clear();
        },
      };
    },
    add(elements) {
      const elementList = Array.isArray(elements) ? elements : [elements];
      elementList.forEach((element) => {
        elementsById.set(element.data.id, structuredCloneForTest(element));
        addedElements.push({
          id: element.data.id,
          parent: element.data.parent ?? null,
          position: element.position == null ? null : structuredCloneForTest(element.position),
        });
        eventLog.push(`add:${element.data.id}`);
      });
    },
    getElementById(elementId) {
      const element = elementsById.get(elementId);

      return element == null
          ? emptyElement
          : createElementApi(element, elementsById, removedElementIds, animateCalls, eventLog);
    },
    storedElement(elementId) {
      return elementsById.get(elementId);
    },
    triggerNodeEvent(eventName, elementId) {
      const target = this.getElementById(elementId);
      eventHandlers
          .filter((handler) => handler.eventName === eventName && handler.selector === 'node')
          .forEach((handler) => handler.handler({ target }));
    },
    snapshotElements() {
      return [...elementsById.values()].map((element) => structuredCloneForTest(element));
    },
    destroy() {},
  };
  cy.add(options.elements);

  return cy;
}

function createElementApi(element, elementsById, removedElementIds, animateCalls, eventLog) {
  return {
    empty() {
      return false;
    },
    id() {
      return element.data.id;
    },
    data(nextData) {
      if (nextData == null) {
        return element.data;
      }

      if (typeof nextData === 'string') {
        return element.data[nextData];
      }

      element.data = nextData;
      return this;
    },
    position(nextPosition) {
      if (nextPosition == null) {
        return element.position;
      }

      element.position = nextPosition;
      return this;
    },
    move(target) {
      if (target.parent == null) {
        delete element.data.parent;
      } else {
        element.data.parent = target.parent;
      }

      return this;
    },
    animate(animation, options) {
      animateCalls.push({
        id: element.data.id,
        position: animation.position,
        duration: options.duration,
        easing: options.easing,
      });
      eventLog.push(`animate:${element.data.id}`);
      element.position = animation.position;
      options.complete();

      return {
        promise() {
          return Promise.resolve();
        },
      };
    },
    remove() {
      removedElementIds.push(element.data.id);
      eventLog.push(`remove:${element.data.id}`);
      elementsById.delete(element.data.id);
    },
  };
}

function structuredCloneForTest(value) {
  return JSON.parse(JSON.stringify(value));
}
