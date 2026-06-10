import assert from 'node:assert/strict';
import test from 'node:test';

import { diffGraphNodes } from '../main/resources/static/graph-data.mjs';

test('diffGraphNodes erkennt hinzugefügte, entfernte und geänderte Knoten', () => {
  // GIVEN
  const previousNodes = [
    {
      id: 'root-directory',
      label: 'Workspace',
      type: 'directory',
    },
    {
      id: 'old-package',
      label: 'old-package',
      type: 'package',
    },
  ];

  const nextNodes = [
    {
      id: 'root-directory',
      label: 'Workspace',
      type: 'directory',
    },
    {
      id: 'new-package',
      label: 'new-package',
      type: 'package',
    },
    {
      id: 'old-package',
      label: 'old-package-renamed',
      type: 'package',
    },
  ];

  // WHEN
  const diff = diffGraphNodes(previousNodes, nextNodes);

  // THEN
  assert.deepEqual(diff, {
    added: [
      {
        id: 'new-package',
        label: 'new-package',
        type: 'package',
      },
    ],
    removed: [],
    updated: [
      {
        id: 'old-package',
        label: 'old-package-renamed',
        type: 'package',
      },
    ],
  });
});

test('diffGraphNodes erkennt entfernte Knoten', () => {
  // GIVEN
  const previousNodes = [
    {
      id: 'root-directory',
      label: 'Workspace',
      type: 'directory',
    },
    {
      id: 'old-package',
      label: 'old-package',
      type: 'package',
    },
  ];

  const nextNodes = [
    {
      id: 'root-directory',
      label: 'Workspace',
      type: 'directory',
    },
  ];

  // WHEN
  const diff = diffGraphNodes(previousNodes, nextNodes);

  // THEN
  assert.deepEqual(diff, {
    added: [],
    removed: [
      {
        id: 'old-package',
        label: 'old-package',
        type: 'package',
      },
    ],
    updated: [],
  });
});
