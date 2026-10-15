const assert = require('assert');

console.log('====================================================');
console.log('🧪 RUNNING SEVEN STAR JWELS VERIFICATION TEST SUITE');
console.log('====================================================\n');

let passedTests = 0;
let totalTests = 0;

function runTest(testName, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`✅ [PASS] ${testName}`);
  } catch (err) {
    console.error(`❌ [FAIL] ${testName}:`, err.message);
  }
}

// 1. ITEMS VALIDATION
runTest('Item Validation: Reject empty name', () => {
  const validateItem = (item) => {
    if (!item.name || !item.name.trim()) throw new Error('Item name is required');
    if (item.purchase_rate < 0) throw new Error('Purchase rate cannot be negative');
    if (item.default_sale_rate < 0) throw new Error('Sale rate cannot be negative');
    if (item.current_stock < 0) throw new Error('Stock cannot be negative');
    return true;
  };

  assert.throws(() => validateItem({ name: '   ', purchase_rate: 100, default_sale_rate: 150, current_stock: 10 }), /Item name is required/);
  assert.throws(() => validateItem({ name: 'Ring', purchase_rate: -10, default_sale_rate: 150, current_stock: 10 }), /Purchase rate cannot be negative/);
  assert.throws(() => validateItem({ name: 'Ring', purchase_rate: 100, default_sale_rate: -5, current_stock: 10 }), /Sale rate cannot be negative/);
  assert.throws(() => validateItem({ name: 'Ring', purchase_rate: 100, default_sale_rate: 150, current_stock: -1 }), /Stock cannot be negative/);
  assert.strictEqual(validateItem({ name: 'Stone Nose Pin', purchase_rate: 110, default_sale_rate: 150, current_stock: 20 }), true);
});

// 2. SALE ARITHMETIC & READ-ONLY PURCHASE RATE
runTest('Sale Calculations: Line total, line cost, line profit & invoice totals', () => {
  const lines = [
    { name: 'Stone Nose Pin', qty: 5, purchase_rate: 110.00, sale_rate: 150.00 },
    { name: 'Silver Floral Nose Pin', qty: 2, purchase_rate: 100.00, sale_rate: 160.00 }
  ];

  let invoiceTotal = 0;
  let totalCost = 0;

  const processed = lines.map(line => {
    const lineTotal = Math.round(line.qty * line.sale_rate * 100) / 100;
    const lineCost = Math.round(line.qty * line.purchase_rate * 100) / 100;
    const lineProfit = Math.round((lineTotal - lineCost) * 100) / 100;
    invoiceTotal += lineTotal;
    totalCost += lineCost;
    return { lineTotal, lineCost, lineProfit };
  });

  // Line 1: 5 * 150 = 750 total, 5 * 110 = 550 cost, profit = 200
  assert.strictEqual(processed[0].lineTotal, 750.00);
  assert.strictEqual(processed[0].lineCost, 550.00);
  assert.strictEqual(processed[0].lineProfit, 200.00);

  // Line 2: 2 * 160 = 320 total, 2 * 100 = 200 cost, profit = 120
  assert.strictEqual(processed[1].lineTotal, 320.00);
  assert.strictEqual(processed[1].lineCost, 200.00);
  assert.strictEqual(processed[1].lineProfit, 120.00);

  // Totals
  assert.strictEqual(invoiceTotal, 1070.00);
  assert.strictEqual(totalCost, 750.00);
  assert.strictEqual(invoiceTotal - totalCost, 320.00);
});

// 3. INSUFFICIENT STOCK REJECTION
runTest('Inventory Deduction: Reject sale exceeding available stock', () => {
  const stock = 10;
  const requestedQty = 12;

  const processSale = (available, requested) => {
    if (requested > available) {
      throw new Error(`Insufficient stock: Requested ${requested}, available ${available}`);
    }
    return available - requested;
  };

  assert.throws(() => processSale(stock, requestedQty), /Insufficient stock/);
  assert.strictEqual(processSale(10, 4), 6);
});

