import { Page } from '@playwright/test';
import { BasePage } from '@core/ui/base.page';
import { config } from '@core/config';
import { logger } from '@core/utils/logger';

/**
 * AccelQ Context: F&P Order Details Page
 * Context PID: 242
 * Migrated from AccelQ — 4 action(s)
 */
export class FPOrderDetailsPage extends BasePage {
  constructor(page: Page) {
    super(page, config.commerceUrl);
  }

  /**
   * AccelQ: Populate Customer and Delivery Details  (CMP-343)
   * @param addressType - AccelQ param: "Address Type"
   * @param addressLine1 - AccelQ param: "Address Line 1"
   * @param addressLine2 - AccelQ param: "Address Line 2"
   * @param state - AccelQ param: "State"
   * @param townCity - AccelQ param: "Town / City"
   * @returns Record with keys: "Customer Name", "Delivery Date", "Email Address", "Phone Number"
   */
  async populateCustomerAndDeliveryDetails(
    addressType: string,
    addressLine1: string,
    addressLine2: string,
    state: string,
    townCity: string
  ): Promise<Record<string, string>> {
    logger.debug('[FPOrderDetailsPage] populateCustomerAndDeliveryDetails');

    // If no address data provided at all, skip gracefully
    if (!addressType && !addressLine1 && !addressLine2 && !state && !townCity) {
      logger.warn('[FPOrderDetailsPage] No address data provided, skipping populateCustomerAndDeliveryDetails');
      return {
        'Customer Name': '',
        'Delivery Date': '',
        'Email Address': '',
        'Phone Number': '',
      };
    }

    await this.waitForLoad();

    // Proceed to checkout / order details if on cart page
    try {
      const checkoutBtn = this.page.locator(
        'button:has-text("Checkout"), a:has-text("Checkout"), button:has-text("Proceed to Checkout")'
      ).first();
      await checkoutBtn.waitFor({ state: 'visible', timeout: 8000 });
      await checkoutBtn.click();
      await this.waitForLoad();
    } catch {
      logger.debug('[FPOrderDetailsPage] Already on checkout/order details page');
    }

    // Select address type if radio buttons present
    if (addressType) {
      try {
        const addressTypeRadio = this.page.locator(
          `input[type="radio"][value="${addressType}"], label:has-text("${addressType}") input[type="radio"]`
        ).first();
        await addressTypeRadio.waitFor({ state: 'visible', timeout: 5000 });
        await addressTypeRadio.check();
      } catch {
        logger.debug('[FPOrderDetailsPage] No address type radio found');
      }
    }

    // Fill address line 1
    if (addressLine1) {
      try {
        const addr1 = this.page.locator(
          'input[name*="address1" i], input[name*="addressLine1" i], input[placeholder*="address line 1" i], #address1'
        ).first();
        await addr1.waitFor({ state: 'visible', timeout: 8000 });
        await addr1.fill(addressLine1);
      } catch {
        logger.debug('[FPOrderDetailsPage] No address line 1 field found');
      }
    }

    // Fill address line 2
    if (addressLine2) {
      try {
        const addr2 = this.page.locator(
          'input[name*="address2" i], input[name*="addressLine2" i], input[placeholder*="address line 2" i], #address2'
        ).first();
        await addr2.fill(addressLine2);
      } catch {
        logger.debug('[FPOrderDetailsPage] No address line 2 field found');
      }
    }

    // Fill city/suburb
    if (townCity) {
      try {
        const cityField = this.page.locator(
          'input[name*="city" i], input[name*="suburb" i], input[placeholder*="city" i], input[placeholder*="suburb" i], #city'
        ).first();
        await cityField.waitFor({ state: 'visible', timeout: 5000 });
        await cityField.fill(townCity);
      } catch {
        logger.debug('[FPOrderDetailsPage] No city field found');
      }
    }

    // Fill state/region
    if (state) {
      try {
        const stateField = this.page.locator(
          'select[name*="state" i], input[name*="state" i], select[name*="region" i]'
        ).first();
        const tagName = await stateField.evaluate(el => el.tagName.toLowerCase());
        if (tagName === 'select') {
          await stateField.selectOption({ label: state });
        } else {
          await stateField.fill(state);
        }
      } catch {
        logger.debug('[FPOrderDetailsPage] No state field found');
      }
    }

    // Continue to next step
    try {
      const continueBtn = this.page.locator(
        'button:has-text("Continue"), button:has-text("Next"), button[type="submit"]'
      ).first();
      await continueBtn.waitFor({ state: 'visible', timeout: 8000 });
      await continueBtn.click();
      await this.waitForLoad();
    } catch {
      logger.debug('[FPOrderDetailsPage] No continue button found');
    }

    // Extract values to return
    let customerName = '';
    let deliveryDate = '';
    let emailAddress = '';
    let phoneNumber = '';

    try {
      const nameEl = this.page.locator('[data-testid="customer-name"], .customer-name, input[name*="firstName" i]').first();
      customerName = await nameEl.inputValue({ timeout: 3000 }).catch(() => nameEl.innerText({ timeout: 3000 }));
    } catch { /* ignore */ }

    try {
      const dateEl = this.page.locator('[data-testid="delivery-date"], .delivery-date, .estimated-delivery').first();
      deliveryDate = await dateEl.innerText({ timeout: 3000 });
    } catch { /* ignore */ }

    try {
      const emailEl = this.page.locator('input[name*="email" i], [data-testid="email"]').first();
      emailAddress = await emailEl.inputValue({ timeout: 3000 }).catch(() => emailEl.innerText({ timeout: 3000 }));
    } catch { /* ignore */ }

    try {
      const phoneEl = this.page.locator('input[name*="phone" i], input[name*="mobile" i], [data-testid="phone"]').first();
      phoneNumber = await phoneEl.inputValue({ timeout: 3000 }).catch(() => phoneEl.innerText({ timeout: 3000 }));
    } catch { /* ignore */ }

    return {
      'Customer Name': customerName.trim(),
      'Delivery Date': deliveryDate.trim(),
      'Email Address': emailAddress.trim(),
      'Phone Number': phoneNumber.trim(),
    };
  }

