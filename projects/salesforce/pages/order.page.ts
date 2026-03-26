import { Page, Locator } from '@playwright/test';
import { BasePage } from '../../../core/ui/base.page';
import { config } from '../../../core/config';
import { logger } from '../../../core/utils/logger';

export class SalesforceOrderPage extends BasePage {
  private readonly orderIdCell: Locator;
  private readonly orderStatusCell: Locator;
  private readonly searchInput: Locator;
  private readonly searchButton: Locator;

  constructor(page: Page) {
    super(page);
    this.orderIdCell     = page.locator('[data-field="order-id"]');
    this.orderStatusCell = page.locator('[data-field="order-status"]');
    this.searchInput     = page.locator('[placeholder="Search orders..."]');
    this.searchButton    = page.locator('[data-action="search"]');
  }

  async navigateToOrders(): Promise<void> {
    await this.navigate(`${config.salesforceApi}/orders`);
  }

  async searchOrder(orderId: string): Promise<void> {
    logger.info(`[SF Orders] Searching for order ${orderId}`);
    await this.searchInput.fill(orderId);
    await this.searchButton.click();
    await this.waitForLoad();
  }

  async getOrderId(): Promise<string> {
    const text = await this.orderIdCell.textContent();
    if (!text) throw new Error('[SF Orders] Order ID not found on page');
    return text.trim();
  }

  async getOrderStatus(): Promise<string> {
    const text = await this.orderStatusCell.textContent();
    if (!text) throw new Error('[SF Orders] Order status not found on page');
    return text.trim();
  }
}
