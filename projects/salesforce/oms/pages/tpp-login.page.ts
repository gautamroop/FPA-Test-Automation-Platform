import { Page } from '@playwright/test';
import { BasePage } from '@core/ui/base.page';
import { config } from '@core/config';

/**
 * AccelQ Context: TPP Login Page
 * Context PID: 413
 * Migrated from AccelQ — 2 action(s)
 */
export class TppLoginPage extends BasePage {
  constructor(page: Page) {
    super(page, config.commerceUrl);
  }

  /**
   * AccelQ: Login to Trade Portal (CMP-591)
   * @param email - AccelQ param: "Email"
   * @param password - AccelQ param: "Password"
   */
  async loginToTradePortal(email: string, password: string): Promise<void> {
    await this.waitForLoad();
    throw new Error('Not yet implemented: Login to Trade Portal');
  }

  /**
   * AccelQ: Login to MSD Trade Portal (CMP-1662)
   * @param email - AccelQ param: "Email"
   * @param password - AccelQ param: "Password"
   */
  async loginToMSDTradePortal(email: string, password: string): Promise<void> {
    await this.waitForLoad();
    throw new Error('Not yet implemented: Login to MSD Trade Portal');
  }
}
