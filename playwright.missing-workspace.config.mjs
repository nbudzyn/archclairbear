import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './src/browser-test',
  testMatch: 'missing-workspace.spec.mjs',
  timeout: 120000,
  expect: {
    timeout: 5000,
  },
  reporter: process.env.CI ? 'line' : 'list',
  use: {
    baseURL: 'http://127.0.0.1:8081',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: '.\\gradlew.bat --console=plain bootRun --args="--server.port=8081 --archclairbear.workspace.path=C:\\TMP\\archclairbear-missing-workspace"',
    url: 'http://127.0.0.1:8081/',
    reuseExistingServer: false,
    timeout: 120000,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
      },
    },
  ],
});
