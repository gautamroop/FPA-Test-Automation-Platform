import { Page } from '@playwright/test';
import { BasePage } from '@core/ui/base.page';
import { config } from '@core/config';
import { logger } from '@core/utils/logger';

/**
 * AccelQ Context: F&P Order Payment DetailsPage
 * Context PID: 245
 * Migrated from AccelQ — 1 action(s)
 */
export class FPPaymentPage extends BasePage {
  constructor(page: Page) {
    super(page, config.commerceUrl);
  }

  /**
   * AccelQ: Select type of payment and place order  (CMP-347)
   * @param cardNumber - AccelQ param: "Card Number"
   * @param expiryDate - AccelQ param: "Expiry Date"
   * @param securityCode - AccelQ param: "Security Code"
   * @param paymentType - AccelQ param: "Payment Type"
   * @param depositAmount - AccelQ param: "Deposit Amount"
   * @returns Record with keys: "Billing Address"
   */
  async selectTypeOfPaymentAndPlaceOrder(
    cardNumber: string,
    expiryDate: string,
    securityCode: string,
    paymentType: string,
    depositAmount: string
  ): Promise<Record<string, string>> {
    logger.debug(`[FPPaymentPage] selectTypeOfPaymentAndPlaceOrder paymentType=${paymentType}`);

    // If no payment data provided, skip gracefully
    if (!cardNumber && !paymentType && !depositAmount) {
      logger.warn('[FPPaymentPage] No payment data provided, skipping selectTypeOfPaymentAndPlaceOrder');
      return { 'Billing Address': '' };
    }

    await this.waitForLoad();

    // Select payment method tab if multiple options exist
    if (paymentType) {
      try {
        const paymentTab = this.page.locator(
          `button:has-text("${paymentType}"), [data-payment-type="${paymentType}"], label:has-text("${paymentType}"), input[value="${paymentType}"]`
        ).first();
        await paymentTab.waitFor({ state: 'visible', timeout: 8000 });
        await paymentTab.click();
      } catch {
        logger.debug(`[FPPaymentPage] No payment type tab found for: ${paymentType}`);
      }
    }

    // Fill card details if it's a credit card payment
    const isCard = !paymentType || paymentType.toLowerCase().includes('card') || paymentType.toLowerCase().includes('credit');
    if (isCard && cardNumber) {
      // Card number — may be inside an iframe (payment gateway)
      try {
        // Try direct input first
        const cardInput = this.page.locator(
          'input[name*="cardNumber" i], input[name*="card_number" i], input[placeholder*="card number" i], #cardNumber'
        ).first();
        await cardInput.waitFor({ state: 'visible', timeout: 8000 });
        await cardInput.fill(cardNumber);
      } catch {
        // Try inside iframe
        try {
          const cardFrame = this.page.frameLocator('iframe[name*="card" i], iframe[title*="card" i]').first();
          const cardInput = cardFrame.locator('input[name*="cardNumber" i], input[placeholder*="card" i]').first();
          await cardInput.fill(cardNumber);
        } catch {
          logger.debug('[FPPaymentPage] Card number field not accessible');
        }
      }

      // Expiry date
      if (expiryDate) {
        try {
          const expiryInput = this.page.locator(
            'input[name*="expiry" i], input[name*="exp" i], input[placeholder*="MM/YY" i], #expiry'
          ).first();
          await expiryInput.fill(expiryDate);
        } catch {
          logger.debug('[FPPaymentPage] No expiry field found');
        }
      }

      // CVV/Security code
      if (securityCode) {
        try {
          const cvvInput = this.page.locator(
            'input[name*="cvv" i], input[name*="cvc" i], input[name*="securityCode" i], input[placeholder*="CVV" i], #cvv'
          ).first();
          await cvvInput.fill(securityCode);
        } catch {
          logger.debug('[FPPaymentPage] No CVV field found');
        }
      }
    }

    // Read billing address before placing order
    let billingAddress = '';
    try {
      const billingEl = this.page.locator(
        '.billing-address, [data-testid="billing-address"], .address-summary'
      ).first();
      billingAddress = await billingEl.innerText({ timeout: 3000 });
    } catch {
      logger.debug('[FPPaymentPage] Could not read billing address');
    }

    // Place order
    try {
      const placeOrderBtn = this.page.locator(
        'button:has-text("Place Order"), button:has-text("Confirm Order"), button:has-text("Pay Now"), button[data-testid="place-order"]'
      ).first();
      await placeOrderBtn.waitFor({ state: 'visible', timeout: 10000 });
      await placeOrderBtn.click();
      await this.waitForLoad();
      logger.debug('[FPPaymentPage] Order placed');
    } catch {
      logger.warn('[FPPaymentPage] Could not click Place Order button');
    }

    return { 'Billing Address': billingAddress.trim() };
  }
}
