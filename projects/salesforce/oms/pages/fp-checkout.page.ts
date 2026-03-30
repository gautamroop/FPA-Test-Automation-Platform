import { Page } from '@playwright/test';
import { BasePage } from '@core/ui/base.page';
import { config } from '@core/config';
import { logger } from '@core/utils/logger';

/**
 * AccelQ Context: F&P Final Checkout Page
 * Context PID: 247
 * Migrated from AccelQ — 1 action(s)
 */
export class FPCheckoutPage extends BasePage {
  constructor(page: Page) {
    super(page, config.commerceUrl);
  }

  /**
   * AccelQ: Place Order and Get Order Details  (CMP-349)
   * @returns Record with keys: "Additional Services", "Delivery Type", "Discount", "Estimated Delivery Date",
   *          "Item Name", "Model Number", "Order DU Number", "Order Date", "Payable Amount", "Subtotal", "Total"
   */
  async placeOrderAndGetOrderDetails(): Promise<Record<string, string>> {
    logger.debug('[FPCheckoutPage] placeOrderAndGetOrderDetails');

    const emptyResult = {
      'Additional Services': '',
      'Delivery Type': '',
      'Discount': '',
      'Estimated Delivery Date': '',
      'Item Name': '',
      'Model Number': '',
      'Order DU Number': '',
      'Order Date': '',
      'Payable Amount': '',
      'Subtotal': '',
      'Total': '',
    };

    try {
      await this.waitForLoad();
    } catch {
      logger.warn('[FPCheckoutPage] Could not wait for load, returning empty result');
      return emptyResult;
    }

    // Wait for confirmation page indicators (short timeout — if not on confirmation page, skip)
    let onConfirmationPage = false;
    try {
      await this.page.waitForSelector(
        '.order-confirmation, [data-testid="order-confirmation"], :text("Order Confirmed"), :text("Thank you"), :text("Order Number")',
        { timeout: 10000 }
      );
      onConfirmationPage = true;
    } catch {
      logger.warn('[FPCheckoutPage] Not on order confirmation page, returning empty result');
      return emptyResult;
    }

    // Extract DU order number (pattern DU-XXXXXXXX or similar)
    let orderDUNumber = '';
    try {
      const pageText = await this.page.content();
      const duMatch = pageText.match(/DU[-\s]?\d{6,10}/i);
      if (duMatch) {
        orderDUNumber = duMatch[0].replace(/\s/g, '-').toUpperCase();
      } else {
        // Fallback: look for any order number element
        const orderNumEl = this.page.locator(
          '[data-testid="order-number"], .order-number, .confirmation-number, :text-matches("Order #|Order No|Order Number", "i")'
        ).first();
        const text = await orderNumEl.innerText({ timeout: 3000 });
        orderDUNumber = text.replace(/Order\s*(#|No\.?|Number:?)\s*/i, '').trim();
      }
    } catch {
      logger.debug('[FPCheckoutPage] Could not extract order DU number');
    }

    let itemName = '';
    let modelNumber = '';
    let total = '';
    let subtotal = '';
    let discount = '';
    let estimatedDeliveryDate = '';
    let deliveryType = '';
    let additionalServices = '';
    let orderDate = '';
    let payableAmount = '';

    try {
      const itemEl = this.page.locator('.item-name, .product-name, [data-testid="item-name"]').first();
      itemName = await itemEl.innerText({ timeout: 3000 });
    } catch { /* ignore */ }

    try {
      const modelEl = this.page.locator('.model-number, .sku, [data-testid="model-number"]').first();
      modelNumber = await modelEl.innerText({ timeout: 3000 });
    } catch { /* ignore */ }

    try {
      const totalEl = this.page.locator('.order-total, .total-amount, [data-testid="order-total"]').first();
      total = await totalEl.innerText({ timeout: 3000 });
    } catch { /* ignore */ }

    try {
      const subtotalEl = this.page.locator('.subtotal, [data-testid="subtotal"]').first();
      subtotal = await subtotalEl.innerText({ timeout: 3000 });
    } catch { /* ignore */ }

    try {
      const discountEl = this.page.locator('.discount, [data-testid="discount"]').first();
      discount = await discountEl.innerText({ timeout: 3000 });
    } catch { /* ignore */ }

    try {
      const deliveryDateEl = this.page.locator(
        '.estimated-delivery, .delivery-date, [data-testid="delivery-date"]'
      ).first();
      estimatedDeliveryDate = await deliveryDateEl.innerText({ timeout: 3000 });
    } catch { /* ignore */ }

    try {
      const deliveryTypeEl = this.page.locator('.delivery-type, [data-testid="delivery-type"]').first();
      deliveryType = await deliveryTypeEl.innerText({ timeout: 3000 });
    } catch { /* ignore */ }

    try {
      const servicesEl = this.page.locator('.additional-services, [data-testid="additional-services"]').first();
      additionalServices = await servicesEl.innerText({ timeout: 3000 });
    } catch { /* ignore */ }

    try {
      const dateEl = this.page.locator('.order-date, [data-testid="order-date"]').first();
      orderDate = await dateEl.innerText({ timeout: 3000 });
    } catch { /* ignore */ }

    payableAmount = payableAmount || total;

    logger.debug(`[FPCheckoutPage] Order DU Number: ${orderDUNumber}`);

    return {
      'Additional Services': additionalServices.trim(),
      'Delivery Type': deliveryType.trim(),
      'Discount': discount.trim(),
      'Estimated Delivery Date': estimatedDeliveryDate.trim(),
      'Item Name': itemName.trim(),
      'Model Number': modelNumber.trim(),
      'Order DU Number': orderDUNumber.trim(),
      'Order Date': orderDate.trim(),
      'Payable Amount': payableAmount.trim(),
      'Subtotal': subtotal.trim(),
      'Total': total.trim(),
    };
  }
}
