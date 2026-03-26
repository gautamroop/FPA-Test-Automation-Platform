/**
 * accelq-codegen.ts
 *
 * Reads all-scenario-steps.json and regenerates:
 *  1. Page-object files under projects/salesforce/oms/pages/
 *     — proper typed parameter names (not param1/param2)
 *     — output params reflected as return-type Record<string,string>
 *  2. Scenario step-plan JSON under scripts/data/codegen/
 *     — one file per scenario: ordered list of { ctxName, compName, params[] }
 *     — used by the next step (spec wiring)
 *
 * Run: npx ts-node -r tsconfig-paths/register scripts/accelq-codegen.ts
 */

import * as fs   from 'fs';
import * as path from 'path';

// ─── Paths ────────────────────────────────────────────────────────────────────
const STEPS_FILE    = path.resolve(__dirname, 'data/details/all-scenario-steps.json');
const CONTEXTS_DIR  = path.resolve(__dirname, '../projects/salesforce/oms/pages');
const CODEGEN_DIR   = path.resolve(__dirname, 'data/codegen');

// ─── Types ────────────────────────────────────────────────────────────────────
interface CompParam {
  pid:           number;
  name:          string;
  required?:     boolean;
  componentPid?: number;
}

interface ScnStep {
  pid:           number;
  index:         number;
  displayIndex?: number;
  stepType:      number;  // 1=setup, 2=end, 3=component call
  compPid?:      number;
  ctxPid?:       number;
  scnPid:        number;
  paramList?:    Array<{ paramName: string; compInputParamPid: number }>;
}

interface StepEntry {
  scnStep:         ScnStep;
  compInputParams: CompParam[];
  compOutputParams: CompParam[];
  ctxName?:        string;
  compName?:       string;
  ownerCtxPid?:    number;
  compDestCtxSet?: Array<{ destCtxPid: number; destCtxName: string }>;
  initAction?:     boolean;
}

interface ScenarioSteps {
  pid:  number;
  name: string;
  data: StepEntry[];
}

// ─── Context → class/file mapping ─────────────────────────────────────────────
// Maps accleQ context names/PIDs → existing page-object class & filename
const CTX_MAP: Record<number, { file: string; className: string; configKey: string }> = {
  197: { file: 'init.page.ts',                       className: 'InitPage',                      configKey: 'commerceUrl' },
  202: { file: 'fp-home.page.ts',                    className: 'FPHomePage',                    configKey: 'commerceUrl' },
  203: { file: 'fp-login.page.ts',                   className: 'FPLoginPage',                   configKey: 'commerceUrl' },
  239: { file: 'fp-products.page.ts',                className: 'FPProductsPage',                configKey: 'commerceUrl' },
  242: { file: 'fp-order-details.page.ts',           className: 'FPOrderDetailsPage',            configKey: 'commerceUrl' },
  245: { file: 'fp-payment.page.ts',                 className: 'FPPaymentPage',                 configKey: 'commerceUrl' },
  247: { file: 'fp-checkout.page.ts',                className: 'FPCheckoutPage',                configKey: 'commerceUrl' },
  248: { file: 'salesforce-login.page.ts',           className: 'SalesforceLoginPage',           configKey: 'salesforceApi' },
  249: { file: 'salesforce-home.page.ts',            className: 'SalesforceHomePage',            configKey: 'salesforceApi' },
  250: { file: 'salesforce-order-details.page.ts',   className: 'SalesforceOrderDetailsPage',    configKey: 'salesforceApi' },
  251: { file: 'salesforce-order-summary.page.ts',   className: 'SalesforceOrderSummaryPage',    configKey: 'salesforceApi' },
  // TPP / MSD contexts  — create new files as needed
  413: { file: 'tpp-login.page.ts',                  className: 'TppLoginPage',                  configKey: 'commerceUrl' },
  414: { file: 'tpp-home.page.ts',                   className: 'TppHomePage',                   configKey: 'commerceUrl' },
  456: { file: 'tpp-home.page.ts',                   className: 'TppHomePage',                   configKey: 'commerceUrl' },
  458: { file: 'tpp-agency-order.page.ts',           className: 'TppAgencyOrderPage',            configKey: 'commerceUrl' },
  459: { file: 'tpp-products.page.ts',               className: 'TppProductsPage',               configKey: 'commerceUrl' },
  462: { file: 'tpp-customer-details.page.ts',       className: 'TppCustomerDetailsPage',        configKey: 'commerceUrl' },
  478: { file: 'tpp-view-quotes.page.ts',            className: 'TppViewQuotesPage',             configKey: 'commerceUrl' },
  481: { file: 'tpp-view-quotes.page.ts',            className: 'TppViewQuotesPage',             configKey: 'commerceUrl' },
  252: { file: 'salesforce-order-details.page.ts',   className: 'SalesforceOrderDetailsPage',    configKey: 'salesforceApi' },
  364: { file: 'salesforce-order-summary.page.ts',   className: 'SalesforceOrderSummaryPage',    configKey: 'salesforceApi' },
  927: { file: 'fp-book-service.page.ts',            className: 'FPBookServicePage',             configKey: 'commerceUrl' },
  946: { file: 'fp-product-registration.page.ts',    className: 'FPProductRegistrationPage',     configKey: 'commerceUrl' },
  1198: { file: 'tpp-msd-portal.page.ts',            className: 'TppMsdPortalPage',              configKey: 'commerceUrl' },
  1283: { file: 'msd-product-listing.page.ts',       className: 'MsdProductListingPage',         configKey: 'commerceUrl' },
  1284: { file: 'msd-customer-info.page.ts',         className: 'MsdCustomerInfoPage',           configKey: 'commerceUrl' },
  1285: { file: 'msd-payment-info.page.ts',          className: 'MsdPaymentInfoPage',            configKey: 'commerceUrl' },
  1286: { file: 'msd-checkout.page.ts',              className: 'MsdCheckoutPage',               configKey: 'commerceUrl' },
};

