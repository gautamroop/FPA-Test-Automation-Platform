import { test, expect } from '@playwright/test';
import { config } from '@core/config';
import { flags } from '@core/config/featureFlags';
import { FPCheckoutPage } from '../../pages/fp-checkout.page';
import { FPHomePage } from '../../pages/fp-home.page';
import { FPLoginPage } from '../../pages/fp-login.page';
import { FPOrderDetailsPage } from '../../pages/fp-order-details.page';
import { FPPaymentPage } from '../../pages/fp-payment.page';
import { FPProductsPage } from '../../pages/fp-products.page';
import { InitPage } from '../../pages/init.page';
import { SalesforceHomePage } from '../../pages/salesforce-home.page';
import { SalesforceLoginPage } from '../../pages/salesforce-login.page';
import { SalesforceOrderDetailsPage } from '../../pages/salesforce-order-details.page';
import { SalesforceOrderSummaryPage } from '../../pages/salesforce-order-summary.page';

/**
 * AccelQ Migration — Delivery Scenarios
 * Source: AccelQ Project FisherAndPaykelProject
 * Total scenarios in this group: 4
 *
 * NOTE: Page object methods still throw 'Not yet implemented'.
 * Implement locators in the contexts/ files, then remove this note.
 */
test.describe('@salesforce @regression AccelQ | Delivery', () => {
  test.skip(!flags.orderFlow, 'Feature flag orderFlow is disabled');

  /**
   * AccelQ Scenario: S-60
   * Original name: Validate GOP dates populated under shipping details section
   * Steps: 4
   */
  test('@smoke Validate GOP dates populated under shipping details section', async ({ page }) => {
    // Data placeholder — replace with fixture or test.use() data
    const data: Record<string, string> = {};

    const initPage = new InitPage(page);
    const sfLogin = new SalesforceLoginPage(page);
    const sfHome = new SalesforceHomePage(page);
    const sfOrderDetails = new SalesforceOrderDetailsPage(page);

    // Step 1: Invoke Browser (CMP-282) [ctx: Init Page]
    await initPage.invokeBrowser(data.uRL);

    // Step 2: Login to Salesforce (CMP-350) [ctx: Salesforce Login Page]
    await sfLogin.loginToSalesforce(data.sFUsername, data.sFPassword, data.sFMFASecretKey);

    // Step 3: Search and View Details (CMP-351) [ctx: Salesforce Home Page]
    await sfHome.searchAndViewDetails(data.orderDUNumber);

    // Step 4: Check GOP Date is Populated (CMP-367) [ctx: Salesforce Order Details Page]
    const checkGOPDateIsPopulatedResult = await sfOrderDetails.checkGOPDateIsPopulated();
  });

  /**
   * AccelQ Scenario: S-88
   * Original name: Update Order Delivery Date and Verify
   * Steps: 5
   */
  test('@smoke Update Order Delivery Date and Verify', async ({ page }) => {
    // Data placeholder — replace with fixture or test.use() data
    const data: Record<string, string> = {};

    const initPage = new InitPage(page);
    const sfLogin = new SalesforceLoginPage(page);
    const sfHome = new SalesforceHomePage(page);
    const sfOrderDetails = new SalesforceOrderDetailsPage(page);
    const sfOrderSummary = new SalesforceOrderSummaryPage(page);

    // Step 1: Invoke Browser (CMP-282) [ctx: Init Page]
    await initPage.invokeBrowser(data.uRL);

    // Step 2: Login to Salesforce (CMP-350) [ctx: Salesforce Login Page]
    await sfLogin.loginToSalesforce(data.sFUsername, data.sFPassword, data.sFMFASecretKey);

    // Step 3: Search and View Details (CMP-351) [ctx: Salesforce Home Page]
    await sfHome.searchAndViewDetails(data.orderDUNumber);

    // Step 4: Update Requested Delivery Date (CMP-510) [ctx: Salesforce Order Details Page]
    const updateRequestedDeliveryDateResult = await sfOrderDetails.updateRequestedDeliveryDate(data.newDeliveryDate);

    // Step 5: Verify Updated Delivery Date (CMP-511) [ctx: Salesforce Order Summary Details Page]
    await sfOrderSummary.verifyUpdatedDeliveryDate(updateRequestedDeliveryDateResult['Updated Delivery Date']);
  });

  /**
   * AccelQ Scenario: S-97
   * Original name: WO/SA creation if GOP is less than 14 days
   * Steps: 13
   */
  test('@smoke WO/SA creation if GOP is less than 14 days', async ({ page }) => {
    // Data placeholder — replace with fixture or test.use() data
    const data: Record<string, string> = {};

    const initPage = new InitPage(page);
    const fpHome = new FPHomePage(page);
    const fpLogin = new FPLoginPage(page);
    const fpProducts = new FPProductsPage(page);
    const fpOrderDetails = new FPOrderDetailsPage(page);
    const fpPayment = new FPPaymentPage(page);
    const fpCheckout = new FPCheckoutPage(page);
    const sfLogin = new SalesforceLoginPage(page);
    const sfHome = new SalesforceHomePage(page);
    const sfOrderDetails = new SalesforceOrderDetailsPage(page);

    // Step 1: Invoke Browser (CMP-282) [ctx: Init Page]
    await initPage.invokeBrowser(data.uRL);

    // Step 2: Validate and Accept Cookies (CMP-291) [ctx: F&P Home Page]
    await fpHome.validateAndAcceptCookies();

    // Step 3: User Login (CMP-292) [ctx: F&P Login Page]
    await fpLogin.userLogin(data.email, data.password);

    // Step 4: Navigate to Product Type and Select Product Style (CMP-337) [ctx: F&P Home Page]
    await fpHome.navigateToProductTypeAndSelectProductStyle(data.productCategory, data.productSubCategory);

    // Step 5: Select In Stock Product (CMP-613) [ctx: F&P Products Page]
    await fpProducts.selectInStockProduct();

    // Step 6: Select the Product and Add to Cart (CMP-338) [ctx: F&P Products Page]
    const selectTheProductAndAddToCartResult = await fpProducts.selectTheProductAndAddToCart(data.deliveryPinCode, data.orderQuantity);

    // Step 7: Populate Customer and Delivery Details  (CMP-343) [ctx: F&P Order Details Page]
    const populateCustomerAndDeliveryDetailsResult = await fpOrderDetails.populateCustomerAndDeliveryDetails(data.addressType, data.addressLine1, data.addressLine2, data.state, data.townCity);

    // Step 8: Select type of payment and place order  (CMP-347) [ctx: F&P Order Payment DetailsPage]
    const selectTypeOfPaymentAndPlaceOrderResult = await fpPayment.selectTypeOfPaymentAndPlaceOrder(data.cardNumber, data.expiryDate, data.securityCode, data.paymentType, data.depositAmount);

    // Step 9: Place Order and Get Order Details  (CMP-349) [ctx: F&P Final Checkout Page]
    const placeOrderAndGetOrderDetailsResult = await fpCheckout.placeOrderAndGetOrderDetails();

    // Step 10: Invoke Browser (CMP-282) [ctx: Init Page]
    await initPage.invokeBrowser(data.uRL);

    // Step 11: Login to Salesforce (CMP-350) [ctx: Salesforce Login Page]
    await sfLogin.loginToSalesforce(data.sFUsername, data.sFPassword, data.sFMFASecretKey);

    // Step 12: Search and View Details (CMP-351) [ctx: Salesforce Home Page]
    await sfHome.searchAndViewDetails(placeOrderAndGetOrderDetailsResult['Order DU Number']);

    // Step 13: Verify GOP is created for less than 14 days  (CMP-605) [ctx: Salesforce Order Details Page]
    await sfOrderDetails.verifyGOPIsCreatedForLessThan14Days();
  });

  /**
   * AccelQ Scenario: S-100
   * Original name: Verify Delivery instruction checkboxes carried over to new FO after every order change
   * Steps: 4
   */
  test('@smoke Verify Delivery instruction checkboxes carried over to new FO after every order change', async ({ page }) => {
    // Data placeholder — replace with fixture or test.use() data
    const data: Record<string, string> = {};

    const initPage = new InitPage(page);
    const sfLogin = new SalesforceLoginPage(page);
    const sfHome = new SalesforceHomePage(page);
    const sfOrderDetails = new SalesforceOrderDetailsPage(page);

    // Step 1: Invoke Browser (CMP-282) [ctx: Init Page]
    await initPage.invokeBrowser(data.uRL);

    // Step 2: Login to Salesforce (CMP-350) [ctx: Salesforce Login Page]
    await sfLogin.loginToSalesforce(data.sFUsername, data.sFPassword, data.sFMFASecretKey);

    // Step 3: Search and View Details (CMP-351) [ctx: Salesforce Home Page]
    await sfHome.searchAndViewDetails(data.orderDUNumber);

    // Step 4: Update Delivery Instruction checkbox  (CMP-687) [ctx: Salesforce Order Details Page]
    await sfOrderDetails.updateDeliveryInstructionCheckbox();
  });

});
