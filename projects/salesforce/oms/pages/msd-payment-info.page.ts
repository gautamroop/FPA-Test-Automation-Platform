import { Page } from '@playwright/test';
import { BasePage } from '@core/ui/base.page';
import { config } from '@core/config';

/**
 * AccelQ Context: MSD Payment info
 * Context PID: 1285
 * Migrated from AccelQ — 1 action(s)
 */
export class MsdPaymentInfoPage extends BasePage {
  constructor(page: Page) {
    super(page, config.commerceUrl);
  }

  /**
   * AccelQ: Provide MSD card and Confirm Payment with Agent (CMP-1794)
   * @param mSDCardNumber - AccelQ param: "MSD Card Number"
   * @param iConfirmIHaveCollectedTheFollowingAmount - AccelQ param: "I confirm I have collected the following amount:"
   */
  async provideMSDCardAndConfirmPaymentWithAgent(mSDCardNumber: string, iConfirmIHaveCollectedTheFollowingAmount: string): Promise<void> {
    await this.waitForLoad();
    throw new Error('Not yet implemented: Provide MSD card and Confirm Payment with Agent');
  }
}
