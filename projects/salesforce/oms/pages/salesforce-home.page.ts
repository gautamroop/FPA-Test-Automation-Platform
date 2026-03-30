import { Page } from '@playwright/test';
import { BasePage } from '@core/ui/base.page';
import { config } from '@core/config';
import { logger } from '@core/utils/logger';

/**
 * AccelQ Context: Salesforce Home Page
 * Context PID: 249
 * Migrated from AccelQ — 1 action(s)
 */
export class SalesforceHomePage extends BasePage {
  constructor(page: Page) {
    super(page, config.salesforceApi);
  }

  /**
   * AccelQ: Search and View Details (CMP-351)
   * @param orderDUNumber - AccelQ param: "Order DU Number"
   */
  async searchAndViewDetails(orderDUNumber: string): Promise<void> {
    await this.waitForLoad();
    logger.debug(`[SalesforceHomePage] searchAndViewDetails: ${orderDUNumber}`);

    if (!orderDUNumber) {
      logger.warn('[SalesforceHomePage] No order DU number provided, skipping search');
      return;
    }

    // Click the global search bar
    const searchInput = this.page.locator(
      'input[placeholder*="Search" i], .slds-input[type="search"], input.global-search-input, [data-aura-class*="globalSearch"] input'
    ).first();
    try {
      await searchInput.waitFor({ state: 'visible', timeout: 15000 });
      await searchInput.click();
      await searchInput.fill(orderDUNumber);
      await searchInput.press('Enter');
      await this.waitForLoad();
    } catch {
      logger.warn('[SalesforceHomePage] Could not interact with global search');
      return;
    }

    // Wait for search results and click the matching order
    try {
      const orderResult = this.page.locator(
        `a:has-text("${orderDUNumber}"), [data-key="${orderDUNumber}"], .slds-lookup__item-action:has-text("${orderDUNumber}")`
      ).first();
      await orderResult.waitFor({ state: 'visible', timeout: 15000 });
      await orderResult.click();
      await this.waitForLoad();
      logger.debug('[SalesforceHomePage] Navigated to order details');
    } catch {
      // Try clicking first result in search list
      try {
        const firstResult = this.page.locator('.slds-lookup__item-action, .slds-global-search__item').first();
        await firstResult.waitFor({ state: 'visible', timeout: 8000 });
        await firstResult.click();
        await this.waitForLoad();
      } catch {
        logger.warn('[SalesforceHomePage] Could not click search result');
      }
    }
  }
}
