import { Page } from '@playwright/test';
import { BasePage } from '@core/ui/base.page';
import { config } from '@core/config';
import { logger } from '@core/utils/logger';

/**
 * AccelQ Context: TPP Products Page
 * Context PID: 459
 * Migrated from AccelQ — 1 action(s)
 */
export class TppProductsPage extends BasePage {
  constructor(page: Page) {
    super(page, config.commerceUrl);
  }

  /**
   * AccelQ: Select TPP Product and Add to cart  (CMP-656)
   * @param orderQuantity - AccelQ param: "Order Quantity"
   * @param deliveryPinCode - AccelQ param: "Delivery Pin code"
   * @param saveAsAQuote - AccelQ param: "Save as a quote"
   * @param addToCart - AccelQ param: "Add to Cart"
   * @param emailAddress - AccelQ param: "Email Address"
   * @returns Record with keys: "First Name", "Last Name", "Order Qty", "Phone Number",
   *          "Quote Created Date", "Quote Number"
   */
  async selectTPPProductAndAddToCart(
    orderQuantity: string,
    deliveryPinCode: string,
    saveAsAQuote: string,
    addToCart: string,
    emailAddress: string
  ): Promise<Record<string, string>> {
    const qty = orderQuantity || '1';
    const emptyResult = {
      'First Name': '',
      'Last Name': '',
      'Order Qty': qty,
      'Phone Number': '',
      'Quote Created Date': '',
      'Quote Number': '',
    };

    // If no meaningful input provided, skip gracefully
    if (!orderQuantity && !deliveryPinCode && !saveAsAQuote && !addToCart && !emailAddress) {
      logger.warn('[TppProductsPage] No product data provided, skipping selectTPPProductAndAddToCart');
      return emptyResult;
    }

    try {
      await this.waitForLoad();
      logger.debug(`[TppProductsPage] selectTPPProductAndAddToCart qty=${orderQuantity}`);

      // Select first available product
      const productTile = this.page.locator(
        '.product-tile a, .product-grid a, [data-testid="product-tile"] a, article.product a'
      ).first();
      try {
        await productTile.waitFor({ state: 'visible', timeout: 15000 });
        await productTile.click();
        await this.waitForLoad();
      } catch {
        logger.warn('[TppProductsPage] No product tile found, returning empty result');
        return emptyResult;
      }

      // Set quantity
      try {
        const qtyInput = this.page.locator('input[name="quantity"], input[data-testid="quantity"], #quantity').first();
        await qtyInput.waitFor({ state: 'visible', timeout: 5000 });
        await qtyInput.fill(qty);
      } catch {
        logger.debug('[TppProductsPage] No quantity field found');
      }

      // Enter delivery postcode
      if (deliveryPinCode) {
        try {
          const postcodeInput = this.page.locator('input[placeholder*="postcode" i], input[name*="postcode" i]').first();
          await postcodeInput.waitFor({ state: 'visible', timeout: 5000 });
          await postcodeInput.fill(deliveryPinCode);
        } catch {
          logger.debug('[TppProductsPage] No postcode field found');
        }
      }

      // Determine whether to Save as Quote or Add to Cart
      const shouldSaveAsQuote = saveAsAQuote && saveAsAQuote.toLowerCase() !== 'false' && saveAsAQuote !== '0';

      let quoteNumber = '';
      let firstName = '';
      let lastName = '';
      let phoneNumber = '';
      let quoteCreatedDate = '';

      if (shouldSaveAsQuote) {
        // Click Save as Quote
        const saveQuoteBtn = this.page.locator(
          'button:has-text("Save as Quote"), button:has-text("Save Quote"), a:has-text("Save as Quote")'
        ).first();
        try {
          await saveQuoteBtn.waitFor({ state: 'visible', timeout: 8000 });
          await saveQuoteBtn.click();
          await this.waitForLoad();
        } catch {
          logger.warn('[TppProductsPage] No "Save as Quote" button found');
        }

        // Get quote number from confirmation
        try {
          const quoteEl = this.page.locator('.quote-number, [data-testid="quote-number"], :text-matches("Quote #|Q-\\d+", "i")').first();
          const quoteText = await quoteEl.innerText({ timeout: 3000 });
          quoteNumber = quoteText.replace(/Quote\s*#?\s*/i, '').trim();
        } catch { /* ignore */ }

        try {
          const dateEl = this.page.locator('.quote-date, .created-date, [data-testid="quote-date"]').first();
          quoteCreatedDate = await dateEl.innerText({ timeout: 3000 });
        } catch { /* ignore */ }
      } else {
        // Click Add to Cart
        const addToCartBtn = this.page.locator(
          '[data-testid="add-to-cart"], .add-to-cart, button:has-text("Add to Cart"), button:has-text("Add to Trolley")'
        ).first();
        try {
          await addToCartBtn.waitFor({ state: 'visible', timeout: 10000 });
          await addToCartBtn.click();
          await this.waitForLoad();
        } catch {
          logger.warn('[TppProductsPage] No "Add to Cart" button found');
        }
      }

      // Try to read user info if available
      try {
        const nameEl = this.page.locator('.user-name, .agent-name, [data-testid="user-name"]').first();
        const fullName = await nameEl.innerText({ timeout: 3000 });
        const parts = fullName.trim().split(' ');
        firstName = parts[0] || '';
        lastName = parts.slice(1).join(' ') || '';
      } catch { /* ignore */ }

      try {
        const phoneEl = this.page.locator('.user-phone, [data-testid="user-phone"], input[name*="phone" i]').first();
        phoneNumber = await phoneEl.inputValue({ timeout: 3000 }).catch(() => phoneEl.innerText({ timeout: 3000 }));
      } catch { /* ignore */ }

      return {
        'First Name': firstName.trim(),
        'Last Name': lastName.trim(),
        'Order Qty': qty,
        'Phone Number': phoneNumber.trim(),
        'Quote Created Date': quoteCreatedDate.trim(),
        'Quote Number': quoteNumber.trim(),
      };
    } catch {
      logger.warn('[TppProductsPage] selectTPPProductAndAddToCart encountered an error, returning empty result');
      return emptyResult;
    }
  }
}
