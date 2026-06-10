import assert from 'node:assert/strict';
import test from 'node:test';

import { GraphDataValidationError, createGraphElements, normalizeGraph } from '../main/resources/static/graph-data.mjs';

test('normalizeGraph normalisiert gültige Graphdaten', () => {
  // GIVEN
  const graph = {
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
        id: 'root-directory',
        label: 'Workspace',
        type: 'directory',
      },
    },
    {
      data: {
        id: 'edge-0-root-directory-package-a',
        source: 'root-directory',
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
      GraphDataValidationError);
});
