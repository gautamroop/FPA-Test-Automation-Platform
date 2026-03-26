/**
 * Test data fixtures for AccelQ JdeIntegration scenarios.
 * These params are referenced in the spec files as data.<paramName>.
 * Replace placeholder values with real test data before running.
 */

export interface JdeIntegrationTestData {
  /** AccelQ data param: orderDUNumber */
  orderDUNumber: string;
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
export const jde_integrationDefaultData: JdeIntegrationTestData = {
  orderDUNumber: 'ORD-00001',
  sFMFASecretKey: 'test.user@fisherpaykel.com',
  sFPassword: 'Test@1234',
  sFUsername: 'test.user@fisherpaykel.com',
  uRL: 'https://fisherpaykel.com',
};
