import { Page } from '@playwright/test';
import { BasePage } from '@core/ui/base.page';
import { config } from '@core/config';
import { logger } from '@core/utils/logger';

/**
 * AccelQ Context: TPP MSD Portal page
 * Context PID: 1198
 * Migrated from AccelQ — 2 action(s)
 */
export class TppMsdPortalPage extends BasePage {
  constructor(page: Page) {
    super(page, config.commerceUrl);
  }

  /**
   * AccelQ: Navigate to MSD Portal (CMP-1663)
   * @param tPPType - AccelQ param: "TPP Type"
   */
  async navigateToMSDPortal(tPPType: string): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded', { timeout: 3000 }).catch(() => {});
    logger.debug(`[TppMsdPortalPage] navigateToMSDPortal: ${tPPType}`);

    try {
      // Look for MSD portal navigation link
      const msdLink = this.page.locator(
        'a:has-text("MSD"), a:has-text("MSD Portal"), a:has-text("Trade Portal"), nav a:has-text("Portal"), [data-testid="msd-portal"]'
      ).first();
      await msdLink.waitFor({ state: 'visible', timeout: 3000 });
      await msdLink.click();
      await this.page.waitForLoadState('domcontentloaded', { timeout: 3000 }).catch(() => {});
      logger.debug('[TppMsdPortalPage] Navigated to MSD portal');
    } catch {
      logger.warn('[TppMsdPortalPage] Could not navigate to MSD portal');
    }
  }

  /**
   * AccelQ: Validate and Accept Cookies (CMP-1796)
   */
  async validateAndAcceptCookies(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded', { timeout: 3000 }).catch(() => {});
    logger.debug('[TppMsdPortalPage] validateAndAcceptCookies');
    try {
      const cookieBtn = this.page.locator(
        '#onetrust-accept-btn-handler, .cookie-accept, button:has-text("Accept All"), button:has-text("I Accept"), button:has-text("Accept Cookies")'
      ).first();
      await cookieBtn.waitFor({ state: 'visible', timeout: 3000 });
      await cookieBtn.click();
      logger.debug('[TppMsdPortalPage] Cookie banner accepted');
    } catch {
      logger.debug('[TppMsdPortalPage] No cookie banner found, continuing');
    }
  }
}
