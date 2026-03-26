/**
 * accelq-spec-wirer.ts
 *
 * Reads the per-scenario step-plan JSON files from scripts/data/codegen/
 * and rewrites the scenario spec files under projects/salesforce/oms/tests/ui/
 * replacing test.fail() scaffolds with real, wired Playwright test steps.
 *
 * Each test body:
 *   1. Instantiates the required page-object classes
 *   2. Calls page object methods in AccelQ step order
 *   3. Captures output variables where actions have return values
 *   4. Passes outputs to subsequent steps that consume them
 *   5. Leaves a clear // TODO comment for each step (still needs locator implementation)
 *
 * Run: npx ts-node --project tsconfig.scripts.json scripts/accelq-spec-wirer.ts
 */

import * as fs   from 'fs';
import * as path from 'path';

// ─── Paths ────────────────────────────────────────────────────────────────────
const CODEGEN_DIR  = path.resolve(__dirname, 'data/codegen');
const SCENARIOS_DIR = path.resolve(__dirname, '../projects/salesforce/oms/tests/ui');

// ─── Types ────────────────────────────────────────────────────────────────────
interface StepPlan {
  scnPid:  number;
  scnName: string;
  steps:   Array<{
    index:      number;
    ctxPid:     number;
    ctxName:    string;
    compPid:    number;
    compName:   string;
    methodName: string;
    params:     string[];
    returns:    string[];
  }>;
}

// ─── ctxPid → import info ─────────────────────────────────────────────────────
interface CtxImport {
  className:  string;
  file:       string;    // relative import path from scenarios/
  varName:    string;    // local variable name used in test body
}

const CTX_IMPORT: Record<number, CtxImport> = {
  197:  { className: 'InitPage',                   file: '../../pages/init.page',                      varName: 'initPage' },
  202:  { className: 'FPHomePage',                  file: '../../pages/fp-home.page',                   varName: 'fpHome' },
  203:  { className: 'FPLoginPage',                 file: '../../pages/fp-login.page',                  varName: 'fpLogin' },
  239:  { className: 'FPProductsPage',              file: '../../pages/fp-products.page',               varName: 'fpProducts' },
  242:  { className: 'FPOrderDetailsPage',          file: '../../pages/fp-order-details.page',          varName: 'fpOrderDetails' },
  245:  { className: 'FPPaymentPage',               file: '../../pages/fp-payment.page',                varName: 'fpPayment' },
  247:  { className: 'FPCheckoutPage',              file: '../../pages/fp-checkout.page',               varName: 'fpCheckout' },
  248:  { className: 'SalesforceLoginPage',          file: '../../pages/salesforce-login.page',          varName: 'sfLogin' },
  249:  { className: 'SalesforceHomePage',           file: '../../pages/salesforce-home.page',           varName: 'sfHome' },
  250:  { className: 'SalesforceOrderDetailsPage',   file: '../../pages/salesforce-order-details.page',  varName: 'sfOrderDetails' },
  252:  { className: 'SalesforceOrderDetailsPage',   file: '../../pages/salesforce-order-details.page',  varName: 'sfOrderDetails' },
  251:  { className: 'SalesforceOrderSummaryPage',   file: '../../pages/salesforce-order-summary.page',  varName: 'sfOrderSummary' },
  364:  { className: 'SalesforceOrderSummaryPage',   file: '../../pages/salesforce-order-summary.page',  varName: 'sfOrderSummary' },
  413:  { className: 'TppLoginPage',                file: '../../pages/tpp-login.page',                 varName: 'tppLogin' },
  414:  { className: 'TppHomePage',                 file: '../../pages/tpp-home.page',                  varName: 'tppHome' },
  456:  { className: 'TppHomePage',                 file: '../../pages/tpp-home.page',                  varName: 'tppHome' },
  458:  { className: 'TppAgencyOrderPage',          file: '../../pages/tpp-agency-order.page',          varName: 'tppAgencyOrder' },
  459:  { className: 'TppProductsPage',             file: '../../pages/tpp-products.page',              varName: 'tppProducts' },
  462:  { className: 'TppCustomerDetailsPage',      file: '../../pages/tpp-customer-details.page',      varName: 'tppCustomerDetails' },
  478:  { className: 'TppViewQuotesPage',           file: '../../pages/tpp-view-quotes.page',           varName: 'tppViewQuotes' },
  481:  { className: 'TppViewQuotesPage',           file: '../../pages/tpp-view-quotes.page',           varName: 'tppViewQuotes' },
  927:  { className: 'FPBookServicePage',           file: '../../pages/fp-book-service.page',           varName: 'fpBookService' },
  946:  { className: 'FPProductRegistrationPage',   file: '../../pages/fp-product-registration.page',   varName: 'fpProductReg' },
  1198: { className: 'TppMsdPortalPage',            file: '../../pages/tpp-msd-portal.page',            varName: 'tppMsdPortal' },
  1283: { className: 'MsdProductListingPage',       file: '../../pages/msd-product-listing.page',       varName: 'msdProducts' },
  1284: { className: 'MsdCustomerInfoPage',         file: '../../pages/msd-customer-info.page',         varName: 'msdCustomerInfo' },
  1285: { className: 'MsdPaymentInfoPage',          file: '../../pages/msd-payment-info.page',          varName: 'msdPaymentInfo' },
  1286: { className: 'MsdCheckoutPage',             file: '../../pages/msd-checkout.page',              varName: 'msdCheckout' },
};

