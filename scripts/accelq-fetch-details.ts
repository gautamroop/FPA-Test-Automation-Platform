/**
 * AccelQ Detail Fetcher
 *
 * Uses the captured access_token (from accelq-scraper.ts run) to call AccelQ
 * REST API and fetch step-level details for every scenario.
 *
 * Run AFTER accelq-scraper.ts while the session is still valid, or re-run
 * the scraper first to refresh the token in scripts/data/captured-headers.json.
 */

import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const BASE    = 'https://fisherpaykel.accelq.io';
const TENANT  = 'fisherpaykel';
const PROJECT = 'FisherAndPaykelProject';
const API     = `${BASE}/awb/api/${TENANT}/${PROJECT}/v1`;

const DATA_DIR = path.resolve(__dirname, 'data');

// Load captured token
const headers = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'captured-headers.json'), 'utf-8'));
const ACCESS_TOKEN = headers['access_token'] ?? '';

if (!ACCESS_TOKEN) {
  console.error('No access_token found in captured-headers.json. Run the scraper first.');
  process.exit(1);
}

const api = axios.create({
  baseURL: API,
  headers: {
    'access_token':  ACCESS_TOKEN,
    'refresh_token': headers['refresh_token'] ?? '',
    'Content-Type':  'application/json',
    'Accept':        'application/json',
    'User-Agent':    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  },
});

function save(filename: string, data: unknown) {
  const p = path.join(DATA_DIR, filename);
  fs.writeFileSync(p, JSON.stringify(data, null, 2));
}

async function tryGet(url: string): Promise<any> {
  try {
    const r = await api.get(url);
    return r.data;
  } catch (e: any) {
    return { __error: e.response?.status ?? 'ERR', __url: url };
  }
}

