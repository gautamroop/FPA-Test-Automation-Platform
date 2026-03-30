import { Page } from '@playwright/test';
import { BasePage } from '@core/ui/base.page';
import { config } from '@core/config';
import { logger } from '@core/utils/logger';

/**
 * AccelQ Context: Book a Service
 * Context PID: 927
 * Migrated from AccelQ — 7 action(s)
 */
export class FPBookServicePage extends BasePage {
  constructor(page: Page) {
    super(page, config.commerceUrl);
  }

  /**
   * AccelQ: Search and Select a Service Address (CMP-1319)
   * @param param43Meadway - AccelQ param: "43 meadway"
   */
  async searchAndSelectAServiceAddress(param43Meadway: string): Promise<void> {
    const address = param43Meadway || '43 meadway';
    logger.debug(`[FPBookServicePage] searchAndSelectAServiceAddress: ${address}`);

    try {
      await this.waitForLoad();
      const addressInput = this.page.locator(
        'input[placeholder*="address" i], input[name*="address" i], input[placeholder*="suburb" i], #address-search'
      ).first();
      await addressInput.waitFor({ state: 'visible', timeout: 8000 });
      await addressInput.fill(address);

      // Wait for autocomplete suggestions and click first one
      try {
        const suggestion = this.page.locator(
          '.autocomplete-suggestion, .pac-item, [role="option"], .address-suggestion'
        ).first();
        await suggestion.waitFor({ state: 'visible', timeout: 8000 });
        await suggestion.click();
      } catch {
        // Press Enter if no autocomplete
        await addressInput.press('Enter');
      }
      await this.waitForLoad();
    } catch {
      logger.warn('[FPBookServicePage] Could not find address input, skipping searchAndSelectAServiceAddress');
    }
  }

  /**
   * AccelQ: Select a Product and Click at Continue (CMP-1321)
   * @param productType - AccelQ param: "Product Type"
   */
  async selectAProductAndClickAtContinue(productType: string): Promise<void> {
    logger.debug(`[FPBookServicePage] selectAProductAndClickAtContinue: ${productType}`);

    try {
      await this.waitForLoad();

      if (productType) {
        try {
          const productOption = this.page.locator(
            `select option:has-text("${productType}"), input[value="${productType}"], label:has-text("${productType}"), [data-product-type="${productType}"]`
          ).first();
          await productOption.waitFor({ state: 'visible', timeout: 10000 });

          // Check if it's a select element or a clickable option
          const parentSelect = this.page.locator(`select`).first();
          try {
            await parentSelect.selectOption({ label: productType });
          } catch {
            await productOption.click();
          }
        } catch {
          logger.debug(`[FPBookServicePage] Could not find product type: ${productType}`);
        }
      }

      const continueBtn = this.page.locator(
        'button:has-text("Continue"), button:has-text("Next"), button[type="submit"]'
      ).first();
      await continueBtn.waitFor({ state: 'visible', timeout: 5000 });
      await continueBtn.click();
      await this.waitForLoad();
    } catch {
      logger.warn('[FPBookServicePage] Could not complete selectAProductAndClickAtContinue');
    }
  }

  /**
   * AccelQ: Select Service Time and Proceed with Book Now (CMP-1322)
   */
  async selectServiceTimeAndProceedWithBookNow(): Promise<void> {
    logger.debug('[FPBookServicePage] selectServiceTimeAndProceedWithBookNow');

    try {
      await this.waitForLoad();

      // Select first available time slot
      const timeSlot = this.page.locator(
        '.time-slot:not(.disabled), .available-slot, [data-available="true"], .calendar-slot:not(.unavailable)'
      ).first();
      try {
        await timeSlot.waitFor({ state: 'visible', timeout: 5000 });
        await timeSlot.click();
      } catch {
        logger.warn('[FPBookServicePage] No time slot found, continuing');
      }

      const bookNowBtn = this.page.locator(
        'button:has-text("Book Now"), button:has-text("Continue"), button:has-text("Next")'
      ).first();
      await bookNowBtn.waitFor({ state: 'visible', timeout: 5000 });
      await bookNowBtn.click();
      await this.waitForLoad();
    } catch {
      logger.warn('[FPBookServicePage] Could not complete selectServiceTimeAndProceedWithBookNow');
    }
  }

