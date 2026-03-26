import { Page, Locator } from '@playwright/test';
import { logger } from '../utils/logger';

export abstract class BasePage {
  constructor(protected readonly page: Page, protected readonly baseUrl?: string) {}

  async navigate(url?: string): Promise<void> {
    const target = url ?? this.baseUrl ?? '';
    logger.debug(`[BasePage] Navigating to ${target}`);
    await this.page.goto(target);
    await this.waitForLoad();
  }

  async waitForLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }

  async getTitle(): Promise<string> {
    return this.page.title();
  }

  async waitForSelector(selector: string, timeout = 10000): Promise<Locator> {
    const locator = this.page.locator(selector);
    await locator.waitFor({ state: 'visible', timeout });
    return locator;
  }

  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `reports/screenshots/${name}.png`, fullPage: true });
    logger.debug(`[BasePage] Screenshot saved: ${name}`);
  }
}
