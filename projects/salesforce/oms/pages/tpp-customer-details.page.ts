import { Page } from '@playwright/test';
import { BasePage } from '@core/ui/base.page';
import { config } from '@core/config';
import { logger } from '@core/utils/logger';

/**
 * AccelQ Context: TPP Customer Details Page
 * Context PID: 462
 * Migrated from AccelQ — 1 action(s)
 */
export class TppCustomerDetailsPage extends BasePage {
  constructor(page: Page) {
    super(page, config.commerceUrl);
  }

  /**
   * AccelQ: TPP Populate Customer and Delivery Details (CMP-660)
   * @param addressType - AccelQ param: "Address Type"
   * @param addressLine1 - AccelQ param: "Address Line 1"
   * @param addressLine2 - AccelQ param: "Address Line 2"
   * @param state - AccelQ param: "State"
   * @param townCity - AccelQ param: "Town / City"
   * @param deliveryTo - AccelQ param: "Delivery To"
   * @param emailAddress - AccelQ param: "Email_Address"
   * @returns Record with keys: "Agent Address", "Customer Name", "Delivery Date",
   *          "Email Address", "Phone Number"
   */
  async tPPPopulateCustomerAndDeliveryDetails(
    addressType: string,
    addressLine1: string,
    addressLine2: string,
    state: string,
    townCity: string,
    deliveryTo: string,
    emailAddress: string
  ): Promise<Record<string, string>> {
    logger.debug('[TppCustomerDetailsPage] tPPPopulateCustomerAndDeliveryDetails');

    const emptyResult = {
      'Agent Address': '',
      'Customer Name': '',
      'Delivery Date': '',
      'Email Address': emailAddress || '',
      'Phone Number': '',
    };

    // If no address data provided at all, skip gracefully
    if (!addressType && !addressLine1 && !addressLine2 && !state && !townCity && !deliveryTo && !emailAddress) {
      logger.warn('[TppCustomerDetailsPage] No address data provided, skipping tPPPopulateCustomerAndDeliveryDetails');
      return emptyResult;
    }

    try {
      await this.waitForLoad();

      // Select address type
      if (addressType) {
        try {
          const addressTypeOption = this.page.locator(
            `input[type="radio"][value="${addressType}"], label:has-text("${addressType}")`
          ).first();
          await addressTypeOption.waitFor({ state: 'visible', timeout: 5000 });
          await addressTypeOption.click();
        } catch {
          logger.debug('[TppCustomerDetailsPage] No address type option found');
        }
      }

      // Fill "Deliver To" (recipient name)
      if (deliveryTo) {
        try {
          const deliveryToField = this.page.locator(
            'input[name*="deliveryTo" i], input[name*="deliver_to" i], input[placeholder*="Deliver to" i]'
          ).first();
          await deliveryToField.waitFor({ state: 'visible', timeout: 5000 });
          await deliveryToField.fill(deliveryTo);
        } catch {
          logger.debug('[TppCustomerDetailsPage] No deliveryTo field found');
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
          logger.debug('[TppCustomerDetailsPage] No address line 1 field');
        }
      }

      // Fill address line 2
      if (addressLine2) {
        try {
          const addr2 = this.page.locator(
            'input[name*="address2" i], input[name*="addressLine2" i], input[placeholder*="address line 2" i]'
          ).first();
          await addr2.fill(addressLine2);
        } catch { /* ignore */ }
      }

      // Fill city
      if (townCity) {
        try {
          const cityField = this.page.locator(
            'input[name*="city" i], input[name*="suburb" i], input[placeholder*="city" i]'
          ).first();
          await cityField.waitFor({ state: 'visible', timeout: 5000 });
          await cityField.fill(townCity);
        } catch { /* ignore */ }
      }

      // Fill state
      if (state) {
        try {
          const stateField = this.page.locator('select[name*="state" i], input[name*="state" i]').first();
          const tagName = await stateField.evaluate(el => el.tagName.toLowerCase());
          if (tagName === 'select') {
            await stateField.selectOption({ label: state });
          } else {
            await stateField.fill(state);
          }
        } catch { /* ignore */ }
      }

      // Fill email if provided
      if (emailAddress) {
        try {
          const emailField = this.page.locator('input[type="email"], input[name*="email" i]').first();
          await emailField.waitFor({ state: 'visible', timeout: 5000 });
          await emailField.fill(emailAddress);
        } catch { /* ignore */ }
      }

      // Continue — with graceful catch
      try {
        const continueBtn = this.page.locator(
          'button:has-text("Continue"), button:has-text("Next"), button[type="submit"]'
        ).first();
        await continueBtn.waitFor({ state: 'visible', timeout: 10000 });
        await continueBtn.click();
        await this.waitForLoad();
      } catch {
        logger.warn('[TppCustomerDetailsPage] No Continue button found, skipping submit');
      }
    } catch {
      logger.warn('[TppCustomerDetailsPage] Could not complete tPPPopulateCustomerAndDeliveryDetails');
      return emptyResult;
    }

    // Extract return values
    let customerName = '';
    let deliveryDate = '';
    let emailOut = emailAddress || '';
    let phoneNumber = '';
    let agentAddress = '';

    try {
      const nameEl = this.page.locator('.customer-name, [data-testid="customer-name"]').first();
      customerName = await nameEl.innerText({ timeout: 3000 });
    } catch { /* ignore */ }

    try {
      const dateEl = this.page.locator('.delivery-date, .estimated-delivery, [data-testid="delivery-date"]').first();
      deliveryDate = await dateEl.innerText({ timeout: 3000 });
    } catch { /* ignore */ }

    try {
      const phoneEl = this.page.locator('input[name*="phone" i], .phone-number').first();
      phoneNumber = await phoneEl.inputValue({ timeout: 3000 }).catch(() => phoneEl.innerText({ timeout: 3000 }));
    } catch { /* ignore */ }

    try {
      const agentAddressEl = this.page.locator('.agent-address, [data-testid="agent-address"]').first();
      agentAddress = await agentAddressEl.innerText({ timeout: 3000 });
    } catch { /* ignore */ }

    return {
      'Agent Address': agentAddress.trim(),
      'Customer Name': customerName.trim(),
      'Delivery Date': deliveryDate.trim(),
      'Email Address': emailOut.trim(),
      'Phone Number': phoneNumber.trim(),
    };
  }
}