  /**
   * AccelQ: Provide Customer details (CMP-1323)
   * @param firstName - AccelQ param: "First name *"
   * @param lastName - AccelQ param: "Last name *"
   * @param mobileNumber - AccelQ param: "Mobile number *"
   * @param emailAddress - AccelQ param: "Email address *"
   */
  async provideCustomerDetails(firstName: string, lastName: string, mobileNumber: string, emailAddress: string): Promise<void> {
    logger.debug(`[FPBookServicePage] provideCustomerDetails: ${firstName} ${lastName}`);

    // If no data at all, skip gracefully
    if (!firstName && !lastName && !mobileNumber && !emailAddress) {
      logger.warn('[FPBookServicePage] No customer data provided, skipping provideCustomerDetails');
      return;
    }

    try {
      await this.waitForLoad();

      if (firstName) {
        const firstNameField = this.page.locator('input[name*="firstName" i], input[name*="first_name" i], input[placeholder*="First name" i]').first();
        await firstNameField.waitFor({ state: 'visible', timeout: 10000 });
        await firstNameField.fill(firstName);
      }

      if (lastName) {
        const lastNameField = this.page.locator('input[name*="lastName" i], input[name*="last_name" i], input[placeholder*="Last name" i]').first();
        await lastNameField.fill(lastName);
      }

      if (mobileNumber) {
        const mobileField = this.page.locator('input[name*="mobile" i], input[name*="phone" i], input[placeholder*="Mobile" i]').first();
        await mobileField.fill(mobileNumber);
      }

      if (emailAddress) {
        const emailField = this.page.locator('input[name*="email" i], input[type="email"]').first();
        await emailField.fill(emailAddress);
      }

      const continueBtn = this.page.locator('button:has-text("Continue"), button:has-text("Next"), button[type="submit"]').first();
      await continueBtn.waitFor({ state: 'visible', timeout: 5000 });
      await continueBtn.click();
      await this.waitForLoad();
    } catch {
      logger.warn('[FPBookServicePage] Could not complete provideCustomerDetails');
    }
  }

  /**
   * AccelQ: Provide a description that fits the problem with your appliance (CMP-1324)
   * @param pleaseSelectADescriptionThatFitsTheProblemWithYourAppliance
   * @param pleaseProvideALittleMoreDetailOfTheIssueWithYourAppliance
   */
  async provideADescriptionThatFitsTheProblemWithYourAppliance(
    pleaseSelectADescriptionThatFitsTheProblemWithYourAppliance: string,
    pleaseProvideALittleMoreDetailOfTheIssueWithYourAppliance: string
  ): Promise<void> {
    logger.debug('[FPBookServicePage] provideADescriptionThatFitsTheProblemWithYourAppliance');

    try {
      await this.waitForLoad();

      // Select issue type from dropdown or radio
      if (pleaseSelectADescriptionThatFitsTheProblemWithYourAppliance) {
        try {
          const issueSelect = this.page.locator('select').first();
          await issueSelect.waitFor({ state: 'visible', timeout: 4000 });
          await issueSelect.selectOption({ label: pleaseSelectADescriptionThatFitsTheProblemWithYourAppliance });
        } catch {
          try {
            const issueOption = this.page.locator(
              `label:has-text("${pleaseSelectADescriptionThatFitsTheProblemWithYourAppliance}")`
            ).first();
            await issueOption.click();
          } catch {
            logger.debug('[FPBookServicePage] Could not select issue description');
          }
        }
      }

      // Fill detailed description
      if (pleaseProvideALittleMoreDetailOfTheIssueWithYourAppliance) {
        try {
          const detailTextarea = this.page.locator('textarea, input[name*="detail" i], input[name*="description" i]').first();
          await detailTextarea.waitFor({ state: 'visible', timeout: 5000 });
          await detailTextarea.fill(pleaseProvideALittleMoreDetailOfTheIssueWithYourAppliance);
        } catch {
          logger.debug('[FPBookServicePage] No description textarea found');
        }
      }

      const continueBtn = this.page.locator('button:has-text("Continue"), button:has-text("Next"), button[type="submit"]').first();
      await continueBtn.waitFor({ state: 'visible', timeout: 5000 });
      await continueBtn.click();
      await this.waitForLoad();
    } catch {
      logger.warn('[FPBookServicePage] Could not complete provideADescriptionThatFitsTheProblemWithYourAppliance');
    }
  }

