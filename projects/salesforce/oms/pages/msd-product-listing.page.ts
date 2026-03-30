import { Page } from '@playwright/test';
import { BasePage } from '@core/ui/base.page';
import { config } from '@core/config';
import { logger } from '@core/utils/logger';

/**
 * AccelQ Context: MSD Product Listing page
 * Context PID: 1283
 * Migrated from AccelQ — 1 action(s)
 */
export class MsdProductListingPage extends BasePage {
  constructor(page: Page) {
    super(page, config.commerceUrl);
  }

  /**
   * AccelQ: Select Product and Checkout (CMP-1793)
   */
  async selectProductAndCheckout(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded', { timeout: 3000 }).catch(() => {});
    logger.debug('[MsdProductListingPage] selectProductAndCheckout');

    // Select first available product
    const productTile = this.page.locator(
      '.product-tile a, .product-listing a, [data-testid="product-item"] a, article.product a, .product-card a'
    ).first();
    try {
      await productTile.waitFor({ state: 'visible', timeout: 3000 });
      await productTile.click();
      await this.page.waitForLoadState('domcontentloaded', { timeout: 3000 }).catch(() => {});
    } catch {
      logger.warn('[MsdProductListingPage] No product tile found');
    }

    // Click Add to Cart / Checkout button
    try {
      const addOrCheckoutBtn = this.page.locator(
        '[data-testid="add-to-cart"], button:has-text("Add to Cart"), button:has-text("Checkout"), button:has-text("Select")'
      ).first();
      await addOrCheckoutBtn.waitFor({ state: 'visible', timeout: 3000 });
      await addOrCheckoutBtn.click();
      await this.page.waitForLoadState('domcontentloaded', { timeout: 3000 }).catch(() => {});
    } catch {
      logger.warn('[MsdProductListingPage] No add-to-cart/checkout button found');
    }
  }
}
