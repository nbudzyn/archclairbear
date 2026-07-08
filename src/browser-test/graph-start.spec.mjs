import { expect, test } from '@playwright/test';

test('root graph is loaded and rendered visibly', async ({ page }) => {
  // GIVEN
  const rootGraphResponse = page.waitForResponse((response) => (
    response.url().endsWith('/api/graph/root') && response.ok()
  ));

  // WHEN
  await page.goto('/');
  const graphData = await (await rootGraphResponse).json();

  // THEN
  expect(graphData).toEqual({
    nodes: [
      {
        id: 'de.aventiure',
        type: 'package',
        label: 'de.aventiure',
        expandable: true,
        parentId: null,
      },
    ],
    edges: [],
  });

  await expect(page.locator('#cy')).toBeVisible();
  await expect(page.locator('#cy canvas').first()).toBeVisible();
  await expect.poll(
      () => hasRenderedCanvasPixels(page),
      {
        message: 'Cytoscape should render visible pixels in the graph container.',
      })
      .toBe(true);
});

test('package graph can be expanded with a double click', async ({ page }) => {
  // GIVEN
  const packageGraphResponse = page.waitForResponse((response) => (
    response.url().includes('/api/graph/package?packageName=de.aventiure') && response.ok()
  ));
  let packageGraphRequestCount = 0;
  page.on('request', (request) => {
    if (request.url().includes('/api/graph/package?packageName=de.aventiure')) {
      packageGraphRequestCount += 1;
    }
  });

  // WHEN
  await page.goto('/');
  await expect(page.locator('#cy canvas').first()).toBeVisible();
  await expect.poll(
      () => hasRenderedCanvasPixels(page),
      {
        message: 'Cytoscape should render visible pixels in the graph container.',
      })
      .toBe(true);
  const initialGraphSnapshot = (await page.locator('#cy').screenshot()).toString('base64');
  const graphBounds = await page.locator('#cy').boundingBox();
  await page.mouse.dblclick(graphBounds.x + (graphBounds.width / 2), graphBounds.y + (graphBounds.height / 2));
  const graphData = await (await packageGraphResponse).json();
  await expect.poll(async () => (await page.locator('#cy').screenshot()).toString('base64'))
      .not.toBe(initialGraphSnapshot);

  // THEN
  expect(graphData.nodes.length).toBeGreaterThan(0);
  expect(graphData.nodes.every((node) => node.type === 'package')).toBe(true);
  expect(graphData.nodes.every((node) => node.parentId === 'de.aventiure')).toBe(true);
  expect(graphData.edges).toEqual([]);
  expect(packageGraphRequestCount).toBe(1);
});

test('expanded package renders type nodes inside the package box', async ({ page }) => {
  // GIVEN
  await page.route('**/api/graph/root', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
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
    }),
  }));

  const packageGraphResponse = page.waitForResponse((response) => (
    response.url().includes('/api/graph/package?packageName=de.aventiure') && response.ok()
  ));
  await page.route('**/api/graph/package?packageName=de.aventiure', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      nodes: [
        {
          id: 'de.aventiure.lay05_being',
          label: 'lay05_being',
          type: 'package',
          expandable: false,
          parentId: 'de.aventiure',
        },
        {
          id: 'de.aventiure.Action',
          label: 'Action',
          type: 'type',
          expandable: false,
          parentId: 'de.aventiure',
        },
      ],
      edges: [],
    }),
  }));

  // WHEN
  await page.goto('/');
  await expect(page.locator('#cy canvas').first()).toBeVisible();
  await expect.poll(
      () => hasRenderedCanvasPixels(page),
      {
        message: 'Cytoscape should render visible pixels in the graph container.',
      })
      .toBe(true);
  const initialGraphSnapshot = (await page.locator('#cy').screenshot()).toString('base64');
  const graphBounds = await page.locator('#cy').boundingBox();
  await page.mouse.dblclick(graphBounds.x + (graphBounds.width / 2), graphBounds.y + (graphBounds.height / 2));
  const graphData = await (await packageGraphResponse).json();
  await expect.poll(async () => (await page.locator('#cy').screenshot()).toString('base64'))
      .not.toBe(initialGraphSnapshot);

  // THEN
  expect(graphData.nodes).toEqual([
    {
      id: 'de.aventiure.lay05_being',
      label: 'lay05_being',
      type: 'package',
      expandable: false,
      parentId: 'de.aventiure',
    },
    {
      id: 'de.aventiure.Action',
      label: 'Action',
      type: 'type',
      expandable: false,
      parentId: 'de.aventiure',
    },
  ]);
});

