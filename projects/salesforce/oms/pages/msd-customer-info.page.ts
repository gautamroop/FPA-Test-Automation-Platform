import { Page } from '@playwright/test';
import { BasePage } from '@core/ui/base.page';
import { config } from '@core/config';

/**
 * AccelQ Context: MSD Customer info
 * Context PID: 1284
 * Migrated from AccelQ — 1 action(s)
 */
export class MsdCustomerInfoPage extends BasePage {
  constructor(page: Page) {
    super(page, config.commerceUrl);
  }

  /**
   * AccelQ: Provide Customer and Delivery details (CMP-1791)
   * @param email - AccelQ param: "Email"
   * @param fixedTextLength - AccelQ param: "fixed text length"
   * @param prefix - AccelQ param: "prefix"
   * @param suffix - AccelQ param: "suffix"
   * @param address - AccelQ param: "Address"
   */
  async provideCustomerAndDeliveryDetails(email: string, fixedTextLength: string, prefix: string, suffix: string, address: string): Promise<void> {
    await this.waitForLoad();
    throw new Error('Not yet implemented: Provide Customer and Delivery details');
  }
}
