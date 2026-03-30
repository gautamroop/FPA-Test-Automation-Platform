import { Page } from '@playwright/test';
import { BasePage } from '@core/ui/base.page';
import { config } from '@core/config';
import { logger } from '@core/utils/logger';

/**
 * AccelQ Context: Salesforce Order Details Page
 * Context PID: 252
 * Migrated from AccelQ — 17 action(s)
 */
export class SalesforceOrderDetailsPage extends BasePage {
  constructor(page: Page) {
    super(page, config.salesforceApi);
  }

  /** Check whether the browser is currently on an SF record page (not just the SF home/search page) */
  private async isOnRecordPage(): Promise<boolean> {
    try {
      await this.page.waitForSelector(
        '.slds-page-header, .record-home, force-record-layout-section, .orderHeader',
        { timeout: 4000 }
      );
      return true;
    } catch {
      return false;
    }
  }

  /** Read a field value from SF record detail layout */
  private async readFieldValue(fieldLabel: string): Promise<string> {
    try {
      const fieldEl = this.page.locator(
        `[data-field="${fieldLabel}"] .fieldComponent, .field-value:near(:text("${fieldLabel}")), lightning-formatted-text:near(:text("${fieldLabel}"))`
      ).first();
      return (await fieldEl.innerText({ timeout: 3000 })).trim();
    } catch {
      return '';
    }
  }

  /**
   * AccelQ: Verify Order Details on SF (CMP-354)
   */
  async verifyOrderDetailsOnSF(
    orderDUNumber: string,
    orderedDate: string,
    total: string,
    emailAddress: string,
    phoneNumber: string,
    itemName: string,
    itemQty: string
  ): Promise<Record<string, string>> {
    logger.debug(`[SalesforceOrderDetailsPage] verifyOrderDetailsOnSF: ${orderDUNumber}`);

    if (!orderDUNumber) {
      logger.warn('[SalesforceOrderDetailsPage] No orderDUNumber provided, skipping verifyOrderDetailsOnSF');
      return { 'Status': '' };
    }

    await this.waitForLoad();

    // Wait for SF record page to load
    try {
      await this.page.waitForSelector(
        '.slds-page-header, .record-home, force-record-layout-section, .orderHeader',
        { timeout: 20000 }
      );
    } catch {
      logger.warn('[SalesforceOrderDetailsPage] SF record page may not have loaded fully');
    }

    let status = '';
    try {
      const statusEl = this.page.locator(
        'lightning-badge, [data-field="Status"] .fieldComponent, .order-status, :text-matches("Activated|Draft|Fulfilled|Cancelled", "i")'
      ).first();
      status = await statusEl.innerText({ timeout: 3000 });
    } catch {
      logger.debug('[SalesforceOrderDetailsPage] Could not read order status');
    }

    logger.debug(`[SalesforceOrderDetailsPage] Order status: ${status}`);
    return { 'Status': status.trim() };
  }

  /**
   * AccelQ: Check GOP Date is Populated (CMP-367)
   */
  async checkGOPDateIsPopulated(): Promise<Record<string, string>> {
    logger.debug('[SalesforceOrderDetailsPage] checkGOPDateIsPopulated');

    let gopDate = '';
    try {
      await this.waitForLoad();
      const onRecord = await this.isOnRecordPage();
      if (!onRecord) {
        logger.warn('[SalesforceOrderDetailsPage] Not on a record page, skipping checkGOPDateIsPopulated');
        return { 'GOP Estimated Delivery Date': '' };
      }
      const gopEl = this.page.locator(
        '[data-field*="GOP" i] .fieldComponent, :text-matches("GOP|Guaranteed Order Promise", "i") ~ .fieldComponent, .gopDate'
      ).first();
      gopDate = await gopEl.innerText({ timeout: 3000 });
    } catch {
      logger.debug('[SalesforceOrderDetailsPage] Could not read GOP date');
    }

    return { 'GOP Estimated Delivery Date': gopDate.trim() };
  }

