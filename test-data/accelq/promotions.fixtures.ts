/**
 * Test data fixtures for AccelQ Promotions scenarios.
 * These params are referenced in the spec files as data.<paramName>.
 * Replace placeholder values with real test data before running.
 */

export interface PromotionsTestData {
  /** AccelQ data param: deliveryPinCode */
  deliveryPinCode: string;
  /** AccelQ data param: email */
  email: string;
  /** AccelQ data param: orderQuantity */
  orderQuantity: string;
  /** AccelQ data param: password */
  password: string;
  /** AccelQ data param: productCategory */
  productCategory: string;
  /** AccelQ data param: productSubCategory */
  productSubCategory: string;
  /** AccelQ data param: uRL */
  uRL: string;
}

/** Default (placeholder) test data — override per-test as needed */
export const promotionsDefaultData: PromotionsTestData = {
  deliveryPinCode: '2000',
  email: 'test@example.com',
  orderQuantity: '1',
  password: 'Test@1234',
  productCategory: 'Refrigeration',
  productSubCategory: 'Refrigeration',
  uRL: 'https://fisherpaykel.com',
};