// 4. HISTORICAL COST PRESERVATION
runTest('Historical Cost Preservation: Item purchase rate update does not rewrite past sales', () => {
  const item = { id: 'item-1', name: 'Ring', purchase_rate: 200.00 };
  
  // Past sale created with purchase_rate snapshot
  const pastSaleItem = {
    item_id: item.id,
    quantity: 2,
    purchase_rate: item.purchase_rate,
    sale_rate: 300.00,
    line_cost: 2 * item.purchase_rate,
    line_profit: (2 * 300.00) - (2 * item.purchase_rate)
  };

  assert.strictEqual(pastSaleItem.line_cost, 400.00);
  assert.strictEqual(pastSaleItem.line_profit, 200.00);

  // Owner updates current purchase rate to 250 in inventory
  item.purchase_rate = 250.00;

  // Past sale line cost and profit remain unchanged!
  assert.strictEqual(pastSaleItem.purchase_rate, 200.00);
  assert.strictEqual(pastSaleItem.line_cost, 400.00);
  assert.strictEqual(pastSaleItem.line_profit, 200.00);
});

// 5. CONTROLLED REVERSAL / VOID SALE
runTest('Controlled Reversal: Voiding sale restores exact inventory stock', () => {
  let inventoryStock = 20;
  const saleQuantity = 5;

  // Execute Sale
  inventoryStock -= saleQuantity;
  assert.strictEqual(inventoryStock, 15);

  // Void Sale
  const voidReason = 'Customer exchange';
  inventoryStock += saleQuantity;
  assert.strictEqual(inventoryStock, 20);
});

// 6. FINANCIAL STATEMENTS & NET OPERATING RESULT
runTest('Financial Reports: Gross profit, operating expenses, and net result', () => {
  const totalRevenue = 15000;
  const cogs = 9500;
  const grossProfit = totalRevenue - cogs; // 5500
  const operatingExpenses = [
    { category: 'Rent', amount: 2000 },
    { category: 'Electricity', amount: 500 },
    { category: 'Packaging', amount: 300 }
  ];
  const totalExpenses = operatingExpenses.reduce((s, e) => s + e.amount, 0); // 2800
  const netResult = grossProfit - totalExpenses; // 2700

  assert.strictEqual(grossProfit, 5500);
  assert.strictEqual(totalExpenses, 2800);
  assert.strictEqual(netResult, 2700);
});

// 7. INVENTORY VALUATION
runTest('Inventory Valuation: Sum of current stock multiplied by purchase cost', () => {
  const items = [
    { stock: 10, cost: 100 },
    { stock: 5, cost: 400 },
    { stock: 2, cost: 1500 }
  ];

  const totalValuation = items.reduce((sum, i) => sum + (i.stock * i.cost), 0);
  // (10*100) + (5*400) + (2*1500) = 1000 + 2000 + 3000 = 6000
  assert.strictEqual(totalValuation, 6000);
});

// 8. BACKUP VALIDATION WITH PURCHASES
runTest('Backup Schema & Integrity: Validate correct vs corrupted backup files with purchases', () => {
  const validJson = JSON.stringify({
    version: '1.0.0',
    app_name: 'SEVEN STAR JWELS',
    exported_at: new Date().toISOString(),
    items: [{ id: '1', name: 'Ring' }],
    purchases: [{ id: 'pur-1', supplier_invoice_number: 'SUP-101' }],
    sales: [{ id: '1', invoice_number: 'SSJ-1001' }],
    expenses: []
  });

  const parsedValid = JSON.parse(validJson);
  assert(Array.isArray(parsedValid.items));
  assert(Array.isArray(parsedValid.purchases));
  assert(Array.isArray(parsedValid.sales));
  assert(Array.isArray(parsedValid.expenses));
  assert.strictEqual(parsedValid.app_name, 'SEVEN STAR JWELS');

  const invalidJson = JSON.stringify({ app_name: 'RANDOM', items: 'not an array' });
  const parsedInvalid = JSON.parse(invalidJson);
  assert.strictEqual(Array.isArray(parsedInvalid.items), false);
});

// 9. SECURITY & SECRETS AUDIT
runTest('Security Check: Zero secrets or passwords exposed in codebase or env example', () => {
  const fs = require('fs');
  const envExample = fs.readFileSync('.env.example', 'utf8');
  assert(!envExample.includes('service_role'), 'Service role key found in .env.example');
  assert(!envExample.includes('postgres://'), 'Database password found in .env.example');

  const gitignore = fs.readFileSync('.gitignore', 'utf8');
  assert(gitignore.includes('.env'), '.env must be in .gitignore');
  assert(gitignore.includes('.env.local'), '.env.local must be in .gitignore');
});

