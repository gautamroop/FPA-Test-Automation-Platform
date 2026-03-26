/**
 * AccelQ Full Fetch
 *
 * Strategy:
 *  1. Launch Chromium (headless:false) and log in
 *  2. Intercept the access_token from real outgoing requests (post-invalidation)
 *  3. Use page.evaluate() to call fetch() with explicit Authorization headers
 *     (passing the intercepted token into the browser fetch call)
 *  4. Probe all step-detail endpoints for scenarios, contexts, components, suites
 *  5. Save to scripts/data/details/
 *
 * Run: npx ts-node scripts/accelq-fetch-all.ts
 */

import { chromium, Request } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const BASE_URL    = (process.env.ACCELQ_URL ?? 'https://fisherpaykel.accelq.io').replace(/\/$/, '');
const ACCELQ_USER = process.env.ACCELQ_USERNAME ?? '';
const ACCELQ_PASS = process.env.ACCELQ_PASSWORD ?? '';
const TENANT      = 'fisherpaykel';
const PROJECT_KEY = 'FisherAndPaykelProject';
const API_BASE    = `${BASE_URL}/awb/api/${TENANT}/${PROJECT_KEY}/v1`;

const DATA_DIR    = path.resolve(__dirname, 'data');
const DETAILS_DIR = path.resolve(DATA_DIR, 'details');
fs.mkdirSync(DETAILS_DIR, { recursive: true });

function save(dir: string, filename: string, data: unknown) {
  const p = path.join(dir, filename);
  fs.writeFileSync(p, JSON.stringify(data, null, 2));
  console.log(`  Saved → ${filename}`);
}

