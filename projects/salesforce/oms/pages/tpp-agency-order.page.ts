import { Page } from '@playwright/test';
import { BasePage } from '@core/ui/base.page';
import { config } from '@core/config';
import { logger } from '@core/utils/logger';

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
    logger.debug('[TppAgencyOrderPage] validateAndAcceptCookies');
    try {
      const cookieBtn = this.page.locator(
        '#onetrust-accept-btn-handler, .cookie-accept, button:has-text("Accept All"), button:has-text("I Accept"), button:has-text("Accept Cookies")'
      ).first();
      await cookieBtn.waitFor({ state: 'visible', timeout: 8000 });
      await cookieBtn.click();
      logger.debug('[TppAgencyOrderPage] Cookie banner accepted');
    } catch {
      logger.debug('[TppAgencyOrderPage] No cookie banner found, continuing');
    }
  }

  /**
   * AccelQ: Select TPP Product Type (CMP-655)
   * @param productType - AccelQ param: "Product Type"
   */
  async selectTPPProductType(productType: string): Promise<void> {
    await this.waitForLoad();
    logger.debug(`[TppAgencyOrderPage] selectTPPProductType: ${productType}`);

    if (!productType) {
      logger.warn('[TppAgencyOrderPage] No product type provided');
      return;
    }

    try {
      // Look for a product type selector (dropdown, radio, card)
      const productTypeOption = this.page.locator(
        `button:has-text("${productType}"), label:has-text("${productType}"), [data-product-type="${productType}"], a:has-text("${productType}")`
      ).first();
      await productTypeOption.waitFor({ state: 'visible', timeout: 15000 });
      await productTypeOption.click();
      await this.waitForLoad();

      // If it's a dropdown
      try {
        const select = this.page.locator('select[name*="productType" i], select[name*="type" i]').first();
        await select.waitFor({ state: 'visible', timeout: 3000 });
        await select.selectOption({ label: productType });
      } catch { /* not a select */ }
    } catch {
      // Try select element as fallback
      try {
        const select = this.page.locator('select').first();
        await select.waitFor({ state: 'visible', timeout: 5000 });
        await select.selectOption({ label: productType });
      } catch {
        logger.warn(`[TppAgencyOrderPage] Could not select product type: ${productType}`);
      }
    }
  }
}
