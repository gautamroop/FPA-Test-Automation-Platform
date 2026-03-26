/**
 * accelq-gen-fixtures.ts
 *
 * Reads per-scenario step-plan JSON files and generates typed test data fixture
 * files under test-data/accelq/<spec-group>.fixtures.ts
 *
 * Each fixture exports a typed interface + a default object with empty/placeholder
 * values for all data parameters required by the scenarios in that spec group.
 *
 * Run: npx ts-node --project tsconfig.scripts.json scripts/accelq-gen-fixtures.ts
 */

import * as fs   from 'fs';
import * as path from 'path';

// ─── Paths ────────────────────────────────────────────────────────────────────
const CODEGEN_DIR   = path.resolve(__dirname, 'data/codegen');
const FIXTURES_DIR  = path.resolve(__dirname, '../test-data/accelq');

// ─── Types ────────────────────────────────────────────────────────────────────
interface StepPlan {
  scnPid:  number;
  scnName: string;
  steps:   Array<{
    params:  string[];
    returns: string[];
  }>;
}

// ─── Scenario → spec mapping (same as spec wirer) ────────────────────────────
const SCENARIO_SPEC: Record<number, string> = {
  35:  'order-creation', 57:  'order-creation', 61:  'order-creation',
  62:  'order-creation', 85:  'order-creation', 87:  'order-creation',
  208: 'order-creation',
  56:  'order-verification',
  64:  'order-modifications', 99:  'order-modifications',
  67:  'cancellation',  79:  'cancellation',   86:  'cancellation',
  103: 'cancellation',  104: 'cancellation',
  60:  'delivery',      88:  'delivery',       97:  'delivery',      100: 'delivery',
  63:  'payments',      98:  'payments',       107: 'payments',      108: 'payments',
  65:  'promotions',    66:  'promotions',     78:  'promotions',
  89:  'jde-integration',
  112: 'agency-tpp',    113: 'agency-tpp',     149: 'agency-tpp',
  182: 'self-service',  187: 'self-service',
};

/** Upper-camel-case a group name: "order-creation" → "OrderCreation" */
function toPascalCase(str: string): string {
  return str.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
}

// ─── Load all step plans ───────────────────────────────────────────────────────
function loadAllStepPlans(): Map<number, StepPlan> {
  const plans = new Map<number, StepPlan>();
  const files = fs.readdirSync(CODEGEN_DIR).filter(f => f.startsWith('steps-') && f.endsWith('.json'));
  for (const file of files) {
    const raw  = fs.readFileSync(path.join(CODEGEN_DIR, file), 'utf-8');
    const plan = JSON.parse(raw) as StepPlan;
    plans.set((plan as any).scnPid, plan);
  }
  return plans;
}

// ─── Build param set per group ─────────────────────────────────────────────────
function collectParamsByGroup(allPlans: Map<number, StepPlan>): Map<string, Set<string>> {
  const groupParams = new Map<string, Set<string>>();
  for (const [pid, plan] of allPlans) {
    const group = SCENARIO_SPEC[pid];
    if (!group) continue;
    if (!groupParams.has(group)) groupParams.set(group, new Set());
    const params = groupParams.get(group)!;
    for (const step of plan.steps) {
      for (const p of step.params) {
        if (p) params.add(p);
      }
    }
  }
  return groupParams;
}