// ── Main ──────────────────────────────────────────────────────────────────────
(async () => {
  const scenarios: any[] = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'extracted-scenarios.json'), 'utf-8'));
  const contexts:  any[] = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'extracted-contexts.json'), 'utf-8'));
  const actions:   any[] = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'extracted-actions.json'), 'utf-8'));
  const suites:    any[] = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'extracted-suites.json'), 'utf-8'));

  console.log(`Loaded: ${scenarios.length} scenarios, ${contexts.length} contexts, ${actions.length} actions, ${suites.length} suites`);

  // ── 1. Browser + token capture ───────────────────────────────────────────────
  console.log('\n[1/4] Launching browser...');
  const browser = await chromium.launch({
    headless: false,
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox'],
  });

  const ctx = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 900 },
    ignoreHTTPSErrors: true,
  });

  // Track ALL request headers sent to the API (not just token)
  // We want the full header set from a real authenticated API call
  const capturedHeaders: Record<string, string> = {};
  let headersCaptured = false;

  ctx.on('request', (req: Request) => {
    const url = req.url();
    if (!url.includes('accelq.io') || !url.includes('/awb/api/')) return;
    const hdrs = req.headers();
    if (!hdrs['access_token'] || hdrs['access_token'].length < 10) return;
    if (hdrs['invalidate-active-tokens'] === 'true') return;

    if (!headersCaptured) {
      Object.assign(capturedHeaders, hdrs);
      headersCaptured = true;
      console.log(`\n  [HEADERS] Captured from: ${url.replace(BASE_URL, '')}`);
      console.log(`  [HEADERS] Keys: ${Object.keys(capturedHeaders).join(', ')}`);
    } else {
      // Keep updating the token (it may refresh)
      if (hdrs['access_token']) capturedHeaders['access_token'] = hdrs['access_token'];
      if (hdrs['refresh_token']) capturedHeaders['refresh_token'] = hdrs['refresh_token'];
    }
  });

  const page = await ctx.newPage();

  // ── 2. Login ─────────────────────────────────────────────────────────────────
  console.log('[2/4] Logging in...');
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  await page.locator('#aq-username-or-email').fill(ACCELQ_USER);
  await page.locator('button:has-text("LOGIN"), button:has-text("Login")').first().click();
  await page.waitForTimeout(3000);

  for (const sel of ['input[placeholder="Password"]', 'input[type="password"]:visible', '#aq-password']) {
    try {
      const el = page.locator(sel).first();
      await el.waitFor({ state: 'visible', timeout: 5000 });
      await el.fill(ACCELQ_PASS);
      console.log(`  Password filled via: ${sel}`);
      break;
    } catch {}
  }

  await page.locator('button:has-text("LOGIN"), button:has-text("Login")').first().click();
  await page.waitForLoadState('networkidle', { timeout: 30000 });
  await page.waitForTimeout(6000);
  console.log(`  Landed: ${page.url()}`);

  // Trigger more API calls to get headers
  if (!headersCaptured) {
    await page.goto(`${BASE_URL}/project/2/scenario/auto/list`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(4000);
  }
  if (!headersCaptured) {
    await page.goto(`${BASE_URL}/project/2/context/list`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(4000);
  }

  if (!headersCaptured || !capturedHeaders['access_token']) {
    console.error('Could not capture auth headers. Exiting.');
    await browser.close();
    process.exit(1);
  }

  const accessToken  = capturedHeaders['access_token'];
  const refreshToken = capturedHeaders['refresh_token'] ?? '';
  console.log(`\n[3/4] Token captured: ${accessToken.substring(0, 16)}...`);
  save(DATA_DIR, 'captured-headers.json', { access_token: accessToken, refresh_token: refreshToken, ...capturedHeaders });

  // ── 3. In-browser fetch with explicit auth headers ───────────────────────────
  // We use page.evaluate to call fetch() with the intercepted headers explicitly
  // This keeps us in the same origin (no CORS) and avoids TLS issues
  type FetchResult = { ok: boolean; status: number; data: any };

  async function apiFetch(
    url: string,
    method = 'GET',
    body?: any,
  ): Promise<FetchResult> {
    return page.evaluate(
      async ({ url, method, body, accessToken, refreshToken, clientId }) => {
        try {
          const hdrs: Record<string, string> = {
            'Content-Type':  'application/json',
            'Accept':        'application/json',
            'access_token':  accessToken,
            'refresh_token': refreshToken,
            'client_id':     clientId,
          };
          const opts: RequestInit = { method, headers: hdrs, credentials: 'include' };
          if (body !== null) opts.body = JSON.stringify(body);
          const r = await fetch(url, opts);
          const ct = r.headers.get('content-type') ?? '';
          const data = ct.includes('application/json') ? await r.json() : await r.text();
          return { ok: r.ok, status: r.status, data };
        } catch (e: any) {
          return { ok: false, status: 0, data: e.message };
        }
      },
      { url, method, body: body ?? null, accessToken, refreshToken, clientId: capturedHeaders['client_id'] ?? '' }
    );
  }

  // Verify
  console.log('\n  Verifying token...');
  const check = await apiFetch(`${API_BASE}/conf/settings`);
  console.log(`  /conf/settings → ${check.status} ${check.ok ? '✓' : '✗'}`);
  if (!check.ok) {
    console.log(`  Response: ${JSON.stringify(check.data).substring(0, 150)}`);
    console.log('  Continuing anyway — endpoints may still work...');
  }

  // ── 4. Discover actual API patterns by navigating to scenario detail ─────────
  console.log('\n[4/4] Discovering endpoints via browser navigation...');

  const discoveredUrls: string[] = [];
  ctx.on('response', async resp => {
    const url = resp.url();
    if (!url.includes('/awb/api/') || !url.includes('accelq.io')) return;
    const ct = resp.headers()['content-type'] ?? '';
    if (!ct.includes('application/json')) return;
    try {
      const body = await resp.json().catch(() => null);
      if (!body) return;
      const key = url.replace(BASE_URL + '/', '').split('?')[0];
      // Only record new URLs that aren't already in our live data
      if (!discoveredUrls.includes(key)) {
        discoveredUrls.push(key);
        console.log(`  [NEW URL] ${key}`);
        save(DETAILS_DIR, `nav-${key.replace(/\//g, '_')}.json`, body);
      }
    } catch {}
  });

  // Navigate to a scenario detail page to see what API calls are made
  const firstScnPid = scenarios[0].pid; // 35
  console.log(`  Navigating to scenario ${firstScnPid} detail...`);
  try {
    await page.goto(`${BASE_URL}/project/2/scenario/auto/${firstScnPid}`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(4000);
    console.log(`  Landed at: ${page.url()}`);
  } catch (e: any) { console.log(`  Nav timeout (ok): ${e.message.substring(0, 60)}`); }

  // Navigate to a component/action detail
  const firstCmpPid = actions[0].pid; // 615
  console.log(`  Navigating to component ${firstCmpPid} detail...`);
  try {
    await page.goto(`${BASE_URL}/project/2/context/${actions[0].contextPid}/action/${firstCmpPid}`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(4000);
  } catch (e: any) { console.log(`  Nav timeout (ok)`); }

  // Navigate to suite detail
  const firstSuitePid = suites[0].pid;
  console.log(`  Navigating to suite ${firstSuitePid} detail...`);
  try {
    await page.goto(`${BASE_URL}/project/2/suite/test/${firstSuitePid}`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(4000);
    // Try alternate suite URL
    await page.goto(`${BASE_URL}/project/2/suite/auto/list/${firstSuitePid}`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(3000);
  } catch (e: any) { console.log(`  Nav timeout (ok)`); }

  console.log(`\n  Discovered ${discoveredUrls.length} new URL patterns:`);
  discoveredUrls.forEach(u => console.log(`    ${u}`));

  // ── 5. Fetch step-level details ──────────────────────────────────────────────
  console.log('\n[5/5] Fetching step-level details...');

  type Item = { pid: number; name: string };

  async function probeAndFetchAll(
    label: string,
    items: Item[],
    candidates: Array<(pid: number) => string>,
    method = 'GET',
    body?: any,
  ) {
    console.log(`\n── ${label} (${items.length} items) ──────────────────────────────────────`);
    const probePid = items[0].pid;
    let working: ((pid: number) => string) | null = null;

    for (const fn of candidates) {
      const url = fn(probePid);
      process.stdout.write(`  ${url.replace(API_BASE, '')} ... `);
      const r = await apiFetch(url, method, body);
      if (r.ok) {
        const summary = Array.isArray(r.data)
          ? `${r.data.length} items`
          : typeof r.data === 'object'
            ? Object.keys(r.data).slice(0, 5).join(', ')
            : String(r.data).substring(0, 60);
        console.log(`✓  (${summary})`);
        save(DETAILS_DIR, `probe-${label}-${probePid}.json`, r.data);
        working = fn;
        break;
      } else {
        console.log(`✗ ${r.status}`);
        if (r.status === 401) {
          console.log(`    401 body: ${JSON.stringify(r.data).substring(0, 100)}`);
        }
      }
    }

    if (!working) {
      console.log(`  No endpoint found.`);
      save(DETAILS_DIR, `all-${label}.json`, { __error: 'no_endpoint' });
      return;
    }

    const allDetails: Record<string, any> = {};
    let ok = 0;
    for (const item of items) {
      const r = await apiFetch(working(item.pid), method, body);
      allDetails[String(item.pid)] = r.ok
        ? { pid: item.pid, name: item.name, data: r.data }
        : { pid: item.pid, name: item.name, error: r.status };
      process.stdout.write(r.ok ? '.' : 'x');
      if (r.ok) ok++;
    }
    console.log(`\n  ${ok}/${items.length} succeeded`);
    save(DETAILS_DIR, `all-${label}.json`, allDetails);
  }

  const scnItems:   Item[] = scenarios.map((s: any) => ({ pid: s.pid, name: s.name }));
  const ctxItems:   Item[] = contexts.map((c: any) => ({ pid: c.pid, name: c.name }));
  const cmpItems:   Item[] = actions.map((a: any) => ({ pid: a.pid, name: a.name }));
  const suiteItems: Item[] = suites.map((s: any) => ({ pid: s.pid, name: s.name }));

  await probeAndFetchAll('scenarios', scnItems, [
    // Discovered from live traffic: /scn/scenarios/auto/{pid}
    pid => `${API_BASE}/scn/scenarios/auto/${pid}`,
    pid => `${API_BASE}/scn/scenarios/auto/root/${pid}`,
    pid => `${API_BASE}/scn/scenarios/${pid}`,
  ]);

  await probeAndFetchAll('scenario-steps', scnItems, [
    // Discovered from live traffic: /scn/scenarios/auto/{pid}/workflow/steps
    pid => `${API_BASE}/scn/scenarios/auto/${pid}/workflow/steps`,
    pid => `${API_BASE}/scn/scenarios/auto/${pid}/wb`,
    pid => `${API_BASE}/scn/scenarios/${pid}/steps`,
  ]);

  await probeAndFetchAll('scenario-testcases', scnItems, [
    pid => `${API_BASE}/scn/scenarios/auto/${pid}/testcases`,
    pid => `${API_BASE}/scn/testcases/scenario/${pid}`,
    pid => `${API_BASE}/scn/testcases?scenarioPid=${pid}`,
  ]);

  await probeAndFetchAll('contexts', ctxItems, [
    pid => `${API_BASE}/ctx/contexts/${pid}`,
    pid => `${API_BASE}/ctx/contexts/${pid}/detail`,
    pid => `${API_BASE}/ctx/contexts/${pid}/steps`,
    pid => `${API_BASE}/ctx/contexts/${pid}/components`,
  ]);

  await probeAndFetchAll('components', cmpItems, [
    // Try context-scoped component URL patterns (discovered via nav)
    pid => `${API_BASE}/ctx/components/${pid}`,
    pid => `${API_BASE}/ctx/components/auto/${pid}`,
    pid => `${API_BASE}/ctx/components/${pid}/steps`,
    pid => `${API_BASE}/ctx/components/${pid}/workbench`,
    pid => `${API_BASE}/ctx/components/${pid}/wb`,
  ]);

  await probeAndFetchAll('suites', suiteItems, [
    pid => `${API_BASE}/test-exec/suites/${pid}`,
    pid => `${API_BASE}/test-exec/suites/auto/${pid}`,
    pid => `${API_BASE}/test-exec/suites/${pid}/scenarios`,
    pid => `${API_BASE}/test-exec/suites/${pid}/detail`,
  ]);

  // Scenario page 2
  console.log('\n── Scenario page 2 ──────────────────────────────────────────────────────');
  const p2 = await apiFetch(
    `${API_BASE}/scn/scenarios/auto/filter`,
    'POST',
    { pageNum: 2, pageSize: 25, filter: [], pagination: { pageNum: 2, pageSize: 25 } },
  );
  if (p2.ok) {
    save(DETAILS_DIR, 'scenarios-page2.json', p2.data);
    console.log(`  Got ${p2.data?.result?.data?.length ?? '?'} additional scenarios`);
  } else {
    console.log(`  Page 2 fetch failed: ${p2.status}`);
  }

  // Summary
  console.log('\n── Summary ──────────────────────────────────────────────────────────────');
  for (const f of fs.readdirSync(DETAILS_DIR).filter(f => f.startsWith('all-'))) {
    const d = JSON.parse(fs.readFileSync(path.join(DETAILS_DIR, f), 'utf-8'));
    if (d.__error) { console.log(`  ${f}: FAILED`); continue; }
    const total = Object.keys(d).length;
    const errs  = Object.values(d).filter((v: any) => v.error).length;
    console.log(`  ${f}: ${total - errs}/${total} ok`);
  }

  await browser.close();
  console.log('\nDone.');
})();
