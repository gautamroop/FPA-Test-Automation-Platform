import { Page, Locator } from '@playwright/test';
import { config } from '../../../core/config';
import { logger } from '../../../core/utils/logger';

export class CheckoutPage {
  private readonly shopLink: Locator;
  private readonly addToCartButton: Locator;
  private readonly checkoutButton: Locator;
  private readonly emailInput: Locator;
  private readonly placeOrderButton: Locator;
  private readonly orderIdElement: Locator;

  constructor(private page: Page) {
    this.shopLink        = page.getByText('Shop');
    this.addToCartButton = page.getByText('Add to Cart');
    this.checkoutButton  = page.getByText('Checkout');
    this.emailInput      = page.locator('#email');
    this.placeOrderButton = page.getByText('Place Order');
    this.orderIdElement  = page.locator('#order-id');
  }

  async createOrder(user: { email: string; name: string }): Promise<{ orderId: string }> {
    logger.info(`[Checkout] Starting order for ${user.email}`);

    await this.page.goto(config.commerceUrl);
    await this.shopLink.click();
    await this.addToCartButton.click();
    await this.checkoutButton.click();

    await this.emailInput.fill(user.email);
    await this.placeOrderButton.click();

    const orderId = await this.orderIdElement.textContent();
    if (!orderId) throw new Error('[Checkout] Order ID not found after placing order');

    logger.info(`[Checkout] Order created: ${orderId}`);
    return { orderId: orderId.trim() };
  }
}
