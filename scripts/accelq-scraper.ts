/**
 * AccelQ Scraper
 *
 * Strategy:
 *  1. Launch Chromium (headless:false) to bypass JS fingerprinting
 *  2. Log in via the two-step AccelQ login flow
 *  3. Intercept ALL request headers after login to capture the auth token
 *     (AccelQ sends tokens in headers like Authorization, X-AQ-Token, or cookies)
 *  4. Once token is captured, use axios to call AccelQ REST API endpoints directly
 *     — no more page.goto() losing session
 *  5. Save raw API responses + screenshots for each section
 */

import { chromium, Request } from '@playwright/test';
import axios from 'axios';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const ACCELQ_URL      = (process.env.ACCELQ_URL ?? 'https://fisherpaykel.accelq.io/').replace(/\/$/, '');
const ACCELQ_USERNAME = process.env.ACCELQ_USERNAME ?? '';
const ACCELQ_PASSWORD = process.env.ACCELQ_PASSWORD ?? '';
const PROJECT_ID      = 2;

const OUT_DIR  = path.resolve(__dirname, 'data');
const SS_DIR   = path.resolve(__dirname, 'screenshots');

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(SS_DIR,  { recursive: true });

function save(filename: string, data: unknown) {
  const filePath = path.join(OUT_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`  Saved → ${filePath}`);
}