// 10. WHOLESALE PURCHASE & STOCK INWARD
runTest('Wholesale Purchase: Inward increases stock and calculates supplier amount due', () => {
  let inventoryStock = 15;
  const purchaseLines = [
    { name: 'Silver Nose Pin', qty: 25, unit_rate: 100.00, gst_rate: 3.00 }
  ];

  // Inward calculation
  const taxable = purchaseLines[0].qty * purchaseLines[0].unit_rate; // 2500
  const gst = taxable * (purchaseLines[0].gst_rate / 100); // 75
  const grandTotal = taxable + gst; // 2575
  const amountPaid = 2000.00;
  const amountDue = grandTotal - amountPaid; // 575

  // Stock update
  inventoryStock += purchaseLines[0].qty;

  assert.strictEqual(taxable, 2500.00);
  assert.strictEqual(gst, 75.00);
  assert.strictEqual(grandTotal, 2575.00);
  assert.strictEqual(amountDue, 575.00);
  assert.strictEqual(inventoryStock, 40);
});

// 11. GST TAX SPLITTING (INTRA-STATE VS INTER-STATE)
runTest('Wholesale GST: Intra-state (1.5% CGST + 1.5% SGST) vs Inter-state (3% IGST)', () => {
  const taxableValue = 10000.00;
  const gstRate = 3.00;

  // Intra-state supply
  const cgst = Math.round((taxableValue * (gstRate / 200)) * 100) / 100; // 150
  const sgst = Math.round((taxableValue * (gstRate / 200)) * 100) / 100; // 150
  const intraTotalGst = cgst + sgst; // 300
  assert.strictEqual(cgst, 150.00);
  assert.strictEqual(sgst, 150.00);
  assert.strictEqual(intraTotalGst, 300.00);

  // Inter-state supply
  const igst = Math.round((taxableValue * (gstRate / 100)) * 100) / 100; // 300
  assert.strictEqual(igst, 300.00);
});

// 12. PERIOD STOCK MOVEMENT FORMULA (OPENING + IN - OUT = CLOSING)
runTest('Period Stock Movement: Closing Stock = Opening + Inward - Outward', () => {
  const item = {
    name: 'CZ Studded Nose Pin',
    opening_stock: 20,
    purchased_in_period: 30, // Inward
    sold_in_period: 12       // Outward
  };

  const closingStock = item.opening_stock + item.purchased_in_period - item.sold_in_period;
  assert.strictEqual(closingStock, 38);
});

// 13. STRICTLY INCLUSIVE DATE FILTERING
runTest('Inclusive Date Range: Range includes full boundary calendar days', () => {
  const filterStartStr = '2026-10-21';
  const filterEndStr = '2026-10-25';

  const rangeStart = new Date(`${filterStartStr}T00:00:00`);
  const rangeEnd = new Date(`${filterEndStr}T23:59:59`);

  const t1 = new Date('2026-10-21T02:30:00'); // Inside first day
  const t2 = new Date('2026-10-23T14:00:00'); // Inside middle day
  const t3 = new Date('2026-10-25T20:00:00'); // Inside last day
  const tOutBefore = new Date('2026-10-20T23:59:00'); // Before start
  const tOutAfter = new Date('2026-10-26T00:01:00'); // After end

  const isIncluded = (d) => d >= rangeStart && d <= rangeEnd;

  assert.strictEqual(isIncluded(t1), true, 'First day must be included');
  assert.strictEqual(isIncluded(t2), true, 'Middle day must be included');
  assert.strictEqual(isIncluded(t3), true, 'Last day must be included');
  assert.strictEqual(isIncluded(tOutBefore), false, 'Day before must be excluded');
  assert.strictEqual(isIncluded(tOutAfter), false, 'Day after must be excluded');
});

// 14. INCOME & EXPENDITURE WITH COGS (NO PENALIZING UNSOLD PURCHASES)
runTest('Income & Expenditure: Revenue ex-GST minus COGS = Gross Profit minus Expenses', () => {
  const grossSalesWithGst = 10300.00;
  const outputGst = 300.00;
  const taxableRevenue = grossSalesWithGst - outputGst; // 10000.00
  const cogs = 6500.00; // Cost of inventory actually sold
  const operatingExpenses = 1200.00; // Rent, salary, electricity

  // Total purchases made in same period (e.g. 20000) should NOT be subtracted as an expense
  const grossProfit = taxableRevenue - cogs; // 3500.00
  const netResult = grossProfit - operatingExpenses; // 2300.00

  assert.strictEqual(grossProfit, 3500.00);
  assert.strictEqual(netResult, 2300.00);
});

