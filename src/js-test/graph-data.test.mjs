import assert from 'node:assert/strict';
import test from 'node:test';

import { GraphDataValidationError, calculateVisiblePackageEdges, collapseGraph, createGraphElements, mergeGraphs, normalizeGraph } from '../main/resources/static/graph-data.mjs';

test('normalizeGraph normalisiert gültige Graphdaten', () => {
  // GIVEN
  const graph = {
    nodes: [
      {
        id: 'de.aventiure',
        label: 'de.aventiure',
        type: 'package',
        expandable: true,
      },
      {
        id: 'de.aventiure.lay05_being',
        label: 'lay05_being',
        type: 'package',
        expandable: true,
        parentId: 'de.aventiure',
      },
      {
        id: 'de.aventiure.lay05_being.Action',
        label: 'Action',
        type: 'type',
        expandable: false,
        parentId: 'de.aventiure.lay05_being',
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
        expandable: true,
        parentId: null,
      },
      {
        id: 'de.aventiure.lay05_being',
        label: 'lay05_being',
        type: 'package',
        expandable: true,
        parentId: 'de.aventiure',
      },
      {
        id: 'de.aventiure.lay05_being.Action',
        label: 'Action',
        type: 'type',
        expandable: false,
        parentId: 'de.aventiure.lay05_being',
      },
    ],
    edges: [],
  });
  assert.deepEqual(elements, [
    {
      data: {
        id: 'de.aventiure',
        label: 'de.aventiure',
        displayLabel: 'de.aventiure',
        type: 'package',
        expandable: true,
        width: 220,
        height: 92,
      },
    },
    {
      data: {
        id: 'de.aventiure.lay05_being',
        label: 'lay05_being',
        displayLabel: 'lay05_being',
        type: 'package',
        expandable: true,
        width: 220,
        height: 92,
        parent: 'de.aventiure',
      },
    },
    {
      data: {
        id: 'de.aventiure.lay05_being.Action',
        label: 'Action',
        displayLabel: 'Action',
        type: 'type',
        expandable: false,
        width: 180,
        height: 64,
        parent: 'de.aventiure.lay05_being',
      },
    },
  ]);
});

test('normalizeGraph ergänzt fehlende Server-Kanten als interne leere Kantenliste', () => {
  // GIVEN
  const graph = {
    nodes: [
      {
        id: 'de.aventiure',
        label: 'de.aventiure',
        type: 'package',
      },
    ],
  };

  // WHEN
  const normalized = normalizeGraph(graph);

  // THEN
  assert.deepEqual(normalized, {
    nodes: [
      {
        id: 'de.aventiure',
        label: 'de.aventiure',
        type: 'package',
        expandable: false,
        parentId: null,
      },
    ],
    edges: [],
  });
});

