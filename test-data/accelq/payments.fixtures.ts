/**
 * Test data fixtures for AccelQ Payments scenarios.
 * These params are referenced in the spec files as data.<paramName>.
 * Replace placeholder values with real test data before running.
 */

export interface PaymentsTestData {
  /** AccelQ data param: orderDUNumber */
  orderDUNumber: string;
  /** AccelQ data param: orderLevelDiscountType */
  orderLevelDiscountType: string;
  /** AccelQ data param: orderLevelDiscountValue */
  orderLevelDiscountValue: string;
  /** AccelQ data param: paymentType */
  paymentType: string;
  /** AccelQ data param: productCodeSKU */
  productCodeSKU: string;
  /** AccelQ data param: requestedAmount */
  requestedAmount: string;
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
export const paymentsDefaultData: PaymentsTestData = {
  orderDUNumber: 'ORD-00001',
  orderLevelDiscountType: '10',
  orderLevelDiscountValue: '10',
  paymentType: 'Credit Card',
  productCodeSKU: 'E522BRXFD_N',
  requestedAmount: '1500.00',
  sFMFASecretKey: 'test.user@fisherpaykel.com',
  sFPassword: 'Test@1234',
  sFUsername: 'test.user@fisherpaykel.com',
  uRL: 'https://fisherpaykel.com',
};
