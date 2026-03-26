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
import { MsdCheckoutPage } from '../../pages/msd-checkout.page';
import { MsdCustomerInfoPage } from '../../pages/msd-customer-info.page';
import { MsdPaymentInfoPage } from '../../pages/msd-payment-info.page';
import { MsdProductListingPage } from '../../pages/msd-product-listing.page';
import { SalesforceHomePage } from '../../pages/salesforce-home.page';
import { SalesforceLoginPage } from '../../pages/salesforce-login.page';
import { SalesforceOrderDetailsPage } from '../../pages/salesforce-order-details.page';
import { SalesforceOrderSummaryPage } from '../../pages/salesforce-order-summary.page';
import { TppAgencyOrderPage } from '../../pages/tpp-agency-order.page';
import { TppCustomerDetailsPage } from '../../pages/tpp-customer-details.page';
import { TppHomePage } from '../../pages/tpp-home.page';
import { TppLoginPage } from '../../pages/tpp-login.page';
import { TppMsdPortalPage } from '../../pages/tpp-msd-portal.page';
import { TppProductsPage } from '../../pages/tpp-products.page';

/**
 * AccelQ Migration — Order Creation Scenarios
 * Source: AccelQ Project FisherAndPaykelProject
 * Total scenarios in this group: 7
 *
 * NOTE: Page object methods still throw 'Not yet implemented'.
 * Implement locators in the contexts/ files, then remove this note.
 */
