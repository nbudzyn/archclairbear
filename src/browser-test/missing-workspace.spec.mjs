import { expect, test } from '@playwright/test';

test('missing workspace path is shown in the browser error layout', async ({ page }) => {
  // WHEN
  await page.goto('/');

  // THEN
  await expect(page.getByRole('alert'))
      .toContainText('Der Workspace-Pfad C:\\TMP\\archclairbear-missing-workspace wurde nicht gefunden.');
});
