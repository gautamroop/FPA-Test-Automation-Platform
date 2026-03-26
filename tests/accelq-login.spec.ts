import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const ACCELQ_URL      = process.env.ACCELQ_URL      ?? 'https://fisherpaykel.accelq.io/';
const ACCELQ_USERNAME = process.env.ACCELQ_USERNAME  ?? '';
const ACCELQ_PASSWORD = process.env.ACCELQ_PASSWORD  ?? '';

test('@accelq @smoke AccelQ - Navigate and Login', async ({ page }) => {
  // Step 1: Navigate to AccelQ
  await page.goto(ACCELQ_URL, { waitUntil: 'networkidle' });

  // Step 2: Fill in email
  const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i], input[placeholder*="user" i]').first();
  await emailInput.waitFor({ state: 'visible', timeout: 15000 });
  await emailInput.fill(ACCELQ_USERNAME);

  // Step 3: Click LOGIN to proceed to password step
  const loginButton = page.locator('button:has-text("LOGIN"), button:has-text("Login"), button[type="submit"]').first();
  await loginButton.click();

  // Step 4: Wait for visible password field (placeholder="Password")
  const passwordInput = page.locator('input[placeholder="Password"]');
  await passwordInput.waitFor({ state: 'visible', timeout: 15000 });
  await passwordInput.fill(ACCELQ_PASSWORD);

  // Step 5: Submit with password
  const submitButton = page.locator('button:has-text("LOGIN"), button:has-text("Login"), button[type="submit"]').first();
  await submitButton.click();

  // Step 6: Wait for dashboard to load
  await page.waitForLoadState('networkidle', { timeout: 30000 });

  // Step 7: Assert successful login — URL should change away from login
  const currentUrl = page.url();
  console.log(`Post-login URL: ${currentUrl}`);
  expect(currentUrl).not.toContain('/login');

  // Step 8: Ensure no error message visible
  const bodyText = await page.locator('body').innerText();
  expect(bodyText).not.toContain('Invalid credentials');
  expect(bodyText).not.toContain('incorrect');

  console.log('AccelQ login successful');
});
