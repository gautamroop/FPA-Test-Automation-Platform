import { Page } from '@playwright/test';
import { BasePage } from '@core/ui/base.page';
import { config } from '@core/config';

/**
 * AccelQ Context: TPP View Quotes Page
 * Context PID: 478
 * Migrated from AccelQ — 2 action(s)
 */
export class TppViewQuotesPage extends BasePage {
  constructor(page: Page) {
    super(page, config.commerceUrl);
  }

  /**
   * AccelQ: View & Verify Quote (CMP-683)
   * @param quoteNumber - AccelQ param: "Quote Number"
   */
  async viewVerifyQuote(quoteNumber: string): Promise<void> {
    await this.waitForLoad();
    throw new Error('Not yet implemented: View & Verify Quote');
  }

  /**
   * AccelQ: TPP - Convert Quote to Order (CMP-684)
   */
  async tPPConvertQuoteToOrder(): Promise<void> {
    await this.waitForLoad();
    throw new Error('Not yet implemented: TPP - Convert Quote to Order');
  }
}