// ─── Utility helpers ───────────────────────────────────────────────────────────

/** Convert a human-readable AccelQ action name to a camelCase TS method name */
function toCamelCase(str: string): string {
  const camel = str
    .replace(/[^a-zA-Z0-9 ]/g, ' ')   // remove special chars
    .trim()
    .split(/\s+/)
    .map((w, i) => i === 0 ? w.charAt(0).toLowerCase() + w.slice(1) : w.charAt(0).toUpperCase() + w.slice(1))
    .join('');
  // Prepend 'action' if method name starts with a digit
  return /^[0-9]/.test(camel) ? `action${camel.charAt(0).toUpperCase()}${camel.slice(1)}` : camel;
}

/** Convert a param name like "Address Line 1" → "addressLine1".
 *  Handles edge cases like names starting with digits (e.g. "43 Meadway" → "param43Meadway"). */
function toParamName(name: string): string {
  const camel = name
    .replace(/[^a-zA-Z0-9 ]/g, ' ')
    .trim()
    .split(/\s+/)
    .map((w, i) => i === 0 ? w.charAt(0).toLowerCase() + w.slice(1) : w.charAt(0).toUpperCase() + w.slice(1))
    .join('');
  // Prepend 'param' if the identifier starts with a digit
  return /^[0-9]/.test(camel) ? `param${camel.charAt(0).toUpperCase()}${camel.slice(1)}` : camel;
}

/** Determine return type: void if no output params, Record<string,string> otherwise */
function returnType(outputParams: CompParam[]): string {
  return outputParams.length > 0 ? 'Promise<Record<string, string>>' : 'Promise<void>';
}

// ─── Build per-context action registry ────────────────────────────────────────
interface ActionDef {
  compPid:      number;
  compName:     string;
  ctxPid:       number;
  ctxName:      string;
  inputParams:  CompParam[];
  outputParams: CompParam[];
}

function buildContextActionMap(allSteps: Record<string, ScenarioSteps>): Map<number, Map<number, ActionDef>> {
  // ctxPid → Map<compPid, ActionDef>
  const ctxMap = new Map<number, Map<number, ActionDef>>();

  for (const scn of Object.values(allSteps)) {
    for (const entry of scn.data) {
      const step = entry.scnStep;
      if (step.stepType !== 3) continue;           // only component-call steps
      if (!step.compPid || !step.ctxPid) continue;

      if (!ctxMap.has(step.ctxPid)) {
        ctxMap.set(step.ctxPid, new Map());
      }
      const actions = ctxMap.get(step.ctxPid)!;

      // Register first occurrence of each compPid; later occurrences won't
      // add new info since component definition is identical across scenarios
      if (!actions.has(step.compPid)) {
        actions.set(step.compPid, {
          compPid:      step.compPid,
          compName:     entry.compName ?? `Action_${step.compPid}`,
          ctxPid:       step.ctxPid,
          ctxName:      entry.ctxName ?? `Context_${step.ctxPid}`,
          inputParams:  entry.compInputParams ?? [],
          outputParams: entry.compOutputParams ?? [],
        });
      }
    }
  }

  return ctxMap;
}

