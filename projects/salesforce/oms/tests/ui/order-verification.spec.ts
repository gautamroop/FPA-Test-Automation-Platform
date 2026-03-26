import { test, expect } from '@playwright/test';
import { config } from '@core/config';
import { flags } from '@core/config/featureFlags';
import { InitPage } from '../../pages/init.page';
import { SalesforceHomePage } from '../../pages/salesforce-home.page';
import { SalesforceLoginPage } from '../../pages/salesforce-login.page';
import { SalesforceOrderDetailsPage } from '../../pages/salesforce-order-details.page';

/**
 * AccelQ Migration — Order Verification Scenarios
 * Source: AccelQ Project FisherAndPaykelProject
 * Total scenarios in this group: 1
 *
 * NOTE: Page object methods still throw 'Not yet implemented'.
 * Implement locators in the contexts/ files, then remove this note.
 */
test.describe('@salesforce @regression AccelQ | Order Verification', () => {
  test.skip(!flags.orderFlow, 'Feature flag orderFlow is disabled');

  /**
   * AccelQ Scenario: S-56
   * Original name: Verify Order Details on SF
   * Steps: 4
   */
  test('@smoke Verify Order Details on SF', async ({ page }) => {
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

    // Step 4: Verify Order Details on SF (CMP-354) [ctx: Salesforce Order Details Page]
    const verifyOrderDetailsOnSFResult = await sfOrderDetails.verifyOrderDetailsOnSF(data.orderDUNumber, data.orderedDate, data.total, data.emailAddress, data.phoneNumber, data.itemName, data.itemQty);
  });

});
