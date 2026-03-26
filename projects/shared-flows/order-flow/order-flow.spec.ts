import { test, expect } from '@playwright/test';
import { CheckoutPage } from '../../commerce/pages/checkout.page';
import { generateUser } from '../../../core/utils/testdata.generator';
import { SalesforceClient } from '../../../core/api/clients/salesforce.client';
import { retry } from '../../../core/utils/retry.util';
import { validateOrderConsistency } from '../../../core/validators/order.validator';
import { logger } from '../../../core/utils/logger';

test('@order @e2e Order Flow', async ({ page }) => {
  const checkout = new CheckoutPage(page);
  const user = generateUser();

  // Step 1: Commerce — place order via UI
  logger.info(`[OrderFlow] Placing order for ${user.email}`);
  const order = await checkout.createOrder(user);

  // Step 2: Salesforce — poll until order is reflected
  logger.info(`[OrderFlow] Validating order ${order.orderId} in Salesforce`);
  const sfClient = new SalesforceClient();

  const sfOrder = await retry(async () => {
    const data = await sfClient.getOrder(order.orderId);
    expect(data).toBeDefined();
    return data;
  });

  // Step 3: Cross-system consistency check
  validateOrderConsistency(order, sfOrder);

  logger.info(`[OrderFlow] E2E success: order ${order.orderId} verified`);
});
