import assert from 'node:assert/strict';
import test from 'node:test';

import { GraphDataValidationError, createGraphElements, mergeGraphs, normalizeGraph } from '../main/resources/static/graph-data.mjs';

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
      },
    },
    {
      data: {
        id: 'de.aventiure.lay05_being',
        label: 'lay05_being',
        type: 'package',
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
