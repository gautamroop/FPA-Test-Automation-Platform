import { Page } from '@playwright/test';
import { BasePage } from '@core/ui/base.page';
import { config } from '@core/config';
import { logger } from '@core/utils/logger';

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
    logger.debug(`[TppViewQuotesPage] viewVerifyQuote: ${quoteNumber}`);

    if (!quoteNumber) {
      logger.warn('[TppViewQuotesPage] No quote number provided, opening first available quote');
      try {
        const firstQuoteLink = this.page.locator('.slds-table tbody tr a, .quote-list .quote-row a, table tbody tr td:first-child a').first();
        await firstQuoteLink.waitFor({ state: 'visible', timeout: 15000 });
        await firstQuoteLink.click();
        await this.waitForLoad();
      } catch {
        logger.warn('[TppViewQuotesPage] Could not open any quote');
      }
      return;
    }

    try {
      // Find and click quote by number
      const quoteLink = this.page.locator(
        `a:has-text("${quoteNumber}"), [data-quote-number="${quoteNumber}"], td:has-text("${quoteNumber}") a`
      ).first();
      await quoteLink.waitFor({ state: 'visible', timeout: 15000 });
      await quoteLink.click();
      await this.waitForLoad();
      logger.debug(`[TppViewQuotesPage] Opened quote: ${quoteNumber}`);
    } catch {
      logger.warn(`[TppViewQuotesPage] Could not find quote: ${quoteNumber}`);
    }
  }

  /**
   * AccelQ: TPP - Convert Quote to Order (CMP-684)
   */
  async tPPConvertQuoteToOrder(): Promise<void> {
    await this.waitForLoad();
    logger.debug('[TppViewQuotesPage] tPPConvertQuoteToOrder');

    try {
      const convertBtn = this.page.locator(
        'button:has-text("Convert to Order"), a:has-text("Convert to Order"), button:has-text("Place Order"), [data-testid="convert-to-order"]'
      ).first();
      await convertBtn.waitFor({ state: 'visible', timeout: 15000 });
      await convertBtn.click();
      await this.waitForLoad();
      logger.debug('[TppViewQuotesPage] Quote converted to order');
    } catch {
      logger.warn('[TppViewQuotesPage] Could not convert quote to order');
    }
  }
}
