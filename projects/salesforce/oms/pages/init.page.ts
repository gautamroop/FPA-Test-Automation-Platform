import { Page } from '@playwright/test';
import { BasePage } from '@core/ui/base.page';
import { config } from '@core/config';

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
    await this.waitForLoad();
    throw new Error('Not yet implemented: Invoke Browser');
  }
}
