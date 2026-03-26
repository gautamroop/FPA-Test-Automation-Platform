/**
 * AccelQ Migration — Reusable Actions / Components Index
 * Source: AccelQ Project FisherAndPaykelProject
 * Total actions: 25
 *
 * In AccelQ, "components" are reusable action sequences (like Playwright fixtures).
 * Each action is listed here with its owning context, parameter counts, and migration status.
 * Implement each as a Playwright helper/fixture in the corresponding page object.
 */

export const ACCELQ_ACTIONS = {
  // CMP-615: Cancel the Item and Verify Additional Charges also Cancelled
  // Context: Salesforce Order Details Page | in=0 out=2
  CANCEL_THE_ITEM_AND_VERIFY_ADDITIONAL_CHARGES_ALSO_CANCELLED: 'CMP-615',

  // CMP-374: Verify Fulfilment Order
  // Context: Salesforce Order Details Page | in=0 out=0
  VERIFY_FULFILMENT_ORDER: 'CMP-374',

  // CMP-501: Verify Refund Amount After Order Cancel
  // Context: F&P Order Details Page | in=2 out=0
  VERIFY_REFUND_AMOUNT_AFTER_ORDER_CANCEL: 'CMP-501',

  // CMP-597: Navigate to Fulfillment and Create Invoice
  // Context: Salesforce Order Details Page | in=1 out=1
  NAVIGATE_TO_FULFILLMENT_AND_CREATE_INVOICE: 'CMP-597',

  // CMP-343: Populate Customer and Delivery Details
  // Context: F&P Order Details Page | in=5 out=4
  POPULATE_CUSTOMER_AND_DELIVERY_DETAILS: 'CMP-343',

  // CMP-338: Select the Product and Add to Cart
  // Context: F&P Products Page | in=2 out=1
  SELECT_THE_PRODUCT_AND_ADD_TO_CART: 'CMP-338',

  // CMP-637: Generate Payment Link
  // Context: Salesforce Order Details Page | in=1 out=0
  GENERATE_PAYMENT_LINK: 'CMP-637',

  // CMP-632: Verify Order Payment Response
  // Context: Salesforce Order Details Page | in=0 out=0
  VERIFY_ORDER_PAYMENT_RESPONSE: 'CMP-632',

  // CMP-510: Update Requested Delivery Date
  // Context: Salesforce Order Details Page | in=1 out=1
  UPDATE_REQUESTED_DELIVERY_DATE: 'CMP-510',

  // CMP-687: Update Delivery Instruction checkbox
  // Context: Salesforce Order Details Page | in=0 out=0
  UPDATE_DELIVERY_INSTRUCTION_CHECKBOX: 'CMP-687',

  // CMP-398: Full Cancel the Order and Verify
  // Context: Salesforce Order Details Page | in=0 out=2
  FULL_CANCEL_THE_ORDER_AND_VERIFY: 'CMP-398',

  // CMP-354: Verify Order Details on SF
  // Context: Salesforce Order Details Page | in=7 out=1
  VERIFY_ORDER_DETAILS_ON_SF: 'CMP-354',

  // CMP-1793: Select Product and Checkout
  // Context: MSD Product Listing page | in=0 out=0
  SELECT_PRODUCT_AND_CHECKOUT: 'CMP-1793',

  // CMP-511: Verify Updated Delivery Date
  // Context: Salesforce Order Summary Details Page | in=1 out=0
  VERIFY_UPDATED_DELIVERY_DATE: 'CMP-511',

  // CMP-367: Check GOP Date is Populated
  // Context: Salesforce Order Details Page | in=0 out=1
  CHECK_GOP_DATE_IS_POPULATED: 'CMP-367',

  // CMP-385: Add item to the order and Verify
  // Context: Salesforce Order Details Page | in=3 out=1
  ADD_ITEM_TO_THE_ORDER_AND_VERIFY: 'CMP-385',

  // CMP-608: Swap Item to the Order and Verify
  // Context: Salesforce Order Details Page | in=1 out=1
  SWAP_ITEM_TO_THE_ORDER_AND_VERIFY: 'CMP-608',

  // CMP-349: Place Order and Get Order Details
  // Context: F&P Final Checkout Page | in=0 out=11
  PLACE_ORDER_AND_GET_ORDER_DETAILS: 'CMP-349',

  // CMP-350: Login to Salesforce
  // Context: Salesforce Login Page | in=3 out=0
  LOGIN_TO_SALESFORCE: 'CMP-350',

  // CMP-1795: Place the Order and Get Order Details
  // Context: MSD Checkout page | in=0 out=0
  PLACE_THE_ORDER_AND_GET_ORDER_DETAILS: 'CMP-1795',

  // CMP-1796: Validate and Accept Cookies
  // Context: TPP MSD Portal page | in=0 out=0
  VALIDATE_AND_ACCEPT_COOKIES: 'CMP-1796',

  // CMP-1794: Provide MSD card and Confirm Payment with Agent
  // Context: MSD Payment info | in=2 out=0
  PROVIDE_MSD_CARD_AND_CONFIRM_PAYMENT_WITH_AGENT: 'CMP-1794',

  // CMP-684: TPP - Convert Quote to Order
  // Context: TPP View Quotes Page | in=0 out=0
  TPP___CONVERT_QUOTE_TO_ORDER: 'CMP-684',

  // CMP-1978: View Order
  // Context: TPP Home Page | in=0 out=0
  VIEW_ORDER: 'CMP-1978',

  // CMP-1791: Provide Customer and Delivery details
  // Context: MSD Customer info | in=5 out=0
  PROVIDE_CUSTOMER_AND_DELIVERY_DETAILS: 'CMP-1791',

} as const;

export type AccelQActionId = typeof ACCELQ_ACTIONS[keyof typeof ACCELQ_ACTIONS];
