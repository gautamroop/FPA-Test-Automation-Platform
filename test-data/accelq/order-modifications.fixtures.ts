/**
 * Test data fixtures for AccelQ OrderModifications scenarios.
 * These params are referenced in the spec files as data.<paramName>.
 * Replace placeholder values with real test data before running.
 */

export interface OrderModificationsTestData {
  /** AccelQ data param: orderDUNumber */
  orderDUNumber: string;
  /** AccelQ data param: orderLevelDiscountType */
  orderLevelDiscountType: string;
  /** AccelQ data param: orderLevelDiscountValue */
  orderLevelDiscountValue: string;
  /** AccelQ data param: productCodeSKU */
  productCodeSKU: string;
  /** AccelQ data param: sFMFASecretKey */
  sFMFASecretKey: string;
  /** AccelQ data param: sFPassword */
  sFPassword: string;
  /** AccelQ data param: sFUsername */
  sFUsername: string;
  /** AccelQ data param: uRL */
  uRL: string;
}

/** Default (placeholder) test data — override per-test as needed */
export const order_modificationsDefaultData: OrderModificationsTestData = {
  orderDUNumber: 'ORD-00001',
  orderLevelDiscountType: '10',
  orderLevelDiscountValue: '10',
  productCodeSKU: 'E522BRXFD_N',
  sFMFASecretKey: 'test.user@fisherpaykel.com',
  sFPassword: 'Test@1234',
  sFUsername: 'test.user@fisherpaykel.com',
  uRL: 'https://fisherpaykel.com',
};