// ─── Scenario PID → spec file mapping ─────────────────────────────────────────
const SCENARIO_SPEC: Record<number, string> = {
  // order-creation.spec.ts
  35:  'order-creation.spec.ts',
  57:  'order-creation.spec.ts',
  61:  'order-creation.spec.ts',
  62:  'order-creation.spec.ts',
  85:  'order-creation.spec.ts',
  87:  'order-creation.spec.ts',
  208: 'order-creation.spec.ts',
  // order-verification.spec.ts
  56:  'order-verification.spec.ts',
  // order-modifications.spec.ts
  64:  'order-modifications.spec.ts',
  99:  'order-modifications.spec.ts',
  // cancellation.spec.ts
  67:  'cancellation.spec.ts',
  79:  'cancellation.spec.ts',
  86:  'cancellation.spec.ts',
  103: 'cancellation.spec.ts',
  104: 'cancellation.spec.ts',
  // delivery.spec.ts
  60:  'delivery.spec.ts',
  88:  'delivery.spec.ts',
  97:  'delivery.spec.ts',
  100: 'delivery.spec.ts',
  // payments.spec.ts
  63:  'payments.spec.ts',
  98:  'payments.spec.ts',
  107: 'payments.spec.ts',
  108: 'payments.spec.ts',
  // promotions.spec.ts
  65:  'promotions.spec.ts',
  66:  'promotions.spec.ts',
  78:  'promotions.spec.ts',
  // jde-integration.spec.ts
  89:  'jde-integration.spec.ts',
  // agency-tpp.spec.ts
  112: 'agency-tpp.spec.ts',
  113: 'agency-tpp.spec.ts',
  149: 'agency-tpp.spec.ts',
  // self-service.spec.ts
  182: 'self-service.spec.ts',
  187: 'self-service.spec.ts',
};

