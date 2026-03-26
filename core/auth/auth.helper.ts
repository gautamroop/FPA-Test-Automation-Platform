import { Page, BrowserContext } from '@playwright/test';
import { config } from '../config';
import { logger } from '../utils/logger';

export class AuthHelper {
  constructor(private readonly page: Page, private readonly context: BrowserContext) {}

  /**
   * Perform Salesforce UI login using credentials from config.
   * Call this in a global setup or beforeAll to reuse across tests.
   */
  async loginSalesforce(): Promise<void> {
    logger.info(`[Auth] Logging into Salesforce as ${config.sfUsername}`);
    await this.page.goto(`${config.salesforceApi}/login`);
    await this.page.locator('#username').fill(config.sfUsername);
    await this.page.locator('#password').fill(config.sfPassword);
    await this.page.locator('#Login').click();
    await this.page.waitForLoadState('networkidle');
    logger.info('[Auth] Salesforce login successful');
  }

  /**
   * Perform Commerce (SFCC) UI login using credentials from config.
   */
  async loginCommerce(): Promise<void> {
    logger.info(`[Auth] Logging into Commerce as ${config.commerceUsername}`);
    await this.page.goto(`${config.commerceUrl}/login`);
    await this.page.locator('#email').fill(config.commerceUsername);
    await this.page.locator('#password').fill(config.commercePassword);
    await this.page.locator('[type="submit"]').click();
    await this.page.waitForLoadState('networkidle');
    logger.info('[Auth] Commerce login successful');
  }

  /**
   * Save browser storage state for session reuse across specs.
   */
  async saveSession(sessionPath: string): Promise<void> {
    await this.context.storageState({ path: sessionPath });
    logger.debug(`[Auth] Session saved to ${sessionPath}`);
  }
}
