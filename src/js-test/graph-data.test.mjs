import assert from 'node:assert/strict';
import test from 'node:test';

import { GraphDataValidationError, collapseGraph, createGraphElements, mergeGraphs, normalizeGraph } from '../main/resources/static/graph-data.mjs';

test('normalizeGraph normalisiert gültige Graphdaten', () => {
  // GIVEN
  const graph = {
    nodes: [
      {
        id: 'de.aventiure',
        label: 'de.aventiure',
        type: 'package',
      },
      {
        id: 'de.aventiure.lay05_being',
        label: 'lay05_being',
        type: 'package',
        parentId: 'de.aventiure',
      },
    ],
    edges: [],
  };

  // WHEN
  const normalized = normalizeGraph(graph);
  const elements = createGraphElements(graph);

  // THEN
  assert.deepEqual(normalized, {
    nodes: [
      {
        id: 'de.aventiure',
        label: 'de.aventiure',
        type: 'package',
        parentId: null,
      },
      {
        id: 'de.aventiure.lay05_being',
        label: 'lay05_being',
        type: 'package',
        parentId: 'de.aventiure',
      },
    ],
    edges: [],
  });
  assert.deepEqual(elements, [
    {
      data: {
        id: 'de.aventiure',
        label: 'de.aventiure',
        type: 'package',
        width: 220,
        height: 92,
      },
    },
    {
      data: {
        id: 'de.aventiure.lay05_being',
        label: 'lay05_being',
        type: 'package',
        width: 220,
        height: 92,
        parent: 'de.aventiure',
      },
    },
  ]);
});

test('normalizeGraph wirft bei ungültigen Graphdaten', () => {
  // WHEN / THEN
  assert.throws(
      () => normalizeGraph({
        nodes: [
          {
            id: 'de.aventiure',
            label: 'de.aventiure',
            type: 'package',
          },
          {
            id: 'de.aventiure.lay05_being',
            label: 'lay05_being',
            type: 'package',
            parentId: 'de.aventiure',
          },
        ],
        edges: [
          {
            source: 'de.aventiure',
          },
        ],
      }),
      GraphDataValidationError);
});

test('mergeGraphs ergänzt neue Package-Knoten als Kind-Boxen ohne Duplikate', () => {
  // GIVEN
  const previousGraph = {
    nodes: [
      {
        id: 'de.aventiure',
        label: 'de.aventiure',
        type: 'package',
        parentId: null,
      },
    ],
    edges: [],
  };
  const graphToMerge = {
    nodes: [
      {
        id: 'de.aventiure.lay05_being',
        label: 'lay05_being',
        type: 'package',
        parentId: 'de.aventiure',
      },
    ],
    edges: [],
  };

  // WHEN
  const mergedGraph = mergeGraphs(previousGraph, graphToMerge);

  // THEN
  assert.deepEqual(mergedGraph, {
    nodes: [
      {
        id: 'de.aventiure',
        label: 'de.aventiure',
        type: 'package',
        parentId: null,
      },
      {
        id: 'de.aventiure.lay05_being',
        label: 'lay05_being',
        type: 'package',
        parentId: 'de.aventiure',
      },
    ],
    edges: [],
  });
});

test('collapseGraph entfernt einen Package-Knoten mit allen sichtbaren Nachfahren', () => {
  // GIVEN
  const graph = {
    nodes: [
      {
        id: 'de.aventiure',
        label: 'de.aventiure',
        type: 'package',
        parentId: null,
      },
      {
        id: 'de.aventiure.lay05_being',
        label: 'lay05_being',
        type: 'package',
        parentId: 'de.aventiure',
      },
      {
        id: 'de.aventiure.lay05_being.model',
        label: 'model',
        type: 'package',
        parentId: 'de.aventiure.lay05_being',
      },
      {
        id: 'de.aventiure.other',
        label: 'other',
        type: 'package',
        parentId: 'de.aventiure',
      },
    ],
    edges: [
      {
        source: 'de.aventiure.lay05_being',
        target: 'de.aventiure.other',
      },
    ],
  };

  // WHEN
  const collapsedGraph = collapseGraph(graph, 'de.aventiure.lay05_being');

  // THEN
  assert.deepEqual(collapsedGraph, {
    nodes: [
      {
        id: 'de.aventiure',
        label: 'de.aventiure',
        type: 'package',
        parentId: null,
      },
      {
        id: 'de.aventiure.lay05_being',
        label: 'lay05_being',
        type: 'package',
        parentId: 'de.aventiure',
      },
      {
        id: 'de.aventiure.other',
        label: 'other',
        type: 'package',
        parentId: 'de.aventiure',
      },
    ],
    edges: [
      {
        source: 'de.aventiure.lay05_being',
        target: 'de.aventiure.other',
      },
    ],
  });
});
