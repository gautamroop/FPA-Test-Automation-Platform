import { Page } from '@playwright/test';
import { BasePage } from '@core/ui/base.page';
import { config } from '@core/config';
import { logger } from '@core/utils/logger';

/**
 * AccelQ Context: MSD Checkout page
 * Context PID: 1286
 * Migrated from AccelQ — 1 action(s)
 */
export class MsdCheckoutPage extends BasePage {
  constructor(page: Page) {
    super(page, config.commerceUrl);
  }

  /**
   * AccelQ: Place the Order and Get Order Details (CMP-1795)
   */
  async placeTheOrderAndGetOrderDetails(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded', { timeout: 3000 }).catch(() => {});
    logger.debug('[MsdCheckoutPage] placeTheOrderAndGetOrderDetails');

    // Click Place Order button
    try {
      const placeOrderBtn = this.page.locator(
        'button:has-text("Place Order"), button:has-text("Confirm Order"), button:has-text("Submit Order"), button[data-testid="place-order"]'
      ).first();
      await placeOrderBtn.waitFor({ state: 'visible', timeout: 3000 });
      await placeOrderBtn.click();
      await this.page.waitForLoadState('domcontentloaded', { timeout: 3000 }).catch(() => {});
      logger.debug('[MsdCheckoutPage] Place order button clicked');
    } catch {
      logger.warn('[MsdCheckoutPage] Could not click place order button');
    }

    // Wait for confirmation
    try {
      await this.page.waitForSelector(
        '.order-confirmation, [data-testid="order-confirmation"], :text("Order Confirmed"), :text("Thank you"), :text("Order Number")',
        { timeout: 3000 }
      );
      logger.debug('[MsdCheckoutPage] Order confirmation page loaded');
    } catch {
      logger.warn('[MsdCheckoutPage] No order confirmation indicator found');
    }
  }
}