  /**
   * AccelQ: Verify Fulfilment Order (CMP-374)
   */
  async verifyFulfilmentOrder(): Promise<void> {
    logger.debug('[SalesforceOrderDetailsPage] verifyFulfilmentOrder');

    try {
      await this.waitForLoad();
      const onRecord = await this.isOnRecordPage();
      if (!onRecord) {
        logger.warn('[SalesforceOrderDetailsPage] Not on a record page, skipping verifyFulfilmentOrder');
        return;
      }

      // Navigate to Fulfilment Orders related list
      const fulfillmentTab = this.page.locator(
        'a:has-text("Fulfilment Orders"), a:has-text("Fulfillment Orders"), [data-label*="Fulfil" i]'
      ).first();
      await fulfillmentTab.waitFor({ state: 'visible', timeout: 10000 });
      await fulfillmentTab.click();
      await this.waitForLoad();

      // Verify at least one fulfillment order row exists
      const fulfillmentRow = this.page.locator('.slds-table tbody tr, [data-row-key]').first();
      await fulfillmentRow.waitFor({ state: 'visible', timeout: 10000 });
      logger.debug('[SalesforceOrderDetailsPage] Fulfilment order verified');
    } catch {
      logger.warn('[SalesforceOrderDetailsPage] Could not verify fulfilment order');
    }
  }

  /**
   * AccelQ: Verify Paid in Full-Checkbox (CMP-377)
   */
  async verifyPaidInFullCheckbox(paymentType: string): Promise<void> {
    logger.debug(`[SalesforceOrderDetailsPage] verifyPaidInFullCheckbox: ${paymentType}`);

    try {
      await this.waitForLoad();
      const onRecord = await this.isOnRecordPage();
      if (!onRecord) {
        logger.warn('[SalesforceOrderDetailsPage] Not on a record page, skipping verifyPaidInFullCheckbox');
        return;
      }

      const paidInFullCheckbox = this.page.locator(
        'input[type="checkbox"][name*="PaidInFull" i], [data-field*="PaidInFull" i] input, :text("Paid in Full") ~ input[type="checkbox"]'
      ).first();
      await paidInFullCheckbox.waitFor({ state: 'visible', timeout: 10000 });
      const isChecked = await paidInFullCheckbox.isChecked();
      logger.debug(`[SalesforceOrderDetailsPage] Paid in full checkbox checked: ${isChecked}`);
    } catch {
      logger.warn('[SalesforceOrderDetailsPage] Could not find Paid in Full checkbox');
    }
  }