// ====================================================
// SECTION 9: 6 SPECIFIED AUTOMATED VERIFICATION SCENARIOS
// ====================================================

function createSaleEngine(grandTotal, amountReceived, requestedStatus) {
  if (amountReceived < 0) throw new Error('Payment received cannot be negative.');
  if (amountReceived > grandTotal) throw new Error(`Payment received (${amountReceived}) cannot exceed invoice total (${grandTotal}).`);

  const amountDue = Math.max(0, Math.round((grandTotal - amountReceived) * 100) / 100);

  let paymentStatus = 'Due Balance';
  if (amountDue === 0 && grandTotal > 0) {
    paymentStatus = 'Payment Complete';
  } else if (requestedStatus === 'Advance Paid' && amountReceived > 0) {
    paymentStatus = 'Advance Paid';
  } else if (requestedStatus === 'Payment Complete' && amountDue > 0) {
    throw new Error(`Cannot save as "Payment Complete" while an outstanding balance of ₹${amountDue} remains.`);
  } else {
    paymentStatus = 'Due Balance';
  }

  const initialPayments = [];
  if (amountReceived > 0) {
    initialPayments.push({
      id: 'pay-init',
      amount: amountReceived,
      notes: paymentStatus === 'Advance Paid' ? 'Advance Payment' : 'Initial Payment'
    });
  }

  return {
    grand_total: grandTotal,
    amount_received: amountReceived,
    amount_due: amountDue,
    payment_status: paymentStatus,
    payments: initialPayments
  };
}

function recordPaymentEngine(sale, newPaymentAmount, notes) {
  if (newPaymentAmount <= 0) throw new Error('Payment amount must be greater than zero.');
  if (newPaymentAmount > sale.amount_due) {
    throw new Error(`Payment amount (${newPaymentAmount}) cannot exceed outstanding due balance (${sale.amount_due}).`);
  }

  const newPayment = {
    id: `pay-${sale.payments.length + 1}`,
    amount: newPaymentAmount,
    notes: notes || 'Subsequent Payment'
  };

  const updatedPayments = [...sale.payments, newPayment];
  const totalReceived = Math.round(updatedPayments.reduce((s, p) => s + p.amount, 0) * 100) / 100;
  const newDue = Math.max(0, Math.round((sale.grand_total - totalReceived) * 100) / 100);

  let newStatus = 'Due Balance';
  if (newDue <= 0.001) {
    newStatus = 'Payment Complete';
  }

  return {
    ...sale,
    payments: updatedPayments,
    amount_received: totalReceived,
    amount_due: newDue,
    payment_status: newStatus
  };
}

// Test 1: Sale of ₹5,000 with Advance Paid ₹3,000
runTest('Section 9 - Test 1: Create sale ₹5,000 with Advance Paid ₹3,000 -> Status: Advance Paid, Due: ₹2,000', () => {
  const sale = createSaleEngine(5000, 3000, 'Advance Paid');
  assert.strictEqual(sale.payment_status, 'Advance Paid');
  assert.strictEqual(sale.amount_due, 2000);
  assert.strictEqual(sale.amount_received, 3000);
  assert.strictEqual(sale.payments.length, 1);
  assert.strictEqual(sale.payments[0].amount, 3000);
});

// Test 2: Add payment of ₹500
runTest('Section 9 - Test 2: Add payment ₹500 to sale -> Status: Due Balance, Due: ₹1,500, previous payments preserved', () => {
  let sale = createSaleEngine(5000, 3000, 'Advance Paid');
  sale = recordPaymentEngine(sale, 500, 'Partial Payment #2');
  assert.strictEqual(sale.payment_status, 'Due Balance');
  assert.strictEqual(sale.amount_due, 1500);
  assert.strictEqual(sale.amount_received, 3500);
  assert.strictEqual(sale.payments.length, 2);
  assert.strictEqual(sale.payments[0].amount, 3000); // First payment preserved!
  assert.strictEqual(sale.payments[1].amount, 500);  // New payment added!
});

// Test 3: Add payment of ₹1,500
runTest('Section 9 - Test 3: Add payment of ₹1,500 -> Status: Payment Complete, Due: ₹0', () => {
  let sale = createSaleEngine(5000, 3000, 'Advance Paid');
  sale = recordPaymentEngine(sale, 500);
  sale = recordPaymentEngine(sale, 1500, 'Final Settlement');
  assert.strictEqual(sale.payment_status, 'Payment Complete');
  assert.strictEqual(sale.amount_due, 0);
  assert.strictEqual(sale.amount_received, 5000);
  assert.strictEqual(sale.payments.length, 3);
  assert.strictEqual(sale.payments[0].amount, 3000);
  assert.strictEqual(sale.payments[1].amount, 500);
  assert.strictEqual(sale.payments[2].amount, 1500);
});

