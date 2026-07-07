import assert from 'node:assert/strict';
import test from 'node:test';

import { buildElkGraph, calculateZoomAdjustedNodeTextStyle, calculateZoomAdjustedTypeNodeTextStyle } from '../main/resources/static/graph-renderer.mjs';

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
              },
            ],
          },
        ],
      },
    ],
    edges: [],
  });
});