test.describe('@salesforce @regression AccelQ | Order Creation', () => {
  test.skip(!flags.orderFlow, 'Feature flag orderFlow is disabled');

  /**
   * AccelQ Scenario: S-35
   * Original name: End-to End | Order Creation and Validation in SF
   * Steps: 12
   */
  test('@smoke End-to End | Order Creation and Validation in SF', async ({ page }) => {
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

    // Step 5: Select the Product and Add to Cart (CMP-338) [ctx: F&P Products Page]
    const selectTheProductAndAddToCartResult = await fpProducts.selectTheProductAndAddToCart(data.deliveryPinCode, data.orderQuantity);

    // Step 6: Populate Customer and Delivery Details  (CMP-343) [ctx: F&P Order Details Page]
    const populateCustomerAndDeliveryDetailsResult = await fpOrderDetails.populateCustomerAndDeliveryDetails(data.addressType, data.addressLine1, data.addressLine2, data.state, data.townCity);

    // Step 7: Select type of payment and place order  (CMP-347) [ctx: F&P Order Payment DetailsPage]
    const selectTypeOfPaymentAndPlaceOrderResult = await fpPayment.selectTypeOfPaymentAndPlaceOrder(data.cardNumber, data.expiryDate, data.securityCode, data.paymentType, data.depositAmount);

    // Step 8: Place Order and Get Order Details  (CMP-349) [ctx: F&P Final Checkout Page]
    const placeOrderAndGetOrderDetailsResult = await fpCheckout.placeOrderAndGetOrderDetails();

    // Step 9: Invoke Browser (CMP-282) [ctx: Init Page]
    await initPage.invokeBrowser(data.uRL);

    // Step 10: Login to Salesforce (CMP-350) [ctx: Salesforce Login Page]
    await sfLogin.loginToSalesforce(data.sFUsername, data.sFPassword, data.sFMFASecretKey);

    // Step 11: Search and View Details (CMP-351) [ctx: Salesforce Home Page]
    await sfHome.searchAndViewDetails(placeOrderAndGetOrderDetailsResult['Order DU Number']);

    // Step 12: Verify Order Details on SF (CMP-354) [ctx: Salesforce Order Details Page]
    const verifyOrderDetailsOnSFResult = await sfOrderDetails.verifyOrderDetailsOnSF(placeOrderAndGetOrderDetailsResult['Order DU Number'], data.orderedDate, placeOrderAndGetOrderDetailsResult['Total'], populateCustomerAndDeliveryDetailsResult['Email Address'], populateCustomerAndDeliveryDetailsResult['Phone Number'], placeOrderAndGetOrderDetailsResult['Item Name'], data.itemQty);
  });

  /**
   * AccelQ Scenario: S-57
   * Original name: Create Ecommerce Order
   * Steps: 8
   */
  test('@smoke Create Ecommerce Order', async ({ page }) => {
    // Data placeholder — replace with fixture or test.use() data
    const data: Record<string, string> = {};

    const initPage = new InitPage(page);
    const fpHome = new FPHomePage(page);
    const fpLogin = new FPLoginPage(page);
    const fpProducts = new FPProductsPage(page);
    const fpOrderDetails = new FPOrderDetailsPage(page);
    const fpPayment = new FPPaymentPage(page);
    const fpCheckout = new FPCheckoutPage(page);

    // Step 1: Invoke Browser (CMP-282) [ctx: Init Page]
    await initPage.invokeBrowser(data.uRL);

    // Step 2: Validate and Accept Cookies (CMP-291) [ctx: F&P Home Page]
    await fpHome.validateAndAcceptCookies();

    // Step 3: User Login (CMP-292) [ctx: F&P Login Page]
    await fpLogin.userLogin(data.email, data.password);

    // Step 4: Navigate to Product Type and Select Product Style (CMP-337) [ctx: F&P Home Page]
    await fpHome.navigateToProductTypeAndSelectProductStyle(data.productCategory, data.productSubCategory);

    // Step 5: Select the Product and Add to Cart (CMP-338) [ctx: F&P Products Page]
    const selectTheProductAndAddToCartResult = await fpProducts.selectTheProductAndAddToCart(data.deliveryPinCode, data.orderQuantity);

    // Step 6: Populate Customer and Delivery Details  (CMP-343) [ctx: F&P Order Details Page]
    const populateCustomerAndDeliveryDetailsResult = await fpOrderDetails.populateCustomerAndDeliveryDetails(data.addressType, data.addressLine1, data.addressLine2, data.state, data.townCity);

    // Step 7: Select type of payment and place order  (CMP-347) [ctx: F&P Order Payment DetailsPage]
    const selectTypeOfPaymentAndPlaceOrderResult = await fpPayment.selectTypeOfPaymentAndPlaceOrder(data.cardNumber, data.expiryDate, data.securityCode, data.paymentType, data.depositAmount);

    // Step 8: Place Order and Get Order Details  (CMP-349) [ctx: F&P Final Checkout Page]
    const placeOrderAndGetOrderDetailsResult = await fpCheckout.placeOrderAndGetOrderDetails();
  });

  /**
   * AccelQ Scenario: S-61
   * Original name: Verify Fulfilment Order Creation
   * Steps: 4
   */
  test('@smoke Verify Fulfilment Order Creation', async ({ page }) => {
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

    // Step 4: Verify Fulfilment Order (CMP-374) [ctx: Salesforce Order Details Page]
    await sfOrderDetails.verifyFulfilmentOrder();
  });

  /**
   * AccelQ Scenario: S-62
   * Original name: Create Order and Verify Paid in Full-Checkbox
   * Steps: 12
   */
  test('@smoke Create Order and Verify Paid in Full-Checkbox', async ({ page }) => {
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

    // Step 5: Select the Product and Add to Cart (CMP-338) [ctx: F&P Products Page]
    const selectTheProductAndAddToCartResult = await fpProducts.selectTheProductAndAddToCart(data.deliveryPinCode, data.orderQuantity);

    // Step 6: Populate Customer and Delivery Details  (CMP-343) [ctx: F&P Order Details Page]
    const populateCustomerAndDeliveryDetailsResult = await fpOrderDetails.populateCustomerAndDeliveryDetails(data.addressType, data.addressLine1, data.addressLine2, data.state, data.townCity);

    // Step 7: Select type of payment and place order  (CMP-347) [ctx: F&P Order Payment DetailsPage]
    const selectTypeOfPaymentAndPlaceOrderResult = await fpPayment.selectTypeOfPaymentAndPlaceOrder(data.cardNumber, data.expiryDate, data.securityCode, data.paymentType, data.depositAmount);

    // Step 8: Place Order and Get Order Details  (CMP-349) [ctx: F&P Final Checkout Page]
    const placeOrderAndGetOrderDetailsResult = await fpCheckout.placeOrderAndGetOrderDetails();

    // Step 9: Invoke Browser (CMP-282) [ctx: Init Page]
    await initPage.invokeBrowser(data.uRL);

    // Step 10: Login to Salesforce (CMP-350) [ctx: Salesforce Login Page]
    await sfLogin.loginToSalesforce(data.sFUsername, data.sFPassword, data.sFMFASecretKey);

    // Step 11: Search and View Details (CMP-351) [ctx: Salesforce Home Page]
    await sfHome.searchAndViewDetails(placeOrderAndGetOrderDetailsResult['Order DU Number']);

    // Step 12: Verify Paid in Full-Checkbox (CMP-377) [ctx: Salesforce Order Details Page]
    await sfOrderDetails.verifyPaidInFullCheckbox(data.paymentType);
  });

  /**
   * AccelQ Scenario: S-85
   * Original name: End-to-End Order Creation and Validation - V2
   * Steps: 13
   */
  test('@smoke End-to-End Order Creation and Validation - V2', async ({ page }) => {
    // Data placeholder — replace with fixture or test.use() data
    const data: Record<string, string> = {};

    const initPage = new InitPage(page);
    const tppLogin = new TppLoginPage(page);
    const tppHome = new TppHomePage(page);
    const tppAgencyOrder = new TppAgencyOrderPage(page);
    const tppProducts = new TppProductsPage(page);
    const tppCustomerDetails = new TppCustomerDetailsPage(page);
    const fpPayment = new FPPaymentPage(page);
    const fpCheckout = new FPCheckoutPage(page);
    const sfLogin = new SalesforceLoginPage(page);
    const sfHome = new SalesforceHomePage(page);
    const sfOrderDetails = new SalesforceOrderDetailsPage(page);

    // Step 1: Invoke Browser (CMP-282) [ctx: Init Page]
    await initPage.invokeBrowser(data.uRL);

    // Step 2: Login to Trade Portal (CMP-591) [ctx: TPP Login Page]
    await tppLogin.loginToTradePortal(data.email, data.password);

    // Step 3: Navigate to New Agency Order (CMP-653) [ctx: TPP Home Page]
    await tppHome.navigateToNewAgencyOrder(data.tPPType);

    // Step 4: Validate and Accept Cookies (CMP-291) [ctx: TPP Agency Order Page]
    await tppAgencyOrder.validateAndAcceptCookies();

    // Step 5: Select TPP Product Type (CMP-655) [ctx: TPP Agency Order Page]
    await tppAgencyOrder.selectTPPProductType(data.productType);

    // Step 6: Select TPP Product and Add to cart  (CMP-656) [ctx: TPP Products Page]
    const selectTPPProductAndAddToCartResult = await tppProducts.selectTPPProductAndAddToCart(data.orderQuantity, data.deliveryPinCode, data.saveAsAQuote, data.addToCart, data.emailAddress);

    // Step 7: TPP Populate Customer and Delivery Details (CMP-660) [ctx: TPP Customer Details Page]
    const tPPPopulateCustomerAndDeliveryDetailsResult = await tppCustomerDetails.tPPPopulateCustomerAndDeliveryDetails(data.addressType, data.addressLine1, data.addressLine2, data.state, data.townCity, data.deliveryTo, data.emailAddress);

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

    // Step 13: Verify Order Details on SF (CMP-354) [ctx: Salesforce Order Details Page]
    const verifyOrderDetailsOnSFResult = await sfOrderDetails.verifyOrderDetailsOnSF(placeOrderAndGetOrderDetailsResult['Order DU Number'], data.orderedDate, placeOrderAndGetOrderDetailsResult['Total'], tPPPopulateCustomerAndDeliveryDetailsResult['Email Address'], tPPPopulateCustomerAndDeliveryDetailsResult['Phone Number'], placeOrderAndGetOrderDetailsResult['Item Name'], data.itemQty);
  });

  /**
   * AccelQ Scenario: S-87
   * Original name: Create Order and Update Delivery Date
   * Steps: 13
   */
  test('@smoke Create Order and Update Delivery Date', async ({ page }) => {
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
    const sfOrderSummary = new SalesforceOrderSummaryPage(page);

    // Step 1: Invoke Browser (CMP-282) [ctx: Init Page]
    await initPage.invokeBrowser(data.uRL);

    // Step 2: Validate and Accept Cookies (CMP-291) [ctx: F&P Home Page]
    await fpHome.validateAndAcceptCookies();

    // Step 3: User Login (CMP-292) [ctx: F&P Login Page]
    await fpLogin.userLogin(data.email, data.password);

    // Step 4: Navigate to Product Type and Select Product Style (CMP-337) [ctx: F&P Home Page]
    await fpHome.navigateToProductTypeAndSelectProductStyle(data.productCategory, data.productSubCategory);

    // Step 5: Select the Product and Add to Cart (CMP-338) [ctx: F&P Products Page]
    const selectTheProductAndAddToCartResult = await fpProducts.selectTheProductAndAddToCart(data.deliveryPinCode, data.orderQuantity);

    // Step 6: Populate Customer and Delivery Details  (CMP-343) [ctx: F&P Order Details Page]
    const populateCustomerAndDeliveryDetailsResult = await fpOrderDetails.populateCustomerAndDeliveryDetails(data.addressType, data.addressLine1, data.addressLine2, data.state, data.townCity);

    // Step 7: Select type of payment and place order  (CMP-347) [ctx: F&P Order Payment DetailsPage]
    const selectTypeOfPaymentAndPlaceOrderResult = await fpPayment.selectTypeOfPaymentAndPlaceOrder(data.cardNumber, data.expiryDate, data.securityCode, data.paymentType, data.depositAmount);

    // Step 8: Place Order and Get Order Details  (CMP-349) [ctx: F&P Final Checkout Page]
    const placeOrderAndGetOrderDetailsResult = await fpCheckout.placeOrderAndGetOrderDetails();

    // Step 9: Invoke Browser (CMP-282) [ctx: Init Page]
    await initPage.invokeBrowser(data.uRL);

    // Step 10: Login to Salesforce (CMP-350) [ctx: Salesforce Login Page]
    await sfLogin.loginToSalesforce(data.sFUsername, data.sFPassword, data.sFMFASecretKey);

    // Step 11: Search and View Details (CMP-351) [ctx: Salesforce Home Page]
    await sfHome.searchAndViewDetails(placeOrderAndGetOrderDetailsResult['Order DU Number']);

    // Step 12: Update Requested Delivery Date (CMP-510) [ctx: Salesforce Order Details Page]
    const updateRequestedDeliveryDateResult = await sfOrderDetails.updateRequestedDeliveryDate(data.newDeliveryDate);

    // Step 13: Verify Updated Delivery Date (CMP-511) [ctx: Salesforce Order Summary Details Page]
    await sfOrderSummary.verifyUpdatedDeliveryDate(updateRequestedDeliveryDateResult['Updated Delivery Date']);
  });

  /**
   * AccelQ Scenario: S-208
   * Original name: MSD Order Creation and Validation in SF
   * Steps: 9
   */
  test('@smoke MSD Order Creation and Validation in SF', async ({ page }) => {
    // Data placeholder — replace with fixture or test.use() data
    const data: Record<string, string> = {};

    const initPage = new InitPage(page);
    const tppLogin = new TppLoginPage(page);
    const tppMsdPortal = new TppMsdPortalPage(page);
    const msdProducts = new MsdProductListingPage(page);
    const msdCustomerInfo = new MsdCustomerInfoPage(page);
    const msdPaymentInfo = new MsdPaymentInfoPage(page);
    const msdCheckout = new MsdCheckoutPage(page);

    // Step 1: Invoke Browser (CMP-282) [ctx: Init Page]
    await initPage.invokeBrowser(data.uRL);

    // Step 2: Login to MSD Trade Portal (CMP-1662) [ctx: TPP Login Page]
    await tppLogin.loginToMSDTradePortal(data.email, data.password);

    // Step 3: Navigate to MSD Portal (CMP-1663) [ctx: TPP MSD Portal page]
    await tppMsdPortal.navigateToMSDPortal(data.tPPType);

    // Step 4: Validate and Accept Cookies (CMP-1796) [ctx: TPP MSD Portal page]
    await tppMsdPortal.validateAndAcceptCookies();

    // Step 5: Select Product and Checkout (CMP-1793) [ctx: MSD Product Listing page]
    await msdProducts.selectProductAndCheckout();

    // Step 6: Provide Customer and Delivery details (CMP-1791) [ctx: MSD Customer info]
    await msdCustomerInfo.provideCustomerAndDeliveryDetails(data.email, data.fixedTextLength, data.prefix, data.suffix, data.address);

    // Step 7: Provide MSD card and Confirm Payment with Agent (CMP-1794) [ctx: MSD Payment info]
    await msdPaymentInfo.provideMSDCardAndConfirmPaymentWithAgent(data.mSDCardNumber, data.iConfirmIHaveCollectedTheFollowingAmount);

    // Step 8: Place the Order and Get Order Details (CMP-1795) [ctx: MSD Checkout page]
    await msdCheckout.placeTheOrderAndGetOrderDetails();

    // Step 9: Invoke Browser (CMP-282) [ctx: Init Page]
    await initPage.invokeBrowser(data.uRL);
  });

});
