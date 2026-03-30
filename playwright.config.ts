import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

export default defineConfig({
  testDir: './projects',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : undefined,
  timeout: 90000,

  reporter: [
    ['list'],
    ['allure-playwright', { outputFolder: process.env.ALLURE_RESULTS_DIR ?? 'reports/allure-results' }],
    ['html', { outputFolder: 'reports/salesforce/oms/oms-test-report', open: 'never' }],
  ],

  use: {
    headless: true,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    baseURL: process.env.COMMERCE_URL,
  },

  projects: [
    // OMS scenario suite — runs only salesforce/oms UI tests
    {
      name: 'oms',
      testDir: './projects/salesforce/oms/tests/ui',
      use: {
        ...devices['Desktop Chrome'],
        headless: true,
        launchOptions: {
          args: ['--disable-blink-features=AutomationControlled'],
        },
      },
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
