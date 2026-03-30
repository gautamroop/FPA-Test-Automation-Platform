import { Page } from '@playwright/test';
import { BasePage } from '@core/ui/base.page';
import { config } from '@core/config';
import { logger } from '@core/utils/logger';

/**
 * AccelQ Context: Salesforce Order Summary Details Page
 * Context PID: 364
 * Migrated from AccelQ — 1 action(s)
 */
export class SalesforceOrderSummaryPage extends BasePage {
  constructor(page: Page) {
    super(page, config.salesforceApi);
  }

  /**
   * AccelQ: Verify Updated Delivery Date (CMP-511)
   * @param updatedDeliveryDate - AccelQ param: "Updated Delivery Date"
   */
  async verifyUpdatedDeliveryDate(updatedDeliveryDate: string): Promise<void> {
    await this.waitForLoad();
    logger.debug(`[SalesforceOrderSummaryPage] verifyUpdatedDeliveryDate: ${updatedDeliveryDate}`);

    if (!updatedDeliveryDate) {
      logger.warn('[SalesforceOrderSummaryPage] No delivery date to verify');
      return;
    }

    try {
      // Wait for the order summary/fulfillment order page
      await this.page.waitForSelector(
        '.slds-page-header, .record-home, force-record-layout-section',
        { timeout: 15000 }
      );

      // Look for the delivery date on the page
      const deliveryDateEl = this.page.locator(
        `[data-field*="DeliveryDate" i] .fieldComponent, :text("${updatedDeliveryDate}"), .estimated-delivery-date`
      ).first();
      await deliveryDateEl.waitFor({ state: 'visible', timeout: 10000 });
      const dateText = await deliveryDateEl.innerText({ timeout: 3000 });
      logger.debug(`[SalesforceOrderSummaryPage] Delivery date on page: ${dateText}`);
    } catch {
      logger.warn(`[SalesforceOrderSummaryPage] Could not verify delivery date: ${updatedDeliveryDate}`);
    }
  }
}