// ─── Default value heuristics ─────────────────────────────────────────────────
function defaultValue(paramName: string): string {
  const lower = paramName.toLowerCase();
  if (lower.includes('url'))             return 'https://fisherpaykel.com';
  if (lower.includes('email'))           return 'test@example.com';
  if (lower.includes('password'))        return 'Test@1234';
  if (lower.includes('username') || lower.includes('sfusername') || lower.includes('sfm')) return 'test.user@fisherpaykel.com';
  if (lower.includes('mfa') || lower.includes('secret')) return 'TOTP_SECRET_KEY';
  if (lower.includes('phone') || lower.includes('mobile')) return '+61400000000';
  if (lower.includes('pin') || lower.includes('postcode') || lower.includes('zipcode')) return '2000';
  if (lower.includes('addressline1') || lower.includes('address1')) return '1 Test Street';
  if (lower.includes('addressline2') || lower.includes('address2')) return 'Level 1';
  if (lower.includes('city') || lower.includes('town')) return 'Sydney';
  if (lower.includes('state'))           return 'NSW';
  if (lower.includes('addresstype'))     return 'Home';
  if (lower.includes('cardnumber'))      return '4111111111111111';
  if (lower.includes('expiry'))         return '12/26';
  if (lower.includes('security') || lower.includes('cvv') || lower.includes('cvc')) return '123';
  if (lower.includes('paymenttype'))     return 'Credit Card';
  if (lower.includes('depositamount'))   return '100';
  if (lower.includes('quantity') || lower.includes('qty')) return '1';
  if (lower.includes('category'))        return 'Refrigeration';
  if (lower.includes('subcategory') || lower.includes('style')) return 'French Door';
  if (lower.includes('productcode') || lower.includes('sku'))  return 'E522BRXFD_N';
  if (lower.includes('orderdu') || lower.includes('ordernumber')) return 'ORD-00001';
  if (lower.includes('date'))           return '2026-12-01';
  if (lower.includes('discount'))       return '10';
  if (lower.includes('firstname'))      return 'Test';
  if (lower.includes('lastname'))       return 'User';
  if (lower.includes('tpp') || lower.includes('type')) return 'Agency';
  if (lower.includes('product') && lower.includes('type')) return 'Cooking';
  if (lower.includes('quote'))          return 'QT-00001';
  if (lower.includes('invoice'))        return 'INV-00001';
  if (lower.includes('amount') || lower.includes('total') || lower.includes('subtotal')) return '1500.00';
  if (lower.includes('save') || lower.includes('add') || lower.includes('confirm')) return 'true';
  if (lower.includes('suffix'))         return 'Mr';
  if (lower.includes('prefix'))         return 'Mr';
  if (lower.includes('length'))         return '10';
  return '';
}

// ─── Generate fixture file content ────────────────────────────────────────────
function generateFixtureFile(group: string, params: Set<string>): string {
  const pascal    = toPascalCase(group);
  const sortedParams = [...params].sort();

  const interfaceFields = sortedParams
    .map(p => `  /** AccelQ data param: ${p} */\n  ${p}: string;`)
    .join('\n');

  const defaultFields = sortedParams
    .map(p => `  ${p}: '${defaultValue(p)}',`)
    .join('\n');

  return [
    `/**`,
    ` * Test data fixtures for AccelQ ${pascal} scenarios.`,
    ` * These params are referenced in the spec files as data.<paramName>.`,
    ` * Replace placeholder values with real test data before running.`,
    ` */`,
    ``,
    `export interface ${pascal}TestData {`,
    interfaceFields,
    `}`,
    ``,
    `/** Default (placeholder) test data — override per-test as needed */`,
    `export const ${group.replace(/-/g, '_')}DefaultData: ${pascal}TestData = {`,
    defaultFields,
    `};`,
    ``,
  ].join('\n');
}

// ─── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('[fixtures] Loading step plans from', CODEGEN_DIR);
  const allPlans    = loadAllStepPlans();
  const groupParams = collectParamsByGroup(allPlans);

  if (!fs.existsSync(FIXTURES_DIR)) fs.mkdirSync(FIXTURES_DIR, { recursive: true });

  let written = 0;
  for (const [group, params] of groupParams) {
    if (params.size === 0) continue;
    const content = generateFixtureFile(group, params);
    const outPath = path.join(FIXTURES_DIR, `${group}.fixtures.ts`);
    fs.writeFileSync(outPath, content, 'utf-8');
    console.log(`[fixtures] Wrote ${group}.fixtures.ts (${params.size} params)`);
    written++;
  }

  // Generate an index barrel file
  const groups  = [...groupParams.keys()].filter(g => (groupParams.get(g)?.size ?? 0) > 0).sort();
  const barrel  = groups.map(g => `export * from './${g}.fixtures';`).join('\n') + '\n';
  fs.writeFileSync(path.join(FIXTURES_DIR, 'index.ts'), barrel, 'utf-8');
  console.log(`[fixtures] Wrote index.ts`);

  console.log(`\n[fixtures] Done. ${written} fixture files generated.`);
}

main().catch(err => { console.error(err); process.exit(1); });
