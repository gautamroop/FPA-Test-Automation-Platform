import { test, expect } from '@playwright/test';
import { SalesforceLoginPage } from '../../pages/login.page';
import { SalesforceOrderPage } from '../../pages/order.page';
import { flags } from '../../../../core/config';

test.describe('@salesforce @ui Salesforce Order UI Tests', () => {

  test.beforeEach(async ({ page }) => {
    const loginPage = new SalesforceLoginPage(page);
    await loginPage.login(); // uses config.sfUsername / config.sfPassword by default
  });

  test('@smoke should display order in Salesforce UI', async ({ page }) => {
    test.skip(!flags.orderFlow, 'orderFlow feature flag is disabled');

    const ordersPage = new SalesforceOrderPage(page);
    await ordersPage.navigateToOrders();
    await ordersPage.searchOrder('ORD-001');

    const orderId = await ordersPage.getOrderId();
    const status  = await ordersPage.getOrderStatus();

    expect(orderId).toBe('ORD-001');
    expect(status).toBeTruthy();
  });

  test('@regression should show correct order status after update', async ({ page }) => {
    test.skip(!flags.orderFlow, 'orderFlow feature flag is disabled');

    const ordersPage = new SalesforceOrderPage(page);
    await ordersPage.navigateToOrders();
    await ordersPage.searchOrder('ORD-002');

    const status = await ordersPage.getOrderStatus();
    expect(['Pending', 'Confirmed', 'Shipped', 'Delivered']).toContain(status);
  });

});