test('createGraphElements zeigt aufklappbare zugeklappte Knoten mit Ellipse', () => {
  // GIVEN
  const graph = {
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
  };

  // WHEN
  const elements = createGraphElements(graph);

  // THEN
  assert.deepEqual(elements, [
    {
      data: {
        id: 'de.aventiure',
        label: 'de.aventiure',
        displayLabel: 'de.aventiure…',
        type: 'package',
        expandable: true,
        width: 220,
        height: 92,
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
            expandable: true,
          },
          {
            id: 'de.aventiure.lay05_being',
            label: 'lay05_being',
            type: 'package',
            expandable: false,
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
        expandable: true,
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
        expandable: false,
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
        expandable: true,
        parentId: null,
      },
      {
        id: 'de.aventiure.lay05_being',
        label: 'lay05_being',
        type: 'package',
        expandable: true,
        parentId: 'de.aventiure',
      },
      {
        id: 'de.aventiure.lay05_being.model',
        label: 'model',
        type: 'package',
        expandable: false,
        parentId: 'de.aventiure.lay05_being',
      },
      {
        id: 'de.aventiure.lay05_being.Action',
        label: 'Action',
        type: 'type',
        expandable: false,
        parentId: 'de.aventiure.lay05_being',
      },
      {
        id: 'de.aventiure.other',
        label: 'other',
        type: 'package',
        expandable: false,
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
        expandable: true,
        parentId: null,
      },
      {
        id: 'de.aventiure.lay05_being',
        label: 'lay05_being',
        type: 'package',
        expandable: true,
        parentId: 'de.aventiure',
      },
      {
        id: 'de.aventiure.other',
        label: 'other',
        type: 'package',
        expandable: false,
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

test('calculateVisiblePackageEdges verwendet das sichtbare Quell-Package selbst', () => {
  // GIVEN
  const graph = packageGraph('a.b', 'a.b.c', 'a.b.c.d', 'a.b.c.d.e', 'a.b.x', 'other');
  const rawDependencies = [
    {
      sourcePackage: 'a.b.c.d.e',
      targetPackage: 'other',
    },
  ];

  // WHEN
  const edges = calculateVisiblePackageEdges(rawDependencies, graph);

  // THEN
  assert.deepEqual(edges, [
    {
      source: 'a.b.c.d.e',
      target: 'other',
    },
  ]);
});

test('calculateVisiblePackageEdges verwendet ein aufgeklapptes Quell-Package bei exakter Package-Übereinstimmung', () => {
  // GIVEN
  const graph = expandedPackageGraph(
      packageNode('a.b'),
      packageNode('a.b.c', 'a.b'),
      packageNode('other'));
  const rawDependencies = [
    {
      sourcePackage: 'a.b',
      targetPackage: 'other',
    },
  ];

  // WHEN
  const edges = calculateVisiblePackageEdges(rawDependencies, graph);

  // THEN
  assert.deepEqual(edges, [
    {
      source: 'a.b',
      target: 'other',
    },
  ]);
});

test('calculateVisiblePackageEdges verwendet ein sichtbares Quell-Kind unter einem aufgeklappten Package', () => {
  // GIVEN
  const graph = expandedPackageGraph(
      packageNode('a.b'),
      packageNode('a.b.c', 'a.b'),
      packageNode('other'));
  const rawDependencies = [
    {
      sourcePackage: 'a.b.c.d',
      targetPackage: 'other',
    },
  ];

  // WHEN
  const edges = calculateVisiblePackageEdges(rawDependencies, graph);

  // THEN
  assert.deepEqual(edges, [
    {
      source: 'a.b.c',
      target: 'other',
    },
  ]);
});

test('calculateVisiblePackageEdges verwirft eine Quell-Kante auf ein aufgeklapptes nicht exakt passendes Package', () => {
  // GIVEN
  const graph = expandedPackageGraph(
      packageNode('a.b'),
      packageNode('a.b.x', 'a.b'),
      packageNode('other'));
  const rawDependencies = [
    {
      sourcePackage: 'a.b.c.d',
      targetPackage: 'other',
    },
  ];

  // WHEN
  const edges = calculateVisiblePackageEdges(rawDependencies, graph);

  // THEN
  assert.deepEqual(edges, []);
});

test('calculateVisiblePackageEdges verwendet das nächste sichtbare Quell-Oberpackage', () => {
  // GIVEN
  const rawDependencies = [
    {
      sourcePackage: 'a.b.c.d.e',
      targetPackage: 'other',
    },
  ];

  // WHEN / THEN
  assert.deepEqual(
      calculateVisiblePackageEdges(rawDependencies, packageGraph('a.b', 'a.b.c', 'a.b.c.d', 'a.b.x', 'other')),
      [
        {
          source: 'a.b.c.d',
          target: 'other',
        },
      ]);
  assert.deepEqual(
      calculateVisiblePackageEdges(rawDependencies, packageGraph('a.b', 'a.b.c', 'a.b.x', 'other')),
      [
        {
          source: 'a.b.c',
          target: 'other',
        },
      ]);
  assert.deepEqual(
      calculateVisiblePackageEdges(rawDependencies, packageGraph('a.b', 'other')),
      [
        {
          source: 'a.b',
          target: 'other',
        },
      ]);
  assert.deepEqual(
      calculateVisiblePackageEdges(rawDependencies, packageGraph('a', 'other')),
      [
        {
          source: 'a',
          target: 'other',
        },
      ]);
});

test('calculateVisiblePackageEdges verwendet das Default-Package als sichtbares Quell-Oberpackage', () => {
  // GIVEN
  const graph = packageGraph('(default)', 'other');
  const rawDependencies = [
    {
      sourcePackage: 'a.b.c.d.e',
      targetPackage: 'other',
    },
  ];

  // WHEN
  const edges = calculateVisiblePackageEdges(rawDependencies, graph);

  // THEN
  assert.deepEqual(edges, [
    {
      source: '(default)',
      target: 'other',
    },
  ]);
});

test('calculateVisiblePackageEdges verwendet das nächste sichtbare Ziel-Package', () => {
  // GIVEN
  const graph = packageGraph('source', 'a.b', 'a.b.c', 'a.b.x');
  const rawDependencies = [
    {
      sourcePackage: 'source',
      targetPackage: 'a.b.c.d.e',
    },
  ];

  // WHEN
  const edges = calculateVisiblePackageEdges(rawDependencies, graph);

  // THEN
  assert.deepEqual(edges, [
    {
      source: 'source',
      target: 'a.b.c',
    },
  ]);
});

test('calculateVisiblePackageEdges verwendet ein aufgeklapptes Ziel-Package bei exakter Package-Übereinstimmung', () => {
  // GIVEN
  const graph = expandedPackageGraph(
      packageNode('source'),
      packageNode('a.b'),
      packageNode('a.b.c', 'a.b'));
  const rawDependencies = [
    {
      sourcePackage: 'source',
      targetPackage: 'a.b',
    },
  ];

  // WHEN
  const edges = calculateVisiblePackageEdges(rawDependencies, graph);

  // THEN
  assert.deepEqual(edges, [
    {
      source: 'source',
      target: 'a.b',
    },
  ]);
});

test('calculateVisiblePackageEdges verwendet ein sichtbares Ziel-Kind unter einem aufgeklappten Package', () => {
  // GIVEN
  const graph = expandedPackageGraph(
      packageNode('source'),
      packageNode('a.b'),
      packageNode('a.b.c', 'a.b'));
  const rawDependencies = [
    {
      sourcePackage: 'source',
      targetPackage: 'a.b.c.d',
    },
  ];

  // WHEN
  const edges = calculateVisiblePackageEdges(rawDependencies, graph);

  // THEN
  assert.deepEqual(edges, [
    {
      source: 'source',
      target: 'a.b.c',
    },
  ]);
});

test('calculateVisiblePackageEdges verwirft eine Ziel-Kante auf ein aufgeklapptes nicht exakt passendes Package', () => {
  // GIVEN
  const graph = expandedPackageGraph(
      packageNode('source'),
      packageNode('a.b'),
      packageNode('a.b.x', 'a.b'));
  const rawDependencies = [
    {
      sourcePackage: 'source',
      targetPackage: 'a.b.c.d',
    },
  ];

  // WHEN
  const edges = calculateVisiblePackageEdges(rawDependencies, graph);

  // THEN
  assert.deepEqual(edges, []);
});

test('calculateVisiblePackageEdges erzeugt keine Kanten innerhalb desselben sichtbaren Packages', () => {
  // GIVEN
  const graph = packageGraph('a.b.c');
  const rawDependencies = [
    {
      sourcePackage: 'a.b.c.source',
      targetPackage: 'a.b.c.target',
    },
  ];

  // WHEN
  const edges = calculateVisiblePackageEdges(rawDependencies, graph);

  // THEN
  assert.deepEqual(edges, []);
});

test('calculateVisiblePackageEdges erzeugt pro sichtbarem Packagepaar und Richtung höchstens eine Kante', () => {
  // GIVEN
  const graph = packageGraph('a.b', 'x.y');
  const rawDependencies = [
    {
      sourcePackage: 'a.b.first',
      targetPackage: 'x.y.first',
    },
    {
      sourcePackage: 'a.b.second',
      targetPackage: 'x.y.second',
    },
    {
      sourcePackage: 'x.y.second',
      targetPackage: 'a.b.second',
    },
  ];

  // WHEN
  const edges = calculateVisiblePackageEdges(rawDependencies, graph);

  // THEN
  assert.deepEqual(edges, [
    {
      source: 'a.b',
      target: 'x.y',
    },
    {
      source: 'x.y',
      target: 'a.b',
    },
  ]);
});

function packageGraph(...packageIds) {
  return {
    nodes: packageIds.map((packageId) => packageNode(packageId)),
    edges: [],
  };
}

function expandedPackageGraph(...nodes) {
  return {
    nodes,
    edges: [],
  };
}

function packageNode(packageId, parentId = null) {
  return {
    id: packageId,
    label: packageId,
    type: 'package',
    expandable: true,
    parentId,
  };
}
