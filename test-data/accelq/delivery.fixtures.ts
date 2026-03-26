/**
 * Test data fixtures for AccelQ Delivery scenarios.
 * These params are referenced in the spec files as data.<paramName>.
 * Replace placeholder values with real test data before running.
 */

export interface DeliveryTestData {
  /** AccelQ data param: addressLine1 */
  addressLine1: string;
  /** AccelQ data param: addressLine2 */
  addressLine2: string;
  /** AccelQ data param: addressType */
  addressType: string;
  /** AccelQ data param: cardNumber */
  cardNumber: string;
  /** AccelQ data param: deliveryPinCode */
  deliveryPinCode: string;
  /** AccelQ data param: depositAmount */
  depositAmount: string;
  /** AccelQ data param: email */
  email: string;
  /** AccelQ data param: expiryDate */
  expiryDate: string;
  /** AccelQ data param: newDeliveryDate */
  newDeliveryDate: string;
  /** AccelQ data param: orderDUNumber */
  orderDUNumber: string;
  /** AccelQ data param: orderQuantity */
  orderQuantity: string;
  /** AccelQ data param: password */
  password: string;
  /** AccelQ data param: paymentType */
  paymentType: string;
  /** AccelQ data param: productCategory */
  productCategory: string;
  /** AccelQ data param: productSubCategory */
  productSubCategory: string;
  /** AccelQ data param: sFMFASecretKey */
  sFMFASecretKey: string;
  /** AccelQ data param: sFPassword */
  sFPassword: string;
  /** AccelQ data param: sFUsername */
  sFUsername: string;
  /** AccelQ data param: securityCode */
  securityCode: string;
  /** AccelQ data param: state */
  state: string;
  /** AccelQ data param: townCity */
  townCity: string;
  /** AccelQ data param: uRL */
  uRL: string;
  /** AccelQ data param: updatedDeliveryDate */
  updatedDeliveryDate: string;
}

/** Default (placeholder) test data — override per-test as needed */
export const deliveryDefaultData: DeliveryTestData = {
  addressLine1: '1 Test Street',
  addressLine2: 'Level 1',
  addressType: 'Home',
  cardNumber: '4111111111111111',
  deliveryPinCode: '2000',
  depositAmount: '100',
  email: 'test@example.com',
  expiryDate: '12/26',
  newDeliveryDate: '2026-12-01',
  orderDUNumber: 'ORD-00001',
  orderQuantity: '1',
  password: 'Test@1234',
  paymentType: 'Credit Card',
  productCategory: 'Refrigeration',
  productSubCategory: 'Refrigeration',
  sFMFASecretKey: 'test.user@fisherpaykel.com',
  sFPassword: 'Test@1234',
  sFUsername: 'test.user@fisherpaykel.com',
  securityCode: '123',
  state: 'NSW',
  townCity: 'Sydney',
  uRL: 'https://fisherpaykel.com',
  updatedDeliveryDate: '2026-12-01',
};
