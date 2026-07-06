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
        id: 'root-directory',
        type: 'directory',
        label: 'aventiure',
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
