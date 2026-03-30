import { Page } from '@playwright/test';
import { BasePage } from '@core/ui/base.page';
import { config } from '@core/config';
import { logger } from '@core/utils/logger';

/**
 * AccelQ Context: F&P Home Page
 * Context PID: 202
 * Migrated from AccelQ — 4 action(s)
 */
export class FPHomePage extends BasePage {
  constructor(page: Page) {
    super(page, config.commerceUrl);
  }

  /**
   * AccelQ: Validate and Accept Cookies (CMP-291)
   */
  async validateAndAcceptCookies(): Promise<void> {
    await this.waitForLoad();
    logger.debug('[FPHomePage] validateAndAcceptCookies');
    try {
      const cookieBtn = this.page.locator(
        '#onetrust-accept-btn-handler, .cookie-accept, [data-testid="cookie-accept"], button:has-text("Accept All"), button:has-text("I Accept")'
      ).first();
      await cookieBtn.waitFor({ state: 'visible', timeout: 8000 });
      await cookieBtn.click();
      logger.debug('[FPHomePage] Cookie banner accepted');
    } catch {
      logger.debug('[FPHomePage] No cookie banner found, continuing');
    }
  }

  /**
   * AccelQ: Navigate to Product Type and Select Product Style (CMP-337)
   * @param productCategory - AccelQ param: "Product Category"
   * @param productSubCategory - AccelQ param: "Product Sub Category"
   */
  async navigateToProductTypeAndSelectProductStyle(productCategory: string, productSubCategory: string): Promise<void> {
    await this.waitForLoad();
    logger.debug(`[FPHomePage] navigateToProductType: ${productCategory} > ${productSubCategory}`);
    if (!productCategory) {
      logger.warn('[FPHomePage] productCategory is empty, skipping navigation');
      return;
    }
    try {
      const categoryNav = this.page.locator(
        `nav a:has-text("${productCategory}"), [data-nav-category="${productCategory}"], .nav-item:has-text("${productCategory}")`
      ).first();
      await categoryNav.waitFor({ state: 'visible', timeout: 10000 });
      await categoryNav.scrollIntoViewIfNeeded();
      await categoryNav.hover({ force: true });
      if (productSubCategory) {
        const subCategoryLink = this.page.locator(
          `a:has-text("${productSubCategory}"), [data-nav-subcategory="${productSubCategory}"]`
        ).first();
        await subCategoryLink.waitFor({ state: 'visible', timeout: 8000 });
        await subCategoryLink.click();
      } else {
        await categoryNav.click();
      }
      await this.waitForLoad();
    } catch {
      logger.warn('[FPHomePage] Could not navigate to product category');
    }
  }

  /**
   * AccelQ: Navigate to Help and Support and Select Book Online (CMP-1337)
   */
  async navigateToHelpAndSupportAndSelectBookOnline(): Promise<void> {
    await this.waitForLoad();
    logger.debug('[FPHomePage] navigateToHelpAndSupportAndSelectBookOnline');

    // Try direct navigation first (more reliable than hover on nav items outside viewport)
    const baseUrl = config.commerceUrl.replace(/\/$/, '');
    try {
      await this.page.goto(`${baseUrl}/help-and-support/book-a-service`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await this.waitForLoad();
      return;
    } catch {
      logger.debug('[FPHomePage] Direct navigation to book-a-service failed, trying nav hover');
    }

    try {
      const helpNav = this.page.locator(
        'nav a:has-text("Help"), a:has-text("Help & Support"), a:has-text("Support")'
      ).first();
      await helpNav.waitFor({ state: 'visible', timeout: 8000 });
      await helpNav.scrollIntoViewIfNeeded();
      await helpNav.hover({ force: true });
      const bookOnlineLink = this.page.locator(
        'a:has-text("Book Online"), a:has-text("Book a Service"), a:has-text("Book Service")'
      ).first();
      await bookOnlineLink.waitFor({ state: 'visible', timeout: 5000 });
      await bookOnlineLink.click();
      await this.waitForLoad();
    } catch {
      logger.warn('[FPHomePage] Could not navigate to Book a Service');
    }
  }

  /**
   * AccelQ: Navigate to Help and Support and Select Register your Product (CMP-1353)
   */
  async navigateToHelpAndSupportAndSelectRegisterYourProduct(): Promise<void> {
    await this.waitForLoad();
    logger.debug('[FPHomePage] navigateToHelpAndSupportAndSelectRegisterYourProduct');

    // Try direct navigation first
    const baseUrl = config.commerceUrl.replace(/\/$/, '');
    try {
      await this.page.goto(`${baseUrl}/help-and-support/product-registration`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await this.waitForLoad();
      return;
    } catch {
      logger.debug('[FPHomePage] Direct navigation to product-registration failed, trying nav hover');
    }

    try {
      const helpNav = this.page.locator(
        'nav a:has-text("Help"), a:has-text("Help & Support"), a:has-text("Support")'
      ).first();
      await helpNav.waitFor({ state: 'visible', timeout: 8000 });
      await helpNav.scrollIntoViewIfNeeded();
      await helpNav.hover({ force: true });
      const registerLink = this.page.locator(
        'a:has-text("Register your Product"), a:has-text("Register Product"), a:has-text("Product Registration")'
      ).first();
      await registerLink.waitFor({ state: 'visible', timeout: 5000 });
      await registerLink.click();
      await this.waitForLoad();
    } catch {
      logger.warn('[FPHomePage] Could not navigate to Product Registration');
    }
  }
}
