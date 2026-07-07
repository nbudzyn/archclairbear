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

async function getCanvasDataUrl(page) {
  return page.locator('#cy canvas').first().evaluate((canvas) => canvas.toDataURL());
}
