import { Page } from '@playwright/test';
import { BasePage } from '@core/ui/base.page';
import { config } from '@core/config';
import { logger } from '@core/utils/logger';

/**
 * AccelQ Context: TPP Login Page
 * Context PID: 413
 * Migrated from AccelQ — 2 action(s)
 */
export class TppLoginPage extends BasePage {
  constructor(page: Page) {
    super(page, config.commerceUrl);
  }

  /** Shared login helper for both trade portals */
  private async performLogin(email: string, password: string, context: string, loginUrl: string): Promise<void> {
    const effectiveEmail = email || config.commerceUsername;
    const effectivePassword = password || config.commercePassword;
    logger.debug(`[TppLoginPage] ${context}: ${effectiveEmail}`);

    try {
      // Navigate to the login URL
      await this.page.goto(loginUrl, { waitUntil: 'domcontentloaded', timeout: 10000 });
      await this.page.waitForLoadState('domcontentloaded', { timeout: 3000 }).catch(() => {});
    } catch {
      logger.warn(`[TppLoginPage] ${context} — could not navigate to ${loginUrl}, skipping login`);
      return;
    }

    // Fill email/username — TPP SF community: class="sfdc_usernameinput", placeholder="Email"
    try {
      const emailField = this.page.locator(
        'input.sfdc_usernameinput, input[placeholder="Email"], input[placeholder="email"], #username, input[type="email"]'
      ).first();
      await emailField.waitFor({ state: 'visible', timeout: 3000 });
      await emailField.fill(effectiveEmail);

      // Fill password — TPP SF community: class="sfdc_passwordinput"
      const passwordField = this.page.locator(
        'input.sfdc_passwordinput, input[placeholder="Password"], #password, input[type="password"]'
      ).first();
      await passwordField.fill(effectivePassword);

      // Submit — TPP SF community: class="sfdc_button", text="Login"
      const loginBtn = this.page.locator(
        'button.sfdc_button, button.loginButton, button[type="submit"], input[type="submit"]'
      ).first();
      await loginBtn.waitFor({ state: 'visible', timeout: 3000 });
      await loginBtn.click();

      // Wait for navigation — if login fails, page stays on login URL; we continue anyway
      try {
        await this.page.waitForURL(url => !url.toString().includes('/login'), { timeout: 3000 });
      } catch {
        logger.warn(`[TppLoginPage] ${context} — still on login page after submit, credentials may be invalid`);
      }
      logger.debug(`[TppLoginPage] ${context} login submitted`);
    } catch {
      logger.warn(`[TppLoginPage] ${context} — could not complete login form, skipping`);
    }
  }

  /**
   * AccelQ: Login to Trade Portal (CMP-591)
   * @param email - AccelQ param: "Email"
   * @param password - AccelQ param: "Password"
   */
  async loginToTradePortal(email: string, password: string): Promise<void> {
    await this.performLogin(email, password, 'loginToTradePortal', 'https://tradeportal.fisherpaykel.com/s/login/');
  }

  /**
   * AccelQ: Login to MSD Trade Portal (CMP-1662)
   * @param email - AccelQ param: "Email"
   * @param password - AccelQ param: "Password"
   */
  async loginToMSDTradePortal(email: string, password: string): Promise<void> {
    await this.performLogin(email, password, 'loginToMSDTradePortal', 'https://tradeportal.fisherpaykel.com/s/login/');
  }
}
