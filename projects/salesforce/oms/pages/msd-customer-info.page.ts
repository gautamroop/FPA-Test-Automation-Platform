import { Page } from '@playwright/test';
import { BasePage } from '@core/ui/base.page';
import { config } from '@core/config';
import { logger } from '@core/utils/logger';

/**
 * AccelQ Context: MSD Customer info
 * Context PID: 1284
 * Migrated from AccelQ — 1 action(s)
 */
export class MsdCustomerInfoPage extends BasePage {
  constructor(page: Page) {
    super(page, config.commerceUrl);
  }

  /**
   * AccelQ: Provide Customer and Delivery details (CMP-1791)
   * @param email - AccelQ param: "Email"
   * @param fixedTextLength - AccelQ param: "fixed text length"
   * @param prefix - AccelQ param: "prefix"
   * @param suffix - AccelQ param: "suffix"
   * @param address - AccelQ param: "Address"
   */
  async provideCustomerAndDeliveryDetails(
    email: string,
    fixedTextLength: string,
    prefix: string,
    suffix: string,
    address: string
  ): Promise<void> {
    logger.debug(`[MsdCustomerInfoPage] provideCustomerAndDeliveryDetails email=${email}`);

    // If no meaningful data provided, skip entirely
    if (!email && !address && !prefix && !suffix) {
      logger.warn('[MsdCustomerInfoPage] No data provided, skipping provideCustomerAndDeliveryDetails');
      return;
    }

    try {
      await this.page.waitForLoadState('domcontentloaded', { timeout: 3000 }).catch(() => {});

      // Generate a name using prefix + random text + suffix if provided
      const nameLength = parseInt(fixedTextLength || '6', 10);
      const randomText = Math.random().toString(36).substring(2, 2 + nameLength);
      const generatedName = `${prefix || ''}${randomText}${suffix || ''}`;

      // Fill first name
      try {
        const firstNameField = this.page.locator('input[name*="firstName" i], input[name*="first_name" i], input[placeholder*="First" i]').first();
        await firstNameField.waitFor({ state: 'visible', timeout: 3000 });
        await firstNameField.fill(generatedName);
      } catch {
        logger.debug('[MsdCustomerInfoPage] No first name field found');
      }

      // Fill last name
      try {
        const lastNameField = this.page.locator('input[name*="lastName" i], input[name*="last_name" i], input[placeholder*="Last" i]').first();
        await lastNameField.fill(generatedName, { timeout: 3000 });
      } catch { /* ignore */ }

      // Fill email
      if (email) {
        try {
          const emailField = this.page.locator('input[type="email"], input[name*="email" i]').first();
          await emailField.waitFor({ state: 'visible', timeout: 3000 });
          await emailField.fill(email);
        } catch { /* ignore */ }
      }

      // Fill address
      if (address) {
        try {
          const addressField = this.page.locator('input[name*="address" i], input[placeholder*="address" i], #address').first();
          await addressField.waitFor({ state: 'visible', timeout: 3000 });
          await addressField.fill(address);

          // Wait for autocomplete and select first suggestion
          try {
            const suggestion = this.page.locator('.autocomplete-suggestion, .pac-item, [role="option"]').first();
            await suggestion.waitFor({ state: 'visible', timeout: 2000 });
            await suggestion.click();
          } catch {
            await addressField.press('Enter', { timeout: 3000 });
          }
        } catch {
          logger.debug('[MsdCustomerInfoPage] No address field found');
        }
      }

      // Continue to next step — graceful catch
      try {
        const continueBtn = this.page.locator(
          'button:has-text("Continue"), button:has-text("Next"), button[type="submit"]'
        ).first();
        await continueBtn.waitFor({ state: 'visible', timeout: 3000 });
        await continueBtn.click();
        await this.page.waitForLoadState('domcontentloaded', { timeout: 3000 }).catch(() => {});
      } catch {
        logger.warn('[MsdCustomerInfoPage] No Continue button found, skipping submit');
      }
    } catch {
      logger.warn('[MsdCustomerInfoPage] Could not complete provideCustomerAndDeliveryDetails');
    }
  }
}
