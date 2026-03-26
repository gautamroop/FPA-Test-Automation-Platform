/**
 * Test data fixtures for AccelQ OrderCreation scenarios.
 * These params are referenced in the spec files as data.<paramName>.
 * Replace placeholder values with real test data before running.
 */

export interface OrderCreationTestData {
  /** AccelQ data param: addToCart */
  addToCart: string;
  /** AccelQ data param: address */
  address: string;
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
  /** AccelQ data param: deliveryTo */
  deliveryTo: string;
  /** AccelQ data param: depositAmount */
  depositAmount: string;
  /** AccelQ data param: email */
  email: string;
  /** AccelQ data param: emailAddress */
  emailAddress: string;
  /** AccelQ data param: expiryDate */
  expiryDate: string;
  /** AccelQ data param: fixedTextLength */
  fixedTextLength: string;
  /** AccelQ data param: iConfirmIHaveCollectedTheFollowingAmount */
  iConfirmIHaveCollectedTheFollowingAmount: string;
  /** AccelQ data param: itemName */
  itemName: string;
  /** AccelQ data param: itemQty */
  itemQty: string;
  /** AccelQ data param: mSDCardNumber */
  mSDCardNumber: string;
  /** AccelQ data param: newDeliveryDate */
  newDeliveryDate: string;
  /** AccelQ data param: orderDUNumber */
  orderDUNumber: string;
  /** AccelQ data param: orderQuantity */
  orderQuantity: string;
  /** AccelQ data param: orderedDate */
  orderedDate: string;
  /** AccelQ data param: password */
  password: string;
  /** AccelQ data param: paymentType */
  paymentType: string;
  /** AccelQ data param: phoneNumber */
  phoneNumber: string;
  /** AccelQ data param: prefix */
  prefix: string;
  /** AccelQ data param: productCategory */
  productCategory: string;
  /** AccelQ data param: productSubCategory */
  productSubCategory: string;
  /** AccelQ data param: productType */
  productType: string;
  /** AccelQ data param: sFMFASecretKey */
  sFMFASecretKey: string;
  /** AccelQ data param: sFPassword */
  sFPassword: string;
  /** AccelQ data param: sFUsername */
  sFUsername: string;
  /** AccelQ data param: saveAsAQuote */
  saveAsAQuote: string;
  /** AccelQ data param: securityCode */
  securityCode: string;
  /** AccelQ data param: state */
  state: string;
  /** AccelQ data param: suffix */
  suffix: string;
  /** AccelQ data param: tPPType */
  tPPType: string;
  /** AccelQ data param: total */
  total: string;
  /** AccelQ data param: townCity */
  townCity: string;
  /** AccelQ data param: uRL */
  uRL: string;
  /** AccelQ data param: updatedDeliveryDate */
  updatedDeliveryDate: string;
}

/** Default (placeholder) test data — override per-test as needed */
export const order_creationDefaultData: OrderCreationTestData = {
  addToCart: 'true',
  address: 'true',
  addressLine1: '1 Test Street',
  addressLine2: 'Level 1',
  addressType: 'Home',
  cardNumber: '4111111111111111',
  deliveryPinCode: '2000',
  deliveryTo: '',
  depositAmount: '100',
  email: 'test@example.com',
  emailAddress: 'test@example.com',
  expiryDate: '12/26',
  fixedTextLength: '10',
  iConfirmIHaveCollectedTheFollowingAmount: '1500.00',
  itemName: '',
  itemQty: '1',
  mSDCardNumber: '4111111111111111',
  newDeliveryDate: '2026-12-01',
  orderDUNumber: 'ORD-00001',
  orderQuantity: '1',
  orderedDate: '2026-12-01',
  password: 'Test@1234',
  paymentType: 'Credit Card',
  phoneNumber: '+61400000000',
  prefix: 'Mr',
  productCategory: 'Refrigeration',
  productSubCategory: 'Refrigeration',
  productType: 'Agency',
  sFMFASecretKey: 'test.user@fisherpaykel.com',
  sFPassword: 'Test@1234',
  sFUsername: 'test.user@fisherpaykel.com',
  saveAsAQuote: 'QT-00001',
  securityCode: '123',
  state: 'NSW',
  suffix: 'Mr',
  tPPType: 'Agency',
  total: '1500.00',
  townCity: 'Sydney',
  uRL: 'https://fisherpaykel.com',
  updatedDeliveryDate: '2026-12-01',
};