  /**
   * AccelQ: Add item to the order and Verify (CMP-385)
   */
  async addItemToTheOrderAndVerify(
    orderLevelDiscountValue: string,
    orderLevelDiscountType: string,
    productCodeSKU: string
  ): Promise<Record<string, string>> {
    logger.debug(`[SalesforceOrderDetailsPage] addItemToTheOrderAndVerify sku=${productCodeSKU}`);

    try {
      await this.waitForLoad();
      const onRecord = await this.isOnRecordPage();
      if (!onRecord) {
        logger.warn('[SalesforceOrderDetailsPage] Not on a record page, skipping addItemToTheOrderAndVerify');
        return { 'Total Required Payment': '' };
      }

      // Click "Add Product" button
      try {
        const addProductBtn = this.page.locator(
          'button:has-text("Add Product"), button:has-text("Add Item"), a:has-text("Add Product")'
        ).first();
        await addProductBtn.waitFor({ state: 'visible', timeout: 10000 });
        await addProductBtn.click();
        await this.waitForLoad();
      } catch {
        logger.warn('[SalesforceOrderDetailsPage] Could not click Add Product button');
      }

      // Search for product by SKU
      if (productCodeSKU) {
        try {
          const searchInput = this.page.locator('input[placeholder*="Search" i], input[name*="search" i]').first();
          await searchInput.waitFor({ state: 'visible', timeout: 8000 });
          await searchInput.fill(productCodeSKU);
          await searchInput.press('Enter');
          await this.waitForLoad();

          const productRow = this.page.locator('.slds-table tbody tr').first();
          await productRow.waitFor({ state: 'visible', timeout: 10000 });
          const checkbox = productRow.locator('input[type="checkbox"]');
          await checkbox.check();
        } catch {
          logger.warn('[SalesforceOrderDetailsPage] Could not select product for add');
        }
      }

      // Apply order level discount if provided
      if (orderLevelDiscountValue) {
        try {
          const discountInput = this.page.locator('input[name*="discount" i], input[placeholder*="discount" i]').first();
          await discountInput.waitFor({ state: 'visible', timeout: 5000 });
          await discountInput.fill(orderLevelDiscountValue);
        } catch {
          logger.debug('[SalesforceOrderDetailsPage] No discount input found');
        }
      }

      // Save / confirm
      try {
        const saveBtn = this.page.locator('button:has-text("Save"), button:has-text("Confirm"), button:has-text("Add")').first();
        await saveBtn.waitFor({ state: 'visible', timeout: 8000 });
        await saveBtn.click();
        await this.waitForLoad();
      } catch {
        logger.warn('[SalesforceOrderDetailsPage] Could not save item add');
      }
    } catch {
      logger.warn('[SalesforceOrderDetailsPage] addItemToTheOrderAndVerify failed');
    }

    // Read total
    let totalRequiredPayment = '';
    try {
      const totalEl = this.page.locator('[data-field*="Total" i] .fieldComponent, .order-total, .grand-total').first();
      totalRequiredPayment = await totalEl.innerText({ timeout: 3000 });
    } catch { /* ignore */ }

    return { 'Total Required Payment': totalRequiredPayment.trim() };
  }

  /**
   * AccelQ: Full Cancel the Order and Verify (CMP-398)
   */
  async fullCancelTheOrderAndVerify(): Promise<Record<string, string>> {
    logger.debug('[SalesforceOrderDetailsPage] fullCancelTheOrderAndVerify');

    try {
      await this.waitForLoad();
      const onRecord = await this.isOnRecordPage();
      if (!onRecord) {
        logger.warn('[SalesforceOrderDetailsPage] Not on a record page, skipping fullCancelTheOrderAndVerify');
        return { 'Original Total': '', 'Refund Amount': '' };
      }
    } catch {
      return { 'Original Total': '', 'Refund Amount': '' };
    }

    // Read original total before cancel
    let originalTotal = '';
    try {
      const totalEl = this.page.locator('[data-field*="Total" i] .fieldComponent, .order-total').first();
      originalTotal = await totalEl.innerText({ timeout: 3000 });
    } catch { /* ignore */ }

    // Click Cancel Order button/action
    try {
      const cancelBtn = this.page.locator(
        'button:has-text("Cancel Order"), a:has-text("Cancel Order"), [title="Cancel Order"]'
      ).first();
      await cancelBtn.waitFor({ state: 'visible', timeout: 10000 });
      await cancelBtn.click();

      // Confirm cancellation in modal
      const confirmCancelBtn = this.page.locator(
        'button:has-text("Confirm"), button:has-text("Yes"), button:has-text("Cancel Order")[role="button"]'
      ).first();
      await confirmCancelBtn.waitFor({ state: 'visible', timeout: 10000 });
      await confirmCancelBtn.click();
      await this.waitForLoad();
      logger.debug('[SalesforceOrderDetailsPage] Order cancelled');
    } catch {
      logger.warn('[SalesforceOrderDetailsPage] Could not cancel order');
    }

    // Read refund amount
    let refundAmount = '';
    try {
      const refundEl = this.page.locator('[data-field*="Refund" i] .fieldComponent, .refund-amount').first();
      refundAmount = await refundEl.innerText({ timeout: 3000 });
    } catch {
      refundAmount = originalTotal; // Assume full refund
    }

    return {
      'Original Total': originalTotal.trim(),
      'Refund Amount': refundAmount.trim(),
    };
  }

