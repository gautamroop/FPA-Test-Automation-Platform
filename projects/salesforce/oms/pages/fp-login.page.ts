import { Page } from '@playwright/test';
import { BasePage } from '@core/ui/base.page';
import { config } from '@core/config';
import { logger } from '@core/utils/logger';

/**
 * AccelQ Context: F&P Login Page
 * Context PID: 203
 * Migrated from AccelQ — 1 action(s)
 */
export class FPLoginPage extends BasePage {
  constructor(page: Page) {
    super(page, config.commerceUrl);
  }

  /**
   * AccelQ: User Login (CMP-292)
   * @param email - AccelQ param: "Email"
   * @param password - AccelQ param: "Password"
   */
  async userLogin(email: string, password: string): Promise<void> {
    await this.waitForLoad();
    const effectiveEmail = email || config.commerceUsername;
    const effectivePassword = password || config.commercePassword;
    logger.debug(`[FPLoginPage] userLogin: ${effectiveEmail}`);

    // Navigate directly to the SF-hosted login page for FP commerce
    const currentUrl = this.page.url();
    if (!currentUrl.includes('login') && !currentUrl.includes('account')) {
      try {
        // FP Commerce uses Salesforce embedded login — click the Login/Register link
        const loginLink = this.page.locator(
          'a[href*="Login-OAuthLogin"], a[href*="Login-Show"], a:has-text("Login/Register"), a:has-text("Sign In"), .sf-login a, .user a:has-text("Login")'
        ).first();
        await loginLink.waitFor({ state: 'visible', timeout: 6000 });
        await loginLink.click();
        await this.waitForLoad();
      } catch {
        // Fallback: navigate directly to SF login page for this site
        try {
          await this.page.goto('https://login-uat.fisherpaykel.com/mafpnz/s/login/', { waitUntil: 'domcontentloaded', timeout: 30000 });
          await this.waitForLoad();
        } catch {
          logger.debug('[FPLoginPage] Could not navigate to login page');
        }
      }
    }

    // Fill email/username — SF community login: placeholder="Email", class="inputBox input"
    try {
      const emailField = this.page.locator(
        'input[placeholder="Email"], input[placeholder="email"], #username, #email, input[name="username"], input[name="email"], input[type="email"]'
      ).first();
      await emailField.waitFor({ state: 'visible', timeout: 12000 });
      await emailField.fill(effectiveEmail);

      // Fill password — placeholder="Password"
      const passwordField = this.page.locator(
        'input[placeholder="Password"], #password, input[name="password"], input[type="password"]'
      ).first();
      await passwordField.waitFor({ state: 'visible', timeout: 6000 });
      await passwordField.fill(effectivePassword);

      // Submit — SF community login button: class="loginButton", text="L O G I N" (letter-spaced)
      const loginBtn = this.page.locator(
        'button.loginButton, button.sfdc_button, button[type="submit"], input[type="submit"]'
      ).first();
      await loginBtn.waitFor({ state: 'visible', timeout: 6000 });
      await loginBtn.click();
      await this.waitForLoad();
      logger.debug('[FPLoginPage] Login submitted');
    } catch {
      logger.warn('[FPLoginPage] Could not complete login form');
    }
  }
}
