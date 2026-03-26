# FPA Test Automation Platform

A cross-system end-to-end test automation platform built with [Playwright](https://playwright.dev), TypeScript, and a project-driven folder structure.

## Project Structure

```
FPA-Test-Automation-Platform/
├── core/                        # Reusable platform layer
│   ├── ui/
│   │   └── base.page.ts         # BasePage — all page objects extend this
│   ├── api/
│   │   └── clients/
│   │       └── salesforce.client.ts  # Axios client: getOrder, createOrder, updateOrderStatus, deleteOrder
│   ├── auth/
│   │   └── auth.helper.ts       # Login + session save (storageState)
│   ├── utils/
│   │   ├── logger.ts            # Winston logger (LOG_LEVEL driven)
│   │   ├── retry.util.ts        # retry<T>() — defaults from config
│   │   └── testdata.generator.ts# generateUser(), generateAddress()
│   ├── validators/
│   │   └── order.validator.ts   # validateOrderConsistency(ui, sf)
│   └── config/
│       ├── configLoader.ts      # Merges .env + config/env/{ENV}.json → AppConfig
│       └── featureFlags.ts      # Loads config/feature-flags/{ENV}.json → FeatureFlags
│
├── projects/                    # Project-based test modules
│   ├── OMS/                     # Order Management System
│   ├── TPP/                     # Third Party Platform
│   ├── ASL/                     # ASL project
│   ├── commerce/
│   │   ├── pages/
│   │   │   └── checkout.page.ts
│   │   ├── tests/
│   │   ├── test-data/
│   │   └── validators/
│   ├── salesforce/
│   │   ├── pages/
│   │   │   ├── login.page.ts
│   │   │   └── order.page.ts
│   │   ├── tests/
│   │   │   ├── ui/
│   │   │   │   └── salesforce.ui.spec.ts
│   │   │   └── api/
│   │   │       └── salesforce.api.spec.ts
│   │   ├── validators/
│   │   └── accelq/                          # ← AccelQ migration (32 scenarios, 4 suites, 29 contexts, 25 actions)
│   │       ├── contexts/                    # Page objects — one per AccelQ context
│   │       │   ├── salesforce-login.page.ts
│   │       │   ├── salesforce-home.page.ts
│   │       │   ├── salesforce-order-details.page.ts   # 12 actions
│   │       │   ├── salesforce-order-summary.page.ts
│   │       │   ├── fp-login.page.ts
│   │       │   ├── fp-home.page.ts
│   │       │   ├── fp-products.page.ts
│   │       │   ├── fp-order-details.page.ts
│   │       │   ├── fp-checkout.page.ts
│   │       │   └── fp-payment.page.ts
│   │       ├── scenarios/                   # Spec files grouped by theme
│   │       │   ├── order-creation.spec.ts   # S-35, S-57, S-61, S-62, S-85, S-87, S-208
│   │       │   ├── order-verification.spec.ts
│   │       │   ├── order-modifications.spec.ts
│   │       │   ├── cancellation.spec.ts
│   │       │   ├── delivery.spec.ts
│   │       │   ├── payments.spec.ts
│   │       │   ├── promotions.spec.ts
│   │       │   ├── jde-integration.spec.ts
│   │       │   ├── agency-tpp.spec.ts
│   │       │   └── self-service.spec.ts
│   │       ├── test-suites/
│   │       │   └── regression-suites.spec.ts  # TS-1, TS-2, TS-4, TS-18
│   │       └── actions/
│   │           └── actions.index.ts          # Catalogue of all 25 AccelQ actions
│   ├── jde/
│   │   ├── tests/
│   │   ├── api/
│   │   └── db/
│   ├── integration/
│   │   ├── tests/
│   │   ├── events/
│   │   └── contracts/
│   ├── subscription/
│   │   ├── tests/
│   │   ├── api/
│   │   └── validators/
│   └── shared-flows/            # Cross-system specs only
│       ├── order-flow/
│       │   └── order-flow.spec.ts
│       └── subscription-flow/
│
├── test-orchestration/
│   ├── workflows/
│   └── runners/
│
├── config/
│   ├── env/
│   │   └── dev.json             # retryCount, retryDelay
│   └── feature-flags/
│       └── dev.json             # orderFlow, subscriptionFlow, newCheckout
│
├── test-data/
│   └── collection.json          # Postman/Newman collection
├── reports/                     # Allure, HTML, Newman output
├── scripts/
├── ci/
└── docs/
```

## AccelQ Migration

All AccelQ test content has been scraped and migrated into `projects/salesforce/accelq/`.

### What was migrated

| Entity | Count | Location |
|---|---|---|
| Scenarios | 32 | `scenarios/*.spec.ts` (grouped by theme) |
| Test Suites | 4 | `test-suites/regression-suites.spec.ts` |
| Contexts (Page Objects) | 10 key contexts | `contexts/*.page.ts` |
| Actions / Components | 25 | `actions/actions.index.ts` |

### AccelQ → Playwright mapping

| AccelQ concept | Playwright equivalent |
|---|---|
| **Context** | Page Object (`extends BasePage`) |
| **Component / Action** | Method on a Page Object |
| **Scenario** | `test(...)` in a `.spec.ts` file |
| **Test Suite** | `test.describe(...)` or a Playwright project |
| **Parameter (in/out)** | Function argument / return value |
| **Data-driven** | Playwright `for...of` loop with test data array |

### Scenario groups

| File | Scenarios | AccelQ IDs |
|---|---|---|
| `order-creation.spec.ts` | 7 | S-35, S-57, S-61, S-62, S-85, S-87, S-208 |
| `order-verification.spec.ts` | 1 | S-56 |
| `order-modifications.spec.ts` | 2 | S-64, S-99 |
| `cancellation.spec.ts` | 5 | S-67, S-79, S-86, S-103, S-104 |
| `delivery.spec.ts` | 4 | S-60, S-88, S-97, S-100 |
| `payments.spec.ts` | 4 | S-63, S-78, S-107, S-108 |
| `promotions.spec.ts` | 3 | S-65, S-66, S-98 |
| `jde-integration.spec.ts` | 1 | S-89 |
| `agency-tpp.spec.ts` | 3 | S-112, S-113, S-149 |
| `self-service.spec.ts` | 2 | S-182, S-187 |

### Running migrated tests

```bash
# Run all AccelQ-migrated scenarios
npx playwright test projects/salesforce/accelq/scenarios/

# Run a specific theme
npx playwright test projects/salesforce/accelq/scenarios/order-creation.spec.ts

# Run test suites
npx playwright test projects/salesforce/accelq/test-suites/
```

### Implementing a migrated test

Each spec has a `test.fail(true, '...')` placeholder. To implement:

1. Import the relevant page object from `contexts/`
2. Replace the `test.fail()` with real Playwright steps using the page object methods
3. Each page object method maps to an AccelQ component — implement the UI interactions there

```ts
import { SalesforceOrderDetailsPage } from '../contexts/salesforce-order-details.page';

test('@smoke Verify Fulfilment Order Creation', async ({ page }) => {
  const sfOrderPage = new SalesforceOrderDetailsPage(page);
  await sfOrderPage.navigate();
  await sfOrderPage.verifyFulfilmentOrder();
});
```

### Re-running the scraper

To re-scrape AccelQ (e.g., after new scenarios are added):

```bash
npx ts-node --transpile-only scripts/accelq-scraper.ts
```

Output files are saved to `scripts/data/` (raw JSON) and `scripts/screenshots/`.

---

## Best Practices

### 1. Feature Flag Gating
Every test that covers a feature in development should be gated by a feature flag. Tests skip automatically when the flag is off — no manual commenting out.

```ts
import { flags } from '../../../core/config';

test('should create order', async () => {
  test.skip(!flags.orderFlow, 'orderFlow feature flag is disabled');
  // ...
});
```

### 2. Tag Strategy
Every spec should be tagged for selective execution:

| Tag | Purpose |
|-----|---------|
| `@smoke` | Fast, critical-path tests — run on every deploy |
| `@regression` | Full suite — run nightly or pre-release |
| `@e2e` | Cross-system flows spanning multiple projects |
| `@ui` | UI/browser tests only |
| `@api` | API tests only |
| `@{project}` | e.g. `@salesforce`, `@commerce`, `@oms` |

```bash
npx playwright test --grep @smoke
npx playwright test --grep "@salesforce.*@api"
```

### 3. Page Object Model (POM)
All page objects extend `BasePage` from `core/ui/base.page.ts`, which provides `navigate()`, `waitForLoad()`, `waitForSelector()`, and `takeScreenshot()`. Never duplicate these across projects.

### 4. Separate UI and API Tests
Each project owns `tests/ui/` and `tests/api/` subdirectories. A spec file should never mix browser interactions with raw API calls.

### 5. Shared Flows for Cross-System Orchestration
`shared-flows/` is reserved exclusively for tests that span multiple systems (e.g. place order in Commerce → verify in Salesforce). Single-system tests live inside their own project.

### 6. Centralised Auth
Session login logic lives in `core/auth/auth.helper.ts`. Use Playwright's `storageState` to log in once and reuse the session across all specs in a project — avoids repeated login overhead.

### 7. Config-Driven Retries
Never hardcode retry counts or delays. Always use the defaults from `config/env/{ENV}.json` via the `retry()` utility.

```ts
// Uses config defaults (retryCount=10, retryDelay=5000ms)
const order = await retry(() => sfClient.getOrder(orderId));
```

---

## Prerequisites

- Node.js >= 18
- npm >= 9
- newman >= 6 (installed globally)

## Setup

```bash
npm install
npx playwright install
cp .env .env.local   # fill in your environment values
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `ENV` | Environment name (e.g. `dev`) |
| `LOG_LEVEL` | Winston log level (`debug`, `info`, `warn`, `error`) |
| `COMMERCE_URL` | Base URL for Commerce |
| `SALESFORCE_API` | Salesforce API/UI base URL |
| `SF_TOKEN` | Salesforce bearer token |
| `SF_USERNAME` | Salesforce UI username |
| `SF_PASSWORD` | Salesforce UI password |
| `JDE_API` | JDE API base URL |
| `ALLURE_RESULTS_DIR` | Output folder for Allure results |

## Running Tests

```bash
# Run all tests
npm test

# Run order flow tests
npm run test:order

# Run all e2e tests
npm run test:e2e

# Run in CI mode
npm run test:ci

# Run Salesforce UI tests only
npx playwright test --grep "@salesforce.*@ui"

# Run Salesforce API tests only
npx playwright test --grep "@salesforce.*@api"

# Run smoke tests across all projects
npx playwright test --grep @smoke

# Run on a specific browser
npx playwright test --project=chromium

# Run with UI mode
npx playwright test --ui
```

## Newman (API Collections)

```bash
# Run Postman collection with HTML report
npm run newman

# Run with variable overrides
newman run test-data/collection.json \
  --env-var "SALESFORCE_API=https://your-sf-api" \
  --env-var "SF_TOKEN=your_token" \
  --env-var "orderId=ORD-001" \
  -r html --reporter-html-export reports/newman/index.html
```

## Reporting

```bash
# Generate and open Allure report
npm run report:allure

# Open Playwright HTML report
npm run report:html
```

## Tech Stack

| Tool | Purpose |
|------|---------|
| Playwright | Browser automation & test runner |
| TypeScript | Language |
| Axios | HTTP/API client |
| Winston | Structured logging |
| Allure | Test reporting |
| Newman | Postman collection runner |
| dotenv | Environment config |
| uuid | Unique ID generation |
