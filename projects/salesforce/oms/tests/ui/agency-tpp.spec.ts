import { test, expect } from '@playwright/test';
import { config } from '@core/config';
import { flags } from '@core/config/featureFlags';
import { FPCheckoutPage } from '../../pages/fp-checkout.page';
import { FPPaymentPage } from '../../pages/fp-payment.page';
import { InitPage } from '../../pages/init.page';
import { TppAgencyOrderPage } from '../../pages/tpp-agency-order.page';
import { TppCustomerDetailsPage } from '../../pages/tpp-customer-details.page';
import { TppHomePage } from '../../pages/tpp-home.page';
import { TppLoginPage } from '../../pages/tpp-login.page';
import { TppProductsPage } from '../../pages/tpp-products.page';
import { TppViewQuotesPage } from '../../pages/tpp-view-quotes.page';

/**
 * AccelQ Migration — Agency TPP Scenarios
 * Source: AccelQ Project FisherAndPaykelProject
 * Total scenarios in this group: 3
 *
 * NOTE: Page object methods still throw 'Not yet implemented'.
 * Implement locators in the contexts/ files, then remove this note.
 */
test.describe('@salesforce @regression AccelQ | Agency TPP', () => {
  test.skip(!flags.orderFlow, 'Feature flag orderFlow is disabled');

  /**
   * AccelQ Scenario: S-112
   * Original name: TPP - Save or Generate Quote
   * Steps: 7
   */
  test('@smoke TPP - Save or Generate Quote', async ({ page }) => {
    // Data placeholder — replace with fixture or test.use() data
    const data: Record<string, string> = {};

    const initPage = new InitPage(page);
    const tppLogin = new TppLoginPage(page);
    const tppHome = new TppHomePage(page);
    const tppAgencyOrder = new TppAgencyOrderPage(page);
    const tppProducts = new TppProductsPage(page);

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

    // Step 7: Verify Quote is Generated (CMP-680) [ctx: TPP Home Page]
    await tppHome.verifyQuoteIsGenerated(selectTPPProductAndAddToCartResult['Quote Number']);
  });

  /**
   * AccelQ Scenario: S-113
   * Original name: TPP - Convert Quote to Order
   * Steps: 8
   */
  test('@smoke TPP - Convert Quote to Order', async ({ page }) => {
    // Data placeholder — replace with fixture or test.use() data
    const data: Record<string, string> = {};

    const initPage = new InitPage(page);
    const tppLogin = new TppLoginPage(page);
    const tppHome = new TppHomePage(page);
    const tppViewQuotes = new TppViewQuotesPage(page);
    const tppCustomerDetails = new TppCustomerDetailsPage(page);
    const fpPayment = new FPPaymentPage(page);
    const fpCheckout = new FPCheckoutPage(page);

    // Step 1: Invoke Browser (CMP-282) [ctx: Init Page]
    await initPage.invokeBrowser(data.uRL);

    // Step 2: Login to Trade Portal (CMP-591) [ctx: TPP Login Page]
    await tppLogin.loginToTradePortal(data.email, data.password);

    // Step 3: Navigate to Agency Quotes (CMP-682) [ctx: TPP Home Page]
    await tppHome.navigateToAgencyQuotes();

    // Step 4: View & Verify Quote (CMP-683) [ctx: TPP View Quotes Page]
    await tppViewQuotes.viewVerifyQuote(data.quoteNumber);

    // Step 5: TPP - Convert Quote to Order (CMP-684) [ctx: TPP View Quotes Page]
    await tppViewQuotes.tPPConvertQuoteToOrder();

    // Step 6: TPP Populate Customer and Delivery Details (CMP-660) [ctx: TPP Customer Details Page]
    const tPPPopulateCustomerAndDeliveryDetailsResult = await tppCustomerDetails.tPPPopulateCustomerAndDeliveryDetails(data.addressType, data.addressLine1, data.addressLine2, data.state, data.townCity, data.deliveryTo, data.emailAddress);

    // Step 7: Select type of payment and place order  (CMP-347) [ctx: F&P Order Payment DetailsPage]
    const selectTypeOfPaymentAndPlaceOrderResult = await fpPayment.selectTypeOfPaymentAndPlaceOrder(data.cardNumber, data.expiryDate, data.securityCode, data.paymentType, data.depositAmount);

    // Step 8: Place Order and Get Order Details  (CMP-349) [ctx: F&P Final Checkout Page]
    const placeOrderAndGetOrderDetailsResult = await fpCheckout.placeOrderAndGetOrderDetails();
  });

  /**
   * AccelQ Scenario: S-149
   * Original name: Draft | TPP - Save or Generate Quote
   * Steps: 9
   */
  test('@smoke Draft | TPP - Save or Generate Quote', async ({ page }) => {
    // Data placeholder — replace with fixture or test.use() data
    const data: Record<string, string> = {};

    const initPage = new InitPage(page);
    const tppLogin = new TppLoginPage(page);
    const tppHome = new TppHomePage(page);
    const tppAgencyOrder = new TppAgencyOrderPage(page);
    const tppProducts = new TppProductsPage(page);
    const tppViewQuotes = new TppViewQuotesPage(page);

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

    // Step 7: Verify Quote is Generated (CMP-680) [ctx: TPP Home Page]
    await tppHome.verifyQuoteIsGenerated(selectTPPProductAndAddToCartResult['Quote Number']);

    // Step 8: TPP - Convert Quote to Order (CMP-684) [ctx: TPP View Quotes Page]
    await tppViewQuotes.tPPConvertQuoteToOrder();

    // Step 9: View Order (CMP-1978) [ctx: TPP Home Page]
    await tppHome.viewOrder();
  });

});
