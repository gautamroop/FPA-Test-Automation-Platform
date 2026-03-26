import { test, expect } from '@playwright/test';
import { config } from '@core/config';
import { flags } from '@core/config/featureFlags';
import { InitPage } from '../../pages/init.page';
import { SalesforceHomePage } from '../../pages/salesforce-home.page';
import { SalesforceLoginPage } from '../../pages/salesforce-login.page';
import { SalesforceOrderDetailsPage } from '../../pages/salesforce-order-details.page';

/**
 * AccelQ Migration — Payments Scenarios
 * Source: AccelQ Project FisherAndPaykelProject
 * Total scenarios in this group: 4
 *
 * NOTE: Page object methods still throw 'Not yet implemented'.
 * Implement locators in the contexts/ files, then remove this note.
 */
test.describe('@salesforce @regression AccelQ | Payments', () => {
  test.skip(!flags.orderFlow, 'Feature flag orderFlow is disabled');

  /**
   * AccelQ Scenario: S-63
   * Original name: Verify Paid in Full-Checkbox
   * Steps: 4
   */
  test('@smoke Verify Paid in Full-Checkbox', async ({ page }) => {
    // Data placeholder — replace with fixture or test.use() data
    const data: Record<string, string> = {};

    const initPage = new InitPage(page);
    const sfLogin = new SalesforceLoginPage(page);
    const sfHome = new SalesforceHomePage(page);
    const sfOrderDetails = new SalesforceOrderDetailsPage(page);

    // Step 1: Invoke Browser (CMP-282) [ctx: Init Page]
    await initPage.invokeBrowser(data.uRL);

    // Step 2: Login to Salesforce (CMP-350) [ctx: Salesforce Login Page]
    await sfLogin.loginToSalesforce(data.sFUsername, data.sFPassword, data.sFMFASecretKey);

    // Step 3: Search and View Details (CMP-351) [ctx: Salesforce Home Page]
    await sfHome.searchAndViewDetails(data.orderDUNumber);

    // Step 4: Verify Paid in Full-Checkbox (CMP-377) [ctx: Salesforce Order Details Page]
    await sfOrderDetails.verifyPaidInFullCheckbox(data.paymentType);
  });

  /**
   * AccelQ Scenario: S-98
   * Original name: Generate Invoice
   * Steps: 4
   */
  test('@smoke Generate Invoice', async ({ page }) => {
    // Data placeholder — replace with fixture or test.use() data
    const data: Record<string, string> = {};

    const initPage = new InitPage(page);
    const sfLogin = new SalesforceLoginPage(page);
    const sfHome = new SalesforceHomePage(page);
    const sfOrderDetails = new SalesforceOrderDetailsPage(page);

    // Step 1: Invoke Browser (CMP-282) [ctx: Init Page]
    await initPage.invokeBrowser(data.uRL);

    // Step 2: Login to Salesforce (CMP-350) [ctx: Salesforce Login Page]
    await sfLogin.loginToSalesforce(data.sFUsername, data.sFPassword, data.sFMFASecretKey);

    // Step 3: Search and View Details (CMP-351) [ctx: Salesforce Home Page]
    await sfHome.searchAndViewDetails(data.orderDUNumber);

    // Step 4: Navigate to Fulfillment and Create Invoice (CMP-597) [ctx: Salesforce Order Details Page]
    const navigateToFulfillmentAndCreateInvoiceResult = await sfOrderDetails.navigateToFulfillmentAndCreateInvoice(data.orderDUNumber);
  });

  /**
   * AccelQ Scenario: S-107
   * Original name: Verify Payment sent to JDE
   * Steps: 4
   */
  test('@smoke Verify Payment sent to JDE', async ({ page }) => {
    // Data placeholder — replace with fixture or test.use() data
    const data: Record<string, string> = {};

    const initPage = new InitPage(page);
    const sfLogin = new SalesforceLoginPage(page);
    const sfHome = new SalesforceHomePage(page);
    const sfOrderDetails = new SalesforceOrderDetailsPage(page);

    // Step 1: Invoke Browser (CMP-282) [ctx: Init Page]
    await initPage.invokeBrowser(data.uRL);

    // Step 2: Login to Salesforce (CMP-350) [ctx: Salesforce Login Page]
    await sfLogin.loginToSalesforce(data.sFUsername, data.sFPassword, data.sFMFASecretKey);

    // Step 3: Search and View Details (CMP-351) [ctx: Salesforce Home Page]
    await sfHome.searchAndViewDetails(data.orderDUNumber);

    // Step 4: Verify Order Payment Response  (CMP-632) [ctx: Salesforce Order Details Page]
    await sfOrderDetails.verifyOrderPaymentResponse();
  });

  /**
   * AccelQ Scenario: S-108
   * Original name: Generate payment Link- Amount on screen matches Outstanding amount
   * Steps: 5
   */
  test('@smoke Generate payment Link- Amount on screen matches Outstanding amount', async ({ page }) => {
    // Data placeholder — replace with fixture or test.use() data
    const data: Record<string, string> = {};

    const initPage = new InitPage(page);
    const sfLogin = new SalesforceLoginPage(page);
    const sfHome = new SalesforceHomePage(page);
    const sfOrderDetails = new SalesforceOrderDetailsPage(page);

    // Step 1: Invoke Browser (CMP-282) [ctx: Init Page]
    await initPage.invokeBrowser(data.uRL);

    // Step 2: Login to Salesforce (CMP-350) [ctx: Salesforce Login Page]
    await sfLogin.loginToSalesforce(data.sFUsername, data.sFPassword, data.sFMFASecretKey);

    // Step 3: Search and View Details (CMP-351) [ctx: Salesforce Home Page]
    await sfHome.searchAndViewDetails(data.orderDUNumber);

    // Step 4: Add item to the order and Verify (CMP-385) [ctx: Salesforce Order Details Page]
    const addItemToTheOrderAndVerifyResult = await sfOrderDetails.addItemToTheOrderAndVerify(data.orderLevelDiscountValue, data.orderLevelDiscountType, data.productCodeSKU);

    // Step 5: Generate Payment Link (CMP-637) [ctx: Salesforce Order Details Page]
    await sfOrderDetails.generatePaymentLink(data.requestedAmount);
  });

});
