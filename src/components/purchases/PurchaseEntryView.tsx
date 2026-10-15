import React, { useState, useMemo } from 'react';
import {
  ShoppingBag,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  ArrowUpDown,
  Building,
  Calendar,
  FileText,
  DollarSign,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import { formatCurrency, formatDate } from '../../lib/formatters';
import { PaymentStatus, Purchase } from '../../types';

interface PurchaseLineForm {
  tempId: string;
  itemId: string; // If selecting existing
  itemName: string;
  category: string;
  quantity: number | '';
  unitPurchaseRate: number | '';
  gstRate: number;
}

export const PurchaseEntryView: React.FC = () => {
  const { items, purchases, createPurchase, deletePurchase, settings } = useAppData();

  const [activeSubTab, setActiveSubTab] = useState<'new_entry' | 'register'>('new_entry');

  // Form State
  const [purchaseDate, setPurchaseDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [supplierName, setSupplierName] = useState<string>('');
  const [supplierInvoiceNumber, setSupplierInvoiceNumber] = useState<string>('');
  const [supplierGstin, setSupplierGstin] = useState<string>('');
  const [isInterstate, setIsInterstate] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');

  const defaultGst = settings.default_gst_rate || 3;

  const [lines, setLines] = useState<PurchaseLineForm[]>([
    {
      tempId: 'line-1',
      itemId: '',
      itemName: '',
      category: 'Nose Pin',
      quantity: 1,
      unitPurchaseRate: '',
      gstRate: defaultGst
    }
  ]);

  const [amountPaid, setAmountPaid] = useState<number | ''>('');
  const [manualPaymentStatus, setManualPaymentStatus] = useState<PaymentStatus | 'auto'>('auto');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Register Search & Filter State
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedPurchaseId, setExpandedPurchaseId] = useState<string | null>(null);
  const [purchaseToDelete, setPurchaseToDelete] = useState<Purchase | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const handleDeletePurchase = async () => {
    if (!purchaseToDelete) return;
    setIsDeleting(true);
    setErrorMessage(null);
    try {
      await deletePurchase(purchaseToDelete.id);
      setSuccessMessage(`Purchase bill "${purchaseToDelete.supplier_invoice_number}" deleted and inward stock reversed.`);
      setPurchaseToDelete(null);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to delete purchase bill');
    } finally {
      setIsDeleting(false);
    }
  };

  // Supplier Autocomplete Suggestions
  const existingSuppliers = useMemo(() => {
    const list = Array.from(new Set(purchases.map(p => p.supplier_name.trim()))).filter(Boolean);
    return list;
  }, [purchases]);

  // Handle line item change
  const handleItemSelect = (index: number, selectedItemId: string) => {
    const updated = [...lines];
    if (selectedItemId === 'new_item') {
      updated[index].itemId = '';
      updated[index].itemName = '';
    } else {
      const found = items.find(i => i.id === selectedItemId);
      if (found) {
        updated[index].itemId = found.id;
        updated[index].itemName = found.name;
        updated[index].category = found.category || 'Jewellery';
        updated[index].unitPurchaseRate = found.purchase_rate || '';
      }
    }
    setLines(updated);
  };

  const handleUpdateLine = (index: number, field: keyof PurchaseLineForm, value: any) => {
    const updated = [...lines];
    updated[index] = { ...updated[index], [field]: value };
    setLines(updated);
  };

  const handleAddLine = () => {
    setLines([
      ...lines,
      {
        tempId: `line-${Date.now()}-${lines.length + 1}`,
        itemId: '',
        itemName: '',
        category: 'Nose Pin',
        quantity: 1,
        unitPurchaseRate: '',
        gstRate: defaultGst
      }
    ]);
  };

  const handleRemoveLine = (index: number) => {
    if (lines.length <= 1) return;
    setLines(lines.filter((_, i) => i !== index));
  };

  // Arithmetic Totals
  const calculatedLines = useMemo(() => {
    return lines.map(line => {
      const qty = typeof line.quantity === 'number' ? line.quantity : 0;
      const rate = typeof line.unitPurchaseRate === 'number' ? line.unitPurchaseRate : 0;
      const taxable = Math.round(qty * rate * 100) / 100;
      const gstAmt = Math.round((taxable * (line.gstRate / 100)) * 100) / 100;
      const lineTotal = Math.round((taxable + gstAmt) * 100) / 100;
      return {
        ...line,
        taxable,
        gstAmt,
        lineTotal
      };
    });
  }, [lines]);

  const totalTaxable = useMemo(() => {
    return calculatedLines.reduce((acc, l) => acc + l.taxable, 0);
  }, [calculatedLines]);

  const totalGst = useMemo(() => {
    return calculatedLines.reduce((acc, l) => acc + l.gstAmt, 0);
  }, [calculatedLines]);

  const grandTotal = useMemo(() => {
    return Math.round((totalTaxable + totalGst) * 100) / 100;
  }, [totalTaxable, totalGst]);

  const paidValue = typeof amountPaid === 'number' ? amountPaid : 0;
  const amountDue = Math.max(0, Math.round((grandTotal - paidValue) * 100) / 100);

  const effectivePaymentStatus: PaymentStatus = useMemo(() => {
    if (manualPaymentStatus !== 'auto') return manualPaymentStatus;
    if (paidValue >= grandTotal && grandTotal > 0) return 'Paid';
    if (paidValue > 0 && paidValue < grandTotal) return 'Partially Paid';
    return 'Unpaid';
  }, [manualPaymentStatus, paidValue, grandTotal]);

  const handleSubmitPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!supplierName.trim()) {
      setErrorMessage('Please enter Supplier Name.');
      return;
    }
    if (!supplierInvoiceNumber.trim()) {
      setErrorMessage('Please enter Supplier Invoice / Bill Number.');
      return;
    }

    // Validate lines
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line.itemName.trim()) {
        setErrorMessage(`Row #${i + 1}: Item name is required.`);
        return;
      }
      const qty = typeof line.quantity === 'number' ? line.quantity : 0;
      if (qty <= 0) {
        setErrorMessage(`Row #${i + 1}: Quantity must be greater than 0.`);
        return;
      }
      const rate = typeof line.unitPurchaseRate === 'number' ? line.unitPurchaseRate : 0;
      if (rate <= 0) {
        setErrorMessage(`Row #${i + 1}: Unit purchase rate must be greater than 0.`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const purchaseData = {
        purchase_date: new Date(purchaseDate).toISOString(),
        supplier_name: supplierName.trim(),
        supplier_gstin: supplierGstin.trim() || undefined,
        supplier_invoice_number: supplierInvoiceNumber.trim(),
        is_interstate: isInterstate,
        total_taxable: totalTaxable,
        total_gst: totalGst,
        grand_total: grandTotal,
        payment_status: effectivePaymentStatus,
        amount_paid: paidValue,
        amount_due: amountDue,
        notes: notes.trim() || undefined,
        status: 'active'
      };

      const itemsData = calculatedLines.map(line => ({
        item_id: line.itemId || undefined,
        item_name: line.itemName.trim(),
        quantity: Number(line.quantity),
        unit_purchase_rate: Number(line.unitPurchaseRate),
        gst_rate: line.gstRate,
        taxable_amount: line.taxable,
        gst_amount: line.gstAmt,
        line_total: line.lineTotal
      }));

      await createPurchase(purchaseData, itemsData);

      setSuccessMessage(`Purchase inward #${supplierInvoiceNumber} saved! Inventory stock increased successfully.`);

      // Reset form
      setSupplierName('');
      setSupplierInvoiceNumber('');
      setSupplierGstin('');
      setNotes('');
      setAmountPaid('');
      setLines([
        {
          tempId: `line-${Date.now()}`,
          itemId: '',
          itemName: '',
          category: 'Nose Pin',
          quantity: 1,
          unitPurchaseRate: '',
          gstRate: defaultGst
        }
      ]);

      setTimeout(() => setSuccessMessage(null), 6000);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to record purchase entry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered Purchases for Register
  const filteredPurchases = useMemo(() => {
    return purchases.filter(p => {
      if (p.status !== 'active') return false;

      const matchesSearch =
        p.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.supplier_invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.supplier_gstin && p.supplier_gstin.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus =
        statusFilter === 'all' || p.payment_status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [purchases, searchTerm, statusFilter]);

  // Aggregate Register Stats
  const registerStats = useMemo(() => {
    let totalInward = 0;
    let totalPaid = 0;
    let totalDue = 0;
    filteredPurchases.forEach(p => {
      totalInward += p.grand_total;
      totalPaid += p.amount_paid || 0;
      totalDue += p.amount_due || 0;
    });
    return { totalInward, totalPaid, totalDue };
  }, [filteredPurchases]);

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header & Sub-Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1E2B45]">
        <div>
          <h2 className="text-xl lg:text-2xl font-serif font-bold text-gold-gradient tracking-wide">
            Wholesale Purchase Inward
          </h2>
          <p className="text-xs text-[#AAB4C5] mt-0.5">
            Record supplier stock purchases, track GST input, and manage supplier payment dues.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#111B2E] p-1 rounded-xl border border-[#1E2B45]">
          <button
            onClick={() => setActiveSubTab('new_entry')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeSubTab === 'new_entry'
                ? 'bg-[#D6B36A] text-[#0B1220] shadow-sm'
                : 'text-[#AAB4C5] hover:text-[#F5F3EE]'
            }`}
          >
            + New Purchase Entry
          </button>
          <button
            onClick={() => setActiveSubTab('register')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeSubTab === 'register'
                ? 'bg-[#D6B36A] text-[#0B1220] shadow-sm'
                : 'text-[#AAB4C5] hover:text-[#F5F3EE]'
            }`}
          >
            Purchase Register ({purchases.length})
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in">
          <AlertCircle size={18} className="text-rose-400 shrink-0" />
          <span className="font-semibold">{errorMessage}</span>
        </div>
      )}

      {/* SUB-TAB 1: NEW PURCHASE ENTRY FORM */}
      {activeSubTab === 'new_entry' && (
        <form onSubmit={handleSubmitPurchase} className="space-y-6">
          {/* Card 1: Supplier & Invoice Header */}
          <div className="bg-[#111B2E] border border-[#1E2B45] rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-semibold text-[#D6B36A] uppercase tracking-wider flex items-center gap-2">
              <Building size={16} />
              <span>Supplier & Invoice Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#AAB4C5] mb-1">
                  Purchase Date *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={purchaseDate}
                    onChange={e => setPurchaseDate(e.target.value)}
                    className="w-full bg-[#0B1220] border border-[#1E2B45] rounded-lg px-3 py-2 text-xs text-[#F5F3EE] focus:outline-none focus:border-[#D6B36A] transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#AAB4C5] mb-1">
                  Supplier / Karigar Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. M/S Royal Jewels / Karigar Ramesh"
                  list="supplier-suggestions"
                  value={supplierName}
                  onChange={e => setSupplierName(e.target.value)}
                  className="w-full bg-[#0B1220] border border-[#1E2B45] rounded-lg px-3 py-2 text-xs text-[#F5F3EE] focus:outline-none focus:border-[#D6B36A] transition"
                />
                <datalist id="supplier-suggestions">
                  {existingSuppliers.map(s => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#AAB4C5] mb-1">
                  Supplier Bill / Invoice # *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. INV-2024-98"
                  value={supplierInvoiceNumber}
                  onChange={e => setSupplierInvoiceNumber(e.target.value)}
                  className="w-full bg-[#0B1220] border border-[#1E2B45] rounded-lg px-3 py-2 text-xs text-[#F5F3EE] font-mono focus:outline-none focus:border-[#D6B36A] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#AAB4C5] mb-1">
                  Supplier GSTIN (Optional)
                </label>
                <input
                  type="text"
                  maxLength={15}
                  placeholder="27AAAAA0000A1Z5"
                  value={supplierGstin}
                  onChange={e => setSupplierGstin(e.target.value.toUpperCase())}
                  className="w-full bg-[#0B1220] border border-[#1E2B45] rounded-lg px-3 py-2 text-xs text-[#F5F3EE] font-mono uppercase focus:outline-none focus:border-[#D6B36A] transition"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-[#AAB4C5] select-none">
                <input
                  type="checkbox"
                  checked={isInterstate}
                  onChange={e => setIsInterstate(e.target.checked)}
                  className="w-4 h-4 rounded bg-[#0B1220] border-[#1E2B45] text-[#D6B36A] focus:ring-0"
                />
                <span>Inter-state Purchase (IGST)</span>
              </label>
              <span className="text-[11px] text-[#7A8699]">
                {isInterstate ? '(Calculates IGST at total GST rate)' : '(Calculates CGST 1.5% + SGST 1.5% for intra-state)'}
              </span>
            </div>
          </div>

          {/* Card 2: Line Items with Inline Add Option */}
          <div className="bg-[#111B2E] border border-[#1E2B45] rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-[#D6B36A] uppercase tracking-wider flex items-center gap-2">
                <ShoppingBag size={16} />
                <span>Purchased Jewellery Items (Stock Inward)</span>
              </h3>
              <button
                type="button"
                onClick={handleAddLine}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#16233B] hover:bg-[#1E2E4A] border border-[#1E2B45] text-[#D6B36A] rounded-lg text-xs font-semibold transition"
              >
                <Plus size={14} />
                <span>Add Item Row</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#1E2B45] text-[#AAB4C5]">
                    <th className="pb-2.5 font-medium min-w-[200px]">Item Name / Selection</th>
                    <th className="pb-2.5 font-medium w-28 text-right">Quantity</th>
                    <th className="pb-2.5 font-medium w-32 text-right">Purchase Rate (₹)</th>
                    <th className="pb-2.5 font-medium w-24 text-right">GST %</th>
                    <th className="pb-2.5 font-medium w-28 text-right">Taxable (₹)</th>
                    <th className="pb-2.5 font-medium w-28 text-right">GST (₹)</th>
                    <th className="pb-2.5 font-medium w-32 text-right">Total (₹)</th>
                    <th className="pb-2.5 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E2B45]/50">
                  {lines.map((line, idx) => {
                    const calc = calculatedLines[idx];
                    return (
                      <tr key={line.tempId} className="group">
                        <td className="py-2.5 pr-3">
                          <div className="space-y-1.5">
                            {/* Choose existing or type new */}
                            <select
                              value={line.itemId || 'new_item'}
                              onChange={e => handleItemSelect(idx, e.target.value)}
                              className="w-full bg-[#0B1220] border border-[#1E2B45] rounded-md px-2 py-1.5 text-xs text-[#F5F3EE] focus:outline-none focus:border-[#D6B36A]"
                            >
                              <option value="new_item">+ Add New Item Name</option>
                              <optgroup label="Existing Inventory Items">
                                {items
                                  .filter(i => !i.is_archived)
                                  .map(i => (
                                    <option key={i.id} value={i.id}>
                                      {i.name} (Stock: {i.current_stock})
                                    </option>
                                  ))}
                              </optgroup>
                            </select>

                            {/* If new item, text input */}
                            {(!line.itemId || line.itemId === '') && (
                              <input
                                type="text"
                                required
                                placeholder="Enter item name (e.g. 22K Gold Ring)"
                                value={line.itemName}
                                onChange={e => handleUpdateLine(idx, 'itemName', e.target.value)}
                                className="w-full bg-[#0B1220] border border-[#D6B36A]/40 rounded-md px-2 py-1.5 text-xs text-[#D6B36A] focus:outline-none focus:border-[#D6B36A]"
                              />
                            )}
                          </div>
                        </td>

                        <td className="py-2.5 px-2 text-right">
                          <input
                            type="number"
                            inputMode="decimal"
                            min="1"
                            step="1"
                            required
                            value={line.quantity}
                            onChange={e =>
                              handleUpdateLine(
                                idx,
                                'quantity',
                                e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value) || 0)
                              )
                            }
                            className="w-full bg-[#0B1220] border border-[#1E2B45] rounded-md px-2 py-1.5 text-xs text-right text-[#F5F3EE] font-mono focus:outline-none focus:border-[#D6B36A]"
                          />
                        </td>

                        <td className="py-2.5 px-2 text-right">
                          <input
                            type="number"
                            inputMode="decimal"
                            min="0"
                            step="0.01"
                            required
                            placeholder="0.00"
                            value={line.unitPurchaseRate}
                            onChange={e =>
                              handleUpdateLine(
                                idx,
                                'unitPurchaseRate',
                                e.target.value === '' ? '' : parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-full bg-[#0B1220] border border-[#1E2B45] rounded-md px-2 py-1.5 text-xs text-right text-[#F5F3EE] font-mono focus:outline-none focus:border-[#D6B36A]"
                          />
                        </td>

                        <td className="py-2.5 px-2 text-right">
                          <select
                            value={line.gstRate}
                            onChange={e => handleUpdateLine(idx, 'gstRate', parseFloat(e.target.value) || 0)}
                            className="w-full bg-[#0B1220] border border-[#1E2B45] rounded-md px-2 py-1.5 text-xs text-right text-[#F5F3EE] font-mono focus:outline-none focus:border-[#D6B36A]"
                          >
                            <option value={3}>3%</option>
                            <option value={0}>0%</option>
                            <option value={1.5}>1.5%</option>
                            <option value={5}>5%</option>
                            <option value={12}>12%</option>
                            <option value={18}>18%</option>
                          </select>
                        </td>

                        <td className="py-2.5 px-2 text-right font-mono text-[#AAB4C5]">
                          {formatCurrency(calc.taxable)}
                        </td>

                        <td className="py-2.5 px-2 text-right font-mono text-amber-400">
                          {formatCurrency(calc.gstAmt)}
                        </td>

                        <td className="py-2.5 pl-2 text-right font-mono font-semibold text-[#F5F3EE]">
                          {formatCurrency(calc.lineTotal)}
                        </td>

                        <td className="py-2.5 pl-2 text-center">
                          {lines.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveLine(idx)}
                              className="text-[#7A8699] hover:text-rose-400 p-1 transition"
                              title="Delete Row"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Card 3: Summary, Tax Breakdown & Payment Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment & Remarks */}
            <div className="bg-[#111B2E] border border-[#1E2B45] rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-semibold text-[#D6B36A] uppercase tracking-wider flex items-center gap-2">
                <DollarSign size={16} />
                <span>Supplier Payment & Settlement</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#AAB4C5] mb-1">
                    Amount Paid to Supplier (₹)
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={amountPaid}
                    onChange={e =>
                      setAmountPaid(e.target.value === '' ? '' : parseFloat(e.target.value) || 0)
                    }
                    className="w-full bg-[#0B1220] border border-[#1E2B45] rounded-lg px-3 py-2 text-xs text-[#F5F3EE] font-mono focus:outline-none focus:border-[#D6B36A] transition"
                  />
                  <div className="flex gap-2 mt-1.5">
                    <button
                      type="button"
                      onClick={() => setAmountPaid(grandTotal)}
                      className="text-[10px] text-[#D6B36A] hover:underline"
                    >
                      Paid Full (₹{grandTotal})
                    </button>
                    <span className="text-[10px] text-[#7A8699]">•</span>
                    <button
                      type="button"
                      onClick={() => setAmountPaid(0)}
                      className="text-[10px] text-[#7A8699] hover:underline"
                    >
                      Unpaid (₹0)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#AAB4C5] mb-1">
                    Payment Status
                  </label>
                  <div className="p-2.5 rounded-lg border bg-[#0B1220] flex items-center justify-between text-xs">
                    <span className="text-[#AAB4C5]">Status:</span>
                    <span
                      className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                        effectivePaymentStatus === 'Paid'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : effectivePaymentStatus === 'Partially Paid'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {effectivePaymentStatus}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#AAB4C5] mb-1">
                  Notes / Supplier Terms (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. 50% paid via RTGS, balance due within 30 days"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full bg-[#0B1220] border border-[#1E2B45] rounded-lg p-2.5 text-xs text-[#F5F3EE] focus:outline-none focus:border-[#D6B36A] transition"
                />
              </div>
            </div>

            {/* Calculations Bill Summary */}
            <div className="bg-[#111B2E] border border-[#1E2B45] rounded-xl p-5 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-semibold text-[#D6B36A] uppercase tracking-wider mb-4 flex items-center gap-2">
                  <FileText size={16} />
                  <span>Invoice Valuation & Tax Totals</span>
                </h3>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between text-[#AAB4C5]">
                    <span>Total Taxable Inward Value:</span>
                    <span className="font-mono text-[#F5F3EE]">{formatCurrency(totalTaxable)}</span>
                  </div>

                  {isInterstate ? (
                    <div className="flex justify-between text-[#AAB4C5]">
                      <span>Total IGST:</span>
                      <span className="font-mono text-amber-400">{formatCurrency(totalGst)}</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between text-[#AAB4C5]">
                        <span>CGST ({defaultGst / 2}%):</span>
                        <span className="font-mono text-amber-400">{formatCurrency(totalGst / 2)}</span>
                      </div>
                      <div className="flex justify-between text-[#AAB4C5]">
                        <span>SGST ({defaultGst / 2}%):</span>
                        <span className="font-mono text-amber-400">{formatCurrency(totalGst / 2)}</span>
                      </div>
                    </>
                  )}

                  <div className="pt-2 border-t border-[#1E2B45] flex justify-between text-sm font-bold">
                    <span className="text-[#D6B36A]">Grand Total Inward:</span>
                    <span className="font-mono text-[#D6B36A] text-base">{formatCurrency(grandTotal)}</span>
                  </div>

                  <div className="pt-2 border-t border-[#1E2B45]/50 flex justify-between text-xs text-[#AAB4C5]">
                    <span>Amount Paid:</span>
                    <span className="font-mono text-emerald-400">{formatCurrency(paidValue)}</span>
                  </div>

                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-rose-400">Balance Due to Supplier:</span>
                    <span className="font-mono text-rose-400">{formatCurrency(amountDue)}</span>
                  </div>
                </div>
              </div>

              {/* Desktop Submit Button */}
              <div className="hidden lg:flex pt-6 items-center justify-end gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#D6B36A] hover:bg-[#c9a356] text-[#0B1220] rounded-xl text-xs font-bold shadow-md transition active:scale-95 disabled:opacity-50"
                >
                  <CheckCircle2 size={16} strokeWidth={2.5} />
                  <span>{isSubmitting ? 'Recording Inward...' : 'Confirm & Inward Stock'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sticky Mobile Submit Bar */}
          <div className="lg:hidden sticky bottom-0 -mx-4 -mb-6 px-4 py-3 bg-[#0B1220]/95 backdrop-blur border-t border-[#1E2B45] flex items-center justify-between gap-3 z-30 shadow-2xl">
            <div>
              <span className="text-[10px] text-[#AAB4C5] block font-mono">Inward: {formatCurrency(grandTotal)}</span>
              <span className="text-xs font-mono font-bold text-rose-400">Due: {formatCurrency(amountDue)}</span>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 px-4 bg-[#D6B36A] hover:bg-[#c9a356] text-[#0B1220] rounded-xl text-xs font-bold shadow-lg transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 size={16} strokeWidth={2.5} />
              <span>{isSubmitting ? 'Recording...' : 'Inward Stock'}</span>
            </button>
          </div>
        </form>
      )}

      {/* SUB-TAB 2: PURCHASE REGISTER */}
      {activeSubTab === 'register' && (
        <div className="space-y-6">
          {/* Metrics bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#111B2E] border border-[#1E2B45] rounded-xl p-4">
              <span className="text-xs text-[#AAB4C5]">Total Purchases (Active)</span>
              <p className="text-lg font-bold font-mono text-[#F5F3EE] mt-1">
                {formatCurrency(registerStats.totalInward)}
              </p>
            </div>
            <div className="bg-[#111B2E] border border-[#1E2B45] rounded-xl p-4">
              <span className="text-xs text-[#AAB4C5]">Total Paid to Suppliers</span>
              <p className="text-lg font-bold font-mono text-emerald-400 mt-1">
                {formatCurrency(registerStats.totalPaid)}
              </p>
            </div>
            <div className="bg-[#111B2E] border border-[#1E2B45] rounded-xl p-4">
              <span className="text-xs text-[#AAB4C5]">Outstanding Supplier Payables</span>
              <p className="text-lg font-bold font-mono text-rose-400 mt-1">
                {formatCurrency(registerStats.totalDue)}
              </p>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-[#111B2E] border border-[#1E2B45] rounded-xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A8699]" />
              <input
                type="text"
                placeholder="Search supplier, invoice #, GSTIN..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-[#0B1220] border border-[#1E2B45] rounded-lg pl-9 pr-3 py-2 text-xs text-[#F5F3EE] placeholder-[#7A8699] focus:outline-none focus:border-[#D6B36A] transition"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-[#AAB4C5]">Status:</span>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-[#0B1220] border border-[#1E2B45] rounded-lg px-3 py-2 text-xs text-[#F5F3EE] focus:outline-none focus:border-[#D6B36A]"
              >
                <option value="all">All Statuses</option>
                <option value="paid">Paid</option>
                <option value="partially paid">Partially Paid</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </div>
          </div>

          {/* Mobile Cards View (sm:hidden) */}
          <div className="sm:hidden space-y-3">
            {filteredPurchases.length === 0 ? (
              <div className="bg-[#111B2E] border border-[#1E2B45] rounded-xl p-8 text-center text-xs text-[#7A8699]">
                No purchase inward entries found.
              </div>
            ) : (
              filteredPurchases.map(p => {
                const isExpanded = expandedPurchaseId === p.id;
                return (
                  <div key={p.id} className="bg-[#111B2E] border border-[#1E2B45] rounded-xl p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-semibold text-sm text-[#F5F3EE] block">{p.supplier_name}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-mono text-[#D6B36A]">{p.supplier_invoice_number}</span>
                          <span className="text-[10px] text-[#7A8699]">• {formatDate(p.purchase_date)}</span>
                        </div>
                      </div>
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold shrink-0 ${
                          p.payment_status === 'Paid'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : p.payment_status === 'Partially Paid'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {p.payment_status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1E2B45]/60 text-xs">
                      <div>
                        <span className="text-[10px] text-[#AAB4C5] block">Total Inward</span>
                        <span className="font-mono font-bold text-[#F5F3EE]">{formatCurrency(p.grand_total)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-[#AAB4C5] block">Due to Supplier</span>
                        <span className="font-mono font-bold text-rose-400">{formatCurrency(p.amount_due)}</span>
                      </div>
                    </div>

                    {isExpanded && p.items && p.items.length > 0 && (
                      <div className="pt-2 border-t border-[#1E2B45]/60 space-y-1.5 bg-[#0B1220]/50 p-2.5 rounded-lg">
                        <span className="text-[10px] font-semibold text-[#D6B36A] uppercase tracking-wider block">Inward Items</span>
                        {p.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs">
                            <span className="text-[#F5F3EE]">{it.item_name} × {it.quantity}</span>
                            <span className="font-mono text-[#AAB4C5]">{formatCurrency(it.line_total)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-[#1E2B45]/60">
                      <button
                        onClick={() => setExpandedPurchaseId(isExpanded ? null : p.id)}
                        className="text-xs text-[#AAB4C5] hover:text-[#F5F3EE] flex items-center gap-1"
                      >
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        <span>{isExpanded ? 'Hide Items' : `View Items (${p.items?.length || 0})`}</span>
                      </button>
                      <button
                        onClick={() => setPurchaseToDelete(p)}
                        className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                      >
                        <Trash2 size={13} />
                        <span>Delete Bill</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Desktop Purchases Table (hidden sm:block) */}
          <div className="hidden sm:block bg-[#111B2E] border border-[#1E2B45] rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#0E1726] border-b border-[#1E2B45] text-[#AAB4C5]">
                    <th className="py-3 px-4 font-semibold">Date</th>
                    <th className="py-3 px-4 font-semibold">Supplier / Karigar</th>
                    <th className="py-3 px-4 font-semibold">Supplier Invoice #</th>
                    <th className="py-3 px-4 font-semibold text-right">Taxable (₹)</th>
                    <th className="py-3 px-4 font-semibold text-right">GST (₹)</th>
                    <th className="py-3 px-4 font-semibold text-right">Total (₹)</th>
                    <th className="py-3 px-4 font-semibold text-right">Due (₹)</th>
                    <th className="py-3 px-4 font-semibold text-center">Status</th>
                    <th className="py-3 px-4 font-semibold text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E2B45]/60">
                  {filteredPurchases.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-xs text-[#7A8699]">
                        No purchase inward entries found.
                      </td>
                    </tr>
                  ) : (
                    filteredPurchases.map(p => {
                      const isExpanded = expandedPurchaseId === p.id;
                      return (
                        <React.Fragment key={p.id}>
                          <tr className="hover:bg-[#16233B]/50 transition">
                            <td className="py-3 px-4 text-[#AAB4C5] whitespace-nowrap">
                              {formatDate(p.purchase_date)}
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-semibold text-[#F5F3EE] block">{p.supplier_name}</span>
                              {p.supplier_gstin && (
                                <span className="text-[10px] text-[#7A8699] font-mono block">
                                  GST: {p.supplier_gstin}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 font-mono text-[#D6B36A]">
                              {p.supplier_invoice_number}
                            </td>
                            <td className="py-3 px-4 text-right font-mono text-[#AAB4C5]">
                              {formatCurrency(p.total_taxable)}
                            </td>
                            <td className="py-3 px-4 text-right font-mono text-amber-400">
                              {formatCurrency(p.total_gst)}
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-bold text-[#F5F3EE]">
                              {formatCurrency(p.grand_total)}
                            </td>
                            <td className="py-3 px-4 text-right font-mono text-rose-400 font-semibold">
                              {formatCurrency(p.amount_due)}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                                  p.payment_status === 'Paid'
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : p.payment_status === 'Partially Paid'
                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                }`}
                              >
                                {p.payment_status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => setExpandedPurchaseId(isExpanded ? null : p.id)}
                                  className="p-1.5 rounded-lg hover:bg-[#1E2B45] text-[#AAB4C5] hover:text-[#F5F3EE] transition"
                                  title="Toggle Items"
                                >
                                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </button>
                                <button
                                  onClick={() => setPurchaseToDelete(p)}
                                  className="p-1.5 rounded-lg hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition"
                                  title="Delete Purchase Bill"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* Expanded Items Drawer */}
                          {isExpanded && (
                            <tr className="bg-[#0B1220]/70">
                              <td colSpan={9} className="p-4 border-y border-[#1E2B45]">
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between text-xs text-[#D6B36A] font-semibold">
                                    <span>Purchased Items Breakdown</span>
                                    <span>{p.is_interstate ? 'Inter-state (IGST)' : 'Intra-state (CGST + SGST)'}</span>
                                  </div>
                                  <table className="w-full text-left text-xs bg-[#111B2E] rounded-lg overflow-hidden border border-[#1E2B45]/60">
                                    <thead>
                                      <tr className="border-b border-[#1E2B45] text-[#AAB4C5]">
                                        <th className="py-1.5 px-3">Item Name</th>
                                        <th className="py-1.5 px-3 text-right">Quantity</th>
                                        <th className="py-1.5 px-3 text-right">Unit Rate</th>
                                        <th className="py-1.5 px-3 text-right">GST Rate</th>
                                        <th className="py-1.5 px-3 text-right">Taxable Amount</th>
                                        <th className="py-1.5 px-3 text-right">Total Amount</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#1E2B45]/40 font-mono">
                                      {p.items && p.items.length > 0 ? (
                                        p.items.map((it, i) => (
                                          <tr key={i}>
                                            <td className="py-1.5 px-3 font-sans text-[#F5F3EE]">{it.item_name}</td>
                                            <td className="py-1.5 px-3 text-right">{it.quantity}</td>
                                            <td className="py-1.5 px-3 text-right">{formatCurrency(it.unit_purchase_rate)}</td>
                                            <td className="py-1.5 px-3 text-right">{it.gst_rate}%</td>
                                            <td className="py-1.5 px-3 text-right">{formatCurrency(it.taxable_amount)}</td>
                                            <td className="py-1.5 px-3 text-right font-semibold text-[#D6B36A]">{formatCurrency(it.line_total)}</td>
                                          </tr>
                                        ))
                                      ) : (
                                        <tr>
                                          <td colSpan={6} className="py-2 text-center text-[#7A8699]">
                                            No item details recorded for this purchase.
                                          </td>
                                        </tr>
                                      )}
                                    </tbody>
                                  </table>
                                  {p.notes && (
                                    <p className="text-[11px] text-[#AAB4C5] italic pt-1">
                                      Notes: {p.notes}
                                    </p>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* DELETE PURCHASE CONFIRMATION MODAL */}
      {purchaseToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#111B2E] border border-[#1E2B45] rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl text-left">
            <div className="flex items-start gap-3.5">
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl shrink-0">
                <Trash2 size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#F5F3EE]">Delete Purchase Bill?</h3>
                <p className="text-xs text-[#AAB4C5] mt-1">
                  Are you sure you want to delete this purchase entry? This will reverse the inward stock quantity from your inventory.
                </p>
              </div>
            </div>

            <div className="bg-[#0B1220] border border-[#1E2B45] rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#AAB4C5]">Supplier:</span>
                <span className="font-semibold text-[#F5F3EE]">{purchaseToDelete.supplier_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#AAB4C5]">Invoice #:</span>
                <span className="font-mono text-[#D6B36A]">{purchaseToDelete.supplier_invoice_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#AAB4C5]">Purchase Date:</span>
                <span className="text-[#F5F3EE]">{formatDate(purchaseToDelete.purchase_date)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-[#1E2B45]">
                <span className="text-[#AAB4C5]">Total Bill Amount:</span>
                <span className="font-mono font-bold text-[#F5F3EE]">{formatCurrency(purchaseToDelete.grand_total)}</span>
              </div>
              {purchaseToDelete.items && purchaseToDelete.items.length > 0 && (
                <div className="pt-2 border-t border-[#1E2B45]">
                  <span className="text-[11px] text-[#AAB4C5] block mb-1">Items stock to be reversed:</span>
                  <div className="space-y-1">
                    {purchaseToDelete.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between text-[11px] text-rose-300 font-mono">
                        <span>• {it.item_name}</span>
                        <span>-{it.quantity} qty</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-300 flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-amber-400" />
              <span>Deducted stock will be permanently removed from inventory.</span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPurchaseToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 bg-[#16233B] hover:bg-[#1E2E4A] border border-[#1E2B45] text-[#AAB4C5] hover:text-[#F5F3EE] rounded-xl text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeletePurchase}
                disabled={isDeleting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg transition active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
              >
                <Trash2 size={14} />
                <span>{isDeleting ? 'Deleting...' : 'Delete & Revert Stock'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
