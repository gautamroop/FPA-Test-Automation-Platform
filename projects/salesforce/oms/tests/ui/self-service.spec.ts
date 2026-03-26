import { test, expect } from '@playwright/test';
import { config } from '@core/config';
import { flags } from '@core/config/featureFlags';
import { FPBookServicePage } from '../../pages/fp-book-service.page';
import { FPHomePage } from '../../pages/fp-home.page';
import { FPProductRegistrationPage } from '../../pages/fp-product-registration.page';
import { InitPage } from '../../pages/init.page';

/**
 * AccelQ Migration — Self Service Scenarios
 * Source: AccelQ Project FisherAndPaykelProject
 * Total scenarios in this group: 2
 *
 * NOTE: Page object methods still throw 'Not yet implemented'.
 * Implement locators in the contexts/ files, then remove this note.
 */
test.describe('@salesforce @regression AccelQ | Self Service', () => {
  test.skip(!flags.orderFlow, 'Feature flag orderFlow is disabled');

  /**
   * AccelQ Scenario: S-182
   * Original name: Book a Service Online
   * Steps: 10
   */
  test('@smoke Book a Service Online', async ({ page }) => {
    // Data placeholder — replace with fixture or test.use() data
    const data: Record<string, string> = {};

    const initPage = new InitPage(page);
    const fpHome = new FPHomePage(page);
    const fpBookService = new FPBookServicePage(page);

    // Step 1: Invoke Browser (CMP-282) [ctx: Init Page]
    await initPage.invokeBrowser(data.uRL);

    // Step 2: Validate and Accept Cookies (CMP-291) [ctx: F&P Home Page]
    await fpHome.validateAndAcceptCookies();

    // Step 3: Navigate to Help and Support and Select Book Online (CMP-1337) [ctx: F&P Home Page]
    await fpHome.navigateToHelpAndSupportAndSelectBookOnline();

    // Step 4: Search and Select a Service Address (CMP-1319) [ctx: Book a Service]
    await fpBookService.searchAndSelectAServiceAddress(data.param43Meadway);

    // Step 5: Select a Product and Click at Continue (CMP-1321) [ctx: Book a Service]
    await fpBookService.selectAProductAndClickAtContinue(data.productType);

    // Step 6: Select Service Time and Proceed with Book Now (CMP-1322) [ctx: Book a Service]
    await fpBookService.selectServiceTimeAndProceedWithBookNow();

    // Step 7: Provide Customer details (CMP-1323) [ctx: Book a Service]
    await fpBookService.provideCustomerDetails(data.firstName, data.lastName, data.mobileNumber, data.emailAddress);

    // Step 8: Provide a description that fits the problem with your appliance (CMP-1324) [ctx: Book a Service]
    await fpBookService.provideADescriptionThatFitsTheProblemWithYourAppliance(data.pleaseSelectADescriptionThatFitsTheProblemWithYourAppliance, data.pleaseProvideALittleMoreDetailOfTheIssueWithYourAppliance);

    // Step 9: Confirm the Booking (CMP-1325) [ctx: Book a Service]
    await fpBookService.confirmTheBooking();

    // Step 10: Validate Booking and Get Booking Details (CMP-1330) [ctx: Book a Service]
    const validateBookingAndGetBookingDetailsResult = await fpBookService.validateBookingAndGetBookingDetails(data.n, data.initialCustomDateFormat);
  });

  /**
   * AccelQ Scenario: S-187
   * Original name: Register Your Product
   * Steps: 7
   */
  test('@smoke Register Your Product', async ({ page }) => {
    // Data placeholder — replace with fixture or test.use() data
    const data: Record<string, string> = {};

    const initPage = new InitPage(page);
    const fpHome = new FPHomePage(page);
    const fpProductReg = new FPProductRegistrationPage(page);

    // Step 1: Invoke Browser (CMP-282) [ctx: Init Page]
    await initPage.invokeBrowser(data.uRL);

    // Step 2: Validate and Accept Cookies (CMP-291) [ctx: F&P Home Page]
    await fpHome.validateAndAcceptCookies();

    // Step 3: Navigate to Help and Support and Select Register your Product (CMP-1353) [ctx: F&P Home Page]
    await fpHome.navigateToHelpAndSupportAndSelectRegisterYourProduct();

    // Step 4: Provide customer Details (CMP-1354) [ctx: Product Registration]
    await fpProductReg.provideCustomerDetails(data.firstName, data.lastName, data.email, data.mobileCellNumber, data.address);

    // Step 5: Provide Purchase info (CMP-1355) [ctx: Product Registration]
    await fpProductReg.providePurchaseInfo();

    // Step 6: Provide Product info and Proceed (CMP-1357) [ctx: Product Registration]
    await fpProductReg.provideProductInfoAndProceed(data.selectHowManyProductsYouWantToRegister, data.productType, data.productCodeSKU);

    // Step 7: Validate Product is Registered (CMP-1358) [ctx: Product Registration]
    await fpProductReg.validateProductIsRegistered(data.successMessage);
  });

});
