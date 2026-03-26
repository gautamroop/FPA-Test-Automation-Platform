/**
 * Test data fixtures for AccelQ AgencyTpp scenarios.
 * These params are referenced in the spec files as data.<paramName>.
 * Replace placeholder values with real test data before running.
 */

export interface AgencyTppTestData {
  /** AccelQ data param: addToCart */
  addToCart: string;
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
  /** AccelQ data param: orderQuantity */
  orderQuantity: string;
  /** AccelQ data param: password */
  password: string;
  /** AccelQ data param: paymentType */
  paymentType: string;
  /** AccelQ data param: productType */
  productType: string;
  /** AccelQ data param: quoteNumber */
  quoteNumber: string;
  /** AccelQ data param: saveAsAQuote */
  saveAsAQuote: string;
  /** AccelQ data param: securityCode */
  securityCode: string;
  /** AccelQ data param: state */
  state: string;
  /** AccelQ data param: tPPType */
  tPPType: string;
  /** AccelQ data param: townCity */
  townCity: string;
  /** AccelQ data param: uRL */
  uRL: string;
}

/** Default (placeholder) test data — override per-test as needed */
export const agency_tppDefaultData: AgencyTppTestData = {
  addToCart: 'true',
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
  orderQuantity: '1',
  password: 'Test@1234',
  paymentType: 'Credit Card',
  productType: 'Agency',
  quoteNumber: 'QT-00001',
  saveAsAQuote: 'QT-00001',
  securityCode: '123',
  state: 'NSW',
  tPPType: 'Agency',
  townCity: 'Sydney',
  uRL: 'https://fisherpaykel.com',
};
