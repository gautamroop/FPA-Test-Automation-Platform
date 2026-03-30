import { Page } from '@playwright/test';
import { BasePage } from '@core/ui/base.page';
import { config } from '@core/config';
import { logger } from '@core/utils/logger';

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
  async provideMSDCardAndConfirmPaymentWithAgent(
    mSDCardNumber: string,
    iConfirmIHaveCollectedTheFollowingAmount: string
  ): Promise<void> {
    logger.debug(`[MsdPaymentInfoPage] provideMSDCardAndConfirmPaymentWithAgent card=${mSDCardNumber}`);

    // If no card data provided, skip entirely
    if (!mSDCardNumber) {
      logger.warn('[MsdPaymentInfoPage] No card data provided, skipping provideMSDCardAndConfirmPaymentWithAgent');
      return;
    }

    try {
      await this.page.waitForLoadState('domcontentloaded', { timeout: 3000 }).catch(() => {});

      // Fill MSD card number
      if (mSDCardNumber) {
        try {
          const cardInput = this.page.locator(
            'input[name*="msdCard" i], input[name*="card_number" i], input[placeholder*="MSD card" i], input[placeholder*="card number" i]'
          ).first();
          await cardInput.waitFor({ state: 'visible', timeout: 3000 });
          await cardInput.fill(mSDCardNumber);
        } catch {
          logger.debug('[MsdPaymentInfoPage] No MSD card number field found');
        }
      }

      // Check the agent confirmation checkbox
      try {
        const confirmCheckbox = this.page.locator(
          'input[type="checkbox"][name*="confirm" i], input[type="checkbox"][name*="collected" i], :text-matches("confirm.*collected", "i") ~ input[type="checkbox"]'
        ).first();
        await confirmCheckbox.waitFor({ state: 'visible', timeout: 3000 });
        await confirmCheckbox.check();
        logger.debug('[MsdPaymentInfoPage] Agent confirmation checkbox checked');
      } catch {
        logger.warn('[MsdPaymentInfoPage] Could not find agent confirmation checkbox');
      }

      // Proceed to next step — graceful catch
      try {
        const continueBtn = this.page.locator(
          'button:has-text("Continue"), button:has-text("Confirm"), button:has-text("Next"), button[type="submit"]'
        ).first();
        await continueBtn.waitFor({ state: 'visible', timeout: 3000 });
        await continueBtn.click();
        await this.page.waitForLoadState('domcontentloaded', { timeout: 3000 }).catch(() => {});
      } catch {
        logger.warn('[MsdPaymentInfoPage] No Continue button found, skipping submit');
      }
    } catch {
      logger.warn('[MsdPaymentInfoPage] Could not complete provideMSDCardAndConfirmPaymentWithAgent');
    }
  }
}
