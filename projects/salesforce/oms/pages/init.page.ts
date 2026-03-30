import { Page } from '@playwright/test';
import { BasePage } from '@core/ui/base.page';
import { config } from '@core/config';
import { logger } from '@core/utils/logger';

/**
 * AccelQ Context: Init Page
 * Context PID: 197
 * Migrated from AccelQ — 1 action(s)
 */
export class InitPage extends BasePage {
  constructor(page: Page) {
    super(page, config.commerceUrl);
  }

  /**
   * AccelQ: Invoke Browser (CMP-282)
   * @param uRL - AccelQ param: "URL"
   */
  async invokeBrowser(uRL: string): Promise<void> {
    const target = uRL || this.baseUrl || config.commerceUrl;
    logger.debug(`[InitPage] invokeBrowser → ${target}`);
    try {
      await this.page.goto(target, { waitUntil: 'domcontentloaded', timeout: 10000 });
      await this.page.waitForLoadState('domcontentloaded', { timeout: 3000 }).catch(() => {});
    } catch {
      logger.warn(`[InitPage] Could not navigate to ${target}`);
    }
  }
}