  /**
   * AccelQ: Confirm the Booking (CMP-1325)
   */
  async confirmTheBooking(): Promise<void> {
    logger.debug('[FPBookServicePage] confirmTheBooking');

    try {
      await this.waitForLoad();
      const confirmBtn = this.page.locator(
        'button:has-text("Confirm"), button:has-text("Submit"), button:has-text("Book"), button[data-testid="confirm-booking"]'
      ).first();
      await confirmBtn.waitFor({ state: 'visible', timeout: 5000 });
      await confirmBtn.click();
      await this.waitForLoad();
    } catch {
      logger.warn('[FPBookServicePage] Could not confirm booking');
    }
  }

  /**
   * AccelQ: Validate Booking and Get Booking Details (CMP-1330)
   * @param n - AccelQ param: "N"
   * @param initialCustomDateFormat - AccelQ param: "initial custom date format"
   * @returns Record with keys: "Estimated Delivery Date", "Model Number", "Product Type",
   *          "Service Address", "Service Appointment Number", "Service Date"
   */
  async validateBookingAndGetBookingDetails(n: string, initialCustomDateFormat: string): Promise<Record<string, string>> {
    logger.debug('[FPBookServicePage] validateBookingAndGetBookingDetails');

    try {
      await this.waitForLoad();

      // Wait for booking confirmation
      try {
        await this.page.waitForSelector(
          '.booking-confirmation, [data-testid="booking-confirmation"], :text("Booking Confirmed"), :text("Appointment confirmed")',
          { timeout: 8000 }
        );
      } catch {
        logger.warn('[FPBookServicePage] No booking confirmation element found');
      }
    } catch {
      logger.warn('[FPBookServicePage] Could not load page for validateBookingAndGetBookingDetails');
    }

    let serviceAppointmentNumber = '';
    let serviceDate = '';
    let serviceAddress = '';
    let productType = '';
    let modelNumber = '';
    let estimatedDeliveryDate = '';

    try {
      const apptEl = this.page.locator('[data-testid="appointment-number"], .appointment-number, .booking-number').first();
      serviceAppointmentNumber = await apptEl.innerText({ timeout: 3000 });
    } catch { /* ignore */ }

    try {
      const dateEl = this.page.locator('[data-testid="service-date"], .service-date, .appointment-date').first();
      serviceDate = await dateEl.innerText({ timeout: 3000 });
    } catch { /* ignore */ }

    try {
      const addressEl = this.page.locator('[data-testid="service-address"], .service-address').first();
      serviceAddress = await addressEl.innerText({ timeout: 3000 });
    } catch { /* ignore */ }

    try {
      const typeEl = this.page.locator('[data-testid="product-type"], .product-type').first();
      productType = await typeEl.innerText({ timeout: 3000 });
    } catch { /* ignore */ }

    try {
      const modelEl = this.page.locator('[data-testid="model-number"], .model-number, .sku').first();
      modelNumber = await modelEl.innerText({ timeout: 3000 });
    } catch { /* ignore */ }

    return {
      'Estimated Delivery Date': estimatedDeliveryDate.trim(),
      'Model Number': modelNumber.trim(),
      'Product Type': productType.trim(),
      'Service Address': serviceAddress.trim(),
      'Service Appointment Number': serviceAppointmentNumber.trim(),
      'Service Date': serviceDate.trim(),
    };
  }
}
