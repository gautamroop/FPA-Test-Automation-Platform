import { Page } from '@playwright/test';
import { BasePage } from '@core/ui/base.page';
import { config } from '@core/config';

/**
 * AccelQ Context: Salesforce Login Page
 * Context PID: 248
 * Migrated from AccelQ — 1 action(s)
 */
export class SalesforceLoginPage extends BasePage {
  constructor(page: Page) {
    super(page, config.salesforceApi);
  }

  /**
   * AccelQ: Login to Salesforce (CMP-350)
   * @param sFUsername - AccelQ param: "SF Username"
   * @param sFPassword - AccelQ param: "SF Password"
   * @param sFMFASecretKey - AccelQ param: "SF MFA Secret Key"
   */
  async loginToSalesforce(sFUsername: string, sFPassword: string, sFMFASecretKey: string): Promise<void> {
    await this.waitForLoad();
    throw new Error('Not yet implemented: Login to Salesforce');
  }
}
