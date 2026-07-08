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

function addPositions(layoutNode) {
  return {
    ...layoutNode,
    x: layoutNode.x ?? 0,
    y: layoutNode.y ?? 0,
    children: (layoutNode.children ?? []).map((childNode) => addPositions(childNode)),
  };
}