// ── Main ──────────────────────────────────────────────────────────────────────
(async () => {

  // ── 1. Launch browser ───────────────────────────────────────────────────────
  const browser = await chromium.launch({
    headless: false,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ],
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 900 },
  });

  // ── 2. Intercept auth headers from outgoing requests ───────────────────────
  const capturedHeaders: Record<string, string> = {};
  const capturedCookieHeader: { value: string } = { value: '' };
  let authToken = '';
  let jwtToken  = '';

  context.on('request', (req: Request) => {
    const url = req.url();
    if (!url.includes('accelq.io')) return;
    const headers = req.headers();
    // Capture any auth-related headers
    for (const [key, val] of Object.entries(headers)) {
      const k = key.toLowerCase();
      if (k === 'authorization' || k.includes('token') || k.includes('auth') || k.includes('jwt') || k.includes('aq-')) {
        capturedHeaders[key] = val;
        if (k === 'authorization') authToken = val;
        if (k.includes('jwt') || k.includes('token')) jwtToken = val;
        console.log(`  [HDR] ${key}: ${val.substring(0, 80)}...`);
      }
      if (k === 'cookie' && val.length > capturedCookieHeader.value.length) {
        capturedCookieHeader.value = val;
      }
    }
  });

  // Also intercept JSON API responses to capture token from response bodies
  const apiResponses: Record<string, unknown> = {};
  context.on('response', async (resp) => {
    const url = resp.url();
    if (!url.includes('accelq.io')) return;
    const ct = resp.headers()['content-type'] ?? '';
    if (!ct.includes('application/json')) return;
    try {
      const body = await resp.json().catch(() => null);
      if (!body) return;
      const key = url.replace(ACCELQ_URL, '').split('?')[0];
      apiResponses[key] = body;
      // Look for token in response body
      const bodyStr = JSON.stringify(body);
      const tokenMatch = bodyStr.match(/"(token|jwt|accessToken|access_token|authToken)"\s*:\s*"([^"]{20,})"/i);
      if (tokenMatch) {
        console.log(`  [TOKEN from body] ${tokenMatch[1]}: ${tokenMatch[2].substring(0, 40)}...`);
        authToken = `Bearer ${tokenMatch[2]}`;
      }
    } catch {}
  });

  const page = await context.newPage();

  // ── 3. Login ─────────────────────────────────────────────────────────────────
  console.log('\n[1/5] Navigating to AccelQ...');
  await page.goto(ACCELQ_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(SS_DIR, '01-initial.png') });

  console.log('[2/5] Entering username...');
  await page.locator('#aq-username-or-email').fill(ACCELQ_USERNAME);
  await page.locator('button:has-text("LOGIN"), button:has-text("Login")').first().click();
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(SS_DIR, '02-after-email.png') });

  console.log('[3/5] Entering password...');
  // Password field may appear as visible input or revealed hidden input
  const pwdSelectors = [
    'input[placeholder="Password"]',
    'input[type="password"]:visible',
    '#aq-password',
  ];
  let pwdFilled = false;
  for (const sel of pwdSelectors) {
    try {
      const el = page.locator(sel).first();
      await el.waitFor({ state: 'visible', timeout: 5000 });
      await el.fill(ACCELQ_PASSWORD);
      pwdFilled = true;
      console.log(`  Password filled via: ${sel}`);
      break;
    } catch {}
  }
  if (!pwdFilled) {
    // Fallback: press Tab and type (AccelQ sometimes just reveals the same input)
    await page.keyboard.press('Tab');
    await page.keyboard.type(ACCELQ_PASSWORD);
    console.log('  Password filled via keyboard fallback');
  }

  await page.locator('button:has-text("LOGIN"), button:has-text("Login")').first().click();
  console.log('[4/5] Waiting for login to complete...');
  await page.waitForLoadState('networkidle', { timeout: 30000 });
  await page.waitForTimeout(5000);

  const postLoginUrl = page.url();
  console.log(`  Landed at: ${postLoginUrl}`);
  await page.screenshot({ path: path.join(SS_DIR, '03-post-login.png') });

  // ── 4. Capture session state ─────────────────────────────────────────────────
  const cookies = await context.cookies();
  save('cookies.json', cookies);
  console.log(`  Captured ${cookies.length} cookies`);

  // Build cookie string for axios
  const cookieString = cookies
    .filter(c => c.domain.includes('accelq.io'))
    .map(c => `${c.name}=${c.value}`)
    .join('; ');

  // Check localStorage for token
  const localStorageData = await page.evaluate(() => {
    const data: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)!;
      data[key] = localStorage.getItem(key) ?? '';
    }
    return data;
  });
  save('localStorage.json', localStorageData);
  console.log(`  Captured ${Object.keys(localStorageData).length} localStorage keys`);

  // Extract token from localStorage
  let lsToken = '';
  for (const [key, val] of Object.entries(localStorageData)) {
    if (key.toLowerCase().includes('token') || key.toLowerCase().includes('auth') || key.toLowerCase().includes('jwt')) {
      console.log(`  [LS] ${key}: ${val.substring(0, 80)}`);
      if (val.length > 20) lsToken = val;
    }
  }

  // Check sessionStorage
  const sessionStorageData = await page.evaluate(() => {
    const data: Record<string, string> = {};
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)!;
      data[key] = sessionStorage.getItem(key) ?? '';
    }
    return data;
  });
  save('sessionStorage.json', sessionStorageData);

  let ssToken = '';
  for (const [key, val] of Object.entries(sessionStorageData)) {
    if (key.toLowerCase().includes('token') || key.toLowerCase().includes('auth') || key.toLowerCase().includes('jwt')) {
      console.log(`  [SS] ${key}: ${val.substring(0, 80)}`);
      if (val.length > 20) ssToken = val;
    }
  }

  // Determine the best auth mechanism
  const finalToken  = authToken || jwtToken || lsToken || ssToken || '';
  const finalCookie = capturedCookieHeader.value || cookieString;

  console.log('\n[5/5] Auth summary:');
  console.log(`  authToken (from requests):  ${finalToken ? finalToken.substring(0, 60) + '...' : 'NONE'}`);
  console.log(`  cookie string length:        ${finalCookie.length} chars`);
  console.log(`  captured request headers:    ${Object.keys(capturedHeaders).join(', ') || 'none'}`);

  save('captured-headers.json', capturedHeaders);
  save('api-responses-during-login.json', apiResponses);

  // ── 5. Hit AccelQ REST API ───────────────────────────────────────────────────
  // Build axios headers — try both token + cookies
  const axiosHeaders: Record<string, string> = {
    'Content-Type':  'application/json',
    'Accept':        'application/json',
    'User-Agent':    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  };
  if (finalToken)  axiosHeaders['Authorization'] = finalToken.startsWith('Bearer ') ? finalToken : `Bearer ${finalToken}`;
  if (finalCookie) axiosHeaders['Cookie']        = finalCookie;
  // Add all captured headers
  for (const [k, v] of Object.entries(capturedHeaders)) axiosHeaders[k] = v;

  const api = axios.create({
    baseURL: ACCELQ_URL,
    headers: axiosHeaders,
    withCredentials: true,
  });

  // Known AccelQ REST API endpoint patterns
  const endpoints = [
    // Scenarios
    { name: 'scenarios',  path: `/api/project/${PROJECT_ID}/scenario/list` },
    { name: 'scenarios2', path: `/api/v1/project/${PROJECT_ID}/scenario/list` },
    { name: 'scenarios3', path: `/rest/project/${PROJECT_ID}/scenario` },
    // Suites
    { name: 'suites',     path: `/api/project/${PROJECT_ID}/suite/list` },
    { name: 'suites2',    path: `/api/v1/project/${PROJECT_ID}/suite/list` },
    { name: 'suites3',    path: `/rest/project/${PROJECT_ID}/suite` },
    // Contexts
    { name: 'contexts',   path: `/api/project/${PROJECT_ID}/context/list` },
    { name: 'contexts2',  path: `/api/v1/project/${PROJECT_ID}/context/list` },
    { name: 'contexts3',  path: `/rest/project/${PROJECT_ID}/context` },
    // Actions
    { name: 'actions',    path: `/api/project/${PROJECT_ID}/action/list` },
    { name: 'actions2',   path: `/api/v1/project/${PROJECT_ID}/action/list` },
    { name: 'actions3',   path: `/rest/project/${PROJECT_ID}/action` },
  ];

  console.log('\nProbing REST API endpoints...');
  const apiResults: Record<string, unknown> = {};

  for (const ep of endpoints) {
    try {
      const resp = await api.get(ep.path);
      console.log(`  [${resp.status}] ${ep.path} → ${JSON.stringify(resp.data).substring(0, 120)}`);
      apiResults[ep.name] = resp.data;
      save(`api-${ep.name}.json`, resp.data);
    } catch (err: any) {
      const status = err.response?.status ?? 'ERR';
      console.log(`  [${status}] ${ep.path}`);
    }
  }

  // ── 6. Use Playwright page to navigate and extract via intercepted responses ─
  // Since we have the page still open and logged in, navigate using the page
  // but now wait for the specific API calls and capture their responses
  console.log('\nNavigating via browser to capture live API responses...');

  const liveApiData: Record<string, unknown> = {};

  // Set up response listener specifically for data endpoints
  context.on('response', async (resp) => {
    const url = resp.url();
    if (!url.includes('accelq.io')) return;
    const ct = resp.headers()['content-type'] ?? '';
    if (!ct.includes('application/json')) return;
    // Filter for data-rich responses (not tiny config responses)
    try {
      const body = await resp.json().catch(() => null);
      if (!body) return;
      const bodyStr = JSON.stringify(body);
      if (bodyStr.length < 50) return;
      const key = url.replace(ACCELQ_URL, '').replace(/^\//, '').split('?')[0];
      liveApiData[key] = body;
      console.log(`  [LIVE API] ${resp.status()} ${url.substring(0, 120)}`);
    } catch {}
  });

  const sections = [
    { name: 'scenarios', url: `${ACCELQ_URL}/project/${PROJECT_ID}/scenario/auto/list` },
    { name: 'suites',    url: `${ACCELQ_URL}/project/${PROJECT_ID}/suite/list` },
    { name: 'contexts',  url: `${ACCELQ_URL}/project/${PROJECT_ID}/context/list` },
    { name: 'actions',   url: `${ACCELQ_URL}/project/${PROJECT_ID}/action/list` },
  ];

  for (const section of sections) {
    console.log(`\nBrowser navigating to ${section.name}...`);
    try {
      await page.goto(section.url, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(5000);
      const landed = page.url();
      console.log(`  Landed: ${landed}`);
      await page.screenshot({ path: path.join(SS_DIR, `${section.name}.png`), fullPage: true });

      // Extract visible content
      const visible = await page.evaluate(() => {
        // Try many possible selectors for list items
        const selectors = [
          '[class*="scenario-name"]', '[class*="suite-name"]',
          '[class*="action-name"]', '[class*="context-name"]',
          '[class*="entity-name"]', '[class*="row-title"]',
          'td.ng-binding', 'td[ng-bind]', '[ng-bind*="name"]',
          '[class*="list"] [class*="name"]',
          '[class*="grid"] td',
        ];
        const texts = new Set<string>();
        for (const sel of selectors) {
          document.querySelectorAll(sel).forEach((el: any) => {
            const t = el.innerText?.trim();
            if (t && t.length > 1 && t.length < 300) texts.add(t);
          });
        }
        return Array.from(texts);
      });
      console.log(`  Extracted ${visible.length} visible items`);
      save(`${section.name}-visible.json`, visible);
    } catch (err: any) {
      console.log(`  ERROR: ${err.message}`);
    }
  }

  // Save all live API data captured during navigation
  save('live-api-data.json', liveApiData);
  console.log(`\nCaptured ${Object.keys(liveApiData).length} live API responses`);

  // Summary
  console.log('\n── Summary ──────────────────────────────────────────────────────────');
  for (const section of sections) {
    const file = path.join(OUT_DIR, `${section.name}-visible.json`);
    if (fs.existsSync(file)) {
      const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
      console.log(`  ${section.name}: ${Array.isArray(data) ? data.length : 'N/A'} items`);
    }
  }
  const liveFile = path.join(OUT_DIR, 'live-api-data.json');
  const liveData = JSON.parse(fs.readFileSync(liveFile, 'utf-8'));
  console.log(`  live API endpoints: ${Object.keys(liveData).join(', ') || 'none'}`);

  await browser.close();
  console.log('\nDone.');
})();
