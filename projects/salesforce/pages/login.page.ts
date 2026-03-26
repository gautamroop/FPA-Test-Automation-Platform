import { Page, Locator } from '@playwright/test';
import { BasePage } from '../../../core/ui/base.page';
import { config } from '../../../core/config';
import { logger } from '../../../core/utils/logger';

export class SalesforceLoginPage extends BasePage {
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.locator('#username');
    this.passwordInput = page.locator('#password');
    this.loginButton   = page.locator('#Login');
  }

  async login(
    username: string = config.sfUsername,
    password: string = config.sfPassword
  ): Promise<void> {
    logger.info(`[SF Login] Logging in as ${username}`);
    await this.navigate(`${config.salesforceApi}/login`);
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    await this.waitForLoad();
    logger.info('[SF Login] Login successful');
  }
}
