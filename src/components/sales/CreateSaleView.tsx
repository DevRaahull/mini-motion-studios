import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Plus,
  Trash2,
  Lock,
  AlertCircle,
  CheckCircle2,
  Calculator,
  User,
  Phone,
  FileText,
  CreditCard,
  Printer
} from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import { formatCurrency } from '../../lib/formatters';
import { Sale } from '../../types';
import { InvoiceReceiptModal } from './InvoiceReceiptModal';

interface SaleLineItemDraft {
  id: string;
  item_id: string;
  item_name: string;
  available_stock: number;
  quantity: number;
  purchase_rate: number; // READ ONLY!
  sale_rate: number; // EDITABLE!
}

export const CreateSaleView: React.FC = () => {
  const { items, settings, createSale, isOnline } = useAppData();

  // Active items only for sales
  const availableItems = useMemo(() => {
    return items.filter(i => !i.is_archived);
  }, [items]);

  // Generate default local date string for datetime-local input (YYYY-MM-DDTHH:mm)
  const getInitialDateTime = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - offset).toISOString().slice(0, 16);
  };

  // Form States
  const [saleDate, setSaleDate] = useState<string>(getInitialDateTime());
  const [invoiceNumber, setInvoiceNumber] = useState<string>(
    `${settings.invoice_prefix || 'SSJ-'}${settings.next_invoice_number || 2026008}`
  );
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('Cash');

  // Item Rows
  const [lines, setLines] = useState<SaleLineItemDraft[]>([
    {
      id: 'row-1',
      item_id: '',
      item_name: '',
      available_stock: 0,
      quantity: 1,
      purchase_rate: 0,
      sale_rate: 0
    }
  ]);

  // Submission States
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);

  // Handle Item Selector change
  const handleItemSelect = (rowId: string, itemId: string) => {
    const selected = availableItems.find(i => i.id === itemId);
    setLines(prev => prev.map(row => {
      if (row.id !== rowId) return row;
      if (!selected) {
        return {
          ...row,
          item_id: '',
          item_name: '',
          available_stock: 0,
          purchase_rate: 0,
          sale_rate: 0
        };
      }
      return {
        ...row,
        item_id: selected.id,
        item_name: selected.name,
        available_stock: selected.current_stock,
        purchase_rate: selected.purchase_rate, // Automatically loaded and locked!
        sale_rate: selected.default_sale_rate, // Pre-populated from default but editable!
        quantity: Math.min(row.quantity > 0 ? row.quantity : 1, selected.current_stock > 0 ? selected.current_stock : 1)
      };
    }));
  };

  // Handle Quantity change with stock limit validation
  const handleQuantityChange = (rowId: string, qtyStr: string) => {
    const val = parseFloat(qtyStr);
    const qty = isNaN(val) ? 0 : val;
    setLines(prev => prev.map(row => {
      if (row.id !== rowId) return row;
      return { ...row, quantity: qty };
    }));
  };

  // Handle Sale Rate change (Editable)
  const handleSaleRateChange = (rowId: string, rateStr: string) => {
    const val = parseFloat(rateStr);
    const rate = isNaN(val) ? 0 : val;
    setLines(prev => prev.map(row => {
      if (row.id !== rowId) return row;
      return { ...row, sale_rate: rate };
    }));
  };

  // Add Row
  const addRow = () => {
    setLines(prev => [
      ...prev,
      {
        id: `row-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        item_id: '',
        item_name: '',
        available_stock: 0,
        quantity: 1,
        purchase_rate: 0,
        sale_rate: 0
      }
    ]);
  };

  // Remove Row
  const removeRow = (rowId: string) => {
    if (lines.length <= 1) return;
    setLines(prev => prev.filter(r => r.id !== rowId));
  };

  // Calculations
  const calculatedTotals = useMemo(() => {
    let invoiceTotal = 0;
    let totalCost = 0;

    const rowCalculations = lines.map(line => {
      const lineTotal = Math.round(line.quantity * line.sale_rate * 100) / 100;
      const lineCost = Math.round(line.quantity * line.purchase_rate * 100) / 100;
      const lineProfit = Math.round((lineTotal - lineCost) * 100) / 100;

      invoiceTotal += lineTotal;
      totalCost += lineCost;

      return {
        lineTotal,
        lineCost,
        lineProfit,
        isStockExceeded: line.quantity > line.available_stock,
        isOutOfStock: line.available_stock <= 0
      };
    });

    const grossProfit = Math.round((invoiceTotal - totalCost) * 100) / 100;
    const profitMargin = invoiceTotal > 0 ? (grossProfit / invoiceTotal) * 100 : 0;

    return {
      invoiceTotal,
      totalCost,
      grossProfit,
      profitMargin,
      rowCalculations
    };
  }, [lines]);

  // Form Validation & Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isOnline) {
      setErrorMessage('Saving sales is disabled while offline to prevent data synchronization conflicts.');
      return;
    }

    if (!saleDate) {
      setErrorMessage('Sale Date is required.');
      return;
    }

    if (!invoiceNumber.trim()) {
      setErrorMessage('Invoice Number is required.');
      return;
    }

    // Validate items
    const validLines = lines.filter(l => l.item_id !== '');
    if (validLines.length === 0) {
      setErrorMessage('Please add at least one item to the invoice.');
      return;
    }

    // Check for duplicate items in same invoice
    const itemIds = validLines.map(l => l.item_id);
    if (new Set(itemIds).size !== itemIds.length) {
      setErrorMessage('The same item appears multiple times. Please combine into a single row with updated quantity.');
      return;
    }

    // Check stock availability
    for (const line of validLines) {
      if (line.quantity <= 0) {
        setErrorMessage(`Quantity for "${line.item_name}" must be greater than zero.`);
        return;
      }
      if (line.quantity > line.available_stock) {
        setErrorMessage(
          `Insufficient stock for "${line.item_name}". Available: ${line.available_stock}, Requested: ${line.quantity}.`
        );
        return;
      }
      if (line.sale_rate < 0) {
        setErrorMessage(`Sale rate for "${line.item_name}" cannot be negative.`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const salePayload = {
        sale_date: new Date(saleDate).toISOString(),
        invoice_number: invoiceNumber.trim(),
        customer_name: customerName.trim() || undefined,
        customer_phone: customerPhone.trim() || undefined,
        notes: notes.trim() || undefined,
        payment_method: paymentMethod
      };

      const itemsPayload = validLines.map(line => ({
        item_id: line.item_id,
        item_name: line.item_name,
        quantity: line.quantity,
        purchase_rate: line.purchase_rate,
        sale_rate: line.sale_rate
      }));

      const created = await createSale(salePayload, itemsPayload);
      setCompletedSale(created);

      // Reset form with incremented invoice number
      setSaleDate(getInitialDateTime());
      setCustomerName('');
      setCustomerPhone('');
      setNotes('');
      setLines([
        {
          id: `row-${Date.now()}`,
          item_id: '',
          item_name: '',
          available_stock: 0,
          quantity: 1,
          purchase_rate: 0,
          sale_rate: 0
        }
      ]);
      setInvoiceNumber(`${settings.invoice_prefix || 'SSJ-'}${settings.next_invoice_number + 1}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while creating the sale.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#1E2B45]">
        <div>
          <h2 className="text-xl lg:text-2xl font-serif font-bold text-gold-gradient tracking-wide">
            Create Sale / Invoice
          </h2>
          <p className="text-xs text-[#AAB4C5] mt-0.5">
            Record counter sales with atomic inventory deduction & instant printable receipts.
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#111B2E] border border-[#1E2B45] rounded-lg text-xs text-[#D6B36A]">
          <Calculator size={14} />
          <span>Real-time Gross Profit Engine</span>
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/40 rounded-xl text-rose-200 text-xs flex items-center gap-3 animate-in fade-in">
          <AlertCircle size={18} className="text-rose-400 shrink-0" />
          <span className="flex-1 font-medium">{errorMessage}</span>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-xs text-rose-400 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: INVOICE & CUSTOMER DETAILS (SALE DATE PROMINENTLY FIRST) */}
        <div className="bg-[#111B2E] border border-[#1E2B45] rounded-xl p-5 shadow-sm">
          <h3 className="text-xs font-semibold text-[#D6B36A] uppercase tracking-wider mb-4 flex items-center gap-2">
            <span>Invoice Information</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. SALE DATE (REQUIRED & PROMINENTLY FIRST) */}
            <div className="p-3 bg-[#0B1220] border-2 border-[#D6B36A]/50 rounded-xl shadow-inner">
              <label className="block text-xs font-bold text-[#D6B36A] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Calendar size={13} />
                <span>Sale Date & Time *</span>
              </label>
              <input
                type="datetime-local"
                required
                value={saleDate}
                onChange={(e) => setSaleDate(e.target.value)}
                className="w-full bg-[#111B2E] border border-[#1E2B45] rounded-lg px-3 py-2 text-sm text-[#F5F3EE] font-medium focus:outline-none focus:border-[#D6B36A] transition cursor-pointer"
              />
            </div>

            {/* 2. INVOICE NUMBER */}
            <div>
              <label className="block text-xs font-medium text-[#AAB4C5] mb-1">
                Invoice / Receipt No. *
              </label>
              <input
                type="text"
                required
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full bg-[#0B1220] border border-[#1E2B45] rounded-lg px-3 py-2.5 text-xs text-[#F5F3EE] font-mono focus:outline-none focus:border-[#D6B36A] transition"
              />
            </div>

            {/* 3. CUSTOMER NAME */}
            <div>
              <label className="block text-xs font-medium text-[#AAB4C5] mb-1 flex items-center gap-1">
                <User size={13} />
                <span>Customer Name (Optional)</span>
              </label>
              <input
                type="text"
                placeholder="Walk-in Customer"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-[#0B1220] border border-[#1E2B45] rounded-lg px-3 py-2.5 text-xs text-[#F5F3EE] focus:outline-none focus:border-[#D6B36A] transition"
              />
            </div>

            {/* 4. CUSTOMER PHONE */}
            <div>
              <label className="block text-xs font-medium text-[#AAB4C5] mb-1 flex items-center gap-1">
                <Phone size={13} />
                <span>Customer Phone (Optional)</span>
              </label>
              <input
                type="tel"
                placeholder="10-digit mobile number"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full bg-[#0B1220] border border-[#1E2B45] rounded-lg px-3 py-2.5 text-xs text-[#F5F3EE] font-mono focus:outline-none focus:border-[#D6B36A] transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-3 border-t border-[#1E2B45]/60">
            {/* Payment Method */}
            <div>
              <label className="block text-xs font-medium text-[#AAB4C5] mb-1 flex items-center gap-1">
                <CreditCard size={13} />
                <span>Payment Method</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['Cash', 'UPI', 'Card', 'Bank Transfer'].map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`py-2 text-xs font-medium rounded-lg border transition ${
                      paymentMethod === method
                        ? 'bg-[#D6B36A]/20 border-[#D6B36A] text-[#F5F3EE]'
                        : 'bg-[#0B1220] border-[#1E2B45] text-[#AAB4C5] hover:text-[#F5F3EE]'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-medium text-[#AAB4C5] mb-1 flex items-center gap-1">
                <FileText size={13} />
                <span>Sale Notes / Remarks</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Gift packing included, hallmarked 92.5"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-[#0B1220] border border-[#1E2B45] rounded-lg px-3 py-2 text-xs text-[#F5F3EE] focus:outline-none focus:border-[#D6B36A] transition"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: MULTIPLE ITEM ROWS */}
        <div className="bg-[#111B2E] border border-[#1E2B45] rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1E2B45]">
            <h3 className="text-xs font-semibold text-[#D6B36A] uppercase tracking-wider">
              Invoice Items ({lines.length})
            </h3>
            <button
              type="button"
              onClick={addRow}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#16233B] hover:bg-[#1E2E4A] border border-[#D6B36A]/40 text-[#D6B36A] rounded-lg text-xs font-semibold transition active:scale-95"
            >
              <Plus size={15} />
              <span>Add Another Item Row</span>
            </button>
          </div>

          {/* Desktop Table Header */}
          <div className="hidden lg:grid grid-cols-12 gap-3 text-[11px] font-semibold text-[#7A8699] uppercase tracking-wider px-2">
            <div className="col-span-4">Item Selector & Available Stock</div>
            <div className="col-span-1 text-center">Quantity</div>
            <div className="col-span-2 text-right">Purchase Rate (Read-Only)</div>
            <div className="col-span-2 text-right">Sale Rate (Editable)</div>
            <div className="col-span-2 text-right">Line Total & Profit</div>
            <div className="col-span-1 text-center">Action</div>
          </div>

          {/* Line Item Rows */}
          <div className="space-y-3">
            {lines.map((line, index) => {
              const calc = calculatedTotals.rowCalculations[index];

              return (
                <div
                  key={line.id}
                  className="bg-[#0B1220] border border-[#1E2B45] rounded-xl p-3.5 hover:border-[#2A3B5E] transition"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
                    {/* Item Selector & Stock */}
                    <div className="lg:col-span-4 space-y-1">
                      <label className="lg:hidden text-[10px] text-[#7A8699] uppercase">Item</label>
                      <select
                        value={line.item_id}
                        onChange={(e) => handleItemSelect(line.id, e.target.value)}
                        className="w-full bg-[#111B2E] border border-[#1E2B45] text-xs text-[#F5F3EE] rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#D6B36A] transition cursor-pointer"
                      >
                        <option value="">-- Choose Item from Inventory --</option>
                        {availableItems.map(item => (
                          <option key={item.id} value={item.id} disabled={item.current_stock <= 0}>
                            {item.name} {item.sku ? `(${item.sku})` : ''} &bull; Stock: {item.current_stock}
                          </option>
                        ))}
                      </select>

                      {/* Stock badge */}
                      {line.item_id && (
                        <div className="flex items-center gap-2 text-[11px] px-1">
                          <span className="text-[#AAB4C5]">Available Stock:</span>
                          <span className={`font-mono font-bold ${
                            line.available_stock <= 0
                              ? 'text-rose-400'
                              : line.available_stock <= 5
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }`}>
                            {line.available_stock} units
                          </span>
                          {calc.isStockExceeded && (
                            <span className="text-rose-400 font-semibold text-[10px] animate-pulse">
                              (Exceeds stock!)
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Quantity Input */}
                    <div className="lg:col-span-1">
                      <label className="lg:hidden text-[10px] text-[#7A8699] uppercase">Qty</label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        max={line.available_stock || 9999}
                        value={line.quantity || ''}
                        onChange={(e) => handleQuantityChange(line.id, e.target.value)}
                        className={`w-full bg-[#111B2E] border rounded-lg px-2.5 py-2 text-xs font-mono text-center text-[#F5F3EE] focus:outline-none focus:border-[#D6B36A] transition ${
                          calc.isStockExceeded ? 'border-rose-500 bg-rose-500/10' : 'border-[#1E2B45]'
                        }`}
                      />
                    </div>

                    {/* Purchase Rate per Unit (READ-ONLY WITH LOCK) */}
                    <div className="lg:col-span-2">
                      <label className="lg:hidden text-[10px] text-[#7A8699] uppercase">Purchase Cost (Locked)</label>
                      <div className="relative">
                        <input
                          type="text"
                          readOnly
                          tabIndex={-1}
                          value={line.purchase_rate.toFixed(2)}
                          className="w-full bg-[#0E1729]/90 border border-[#1E2B45] rounded-lg pl-8 pr-3 py-2 text-xs font-mono text-right text-[#AAB4C5] cursor-not-allowed select-none opacity-80"
                        />
                        <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-amber-500/70" title="Purchase Rate is Strictly Read-Only">
                          <Lock size={13} />
                        </div>
                      </div>
                      <div className="text-[10px] text-[#7A8699] text-right mt-0.5">
                        Read-only cost
                      </div>
                    </div>

                    {/* Default/Actual Sale Rate per Unit (EDITABLE) */}
                    <div className="lg:col-span-2">
                      <label className="lg:hidden text-[10px] text-[#7A8699] uppercase">Sale Rate (Editable)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={line.sale_rate || ''}
                        onChange={(e) => handleSaleRateChange(line.id, e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-[#111B2E] border border-[#1E2B45] rounded-lg px-3 py-2 text-xs font-mono text-right text-[#F5F3EE] focus:outline-none focus:border-[#D6B36A] transition"
                      />
                      <div className="text-[10px] text-[#AAB4C5] text-right mt-0.5">
                        Line Rate
                      </div>
                    </div>

                    {/* Line Total & Profit */}
                    <div className="lg:col-span-2 text-right">
                      <label className="lg:hidden text-[10px] text-[#7A8699] uppercase">Total / Profit</label>
                      <div className="font-mono font-bold text-xs text-[#F5F3EE]">
                        {formatCurrency(calc.lineTotal)}
                      </div>
                      <div className={`text-[11px] font-mono ${calc.lineProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        Profit: {formatCurrency(calc.lineProfit)}
                      </div>
                    </div>

                    {/* Delete Row Button */}
                    <div className="lg:col-span-1 flex justify-center">
                      <button
                        type="button"
                        onClick={() => removeRow(line.id)}
                        disabled={lines.length <= 1}
                        className={`p-2 rounded-lg transition ${
                          lines.length <= 1
                            ? 'text-slate-600 cursor-not-allowed'
                            : 'text-[#AAB4C5] hover:text-rose-400 hover:bg-rose-500/10'
                        }`}
                        title="Remove Item Row"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 3: INVOICE SUMMARY & ACTION BAR */}
        <div className="bg-[#111B2E] border border-[#1E2B45] rounded-xl p-5 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Summary Metric Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 w-full md:w-auto">
            <div>
              <p className="text-[11px] text-[#AAB4C5] uppercase tracking-wider">Total Quantity</p>
              <p className="text-lg font-bold text-[#F5F3EE] font-mono mt-0.5">
                {lines.reduce((s, l) => s + (l.quantity || 0), 0)}
              </p>
            </div>

            <div>
              <p className="text-[11px] text-[#AAB4C5] uppercase tracking-wider">Total Cost (COGS)</p>
              <p className="text-lg font-bold text-[#AAB4C5] font-mono mt-0.5">
                {formatCurrency(calculatedTotals.totalCost)}
              </p>
            </div>

            <div>
              <p className="text-[11px] text-[#D6B36A] uppercase tracking-wider">Gross Profit</p>
              <p className="text-lg font-bold text-[#D6B36A] font-mono mt-0.5">
                {formatCurrency(calculatedTotals.grossProfit)}
                <span className="text-xs font-normal text-emerald-400 ml-1.5">
                  ({calculatedTotals.profitMargin.toFixed(1)}%)
                </span>
              </p>
            </div>

            <div>
              <p className="text-[11px] text-[#7A8699] uppercase tracking-wider">Invoice Grand Total</p>
              <p className="text-2xl font-bold text-gold-gradient font-mono mt-0.5">
                {formatCurrency(calculatedTotals.invoiceTotal)}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <button
              type="submit"
              disabled={isSubmitting || calculatedTotals.invoiceTotal <= 0}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-[#D6B36A] hover:bg-[#c9a356] text-[#0B1220] rounded-xl text-sm font-bold shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#0B1220] border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving Sale & Updating Stock...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} strokeWidth={2.5} />
                  <span>Save Sale & Generate Receipt</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Invoice Receipt Modal (Displayed after successful sale or when clicked) */}
      {completedSale && (
        <InvoiceReceiptModal
          sale={completedSale}
          onClose={() => setCompletedSale(null)}
        />
      )}
    </div>
  );
};