(async () => {
  const scenarios: any[] = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'extracted-scenarios.json'), 'utf-8'));
  const suites:   any[]  = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'extracted-suites.json'),   'utf-8'));
  const contexts: any[]  = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'extracted-contexts.json'), 'utf-8'));
  const actions:  any[]  = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'extracted-actions.json'),  'utf-8'));

  // ── 1. Probe token validity ─────────────────────────────────────────────────
  console.log('\nProbing token validity...');
  const probe = await tryGet('/conf/settings');
  if (probe.__error) {
    console.error('Token is expired or invalid. Re-run accelq-scraper.ts to refresh.');
    process.exit(1);
  }
  console.log('  Token valid ✓');

  // ── 2. Fetch ALL scenarios (page 2 to get remaining 7) ─────────────────────
  console.log('\nFetching all scenario pages...');
  const scnPage2 = await tryGet('/scn/scenarios/auto/filter?pageNum=2&pageSize=25');
  if (!scnPage2.__error) {
    save('scn-page2.json', scnPage2);
    const page2Items = scnPage2?.result?.data ?? [];
    console.log(`  Page 2: ${page2Items.length} additional scenarios`);
    // Merge all scenarios
    const page1Items: any[] = JSON.parse(
      fs.readFileSync(path.join(DATA_DIR, 'live-api-data.json'), 'utf-8')
    )['awb/api/fisherpaykel/FisherAndPaykelProject/v1/scn/scenarios/auto/filter']?.result?.data ?? [];
    const allScenarioDetails = [...page1Items, ...page2Items];
    save('all-scenario-details.json', allScenarioDetails);
    console.log(`  Total scenario details: ${allScenarioDetails.length}`);
  }

  // ── 3. Fetch step-level detail for each scenario ────────────────────────────
  console.log('\nFetching scenario step details...');
  const scenarioSteps: Record<string, any> = {};
  const STEP_ENDPOINTS = [
    (pid: number) => `/scn/scenarios/${pid}/steps`,
    (pid: number) => `/scn/scenarios/${pid}/testcases`,
    (pid: number) => `/scn/scenarios/${pid}/detail`,
    (pid: number) => `/scn/scenarios/${pid}`,
    (pid: number) => `/scn/scenarios/${pid}/workbench`,
  ];

  // Try first 5 scenarios to find the right endpoint
  const samplePids = scenarios.slice(0, 5).map((s: any) => s.pid);
  let workingStepEndpoint = '';
  for (const endpointFn of STEP_ENDPOINTS) {
    const testUrl = endpointFn(samplePids[0]);
    console.log(`  Trying: ${testUrl}`);
    const r = await tryGet(testUrl);
    if (!r.__error) {
      console.log(`    ✓ Works! Response keys: ${Object.keys(r).slice(0, 6).join(', ')}`);
      workingStepEndpoint = testUrl.replace(String(samplePids[0]), '{pid}');
      save(`step-sample-${samplePids[0]}.json`, r);
      break;
    } else {
      console.log(`    ✗ ${r.__error}`);
    }
  }

  // ── 4. Fetch context details ─────────────────────────────────────────────────
  console.log('\nFetching context details...');
  const CTX_ENDPOINTS = [
    (pid: number) => `/ctx/contexts/${pid}`,
    (pid: number) => `/ctx/contexts/${pid}/detail`,
    (pid: number) => `/ctx/contexts/${pid}/steps`,
    (pid: number) => `/ctx/contexts/${pid}/components`,
  ];

  const sampleCtxPid = contexts[0]?.pid;
  let workingCtxEndpoint = '';
  if (sampleCtxPid) {
    for (const endpointFn of CTX_ENDPOINTS) {
      const testUrl = endpointFn(sampleCtxPid);
      console.log(`  Trying: ${testUrl}`);
      const r = await tryGet(testUrl);
      if (!r.__error) {
        console.log(`    ✓ Works! Response keys/len: ${Array.isArray(r) ? r.length + ' items' : Object.keys(r).slice(0, 6).join(', ')}`);
        workingCtxEndpoint = testUrl.replace(String(sampleCtxPid), '{pid}');
        save(`ctx-sample-${sampleCtxPid}.json`, r);
        break;
      } else {
        console.log(`    ✗ ${r.__error}`);
      }
    }
  }

  // ── 5. Fetch component/action details ────────────────────────────────────────
  console.log('\nFetching component details...');
  const CMP_ENDPOINTS = [
    (pid: number) => `/ctx/components/${pid}`,
    (pid: number) => `/ctx/components/${pid}/detail`,
    (pid: number) => `/ctx/components/${pid}/steps`,
  ];

  const sampleCmpPid = actions[0]?.pid;
  let workingCmpEndpoint = '';
  if (sampleCmpPid) {
    for (const endpointFn of CMP_ENDPOINTS) {
      const testUrl = endpointFn(sampleCmpPid);
      console.log(`  Trying: ${testUrl}`);
      const r = await tryGet(testUrl);
      if (!r.__error) {
        console.log(`    ✓ Works! Response keys/len: ${Array.isArray(r) ? r.length + ' items' : Object.keys(r).slice(0, 6).join(', ')}`);
        workingCmpEndpoint = testUrl.replace(String(sampleCmpPid), '{pid}');
        save(`cmp-sample-${sampleCmpPid}.json`, r);
        break;
      } else {
        console.log(`    ✗ ${r.__error}`);
      }
    }
  }

  // ── 6. Fetch suite detail ────────────────────────────────────────────────────
  console.log('\nFetching suite details...');
  const SUITE_ENDPOINTS = [
    (pid: number) => `/test-exec/suites/${pid}`,
    (pid: number) => `/test-exec/suites/${pid}/scenarios`,
    (pid: number) => `/test-exec/suites/${pid}/detail`,
  ];

  const sampleSuitePid = suites[0]?.pid;
  if (sampleSuitePid) {
    for (const endpointFn of SUITE_ENDPOINTS) {
      const testUrl = endpointFn(sampleSuitePid);
      console.log(`  Trying: ${testUrl}`);
      const r = await tryGet(testUrl);
      if (!r.__error) {
        console.log(`    ✓ Works! Response keys/len: ${Array.isArray(r) ? r.length + ' items' : Object.keys(r).slice(0, 6).join(', ')}`);
        save(`suite-sample-${sampleSuitePid}.json`, r);
        break;
      } else {
        console.log(`    ✗ ${r.__error}`);
      }
    }
  }

  // ── 7. Summary ───────────────────────────────────────────────────────────────
  console.log('\n── Summary ──────────────────────────────────────────────────────────');
  console.log(`  Working scenario step endpoint:  ${workingStepEndpoint || 'NOT FOUND'}`);
  console.log(`  Working context endpoint:        ${workingCtxEndpoint || 'NOT FOUND'}`);
  console.log(`  Working component endpoint:      ${workingCmpEndpoint || 'NOT FOUND'}`);

  console.log('\nDone.');
})();
