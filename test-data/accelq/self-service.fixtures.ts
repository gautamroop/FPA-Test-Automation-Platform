/**
 * Test data fixtures for AccelQ SelfService scenarios.
 * These params are referenced in the spec files as data.<paramName>.
 * Replace placeholder values with real test data before running.
 */

export interface SelfServiceTestData {
  /** AccelQ data param: address */
  address: string;
  /** AccelQ data param: email */
  email: string;
  /** AccelQ data param: emailAddress */
  emailAddress: string;
  /** AccelQ data param: firstName */
  firstName: string;
  /** AccelQ data param: initialCustomDateFormat */
  initialCustomDateFormat: string;
  /** AccelQ data param: lastName */
  lastName: string;
  /** AccelQ data param: mobileCellNumber */
  mobileCellNumber: string;
  /** AccelQ data param: mobileNumber */
  mobileNumber: string;
  /** AccelQ data param: n */
  n: string;
  /** AccelQ data param: param43Meadway */
  param43Meadway: string;
  /** AccelQ data param: pleaseProvideALittleMoreDetailOfTheIssueWithYourAppliance */
  pleaseProvideALittleMoreDetailOfTheIssueWithYourAppliance: string;
  /** AccelQ data param: pleaseSelectADescriptionThatFitsTheProblemWithYourAppliance */
  pleaseSelectADescriptionThatFitsTheProblemWithYourAppliance: string;
  /** AccelQ data param: productCodeSKU */
  productCodeSKU: string;
  /** AccelQ data param: productType */
  productType: string;
  /** AccelQ data param: selectHowManyProductsYouWantToRegister */
  selectHowManyProductsYouWantToRegister: string;
  /** AccelQ data param: successMessage */
  successMessage: string;
  /** AccelQ data param: uRL */
  uRL: string;
}

/** Default (placeholder) test data — override per-test as needed */
export const self_serviceDefaultData: SelfServiceTestData = {
  address: 'true',
  email: 'test@example.com',
  emailAddress: 'test@example.com',
  firstName: 'Test',
  initialCustomDateFormat: '2026-12-01',
  lastName: 'User',
  mobileCellNumber: '+61400000000',
  mobileNumber: '+61400000000',
  n: '',
  param43Meadway: '',
  pleaseProvideALittleMoreDetailOfTheIssueWithYourAppliance: '',
  pleaseSelectADescriptionThatFitsTheProblemWithYourAppliance: '',
  productCodeSKU: 'E522BRXFD_N',
  productType: 'Agency',
  selectHowManyProductsYouWantToRegister: '',
  successMessage: '',
  uRL: 'https://fisherpaykel.com',
};
