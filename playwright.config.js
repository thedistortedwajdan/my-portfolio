import { defineConfig, devices } from '@playwright/test';

// Set PW_CHROMIUM_PATH to use an existing Chromium instead of the one Playwright downloads.
const executablePath = process.env.PW_CHROMIUM_PATH || undefined;

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  retries: 0,
  reporter: [['list']],
  // A failed test keeps a trace of its actions, network and console. Screenshots and page snapshots are left out:
  // they made traces of the long project tests grow past a gigabyte while a run was going.
  use: {
    baseURL: 'http://localhost:4173',
    trace: { mode: 'retain-on-failure', screenshots: false, snapshots: false, sources: false },
  },
  webServer: {
    command: 'npm run build && npm run preview',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], launchOptions: { executablePath } },
    },
  ],
});
