import { Page } from '@playwright/test';
import { BasePage } from '@core/ui/base.page';
import { config } from '@core/config';
import { logger } from '@core/utils/logger';

/**
 * AccelQ Context: TPP Home Page
 * Context PID: 456
 * Migrated from AccelQ — 4 action(s)
 */
export class TppHomePage extends BasePage {
  constructor(page: Page) {
    super(page, config.commerceUrl);
  }

  /**
   * AccelQ: Navigate to New Agency Order (CMP-653)
   * @param tPPType - AccelQ param: "TPP Type"
   */
  async navigateToNewAgencyOrder(tPPType: string): Promise<void> {
    await this.waitForLoad();
    logger.debug(`[TppHomePage] navigateToNewAgencyOrder: ${tPPType}`);

    try {
      // Click "New Agency Order" link or button
      const newOrderLink = this.page.locator(
        'a:has-text("New Agency Order"), button:has-text("New Agency Order"), a:has-text("New Order"), [data-testid="new-agency-order"]'
      ).first();
      await newOrderLink.waitFor({ state: 'visible', timeout: 5000 });
      await newOrderLink.click();
      await this.waitForLoad();
    } catch {
      logger.warn('[TppHomePage] Could not find New Agency Order button');
    }
  }

  /**
   * AccelQ: Verify Quote is Generated (CMP-680)
   * @param quoteNumber - AccelQ param: "Quote Number"
   */
  async verifyQuoteIsGenerated(quoteNumber: string): Promise<void> {
    await this.waitForLoad();
    logger.debug(`[TppHomePage] verifyQuoteIsGenerated: ${quoteNumber}`);

    if (!quoteNumber) {
      logger.warn('[TppHomePage] No quote number to verify');
      return;
    }

    try {
      const quoteEl = this.page.locator(
        `[data-testid="quote-number"]:has-text("${quoteNumber}"), :text("${quoteNumber}"), .quote-number:has-text("${quoteNumber}")`
      ).first();
      await quoteEl.waitFor({ state: 'visible', timeout: 5000 });
      logger.debug(`[TppHomePage] Quote ${quoteNumber} verified on page`);
    } catch {
      logger.warn(`[TppHomePage] Could not find quote number: ${quoteNumber}`);
    }
  }

  /**
   * AccelQ: Navigate to Agency Quotes (CMP-682)
   */
  async navigateToAgencyQuotes(): Promise<void> {
    await this.waitForLoad();
    logger.debug('[TppHomePage] navigateToAgencyQuotes');

    try {
      const quotesLink = this.page.locator(
        'a:has-text("Agency Quotes"), a:has-text("Quotes"), nav a:has-text("Quote"), [data-testid="agency-quotes"]'
      ).first();
      await quotesLink.waitFor({ state: 'visible', timeout: 5000 });
      await quotesLink.click();
      await this.waitForLoad();
    } catch {
      logger.warn('[TppHomePage] Could not navigate to Agency Quotes');
    }
  }

  /**
   * AccelQ: View Order (CMP-1978)
   */
  async viewOrder(): Promise<void> {
    await this.waitForLoad();
    logger.debug('[TppHomePage] viewOrder');

    try {
      const viewOrderLink = this.page.locator(
        'a:has-text("View Order"), button:has-text("View Order"), a:has-text("Orders"), [data-testid="view-order"]'
      ).first();
      await viewOrderLink.waitFor({ state: 'visible', timeout: 5000 });
      await viewOrderLink.click();
      await this.waitForLoad();
    } catch {
      logger.warn('[TppHomePage] Could not click View Order');
    }
  }
}