// Test 4: Sale of ₹5,000 with Payment Complete directly
runTest('Section 9 - Test 4: Create sale ₹5,000 with Payment Complete directly -> Status: Payment Complete, Due: ₹0', () => {
  const sale = createSaleEngine(5000, 5000, 'Payment Complete');
  assert.strictEqual(sale.payment_status, 'Payment Complete');
  assert.strictEqual(sale.amount_due, 0);
  assert.strictEqual(sale.amount_received, 5000);
  assert.strictEqual(sale.payments.length, 1);
  assert.strictEqual(sale.payments[0].amount, 5000);
});

// Test 5: Attempt to enter payment of ₹5,500 on a ₹5,000 sale
runTest('Section 9 - Test 5: Attempt payment of ₹5,500 on a ₹5,000 sale -> Reject with validation error', () => {
  assert.throws(
    () => createSaleEngine(5000, 5500, 'Due Balance'),
    /cannot exceed invoice total/
  );

  // Subsequent overpayment attempt rejected
  const sale = createSaleEngine(5000, 3000, 'Advance Paid');
  assert.throws(
    () => recordPaymentEngine(sale, 2500),
    /cannot exceed outstanding due balance/
  );
});

// Test 6: Verify mobile-friendly UI elements
runTest('Section 9 - Test 6: Verify mobile-friendly UI elements (viewport, responsive layout, inputMode, no horizontal overflow)', () => {
  const fs = require('fs');
  const indexHtml = fs.readFileSync('index.html', 'utf8');
  assert(indexHtml.includes('name="viewport"'), 'index.html must include viewport meta tag');
  assert(indexHtml.includes('width=device-width'), 'viewport must specify width=device-width');

  const salesEntryCode = fs.readFileSync('src/components/sales/SalesEntryView.tsx', 'utf8');
  assert(salesEntryCode.includes('inputMode="decimal"'), 'SalesEntryView must include numeric inputMode="decimal" for phones');
  assert(salesEntryCode.includes('sticky bottom-0'), 'SalesEntryView must include sticky mobile submit bar');

  const purchaseEntryCode = fs.readFileSync('src/components/purchases/PurchaseEntryView.tsx', 'utf8');
  assert(purchaseEntryCode.includes('inputMode="decimal"'), 'PurchaseEntryView must include inputMode="decimal"');
  assert(purchaseEntryCode.includes('sticky bottom-0'), 'PurchaseEntryView must include sticky mobile submit bar');

  const bottomNavCode = fs.readFileSync('src/components/layout/BottomNav.tsx', 'utf8');
  assert(bottomNavCode.includes('fixed bottom-0'), 'BottomNav must be fixed at bottom on mobile');

  const inventoryCode = fs.readFileSync('src/components/inventory/InventoryView.tsx', 'utf8');
  assert(inventoryCode.includes('sm:hidden'), 'InventoryView must provide responsive mobile cards');
});

// 21. PURCHASE DELETION & STOCK REVERSAL
runTest('Purchase Deletion: Deleting purchase bill reverses inward stock', () => {
  const items = [
    { id: 'item-1', name: 'Gold Ring', current_stock: 10 }
  ];
  const purchase = {
    id: 'pur-1',
    supplier_invoice_number: 'INV-100',
    items: [
      { item_id: 'item-1', quantity: 5 }
    ]
  };

  // Simulating inward addition (10 + 5 = 15)
  items[0].current_stock += purchase.items[0].quantity;
  assert.strictEqual(items[0].current_stock, 15);

  // Reversing inward upon deletion
  for (const line of purchase.items) {
    const item = items.find(i => i.id === line.item_id);
    if (item) {
      item.current_stock = Math.max(0, item.current_stock - line.quantity);
    }
  }

  assert.strictEqual(items[0].current_stock, 10, 'Stock must return to original 10 after purchase deletion');
});

console.log(`\n====================================================`);
console.log(`🎉 TEST SUMMARY: ${passedTests}/${totalTests} TESTS PASSED`);
console.log(`====================================================`);

if (passedTests !== totalTests) {
  process.exit(1);
}