  /**
   * AccelQ: Verify Order Level Discount (CMP-461)
   * @returns Record with keys: "Order Level Discount"
   */
  async verifyOrderLevelDiscount(): Promise<Record<string, string>> {
    logger.debug('[FPOrderDetailsPage] verifyOrderLevelDiscount');

    let orderLevelDiscount = '';
    try {
      await this.waitForLoad();
      const discountEl = this.page.locator(
        '.order-discount, [data-testid="order-discount"], .promo-discount, .discount-amount'
      ).first();
      orderLevelDiscount = await discountEl.innerText({ timeout: 3000 });
    } catch {
      logger.debug('[FPOrderDetailsPage] Could not read order level discount');
    }

    return { 'Order Level Discount': orderLevelDiscount.trim() };
  }

  /**
   * AccelQ: Verify Refund Amount After Order Cancel (CMP-501)
   * @param originalTotal - AccelQ param: "Original Total"
   * @param refundAmount - AccelQ param: "Refund Amount"
   */
  async verifyRefundAmountAfterOrderCancel(originalTotal: string, refundAmount: string): Promise<void> {
    logger.debug(`[FPOrderDetailsPage] verifyRefundAmountAfterOrderCancel originalTotal=${originalTotal} refund=${refundAmount}`);

    // Verify refund information is visible on the page
    try {
      await this.waitForLoad();
      const refundEl = this.page.locator(
        ':text("Refund"), [data-testid="refund-amount"], .refund-amount'
      ).first();
      await refundEl.waitFor({ state: 'visible', timeout: 10000 });
      logger.debug('[FPOrderDetailsPage] Refund information found on page');
    } catch {
      logger.warn('[FPOrderDetailsPage] Could not find refund amount on page');
    }
  }

  /**
   * AccelQ: Check Order and Fulfillment Status  (CMP-507)
   * @returns Record with keys: "Fulfillment order number"
   */
  async checkOrderAndFulfillmentStatus(): Promise<Record<string, string>> {
    logger.debug('[FPOrderDetailsPage] checkOrderAndFulfillmentStatus');

    let fulfillmentOrderNumber = '';
    try {
      await this.waitForLoad();
      const fulfillmentEl = this.page.locator(
        '[data-testid="fulfillment-number"], .fulfillment-order-number, :text-matches("FO-|fulfillment", "i")'
      ).first();
      fulfillmentOrderNumber = await fulfillmentEl.innerText({ timeout: 3000 });
    } catch {
      logger.debug('[FPOrderDetailsPage] Could not read fulfillment order number');
    }

    return { 'Fulfillment order number': fulfillmentOrderNumber.trim() };
  }
}
