import { test, expect } from '@playwright/test';
import { SalesforceClient } from '../../../../core/api/clients/salesforce.client';
import { retry } from '../../../../core/utils/retry.util';
import { flags } from '../../../../core/config';

test.describe('@salesforce @api Salesforce Order API Tests', () => {
  let sfClient: SalesforceClient;

  test.beforeAll(() => {
    sfClient = new SalesforceClient();
  });

  test('@smoke GET /orders/:id should return a valid order', async () => {
    test.skip(!flags.orderFlow, 'orderFlow feature flag is disabled');

    const order = await retry(() => sfClient.getOrder('ORD-001'));

    expect(order).toBeDefined();
    expect(order.id).toBe('ORD-001');
    expect(order.status).toBeTruthy();
    expect(typeof order.totalAmount).toBe('number');
  });

  test('@regression POST /orders should create a new order', async () => {
    test.skip(!flags.orderFlow, 'orderFlow feature flag is disabled');

    const order = await sfClient.createOrder({
      accountId: 'ACC-001',
      items: [{ productId: 'PROD-001', quantity: 2 }]
    });

    expect(order.id).toBeTruthy();
    expect(order.status).toBe('Pending');
  });

  test('@regression PATCH /orders/:id should update order status', async () => {
    test.skip(!flags.orderFlow, 'orderFlow feature flag is disabled');

    const updated = await sfClient.updateOrderStatus('ORD-001', 'Confirmed');

    expect(updated.id).toBe('ORD-001');
    expect(updated.status).toBe('Confirmed');
  });

  test('@regression DELETE /orders/:id should remove the order', async () => {
    test.skip(!flags.orderFlow, 'orderFlow feature flag is disabled');

    await expect(sfClient.deleteOrder('ORD-TEST-DELETE')).resolves.toBeUndefined();
  });

});