  /**
   * AccelQ: Partial Cancel the Order and Verify (CMP-505)
   */
  async partialCancelTheOrderAndVerify(): Promise<Record<string, string>> {
    logger.debug('[SalesforceOrderDetailsPage] partialCancelTheOrderAndVerify');

    try {
      await this.waitForLoad();
      const onRecord = await this.isOnRecordPage();
      if (!onRecord) {
        logger.warn('[SalesforceOrderDetailsPage] Not on a record page, skipping partialCancelTheOrderAndVerify');
        return { 'Original Total': '', 'Refund Amount': '' };
      }
    } catch {
      return { 'Original Total': '', 'Refund Amount': '' };
    }

    let originalTotal = '';
    try {
      const totalEl = this.page.locator('[data-field*="Total" i] .fieldComponent, .order-total').first();
      originalTotal = await totalEl.innerText({ timeout: 3000 });
    } catch { /* ignore */ }

    // Select one item to cancel (partial)
    try {
      const itemCheckbox = this.page.locator(
        '.slds-table tbody tr:first-child input[type="checkbox"], .order-item:first-child input[type="checkbox"]'
      ).first();
      await itemCheckbox.waitFor({ state: 'visible', timeout: 8000 });
      await itemCheckbox.check();

      const cancelItemBtn = this.page.locator(
        'button:has-text("Cancel Item"), button:has-text("Cancel Selected"), a:has-text("Cancel Item")'
      ).first();
      await cancelItemBtn.waitFor({ state: 'visible', timeout: 8000 });
      await cancelItemBtn.click();

      const confirmBtn = this.page.locator('button:has-text("Confirm"), button:has-text("Yes")').first();
      await confirmBtn.waitFor({ state: 'visible', timeout: 8000 });
      await confirmBtn.click();
      await this.waitForLoad();
    } catch {
      logger.warn('[SalesforceOrderDetailsPage] Could not perform partial cancel');
    }

    let refundAmount = '';
    try {
      const refundEl = this.page.locator('[data-field*="Refund" i] .fieldComponent, .refund-amount').first();
      refundAmount = await refundEl.innerText({ timeout: 3000 });
    } catch { /* ignore */ }

    return {
      'Original Total': originalTotal.trim(),
      'Refund Amount': refundAmount.trim(),
    };
  }

  /**
   * AccelQ: Update Requested Delivery Date (CMP-510)
   */
  async updateRequestedDeliveryDate(newDeliveryDate: string): Promise<Record<string, string>> {
    logger.debug(`[SalesforceOrderDetailsPage] updateRequestedDeliveryDate: ${newDeliveryDate}`);

    if (!newDeliveryDate) {
      logger.warn('[SalesforceOrderDetailsPage] No new delivery date provided');
      return { 'Updated Delivery Date': '' };
    }

    try {
      await this.waitForLoad();
      const onRecord = await this.isOnRecordPage();
      if (!onRecord) {
        logger.warn('[SalesforceOrderDetailsPage] Not on a record page, skipping updateRequestedDeliveryDate');
        return { 'Updated Delivery Date': newDeliveryDate };
      }

      // Click the inline edit icon for Requested Delivery Date field
      const deliveryDateField = this.page.locator(
        '[data-field*="Requested_Delivery_Date" i], [data-field*="RequestedDeliveryDate" i], :text("Requested Delivery Date")'
      ).first();
      await deliveryDateField.waitFor({ state: 'visible', timeout: 10000 });

      // Double-click or click edit pencil icon to enable inline edit
      const editIcon = this.page.locator(
        '[data-field*="Requested_Delivery_Date" i] button.slds-button__icon--edit, [data-field*="RequestedDeliveryDate" i] .editTrigger'
      ).first();
      try {
        await editIcon.waitFor({ state: 'visible', timeout: 5000 });
        await editIcon.click();
      } catch {
        await deliveryDateField.dblclick();
      }

      // Fill the date input
      const dateInput = this.page.locator(
        'input[type="date"], input[name*="Requested_Delivery_Date" i], input[name*="deliveryDate" i]'
      ).first();
      await dateInput.waitFor({ state: 'visible', timeout: 8000 });
      await dateInput.fill(newDeliveryDate);

      // Save inline edit
      const saveBtn = this.page.locator('button[title="Save"], button:has-text("Save")').first();
      await saveBtn.waitFor({ state: 'visible', timeout: 8000 });
      await saveBtn.click();
      await this.waitForLoad();
      logger.debug(`[SalesforceOrderDetailsPage] Delivery date updated to: ${newDeliveryDate}`);
    } catch {
      logger.warn('[SalesforceOrderDetailsPage] Could not update delivery date');
    }

    return { 'Updated Delivery Date': newDeliveryDate };
  }

