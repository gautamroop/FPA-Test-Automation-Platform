/**
 * Test data fixtures for AccelQ OrderVerification scenarios.
 * These params are referenced in the spec files as data.<paramName>.
 * Replace placeholder values with real test data before running.
 */

export interface OrderVerificationTestData {
  /** AccelQ data param: emailAddress */
  emailAddress: string;
  /** AccelQ data param: itemName */
  itemName: string;
  /** AccelQ data param: itemQty */
  itemQty: string;
  /** AccelQ data param: orderDUNumber */
  orderDUNumber: string;
  /** AccelQ data param: orderedDate */
  orderedDate: string;
  /** AccelQ data param: phoneNumber */
  phoneNumber: string;
  /** AccelQ data param: sFMFASecretKey */
  sFMFASecretKey: string;
  /** AccelQ data param: sFPassword */
  sFPassword: string;
  /** AccelQ data param: sFUsername */
  sFUsername: string;
  /** AccelQ data param: total */
  total: string;
  /** AccelQ data param: uRL */
  uRL: string;
}

/** Default (placeholder) test data — override per-test as needed */
export const order_verificationDefaultData: OrderVerificationTestData = {
  emailAddress: 'test@example.com',
  itemName: '',
  itemQty: '1',
  orderDUNumber: 'ORD-00001',
  orderedDate: '2026-12-01',
  phoneNumber: '+61400000000',
  sFMFASecretKey: 'test.user@fisherpaykel.com',
  sFPassword: 'Test@1234',
  sFUsername: 'test.user@fisherpaykel.com',
  total: '1500.00',
  uRL: 'https://fisherpaykel.com',
};
