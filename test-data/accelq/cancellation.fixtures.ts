/**
 * Test data fixtures for AccelQ Cancellation scenarios.
 * These params are referenced in the spec files as data.<paramName>.
 * Replace placeholder values with real test data before running.
 */

export interface CancellationTestData {
  /** AccelQ data param: orderDUNumber */
  orderDUNumber: string;
  /** AccelQ data param: originalTotal */
  originalTotal: string;
  /** AccelQ data param: refundAmount */
  refundAmount: string;
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
export const cancellationDefaultData: CancellationTestData = {
  orderDUNumber: 'ORD-00001',
  originalTotal: '1500.00',
  refundAmount: '1500.00',
  sFMFASecretKey: 'test.user@fisherpaykel.com',
  sFPassword: 'Test@1234',
  sFUsername: 'test.user@fisherpaykel.com',
  uRL: 'https://fisherpaykel.com',
};