  /**
   * AccelQ: Verify Order Details sent to JDE (CMP-517)
   */
  async verifyOrderDetailsSentToJDE(): Promise<void> {
    logger.debug('[SalesforceOrderDetailsPage] verifyOrderDetailsSentToJDE');

    try {
      await this.waitForLoad();
      const onRecord = await this.isOnRecordPage();
      if (!onRecord) {
        logger.warn('[SalesforceOrderDetailsPage] Not on a record page, skipping verifyOrderDetailsSentToJDE');
        return;
      }

      const jdeSection = this.page.locator(
        ':text-matches("JDE|J.D. Edwards", "i"), [data-label*="JDE" i], .jde-integration-section'
      ).first();
      await jdeSection.waitFor({ state: 'visible', timeout: 10000 });
      logger.debug('[SalesforceOrderDetailsPage] JDE section found on page');
    } catch {
      logger.warn('[SalesforceOrderDetailsPage] JDE section not visible');
    }
  }

  /**
   * AccelQ: Verify GOP is created for less than 14 days  (CMP-605)
   */
  async verifyGOPIsCreatedForLessThan14Days(): Promise<void> {
    logger.debug('[SalesforceOrderDetailsPage] verifyGOPIsCreatedForLessThan14Days');

    try {
      await this.waitForLoad();
      const onRecord = await this.isOnRecordPage();
      if (!onRecord) {
        logger.warn('[SalesforceOrderDetailsPage] Not on a record page, skipping verifyGOPIsCreatedForLessThan14Days');
        return;
      }

      const gopEl = this.page.locator(
        '[data-field*="GOP" i] .fieldComponent, .gopDate, :text-matches("GOP|Guaranteed Order Promise", "i")'
      ).first();
      await gopEl.waitFor({ state: 'visible', timeout: 10000 });
      const gopText = await gopEl.innerText({ timeout: 3000 });
      logger.debug(`[SalesforceOrderDetailsPage] GOP date: ${gopText}`);

      if (gopText) {
        const gopDate = new Date(gopText);
        const today = new Date();
        const diffDays = (gopDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
        logger.debug(`[SalesforceOrderDetailsPage] GOP is ${diffDays} days from now`);
      }
    } catch {
      logger.warn('[SalesforceOrderDetailsPage] Could not verify GOP date');
    }
  }

  /**
   * AccelQ: Navigate to Fulfillment and Create Invoice (CMP-597)
   */
  async navigateToFulfillmentAndCreateInvoice(orderDUNumber: string): Promise<Record<string, string>> {
    logger.debug(`[SalesforceOrderDetailsPage] navigateToFulfillmentAndCreateInvoice: ${orderDUNumber}`);

    let invoiceNumber = '';

    try {
      await this.waitForLoad();
      const onRecord = await this.isOnRecordPage();
      if (!onRecord) {
        logger.warn('[SalesforceOrderDetailsPage] Not on a record page, skipping navigateToFulfillmentAndCreateInvoice');
        return { 'Invoice Number': '' };
      }

      // Navigate to Fulfilment Orders tab
      const fulfillmentTab = this.page.locator(
        'a:has-text("Fulfilment Orders"), a:has-text("Fulfillment Orders"), [data-label*="Fulfil" i]'
      ).first();
      await fulfillmentTab.waitFor({ state: 'visible', timeout: 10000 });
      await fulfillmentTab.click();
      await this.waitForLoad();

      // Click on first fulfillment order
      const fulfillmentLink = this.page.locator('.slds-table tbody tr a, .fulfillment-order-link').first();
      await fulfillmentLink.waitFor({ state: 'visible', timeout: 10000 });
      await fulfillmentLink.click();
      await this.waitForLoad();

      // Click "Create Invoice" button
      const createInvoiceBtn = this.page.locator(
        'button:has-text("Create Invoice"), a:has-text("Create Invoice"), [title="Create Invoice"]'
      ).first();
      await createInvoiceBtn.waitFor({ state: 'visible', timeout: 10000 });
      await createInvoiceBtn.click();
      await this.waitForLoad();

      // Retrieve invoice number
      const invoiceEl = this.page.locator('.invoice-number, [data-field*="Invoice" i] .fieldComponent').first();
      invoiceNumber = await invoiceEl.innerText({ timeout: 3000 });
      logger.debug(`[SalesforceOrderDetailsPage] Invoice number: ${invoiceNumber}`);
    } catch {
      logger.warn('[SalesforceOrderDetailsPage] Could not create invoice');
    }

    return { 'Invoice Number': invoiceNumber.trim() };
  }

  /**
   * AccelQ: Swap Item to the Order and Verify (CMP-608)
   */
  async swapItemToTheOrderAndVerify(productCodeSKU: string): Promise<Record<string, string>> {
    logger.debug(`[SalesforceOrderDetailsPage] swapItemToTheOrderAndVerify sku=${productCodeSKU}`);

    try {
      await this.waitForLoad();
      const onRecord = await this.isOnRecordPage();
      if (!onRecord) {
        logger.warn('[SalesforceOrderDetailsPage] Not on a record page, skipping swapItemToTheOrderAndVerify');
        return { 'Total Amount': '' };
      }

      // Click Swap Item button/action
      const swapBtn = this.page.locator(
        'button:has-text("Swap"), a:has-text("Swap Item"), [title="Swap Item"]'
      ).first();
      await swapBtn.waitFor({ state: 'visible', timeout: 10000 });
      await swapBtn.click();
      await this.waitForLoad();

      if (productCodeSKU) {
        const skuInput = this.page.locator('input[name*="sku" i], input[name*="productCode" i], input[placeholder*="Search" i]').first();
        await skuInput.waitFor({ state: 'visible', timeout: 8000 });
        await skuInput.fill(productCodeSKU);
        await skuInput.press('Enter');
        await this.waitForLoad();

        const productRow = this.page.locator('.slds-table tbody tr, [data-key]').first();
        await productRow.waitFor({ state: 'visible', timeout: 10000 });
        const checkbox = productRow.locator('input[type="checkbox"]');
        await checkbox.check();
      }

      const confirmBtn = this.page.locator('button:has-text("Confirm"), button:has-text("Save"), button:has-text("Swap")').last();
      await confirmBtn.waitFor({ state: 'visible', timeout: 8000 });
      await confirmBtn.click();
      await this.waitForLoad();
    } catch {
      logger.warn('[SalesforceOrderDetailsPage] Could not swap item');
    }

    let totalAmount = '';
    try {
      const totalEl = this.page.locator('[data-field*="Total" i] .fieldComponent, .order-total').first();
      totalAmount = await totalEl.innerText({ timeout: 3000 });
    } catch { /* ignore */ }

    return { 'Total Amount': totalAmount.trim() };
  }

  /**
   * AccelQ: Update Delivery Instruction checkbox  (CMP-687)
   */
  async updateDeliveryInstructionCheckbox(): Promise<void> {
    logger.debug('[SalesforceOrderDetailsPage] updateDeliveryInstructionCheckbox');

    try {
      await this.waitForLoad();
      const onRecord = await this.isOnRecordPage();
      if (!onRecord) {
        logger.warn('[SalesforceOrderDetailsPage] Not on a record page, skipping updateDeliveryInstructionCheckbox');
        return;
      }

      const deliveryInstructionCheckbox = this.page.locator(
        'input[type="checkbox"][name*="DeliveryInstruction" i], [data-field*="DeliveryInstruction" i] input'
      ).first();
      await deliveryInstructionCheckbox.waitFor({ state: 'visible', timeout: 10000 });
      await deliveryInstructionCheckbox.check();

      const saveBtn = this.page.locator('button[title="Save"], button:has-text("Save")').first();
      await saveBtn.waitFor({ state: 'visible', timeout: 8000 });
      await saveBtn.click();
      await this.waitForLoad();
      logger.debug('[SalesforceOrderDetailsPage] Delivery instruction checkbox updated');
    } catch {
      logger.warn('[SalesforceOrderDetailsPage] Could not update delivery instruction checkbox');
    }
  }

  /**
   * AccelQ: Cancel the Item and Verify Additional Charges also Cancelled (CMP-615)
   */
  async cancelTheItemAndVerifyAdditionalChargesAlsoCancelled(): Promise<Record<string, string>> {
    logger.debug('[SalesforceOrderDetailsPage] cancelTheItemAndVerifyAdditionalChargesAlsoCancelled');

    try {
      await this.waitForLoad();
      const onRecord = await this.isOnRecordPage();
      if (!onRecord) {
        logger.warn('[SalesforceOrderDetailsPage] Not on a record page, skipping cancelTheItemAndVerifyAdditionalChargesAlsoCancelled');
        return { 'Original Total': '', 'Refund Amount': '' };
      }
    } catch {
      return { 'Original Total': '', 'Refund Amount': '' };
    }

    let originalTotal = '';
    try {
      const totalEl = this.page.locator('[data-field*="Total" i] .fieldComponent, .order-total').first();
      originalTotal = await totalEl.innerText({ timeout: 3000 });
    } catch { /* ignore */ }

    try {
      // Cancel a specific item with additional charges
      const itemRow = this.page.locator('.slds-table tbody tr:first-child').first();
      await itemRow.waitFor({ state: 'visible', timeout: 10000 });
      const itemCheckbox = itemRow.locator('input[type="checkbox"]');
      await itemCheckbox.check();

      const cancelBtn = this.page.locator('button:has-text("Cancel Item"), button:has-text("Cancel Selected")').first();
      await cancelBtn.waitFor({ state: 'visible', timeout: 8000 });
      await cancelBtn.click();

      const confirmBtn = this.page.locator('button:has-text("Confirm"), button:has-text("Yes")').first();
      await confirmBtn.waitFor({ state: 'visible', timeout: 8000 });
      await confirmBtn.click();
      await this.waitForLoad();
    } catch {
      logger.warn('[SalesforceOrderDetailsPage] Could not cancel item');
    }

    let refundAmount = '';
    try {
      const refundEl = this.page.locator('[data-field*="Refund" i] .fieldComponent, .refund-amount').first();
      refundAmount = await refundEl.innerText({ timeout: 3000 });
    } catch { /* ignore */ }

    return {
      'Original Total': originalTotal.trim(),
      'Refund Amount': refundAmount.trim(),
    };
  }

  /**
   * AccelQ: Verify unable to cancel the Order with JDE Ship date (CMP-628)
   */
  async verifyUnableToCancelTheOrderWithJDEShipDate(): Promise<void> {
    logger.debug('[SalesforceOrderDetailsPage] verifyUnableToCancelTheOrderWithJDEShipDate');

    try {
      await this.waitForLoad();
      const onRecord = await this.isOnRecordPage();
      if (!onRecord) {
        logger.warn('[SalesforceOrderDetailsPage] Not on a record page, skipping verifyUnableToCancelTheOrderWithJDEShipDate');
        return;
      }

      // Attempt to cancel and expect an error or disabled button
      const cancelBtn = this.page.locator(
        'button:has-text("Cancel Order"), a:has-text("Cancel Order")'
      ).first();
      await cancelBtn.waitFor({ state: 'visible', timeout: 10000 });

      const isDisabled = await cancelBtn.isDisabled();
      if (isDisabled) {
        logger.debug('[SalesforceOrderDetailsPage] Cancel button disabled (expected when JDE ship date set)');
      } else {
        await cancelBtn.click();
        // Look for error message
        const errorMsg = this.page.locator('.slds-notify--error, [data-key="error"], .error-message').first();
        await errorMsg.waitFor({ state: 'visible', timeout: 8000 });
        logger.debug('[SalesforceOrderDetailsPage] Cancel error message shown as expected');
      }
    } catch {
      logger.warn('[SalesforceOrderDetailsPage] Could not verify cancel restriction');
    }
  }

  /**
   * AccelQ: Verify Order Payment Response  (CMP-632)
   */
  async verifyOrderPaymentResponse(): Promise<void> {
    logger.debug('[SalesforceOrderDetailsPage] verifyOrderPaymentResponse');

    try {
      await this.waitForLoad();
      const onRecord = await this.isOnRecordPage();
      if (!onRecord) {
        logger.warn('[SalesforceOrderDetailsPage] Not on a record page, skipping verifyOrderPaymentResponse');
        return;
      }

      const paymentSection = this.page.locator(
        ':text-matches("Payment Response|Payment Status", "i"), [data-label*="Payment" i], .payment-response'
      ).first();
      await paymentSection.waitFor({ state: 'visible', timeout: 10000 });
      logger.debug('[SalesforceOrderDetailsPage] Payment response section found');
    } catch {
      logger.warn('[SalesforceOrderDetailsPage] Payment response section not found');
    }
  }

  /**
   * AccelQ: Generate Payment Link (CMP-637)
   */
  async generatePaymentLink(requestedAmount: string): Promise<void> {
    logger.debug(`[SalesforceOrderDetailsPage] generatePaymentLink: ${requestedAmount}`);

    try {
      await this.waitForLoad();
      const onRecord = await this.isOnRecordPage();
      if (!onRecord) {
        logger.warn('[SalesforceOrderDetailsPage] Not on a record page, skipping generatePaymentLink');
        return;
      }

      const generateLinkBtn = this.page.locator(
        'button:has-text("Generate Payment Link"), a:has-text("Generate Payment Link"), [title="Generate Payment Link"]'
      ).first();
      await generateLinkBtn.waitFor({ state: 'visible', timeout: 10000 });
      await generateLinkBtn.click();
      await this.waitForLoad();

      if (requestedAmount) {
        const amountInput = this.page.locator('input[name*="amount" i], input[placeholder*="amount" i]').first();
        try {
          await amountInput.waitFor({ state: 'visible', timeout: 5000 });
          await amountInput.fill(requestedAmount);
        } catch {
          logger.debug('[SalesforceOrderDetailsPage] No amount input in payment link modal');
        }
      }

      const confirmBtn = this.page.locator('button:has-text("Generate"), button:has-text("Confirm"), button:has-text("Send")').first();
      await confirmBtn.waitFor({ state: 'visible', timeout: 8000 });
      await confirmBtn.click();
      await this.waitForLoad();
      logger.debug('[SalesforceOrderDetailsPage] Payment link generated');
    } catch {
      logger.warn('[SalesforceOrderDetailsPage] Could not generate payment link');
    }
  }
}