// ─── Generate page-object file content ────────────────────────────────────────
function generatePageObjectFile(
  ctxPid:  number,
  ctxName: string,
  actions: Map<number, ActionDef>,
  mapping: { file: string; className: string; configKey: string },
): string {
  const methods = [...actions.values()].map(action => {
    const methodName = toCamelCase(action.compName);
    const inputs     = action.inputParams
      .sort((a, b) => (a as any).index - (b as any).index);
    const paramList  = inputs.map(p => `${toParamName(p.name)}: string`).join(', ');
    const ret        = returnType(action.outputParams);

    const paramComments = inputs.length
      ? inputs.map(p => `   * @param ${toParamName(p.name)} - AccelQ param: "${p.name}"`).join('\n')
      : '';

    const outputComment = action.outputParams.length
      ? `   * @returns Record with keys: ${action.outputParams.map(p => `"${p.name}"`).join(', ')}`
      : '';

    const returnStub = action.outputParams.length
      ? [
          `    // TODO: implement — return { ${action.outputParams.map(p => `'${p.name}': ''`).join(', ')} }`,
          `    throw new Error('Not yet implemented: ${action.compName.replace(/'/g, "\\'")}');`,
        ].join('\n')
      : `    throw new Error('Not yet implemented: ${action.compName.replace(/'/g, "\\'")}');`;

    return [
      `  /**`,
      `   * AccelQ: ${action.compName} (CMP-${action.compPid})`,
      paramComments ? paramComments : null,
      outputComment  ? outputComment  : null,
      `   */`,
      `  async ${methodName}(${paramList}): ${ret} {`,
      `    await this.waitForLoad();`,
      returnStub,
      `  }`,
    ].filter(l => l !== null).join('\n');
  });

  const actionCount = actions.size;

  return [
    `import { Page } from '@playwright/test';`,
    `import { BasePage } from '@core/ui/base.page';`,
    `import { config } from '@core/config';`,
    ``,
    `/**`,
    ` * AccelQ Context: ${ctxName}`,
    ` * Context PID: ${ctxPid}`,
    ` * Migrated from AccelQ — ${actionCount} action(s)`,
    ` */`,
    `export class ${mapping.className} extends BasePage {`,
    `  constructor(page: Page) {`,
    `    super(page, config.${mapping.configKey});`,
    `  }`,
    ``,
    ...(actionCount === 0
      ? [`  // No actions defined for this context yet`]
      : methods.map((m, i) => (i < methods.length - 1 ? m + '\n' : m))),
    `}`,
    ``,
  ].join('\n');
}

// ─── Generate scenario step-plan (JSON) ───────────────────────────────────────
interface StepPlan {
  scnPid:   number;
  scnName:  string;
  steps:    Array<{
    index:     number;
    ctxPid:    number;
    ctxName:   string;
    compPid:   number;
    compName:  string;
    methodName: string;
    params:    string[];
    returns:   string[];
  }>;
}

function buildStepPlan(scn: ScenarioSteps): StepPlan {
  const steps = scn.data
    .filter(e => e.scnStep.stepType === 3 && e.scnStep.compPid)
    .map(e => {
      const inputs  = (e.compInputParams ?? []).sort((a,b) => (a as any).index-(b as any).index);
      const outputs = (e.compOutputParams ?? []);
      return {
        index:      e.scnStep.displayIndex ?? e.scnStep.index,
        ctxPid:     e.scnStep.ctxPid!,
        ctxName:    e.ctxName ?? '',
        compPid:    e.scnStep.compPid!,
        compName:   e.compName ?? '',
        methodName: toCamelCase(e.compName ?? ''),
        params:     inputs.map(p => toParamName(p.name)),
        returns:    outputs.map(p => p.name),
      };
    });

  return { scnPid: scn.pid, scnName: scn.name, steps };
}

