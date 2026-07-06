import assert from 'node:assert/strict';
import test from 'node:test';

import { calculateExpandedPackageBox, calculateExpansionTranslations, calculateLayoutReflowTranslations, calculateZoomAdjustedNodeTextStyle } from '../main/resources/static/graph-renderer.mjs';

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

test('calculateExpansionTranslations schiebt Knoten auf der passenden Seite aus dem offenen Package heraus', () => {
  // GIVEN
  const expandedBox = {
    x1: 100,
    y1: 100,
    x2: 300,
    y2: 300,
  };

  // WHEN
  const translations = calculateExpansionTranslations(expandedBox, [
    {
      id: 'left',
      box: {
        x1: 40,
        y1: 150,
        x2: 120,
        y2: 230,
      },
      ancestorIds: [],
    },
    {
      id: 'right',
      box: {
        x1: 280,
        y1: 150,
        x2: 360,
        y2: 230,
      },
      ancestorIds: [],
    },
    {
      id: 'up',
      box: {
        x1: 150,
        y1: 40,
        x2: 230,
        y2: 120,
      },
      ancestorIds: [],
    },
    {
      id: 'down',
      box: {
        x1: 150,
        y1: 280,
        x2: 230,
        y2: 360,
      },
      ancestorIds: [],
    },
  ]);

  // THEN
  assert.deepEqual([...translations.entries()].sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey)), [
    ['down', { x: 0, y: 68 }],
    ['left', { x: -68, y: 0 }],
    ['right', { x: 68, y: 0 }],
    ['up', { x: 0, y: -68 }],
  ]);
});

test('calculateExpansionTranslations verschiebt nur den obersten kollidierenden Knoten', () => {
  // GIVEN
  const expandedBox = {
    x1: 0,
    y1: 0,
    x2: 200,
    y2: 200,
  };

  // WHEN
  const translations = calculateExpansionTranslations(expandedBox, [
    {
      id: 'parent',
      box: {
        x1: 150,
        y1: 50,
        x2: 260,
        y2: 160,
      },
      ancestorIds: [],
    },
    {
      id: 'child',
      box: {
        x1: 170,
        y1: 70,
        x2: 220,
        y2: 120,
      },
      ancestorIds: ['parent'],
    },
  ]);

  // THEN
  assert.deepEqual([...translations.entries()], [
    ['parent', { x: 98, y: 0 }],
  ]);
});

test('calculateExpansionTranslations verschiebt den expandierten Knoten selbst nicht', () => {
  // GIVEN
  const expandedBox = {
    x1: 0,
    y1: 0,
    x2: 200,
    y2: 200,
  };

  // WHEN
  const translations = calculateExpansionTranslations(expandedBox, [
    {
      id: 'expanded',
      box: {
        x1: 0,
        y1: 0,
        x2: 200,
        y2: 200,
      },
      ancestorIds: [],
    },
    {
      id: 'sibling',
      box: {
        x1: 150,
        y1: 50,
        x2: 260,
        y2: 160,
      },
      ancestorIds: [],
    },
  ], new Set(['expanded']));

  // THEN
  assert.deepEqual([...translations.entries()], [
    ['sibling', { x: 98, y: 0 }],
  ]);
});

test('calculateExpandedPackageBox umfasst die Kind-Boxen des geöffneten Packages', () => {
  // GIVEN
  const childBox = {
    x1: 140,
    y1: 220,
    x2: 260,
    y2: 320,
  };
  const packageNode = fakeNode({
    x1: 100,
    y1: 100,
    x2: 300,
    y2: 200,
  }, [
    fakeNode(childBox),
  ]);
  const cy = fakeCy(new Map([
    ['expanded', packageNode],
  ]));

  // WHEN
  const expandedBox = calculateExpandedPackageBox(cy, new Set(['expanded']));

  // THEN
  assert.deepEqual(expandedBox, {
    x1: 100,
    y1: 100,
    x2: 300,
    y2: 320,
  });
});

test('calculateLayoutReflowTranslations schiebt umgebende Knoten sichtbar auseinander', () => {
  // GIVEN
  const expandedBox = {
    x1: 100,
    y1: 100,
    x2: 300,
    y2: 300,
  };

  // WHEN
  const translations = calculateLayoutReflowTranslations(expandedBox, [
    {
      id: 'left',
      box: {
        x1: 40,
        y1: 150,
        x2: 90,
        y2: 220,
      },
      ancestorIds: [],
    },
    {
      id: 'right',
      box: {
        x1: 310,
        y1: 150,
        x2: 360,
        y2: 220,
      },
      ancestorIds: [],
    },
    {
      id: 'up',
      box: {
        x1: 150,
        y1: 40,
        x2: 220,
        y2: 90,
      },
      ancestorIds: [],
    },
    {
      id: 'down',
      box: {
        x1: 150,
        y1: 310,
        x2: 220,
        y2: 360,
      },
      ancestorIds: [],
    },
  ]);

  // THEN
  assert.deepEqual([...translations.entries()].sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey)), [
    ['down', { x: 0, y: 116 }],
    ['left', { x: -244, y: 0 }],
    ['right', { x: 244, y: 0 }],
    ['up', { x: 0, y: -116 }],
  ]);
});

function fakeCy(nodesById) {
  return {
    getElementById(id) {
      return nodesById.get(id) ?? fakeEmptyNode();
    },
  };
}

function fakeNode(box, descendants = []) {
  return {
    empty: () => false,
    descendants: () => descendants,
    boundingBox: () => box,
  };
}

function fakeEmptyNode() {
  return {
    empty: () => true,
    descendants: () => [],
    boundingBox: () => {
      throw new Error('Should not be called.');
    },
  };
}
