import assert from 'node:assert/strict';
import test from 'node:test';

import { GraphDataValidationError, createGraphElements, normalizeGraph } from '../main/resources/static/graph-data.mjs';

test('normalizeGraph normalisiert gültige Graphdaten', () => {
  // GIVEN
  const graph = {
    nodes: [
      {
        id: 'de.aventiure',
        label: 'de.aventiure',
        type: 'package',
      },
    ],
    edges: [
      {
        source: 'de.aventiure',
        target: 'package-a',
      },
    ],
  };

  // WHEN
  const normalized = normalizeGraph(graph);
  const elements = createGraphElements(graph);

  // THEN
  assert.deepEqual(normalized, graph);
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
        id: 'edge-0-de.aventiure-package-a',
        source: 'de.aventiure',
        target: 'package-a',
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
        ],
        edges: [
          {
            source: 'de.aventiure',
          },
        ],
      }),
      GraphDataValidationError);
});
