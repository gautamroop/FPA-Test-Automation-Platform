import { Page } from '@playwright/test';
import { BasePage } from '@core/ui/base.page';
import { config } from '@core/config';

/**
 * AccelQ Context: TPP Agency Order Page
 * Context PID: 458
 * Migrated from AccelQ — 2 action(s)
 */
export class TppAgencyOrderPage extends BasePage {
  constructor(page: Page) {
    super(page, config.commerceUrl);
  }

  /**
   * AccelQ: Validate and Accept Cookies (CMP-291)
   */
  async validateAndAcceptCookies(): Promise<void> {
    await this.waitForLoad();
    throw new Error('Not yet implemented: Validate and Accept Cookies');
  }

  /**
   * AccelQ: Select TPP Product Type (CMP-655)
   * @param productType - AccelQ param: "Product Type"
   */
  async selectTPPProductType(productType: string): Promise<void> {
    await this.waitForLoad();
    throw new Error('Not yet implemented: Select TPP Product Type');
  }
}
