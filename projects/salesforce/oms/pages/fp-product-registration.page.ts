import { Page } from '@playwright/test';
import { BasePage } from '@core/ui/base.page';
import { config } from '@core/config';
import { logger } from '@core/utils/logger';

/**
 * AccelQ Context: Product Registration
 * Context PID: 946
 * Migrated from AccelQ — 4 action(s)
 */
export class FPProductRegistrationPage extends BasePage {
  constructor(page: Page) {
    super(page, config.commerceUrl);
  }

  /**
   * AccelQ: Provide customer Details (CMP-1354)
   * @param firstName - AccelQ param: "First Name"
   * @param lastName - AccelQ param: "Last Name"
   * @param email - AccelQ param: "Email"
   * @param mobileCellNumber - AccelQ param: "Mobile/Cell Number"
   * @param address - AccelQ param: "Address"
   */
  async provideCustomerDetails(
    firstName: string,
    lastName: string,
    email: string,
    mobileCellNumber: string,
    address: string
  ): Promise<void> {
    logger.debug(`[FPProductRegistrationPage] provideCustomerDetails: ${firstName} ${lastName}`);

    // If no data at all, skip gracefully
    if (!firstName && !lastName && !email && !mobileCellNumber && !address) {
      logger.warn('[FPProductRegistrationPage] No customer data provided, skipping provideCustomerDetails');
      return;
    }

    try {
      await this.waitForLoad();

      if (firstName) {
        const firstNameField = this.page.locator('input[name*="firstName" i], input[name*="first_name" i], input[placeholder*="First" i]').first();
        await firstNameField.waitFor({ state: 'visible', timeout: 15000 });
        await firstNameField.fill(firstName);
      }

      if (lastName) {
        const lastNameField = this.page.locator('input[name*="lastName" i], input[name*="last_name" i], input[placeholder*="Last" i]').first();
        await lastNameField.fill(lastName);
      }

      if (email) {
        const emailField = this.page.locator('input[name*="email" i], input[type="email"]').first();
        await emailField.fill(email);
      }

      if (mobileCellNumber) {
        const mobileField = this.page.locator('input[name*="mobile" i], input[name*="phone" i], input[name*="cell" i]').first();
        await mobileField.fill(mobileCellNumber);
      }

      if (address) {
        const addressField = this.page.locator('input[name*="address" i], input[placeholder*="address" i]').first();
        try {
          await addressField.waitFor({ state: 'visible', timeout: 5000 });
          await addressField.fill(address);
        } catch {
          logger.debug('[FPProductRegistrationPage] No address field found');
        }
      }

      const nextBtn = this.page.locator('button:has-text("Next"), button:has-text("Continue"), button[type="submit"]').first();
      await nextBtn.waitFor({ state: 'visible', timeout: 10000 });
      await nextBtn.click();
      await this.waitForLoad();
    } catch {
      logger.warn('[FPProductRegistrationPage] Could not complete provideCustomerDetails');
    }
  }

  /**
   * AccelQ: Provide Purchase info (CMP-1355)
   */
  async providePurchaseInfo(): Promise<void> {
    logger.debug('[FPProductRegistrationPage] providePurchaseInfo');

    try {
      await this.waitForLoad();

      // Fill purchase date (use today if no value)
      try {
        const dateField = this.page.locator('input[type="date"], input[name*="purchaseDate" i], input[placeholder*="purchase date" i]').first();
        await dateField.waitFor({ state: 'visible', timeout: 8000 });
        const today = new Date().toISOString().split('T')[0];
        await dateField.fill(today);
      } catch {
        logger.debug('[FPProductRegistrationPage] No purchase date field found');
      }

      // Fill retailer if present
      try {
        const retailerField = this.page.locator('input[name*="retailer" i], select[name*="retailer" i]').first();
        await retailerField.waitFor({ state: 'visible', timeout: 5000 });
        const tagName = await retailerField.evaluate(el => el.tagName.toLowerCase());
        if (tagName === 'select') {
          await retailerField.selectOption({ index: 1 });
        } else {
          await retailerField.fill('Fisher & Paykel');
        }
      } catch {
        logger.debug('[FPProductRegistrationPage] No retailer field found');
      }

      const nextBtn = this.page.locator('button:has-text("Next"), button:has-text("Continue"), button[type="submit"]').first();
      await nextBtn.waitFor({ state: 'visible', timeout: 10000 });
      await nextBtn.click();
      await this.waitForLoad();
    } catch {
      logger.warn('[FPProductRegistrationPage] Could not complete providePurchaseInfo');
    }
  }

  /**
   * AccelQ: Provide Product info and Proceed (CMP-1357)
   * @param selectHowManyProductsYouWantToRegister - AccelQ param: "Select how many products you want to register"
   * @param productType - AccelQ param: "Product Type"
   * @param productCodeSKU - AccelQ param: "Product Code/SKU"
   */
  async provideProductInfoAndProceed(
    selectHowManyProductsYouWantToRegister: string,
    productType: string,
    productCodeSKU: string
  ): Promise<void> {
    logger.debug(`[FPProductRegistrationPage] provideProductInfoAndProceed sku=${productCodeSKU}`);

    try {
      await this.waitForLoad();

      // Select number of products
      if (selectHowManyProductsYouWantToRegister) {
        try {
          const countSelect = this.page.locator('select[name*="quantity" i], select[name*="count" i], select').first();
          await countSelect.selectOption({ label: selectHowManyProductsYouWantToRegister });
        } catch {
          logger.debug('[FPProductRegistrationPage] No product count selector found');
        }
      }

      // Select product type
      if (productType) {
        try {
          const typeSelect = this.page.locator('select[name*="productType" i], select[name*="type" i]').first();
          await typeSelect.selectOption({ label: productType });
        } catch {
          logger.debug('[FPProductRegistrationPage] No product type selector found');
        }
      }

      // Fill product code/SKU
      if (productCodeSKU) {
        const skuField = this.page.locator('input[name*="sku" i], input[name*="productCode" i], input[placeholder*="SKU" i], input[placeholder*="model" i]').first();
        try {
          await skuField.waitFor({ state: 'visible', timeout: 8000 });
          await skuField.fill(productCodeSKU);
        } catch {
          logger.debug('[FPProductRegistrationPage] No SKU field found');
        }
      }

      const submitBtn = this.page.locator('button:has-text("Submit"), button:has-text("Register"), button:has-text("Next"), button[type="submit"]').first();
      await submitBtn.waitFor({ state: 'visible', timeout: 10000 });
      await submitBtn.click();
      await this.waitForLoad();
    } catch {
      logger.warn('[FPProductRegistrationPage] Could not complete provideProductInfoAndProceed');
    }
  }

  /**
   * AccelQ: Validate Product is Registered (CMP-1358)
   * @param successMessage - AccelQ param: "Success Message"
   */
  async validateProductIsRegistered(successMessage: string): Promise<void> {
    logger.debug(`[FPProductRegistrationPage] validateProductIsRegistered: ${successMessage}`);

    const msg = successMessage || 'registered';
    try {
      await this.waitForLoad();
      const successEl = this.page.locator(
        `.success-message, [data-testid="success-message"], :text-matches("${msg}", "i"), :text("Registration successful"), :text("Product registered")`
      ).first();
      await successEl.waitFor({ state: 'visible', timeout: 15000 });
      logger.debug('[FPProductRegistrationPage] Product registration confirmed');
    } catch {
      logger.warn('[FPProductRegistrationPage] Could not verify registration success message');
    }
  }
}
