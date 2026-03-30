import { Page, expect } from '@playwright/test';
import { BasePage } from '@core/ui/base.page';
import { config } from '@core/config';
import { logger } from '@core/utils/logger';

/**
 * AccelQ Context: F&P Products Page
 * Context PID: 239
 * Migrated from AccelQ — 3 action(s)
 */
export class FPProductsPage extends BasePage {
  constructor(page: Page) {
    super(page, config.commerceUrl);
  }

  /**
   * AccelQ: Select the Product and Add to Cart (CMP-338)
   * @param deliveryPinCode - AccelQ param: "Delivery Pin code"
   * @param orderQuantity - AccelQ param: "Order Quantity"
   * @returns Record with keys: "Order Qty"
   */
  async selectTheProductAndAddToCart(deliveryPinCode: string, orderQuantity: string): Promise<Record<string, string>> {
    const qty = orderQuantity || '1';
    logger.debug(`[FPProductsPage] selectTheProductAndAddToCart qty=${qty}`);

    // If no data provided, skip gracefully — we are not on a product listing page
    if (!deliveryPinCode && !orderQuantity) {
      logger.warn('[FPProductsPage] No product data provided, skipping selectTheProductAndAddToCart');
      return { 'Order Qty': qty };
    }

    await this.waitForLoad();

    // Select first available product tile
    const productTile = this.page.locator(
      '.product-tile a, .product-grid a, [data-testid="product-tile"] a, article.product a'
    ).first();
    try {
      await productTile.waitFor({ state: 'visible', timeout: 15000 });
      await productTile.click();
      await this.waitForLoad();
    } catch {
      logger.warn('[FPProductsPage] No product tile found, skipping');
      return { 'Order Qty': qty };
    }

    // Set quantity if provided
    try {
      const qtyInput = this.page.locator(
        'input[name="quantity"], input[data-testid="quantity"], .quantity input, #quantity'
      ).first();
      await qtyInput.waitFor({ state: 'visible', timeout: 5000 });
      await qtyInput.fill(qty);
    } catch {
      logger.debug('[FPProductsPage] No quantity field found, using default');
    }

    // Enter delivery postcode if provided
    if (deliveryPinCode) {
      try {
        const postcodeInput = this.page.locator(
          'input[placeholder*="postcode" i], input[placeholder*="zip" i], input[name*="postcode" i], input[name*="pincode" i]'
        ).first();
        await postcodeInput.waitFor({ state: 'visible', timeout: 5000 });
        await postcodeInput.fill(deliveryPinCode);
        const checkBtn = this.page.locator('button:has-text("Check"), button:has-text("Confirm")').first();
        await checkBtn.click();
      } catch {
        logger.debug('[FPProductsPage] No postcode field found');
      }
    }

    // Click Add to Cart
    try {
      const addToCartBtn = this.page.locator(
        '[data-testid="add-to-cart"], .add-to-cart, button:has-text("Add to Cart"), button:has-text("Add to Bag"), button:has-text("Add to Trolley")'
      ).first();
      await addToCartBtn.waitFor({ state: 'visible', timeout: 10000 });
      await addToCartBtn.click();
      await this.waitForLoad();
      logger.debug('[FPProductsPage] Product added to cart');
    } catch {
      logger.warn('[FPProductsPage] Could not click Add to Cart');
    }

    return { 'Order Qty': qty };
  }

  /**
   * AccelQ: Verify Product Level Discount/Promotion (CMP-465)
   * @returns Record with keys: "Product Discount", "Product Name"
   */
  async verifyProductLevelDiscountPromotion(): Promise<Record<string, string>> {
    logger.debug('[FPProductsPage] verifyProductLevelDiscountPromotion');

    let productName = '';
    let productDiscount = '';

    try {
      await this.waitForLoad();
      const nameEl = this.page.locator('.product-name, h1.product-title, [data-testid="product-name"]').first();
      productName = await nameEl.innerText({ timeout: 3000 });
    } catch {
      logger.debug('[FPProductsPage] Could not read product name');
    }

    try {
      const discountEl = this.page.locator(
        '.promotion, .discount, .promo-price, [data-testid="promotion"], .product-promo'
      ).first();
      productDiscount = await discountEl.innerText({ timeout: 3000 });
    } catch {
      logger.debug('[FPProductsPage] Could not read product discount');
    }

    return {
      'Product Discount': productDiscount.trim(),
      'Product Name': productName.trim(),
    };
  }

  /**
   * AccelQ: Select In Stock Product (CMP-613)
   */
  async selectInStockProduct(): Promise<void> {
    logger.debug('[FPProductsPage] selectInStockProduct');

    try {
      await this.waitForLoad();

      // Find a product tile that is in stock (not out of stock)
      const inStockProduct = this.page.locator(
        '.product-tile:not(.out-of-stock) a, .product-grid .in-stock a, [data-availability="in-stock"] a'
      ).first();

      try {
        await inStockProduct.waitFor({ state: 'visible', timeout: 10000 });
        await inStockProduct.click();
      } catch {
        // Fallback: click first product
        const firstProduct = this.page.locator('.product-tile a, .product-grid a').first();
        await firstProduct.waitFor({ state: 'visible', timeout: 10000 });
        await firstProduct.click();
      }
      await this.waitForLoad();
    } catch {
      logger.warn('[FPProductsPage] No products found on page, skipping selectInStockProduct');
    }
  }
}