// ─── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('[codegen] Reading step data from', STEPS_FILE);
  const raw      = fs.readFileSync(STEPS_FILE, 'utf-8');
  const allSteps = JSON.parse(raw) as Record<string, ScenarioSteps>;

  // 1. Build context → actions map
  const ctxActionMap = buildContextActionMap(allSteps);
  console.log(`[codegen] Found ${ctxActionMap.size} contexts with actions`);

  // 2. Merge actions per output file (multiple ctxPids can map to the same file)
  //    fileKey → { mapping, mergedActions, ctxNames, primaryCtxPid }
  const fileMap = new Map<string, {
    mapping:       { file: string; className: string; configKey: string };
    mergedActions: Map<number, ActionDef>;
    ctxNames:      string[];
    primaryCtxPid: number;
  }>();

  for (const [ctxPid, actions] of ctxActionMap) {
    const mapping = CTX_MAP[ctxPid];
    if (!mapping) {
      const ctxName = [...actions.values()][0]?.ctxName ?? `ctx_${ctxPid}`;
      console.warn(`[codegen] No mapping for ctxPid=${ctxPid} (${ctxName}) — skipping page object`);
      continue;
    }
    const existing = fileMap.get(mapping.file);
    const ctxName  = [...actions.values()][0]?.ctxName ?? `Context_${ctxPid}`;
    if (!existing) {
      fileMap.set(mapping.file, {
        mapping,
        mergedActions: new Map(actions),
        ctxNames:      [ctxName],
        primaryCtxPid: ctxPid,
      });
    } else {
      // Merge actions (compPid deduplication)
      for (const [compPid, action] of actions) {
        if (!existing.mergedActions.has(compPid)) {
          existing.mergedActions.set(compPid, action);
        }
      }
      existing.ctxNames.push(ctxName);
    }
  }

  // Also ensure every mapped ctx has an entry (even if no actions)
  for (const [ctxPidStr, mapping] of Object.entries(CTX_MAP)) {
    if (!fileMap.has(mapping.file)) {
      fileMap.set(mapping.file, {
        mapping,
        mergedActions: new Map(),
        ctxNames:      [],
        primaryCtxPid: Number(ctxPidStr),
      });
    }
  }

  let written = 0;
  for (const [fileName, { mapping, mergedActions, ctxNames, primaryCtxPid }] of fileMap) {
    const displayName = ctxNames[0] ?? mapping.className;
    const allCtxLabel = ctxNames.length > 1
      ? `${ctxNames.join(' / ')}`
      : displayName;
    const content = generatePageObjectFile(primaryCtxPid, allCtxLabel, mergedActions, mapping);
    const outPath = path.join(CONTEXTS_DIR, fileName);
    fs.writeFileSync(outPath, content, 'utf-8');
    console.log(`[codegen] Wrote ${fileName} (${mergedActions.size} actions)`);
    written++;
  }

  // 3. Write per-scenario step-plan JSON files
  if (!fs.existsSync(CODEGEN_DIR)) fs.mkdirSync(CODEGEN_DIR, { recursive: true });

  for (const scn of Object.values(allSteps)) {
    const plan    = buildStepPlan(scn);
    const outPath = path.join(CODEGEN_DIR, `steps-${scn.pid}.json`);
    fs.writeFileSync(outPath, JSON.stringify(plan, null, 2), 'utf-8');
  }
  console.log(`[codegen] Written ${Object.keys(allSteps).length} step-plan files to ${CODEGEN_DIR}`);

  // 4. Write a combined context-action index (useful for spec wiring)
  const contextIndex: Record<string, { ctxName: string; className: string; file: string; actions: string[] }> = {};
  for (const [ctxPid, actions] of ctxActionMap) {
    const mapping = CTX_MAP[ctxPid];
    if (!mapping) continue;
    const ctxName = [...actions.values()][0]?.ctxName ?? `ctx_${ctxPid}`;
    contextIndex[ctxPid] = {
      ctxName,
      className: mapping.className,
      file:      mapping.file,
      actions:   [...actions.values()].map(a => `${toCamelCase(a.compName)} (CMP-${a.compPid})`),
    };
  }
  const indexPath = path.join(CODEGEN_DIR, 'context-action-index.json');
  fs.writeFileSync(indexPath, JSON.stringify(contextIndex, null, 2), 'utf-8');
  console.log('[codegen] Wrote context-action-index.json');

  console.log(`\n[codegen] Done. ${written} page-object files regenerated.`);
}

main().catch(err => { console.error(err); process.exit(1); });