test('package graph can be collapsed with a double click on the package border', async ({ page }) => {
  // GIVEN
  const packageGraphResponse = page.waitForResponse((response) => (
    response.url().includes('/api/graph/package?packageName=de.aventiure') && response.ok()
  ));
  let packageGraphRequestCount = 0;
  page.on('request', (request) => {
    if (request.url().includes('/api/graph/package?packageName=de.aventiure')) {
      packageGraphRequestCount += 1;
    }
  });

  // WHEN
  await page.goto('/');
  await expect(page.locator('#cy canvas').first()).toBeVisible();
  await expect.poll(
      () => hasRenderedCanvasPixels(page),
      {
        message: 'Cytoscape should render visible pixels in the graph container.',
      })
      .toBe(true);
  const initialGraphSnapshot = (await page.locator('#cy').screenshot()).toString('base64');
  const graphBounds = await page.locator('#cy').boundingBox();
  await page.mouse.dblclick(graphBounds.x + (graphBounds.width / 2), graphBounds.y + (graphBounds.height / 2));
  await (await packageGraphResponse).json();
  await expect.poll(async () => (await page.locator('#cy').screenshot()).toString('base64'))
      .not.toBe(initialGraphSnapshot);

  const expandedBounds = await getRenderedCanvasContentBounds(page);
  const expandedContentHeight = expandedBounds.maxY - expandedBounds.minY;
  await page.mouse.dblclick(
      expandedBounds.canvasX + (((expandedBounds.minX + expandedBounds.maxX) / 2) * expandedBounds.scaleX),
      expandedBounds.canvasY + ((expandedBounds.minY + 2) * expandedBounds.scaleY));
  await expect.poll(async () => {
    const bounds = await getRenderedCanvasContentBounds(page);
    return bounds.maxY - bounds.minY;
  })
      .toBeLessThan(expandedContentHeight);

  // THEN
  expect(packageGraphRequestCount).toBe(1);
});

test('load errors are shown in the browser', async ({ page }) => {
  // GIVEN
  await page.route('**/api/graph/root', (route) => route.fulfill({
    status: 404,
    contentType: 'application/json',
    body: '{"message":"Der Workspace-Pfad C:\\\\projects\\\\2003\\\\aventiure wurde nicht gefunden."}',
  }));

  // WHEN
  await page.goto('/');

  // THEN
  await expect(page.getByRole('alert'))
      .toContainText('Der Workspace-Pfad C:\\projects\\2003\\aventiure wurde nicht gefunden.');
});

async function hasRenderedCanvasPixels(page) {
  return page.locator('#cy canvas').evaluateAll((canvases) => canvases.some((canvas) => {
    const context = canvas.getContext('2d', { willReadFrequently: true });

    if (context == null || canvas.width === 0 || canvas.height === 0) {
      return false;
    }

    const image = context.getImageData(0, 0, canvas.width, canvas.height);

    for (let index = 3; index < image.data.length; index += 4) {
      if (image.data[index] !== 0) {
        return true;
      }
    }

  return false;
  }));
}

async function getRenderedCanvasContentBounds(page) {
  return page.locator('#cy canvas').evaluateAll((canvases) => {
    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;

    canvases.forEach((canvas) => {
      const context = canvas.getContext('2d', { willReadFrequently: true });

      if (context == null || canvas.width === 0 || canvas.height === 0) {
        return;
      }

      const image = context.getImageData(0, 0, canvas.width, canvas.height);

      for (let y = 0; y < canvas.height; y += 1) {
        for (let x = 0; x < canvas.width; x += 1) {
          if (image.data[((y * canvas.width) + x) * 4 + 3] !== 0) {
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
          }
        }
      }
    });

    const canvas = canvases[0];
    const bounds = canvas.getBoundingClientRect();

    return {
      canvasX: bounds.x,
      canvasY: bounds.y,
      scaleX: bounds.width / canvas.width,
      scaleY: bounds.height / canvas.height,
      width: canvas.width,
      height: canvas.height,
      minX,
      minY,
      maxX,
      maxY,
    };
  });
}