// ─── Spec file metadata ───────────────────────────────────────────────────────
const SPEC_META: Record<string, { group: string; flag: string }> = {
  'order-creation.spec.ts':    { group: 'Order Creation',    flag: 'orderFlow' },
  'order-verification.spec.ts':{ group: 'Order Verification',flag: 'orderFlow' },
  'order-modifications.spec.ts':{ group: 'Order Modifications', flag: 'orderFlow' },
  'cancellation.spec.ts':      { group: 'Cancellation',      flag: 'orderFlow' },
  'delivery.spec.ts':          { group: 'Delivery',          flag: 'orderFlow' },
  'payments.spec.ts':          { group: 'Payments',          flag: 'orderFlow' },
  'promotions.spec.ts':        { group: 'Promotions',        flag: 'orderFlow' },
  'jde-integration.spec.ts':   { group: 'JDE Integration',   flag: 'orderFlow' },
  'agency-tpp.spec.ts':        { group: 'Agency TPP',        flag: 'orderFlow' },
  'self-service.spec.ts':      { group: 'Self Service',      flag: 'orderFlow' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Whether a param name looks like a data-driven placeholder (all caps / contains space) */
function isDataParam(name: string): boolean {
  return true; // treat all params as data-driven since we don't have real values yet
}

/** Generate the test body for one scenario */
function generateTestBody(plan: StepPlan): string {
  if (plan.steps.length === 0) {
    return [
      `    // No component steps defined in AccelQ for this scenario`,
      `    // TODO: implement when step data is available`,
    ].join('\n');
  }

  const lines: string[] = [];

  // Collect unique ctxPids to determine which page objects to instantiate
  const usedCtxPids = new Set(plan.steps.map(s => s.ctxPid));

  // Output variable accumulator: param name → JS variable name
  // (for passing outputs of one step as inputs to the next)
  const outputVars = new Map<string, string>(); // returnParamName → jsVarName

  // 1. Instantiate page objects
  const instantiated = new Set<string>();
  for (const ctxPid of usedCtxPids) {
    const imp = CTX_IMPORT[ctxPid];
    if (!imp || instantiated.has(imp.varName)) continue;
    lines.push(`    const ${imp.varName} = new ${imp.className}(page);`);
    instantiated.add(imp.varName);
  }
  lines.push('');

  // 2. Generate step calls
  for (const step of plan.steps) {
    const imp = CTX_IMPORT[step.ctxPid];
    const varName = imp?.varName ?? `ctx_${step.ctxPid}`;

    // Build argument list: use captured output vars if available, else use data placeholder
    const args = step.params.map(p => {
      // Check if a previous step produced this output under the same camelCase name
      const outputKey = step.params.find(op =>
        outputVars.has(op) || outputVars.has(p)
      );
      if (outputVars.has(p)) {
        return outputVars.get(p)!;
      }
      // Otherwise use a data placeholder string
      return `data.${p}`;
    });

    const argStr = args.join(', ');

    // Determine if this step has return values
    if (step.returns.length > 0) {
      const resultVar = `${step.methodName}Result`;
      lines.push(`    // Step ${step.index}: ${step.compName} (CMP-${step.compPid}) [ctx: ${step.ctxName}]`);
      lines.push(`    const ${resultVar} = await ${varName}.${step.methodName}(${argStr});`);
      // Register outputs for downstream steps
      for (const ret of step.returns) {
        const retCamel = ret
          .replace(/[^a-zA-Z0-9 ]/g, ' ')
          .trim()
          .split(/\s+/)
          .map((w, i) => i === 0 ? w.charAt(0).toLowerCase() + w.slice(1) : w.charAt(0).toUpperCase() + w.slice(1))
          .join('');
        outputVars.set(retCamel, `${resultVar}['${ret}']`);
      }
    } else {
      lines.push(`    // Step ${step.index}: ${step.compName} (CMP-${step.compPid}) [ctx: ${step.ctxName}]`);
      lines.push(`    await ${varName}.${step.methodName}(${argStr});`);
    }
    lines.push('');
  }

  return lines.join('\n').trimEnd();
}

/** Build the full imports section for a spec file */
function buildImports(plans: StepPlan[]): string {
  // Collect all unique (className, file) pairs across all scenarios in this spec
  const importMap = new Map<string, string>(); // className → file
  for (const plan of plans) {
    for (const step of plan.steps) {
      const imp = CTX_IMPORT[step.ctxPid];
      if (imp && !importMap.has(imp.className)) {
        importMap.set(imp.className, imp.file);
      }
    }
  }

  const lines = [
    `import { test, expect } from '@playwright/test';`,
    `import { config } from '@core/config';`,
    `import { flags } from '@core/config/featureFlags';`,
  ];

  // Sort imports for consistency
  const sorted = [...importMap.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  for (const [className, file] of sorted) {
    lines.push(`import { ${className} } from '${file}';`);
  }

  return lines.join('\n');
}

// ─── Load all step plans ───────────────────────────────────────────────────────
function loadAllStepPlans(): Map<number, StepPlan> {
  const plans = new Map<number, StepPlan>();
  const files = fs.readdirSync(CODEGEN_DIR).filter(f => f.startsWith('steps-') && f.endsWith('.json'));
  for (const file of files) {
    const raw  = fs.readFileSync(path.join(CODEGEN_DIR, file), 'utf-8');
    const plan = JSON.parse(raw) as StepPlan;
    plans.set(plan.scnPid, plan);
  }
  return plans;
}

// ─── Build per-spec-file scenario list ────────────────────────────────────────
function groupBySpecFile(allPlans: Map<number, StepPlan>): Map<string, StepPlan[]> {
  const specGroups = new Map<string, StepPlan[]>();
  for (const [pid, plan] of allPlans) {
    const specFile = SCENARIO_SPEC[pid];
    if (!specFile) {
      console.warn(`[wirer] No spec file mapping for scenario pid=${pid} (${plan.scnName})`);
      continue;
    }
    if (!specGroups.has(specFile)) specGroups.set(specFile, []);
    specGroups.get(specFile)!.push(plan);
  }
  // Sort scenarios within each spec by pid
  for (const plans of specGroups.values()) {
    plans.sort((a, b) => a.scnPid - b.scnPid);
  }
  return specGroups;
}

// ─── Generate a full spec file ─────────────────────────────────────────────────
function generateSpecFile(specFile: string, plans: StepPlan[]): string {
  const meta    = SPEC_META[specFile] ?? { group: 'Unknown', flag: 'orderFlow' };
  const imports = buildImports(plans);

  const tests = plans.map(plan => {
    const body = generateTestBody(plan);
    return [
      `  /**`,
      `   * AccelQ Scenario: S-${plan.scnPid}`,
      `   * Original name: ${plan.scnName}`,
      `   * Steps: ${plan.steps.length}`,
      `   */`,
      `  test('@smoke ${plan.scnName}', async ({ page }) => {`,
      `    // Data placeholder — replace with fixture or test.use() data`,
      `    const data: Record<string, string> = {};`,
      ``,
      body,
      `  });`,
    ].join('\n');
  }).join('\n\n');

  return [
    imports,
    ``,
    `/**`,
    ` * AccelQ Migration — ${meta.group} Scenarios`,
    ` * Source: AccelQ Project FisherAndPaykelProject`,
    ` * Total scenarios in this group: ${plans.length}`,
    ` *`,
    ` * NOTE: Page object methods still throw 'Not yet implemented'.`,
    ` * Implement locators in the pages/ files, then remove this note.`,
    ` */`,
    `test.describe('@salesforce @regression AccelQ | ${meta.group}', () => {`,
    `  test.skip(!flags.${meta.flag}, 'Feature flag ${meta.flag} is disabled');`,
    ``,
    tests,
    ``,
    `});`,
    ``,
  ].join('\n');
}

// ─── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('[wirer] Loading step plans from', CODEGEN_DIR);
  const allPlans   = loadAllStepPlans();
  const specGroups = groupBySpecFile(allPlans);

  console.log(`[wirer] Found ${allPlans.size} scenarios across ${specGroups.size} spec files`);

  for (const [specFile, plans] of specGroups) {
    const content = generateSpecFile(specFile, plans);
    const outPath = path.join(SCENARIOS_DIR, specFile);
    fs.writeFileSync(outPath, content, 'utf-8');
    console.log(`[wirer] Wrote ${specFile} (${plans.length} scenarios)`);
  }

  console.log('\n[wirer] Done.');
}

main().catch(err => { console.error(err); process.exit(1); });
