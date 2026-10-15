import React, { useState, useMemo } from 'react';
import {
  Search,
  Calendar,
  Printer,
  RotateCcw,
  AlertTriangle,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Filter,
  DollarSign
} from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import { Sale, DateFilterPreset } from '../../types';
import { formatCurrency, formatDate } from '../../lib/formatters';
import { exportToCsv } from '../../lib/exportUtils';
import { InvoiceReceiptModal } from '../sales/InvoiceReceiptModal';
import { RecordPaymentModal } from '../sales/RecordPaymentModal';

export const InvoicesListView: React.FC = () => {
  const { sales, voidSale } = useAppData();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPreset, setFilterPreset] = useState<DateFilterPreset>('this_month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'voided'>('all');

  // Modal states
  const [activeReceiptSale, setActiveReceiptSale] = useState<Sale | null>(null);
  const [saleToRecordPayment, setSaleToRecordPayment] = useState<Sale | null>(null);
  const [saleToVoid, setSaleToVoid] = useState<Sale | null>(null);
  const [voidReason, setVoidReason] = useState('');
  const [isVoiding, setIsVoiding] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Filtered sales
  const filteredSales = useMemo(() => {
    const now = new Date();

    let rangeStart: Date | null = null;
    let rangeEnd: Date | null = null;

    if (filterPreset === 'today') {
      rangeStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      rangeEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    } else if (filterPreset === 'this_month') {
      rangeStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      rangeEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    } else if (filterPreset === 'last_month') {
      rangeStart = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0);
      rangeEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    } else if (filterPreset === 'financial_year') {
      // Indian FY: April 1 to March 31
      const currentYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
      rangeStart = new Date(currentYear, 3, 1, 0, 0, 0);
      rangeEnd = new Date(currentYear + 1, 2, 31, 23, 59, 59);
    } else if (filterPreset === 'custom' && customStartDate && customEndDate) {
      // Strictly inclusive!
      rangeStart = new Date(`${customStartDate}T00:00:00`);
      rangeEnd = new Date(`${customEndDate}T23:59:59`);
    }

    return sales.filter((sale) => {
      // Voided / Completed filter
      if (statusFilter !== 'all' && sale.status !== statusFilter) return false;

      // Payment Status filter
      if (paymentStatusFilter !== 'all') {
        const ps = (sale.payment_status || 'Paid').toLowerCase();
        if (paymentStatusFilter === 'complete') {
          if (ps !== 'payment complete' && ps !== 'paid') return false;
        } else if (paymentStatusFilter === 'advance') {
          if (ps !== 'advance paid') return false;
        } else if (paymentStatusFilter === 'due') {
          if (ps !== 'due balance' && ps !== 'partially paid' && ps !== 'unpaid') return false;
        } else if (!ps.includes(paymentStatusFilter.toLowerCase())) {
          return false;
        }
      }

      // Date Range filter
      const saleDate = new Date(sale.sale_date);
      if (rangeStart && saleDate < rangeStart) return false;
      if (rangeEnd && saleDate > rangeEnd) return false;

      // Search query (invoice #, customer, GSTIN, item)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesInvoice = sale.invoice_number.toLowerCase().includes(query);
        const matchesCustomer = (sale.customer_name || '').toLowerCase().includes(query) || (sale.customer_phone || '').includes(query);
        const matchesGstin = (sale.buyer_gstin || '').toLowerCase().includes(query);
        const matchesItem = sale.items?.some(i => i.item_name.toLowerCase().includes(query));

        if (!matchesInvoice && !matchesCustomer && !matchesGstin && !matchesItem) return false;
      }

      return true;
    });
  }, [sales, filterPreset, customStartDate, customEndDate, paymentStatusFilter, statusFilter, searchQuery]);

  // Aggregate stats
  const aggregates = useMemo(() => {
    let totalBilled = 0;
    let totalReceived = 0;
    let totalDue = 0;
    let totalTaxable = 0;
    let totalGst = 0;

    filteredSales.forEach(s => {
      if (s.status === 'completed') {
        const gTotal = s.grand_total || (s as any).total_amount || 0;
        const rec = s.amount_received !== undefined ? s.amount_received : gTotal;
        const due = s.amount_due !== undefined ? s.amount_due : Math.max(0, gTotal - rec);
        const tax = s.total_taxable || (gTotal / 1.03);
        const gst = s.total_gst || (gTotal - tax);

        totalBilled += gTotal;
        totalReceived += rec;
        totalDue += due;
        totalTaxable += tax;
        totalGst += gst;
      }
    });

    return { totalBilled, totalReceived, totalDue, totalTaxable, totalGst };
  }, [filteredSales]);

  // Handle Void
  const handleConfirmVoid = async () => {
    if (!saleToVoid) return;
    if (!voidReason.trim()) {
      setActionError('Please specify a reason for voiding this invoice.');
      return;
    }

    setIsVoiding(true);
    setActionError(null);

    try {
      await voidSale(saleToVoid.id, voidReason.trim());
      setSaleToVoid(null);
      setVoidReason('');
    } catch (err: any) {
      console.error(err);
      setActionError(err.message || 'Failed to void invoice.');
    } finally {
      setIsVoiding(false);
    }
  };

  // CSV Export
  const handleExportCsv = () => {
    const headers = [
      'Invoice #',
      'Date',
      'Buyer Name',
      'Buyer GSTIN',
      'Payment Status',
      'Payment Mode',
      'Supply Type',
      'Taxable Value',
      'CGST',
      'SGST',
      'IGST',
      'Total GST',
      'Grand Total',
      'Amount Received',
      'Balance Due',
      'Status'
    ];

    const rows = filteredSales.map(s => {
      const gTotal = s.grand_total || (s as any).total_amount || 0;
      const rec = s.amount_received !== undefined ? s.amount_received : gTotal;
      const due = s.amount_due !== undefined ? s.amount_due : Math.max(0, gTotal - rec);
      const tax = s.total_taxable || (gTotal / 1.03);
      const gst = s.total_gst || (gTotal - tax);

      return [
        s.invoice_number,
        formatDate(s.sale_date),
        s.customer_name || 'Counter',
        s.buyer_gstin || 'Unregistered',
        s.payment_status || 'Paid',
        s.payment_method,
        s.is_interstate ? 'Inter-state (IGST)' : 'Intra-state',
        tax.toFixed(2),
        (s.total_cgst || 0).toFixed(2),
        (s.total_sgst || 0).toFixed(2),
        (s.total_igst || 0).toFixed(2),
        gst.toFixed(2),
        gTotal.toFixed(2),
        rec.toFixed(2),
        due.toFixed(2),
        s.status
      ];
    });

    exportToCsv(`wholesale_invoices_${new Date().toISOString().slice(0, 10)}`, headers, rows);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1E2B45]">
        <div>
          <h2 className="text-xl lg:text-2xl font-serif font-bold text-gold-gradient tracking-wide">
            Wholesale Bills & Invoices
          </h2>
          <p className="text-xs text-[#AAB4C5] mt-0.5">
            Search, print, export, and track buyer payments for all wholesale jewellery tax invoices.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#16233B] hover:bg-[#1E2E4A] border border-[#1E2B45] text-[#D6B36A] rounded-xl text-xs font-semibold shadow transition active:scale-95"
        >
          <FileSpreadsheet size={15} />
          <span>Export Invoices CSV</span>
        </button>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111B2E] border border-[#1E2B45] rounded-xl p-4 shadow-sm">
          <span className="text-xs text-[#AAB4C5] font-medium">Total Wholesale Billed</span>
          <p className="text-xl font-bold font-mono text-[#F5F3EE] mt-1.5">
            {formatCurrency(aggregates.totalBilled)}
          </p>
          <span className="text-[11px] text-[#7A8699] mt-0.5 block">
            Taxable: {formatCurrency(aggregates.totalTaxable)}
          </span>
        </div>

        <div className="bg-[#111B2E] border border-[#1E2B45] rounded-xl p-4 shadow-sm">
          <span className="text-xs text-[#AAB4C5] font-medium">Total Collections Received</span>
          <p className="text-xl font-bold font-mono text-emerald-400 mt-1.5">
            {formatCurrency(aggregates.totalReceived)}
          </p>
          <span className="text-[11px] text-[#7A8699] mt-0.5 block">
            Settled buyer payments
          </span>
        </div>

        <div className="bg-[#111B2E] border border-[#1E2B45] rounded-xl p-4 shadow-sm">
          <span className="text-xs text-[#AAB4C5] font-medium">Outstanding Receivables</span>
          <p className="text-xl font-bold font-mono text-rose-400 mt-1.5">
            {formatCurrency(aggregates.totalDue)}
          </p>
          <span className="text-[11px] text-[#7A8699] mt-0.5 block">
            Pending dues from buyers
          </span>
        </div>

        <div className="bg-[#111B2E] border border-[#1E2B45] rounded-xl p-4 shadow-sm">
          <span className="text-xs text-[#AAB4C5] font-medium">Total GST Collected</span>
          <p className="text-xl font-bold font-mono text-amber-400 mt-1.5">
            {formatCurrency(aggregates.totalGst)}
          </p>
          <span className="text-[11px] text-[#7A8699] mt-0.5 block">
            Output tax liability
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#111B2E] border border-[#1E2B45] rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row gap-3 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full lg:w-96">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A8699]" />
            <input
              type="text"
              placeholder="Search invoice #, buyer name, GSTIN, item..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[#0B1220] border border-[#1E2B45] rounded-lg pl-9 pr-3 py-2 text-xs text-[#F5F3EE] placeholder-[#7A8699] focus:outline-none focus:border-[#D6B36A] transition"
            />
          </div>

          {/* Date Presets & Status Filters */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <select
              value={filterPreset}
              onChange={e => setFilterPreset(e.target.value as DateFilterPreset)}
              className="bg-[#0B1220] border border-[#1E2B45] rounded-lg px-3 py-2 text-xs text-[#F5F3EE] focus:outline-none focus:border-[#D6B36A]"
            >
              <option value="today">Today</option>
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
              <option value="financial_year">Current Financial Year</option>
              <option value="custom">Custom Date Range</option>
            </select>

            <select
              value={paymentStatusFilter}
              onChange={e => setPaymentStatusFilter(e.target.value)}
              className="bg-[#0B1220] border border-[#1E2B45] rounded-lg px-3 py-2 text-xs text-[#F5F3EE] focus:outline-none focus:border-[#D6B36A]"
            >
              <option value="all">All Payment Statuses</option>
              <option value="complete">Payment Complete</option>
              <option value="advance">Advance Paid</option>
              <option value="due">Due Balance</option>
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="bg-[#0B1220] border border-[#1E2B45] rounded-lg px-3 py-2 text-xs text-[#F5F3EE] focus:outline-none focus:border-[#D6B36A]"
            >
              <option value="all">Active & Voided</option>
              <option value="completed">Active Bills Only</option>
              <option value="voided">Voided Bills Only</option>
            </select>
          </div>
        </div>

        {/* Custom Date Range Picker (Inclusive) */}
        {filterPreset === 'custom' && (
          <div className="pt-2 border-t border-[#1E2B45] flex flex-wrap items-center gap-3 text-xs text-[#AAB4C5]">
            <span>From Date:</span>
            <input
              type="date"
              value={customStartDate}
              onChange={e => setCustomStartDate(e.target.value)}
              className="bg-[#0B1220] border border-[#1E2B45] rounded-lg px-3 py-1.5 text-xs text-[#F5F3EE] focus:outline-none focus:border-[#D6B36A]"
            />
            <span>To Date (Inclusive):</span>
            <input
              type="date"
              value={customEndDate}
              onChange={e => setCustomEndDate(e.target.value)}
              className="bg-[#0B1220] border border-[#1E2B45] rounded-lg px-3 py-1.5 text-xs text-[#F5F3EE] focus:outline-none focus:border-[#D6B36A]"
            />
          </div>
        )}
      </div>

      {/* Mobile Invoices Card View */}
      <div className="sm:hidden space-y-3">
        {filteredSales.length === 0 ? (
          <div className="bg-[#111B2E] border border-[#1E2B45] rounded-xl p-6 text-center text-xs text-[#7A8699]">
            No invoices match your selected filters.
          </div>
        ) : (
          filteredSales.map((sale) => {
            const gTotal = sale.grand_total || (sale as any).total_amount || 0;
            const rec = sale.amount_received !== undefined ? sale.amount_received : gTotal;
            const due = sale.amount_due !== undefined ? sale.amount_due : Math.max(0, gTotal - rec);
            const isVoided = sale.status === 'voided';
            const paymentStatus = sale.payment_status || 'Paid';
            const isPaid = paymentStatus === 'Payment Complete' || paymentStatus === 'Paid';
            const isAdvance = paymentStatus === 'Advance Paid';

            return (
              <div
                key={sale.id}
                className={`bg-[#111B2E] border border-[#1E2B45] rounded-xl p-4 space-y-3 shadow-sm ${
                  isVoided ? 'opacity-60 bg-rose-950/10' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-[#D6B36A]">
                        {sale.invoice_number}
                      </span>
                      {isVoided && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold uppercase">
                          Voided
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-[#AAB4C5] block mt-0.5">
                      {sale.customer_name || 'Counter Buyer'} • {formatDate(sale.sale_date)}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold shrink-0 ${
                      isPaid
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : isAdvance
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {paymentStatus}
                  </span>
                </div>

                {/* Amount grid */}
                <div className="grid grid-cols-3 gap-2 bg-[#0B1220]/70 p-2.5 rounded-lg text-xs font-mono text-center">
                  <div>
                    <span className="text-[10px] text-[#7A8699] block font-sans">Total</span>
                    <span className="font-bold text-[#F5F3EE]">{formatCurrency(gTotal)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#7A8699] block font-sans">Received</span>
                    <span className="font-semibold text-emerald-400">{formatCurrency(rec)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#7A8699] block font-sans">Due</span>
                    <span className="font-bold text-rose-400">{formatCurrency(due)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-1 border-t border-[#1E2B45]/50">
                  {due > 0 && !isVoided ? (
                    <button
                      onClick={() => setSaleToRecordPayment(sale)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-semibold transition"
                    >
                      <DollarSign size={13} />
                      <span>Record Payment</span>
                    </button>
                  ) : (
                    <span className="text-[11px] text-emerald-400 font-medium">✓ Fully Settled</span>
                  )}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setActiveReceiptSale(sale)}
                      className="flex items-center gap-1 p-1.5 rounded-lg bg-[#16233B] text-[#D6B36A] text-xs transition"
                      title="View / Print"
                    >
                      <Printer size={14} />
                      <span>Bill</span>
                    </button>
                    {!isVoided && (
                      <button
                        onClick={() => {
                          setSaleToVoid(sale);
                          setActionError(null);
                        }}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
                        title="Void"
                      >
                        <RotateCcw size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Invoices Table (Desktop & Tablet) */}
      <div className="hidden sm:block bg-[#111B2E] border border-[#1E2B45] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#0E1726] border-b border-[#1E2B45] text-[#AAB4C5]">
                <th className="py-3 px-4 font-semibold">Invoice #</th>
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold">Buyer Name & GSTIN</th>
                <th className="py-3 px-4 font-semibold text-right">Taxable (₹)</th>
                <th className="py-3 px-4 font-semibold text-right">GST (₹)</th>
                <th className="py-3 px-4 font-semibold text-right">Total (₹)</th>
                <th className="py-3 px-4 font-semibold text-right">Due (₹)</th>
                <th className="py-3 px-4 font-semibold text-center">Payment</th>
                <th className="py-3 px-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2B45]/60">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-xs text-[#7A8699]">
                    No invoices match your selected filters.
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => {
                  const gTotal = sale.grand_total || (sale as any).total_amount || 0;
                  const rec = sale.amount_received !== undefined ? sale.amount_received : gTotal;
                  const due = sale.amount_due !== undefined ? sale.amount_due : Math.max(0, gTotal - rec);
                  const tax = sale.total_taxable || (gTotal / 1.03);
                  const gst = sale.total_gst || (gTotal - tax);
                  const isVoided = sale.status === 'voided';
                  const paymentStatus = sale.payment_status || 'Paid';
                  const isPaid = paymentStatus === 'Payment Complete' || paymentStatus === 'Paid';
                  const isAdvance = paymentStatus === 'Advance Paid';

                  return (
                    <tr
                      key={sale.id}
                      className={`hover:bg-[#16233B]/50 transition ${
                        isVoided ? 'opacity-60 bg-rose-950/10' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-mono font-semibold text-[#D6B36A]">
                        {sale.invoice_number}
                        {isVoided && (
                          <span className="block text-[9px] text-rose-400 uppercase tracking-widest font-sans font-bold">
                            Voided
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[#AAB4C5] whitespace-nowrap">
                        {formatDate(sale.sale_date)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-[#F5F3EE] block">
                          {sale.customer_name || 'Counter Buyer'}
                        </span>
                        {sale.buyer_gstin ? (
                          <span className="text-[10px] text-[#D6B36A] font-mono block">
                            GSTIN: {sale.buyer_gstin}
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#7A8699] block">
                            Unregistered
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-[#AAB4C5]">
                        {formatCurrency(tax)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-amber-400">
                        {formatCurrency(gst)}
                        <span className="block text-[9px] text-[#7A8699]">
                          {sale.is_interstate ? 'IGST' : 'CGST+SGST'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#F5F3EE]">
                        {formatCurrency(gTotal)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-rose-400 font-semibold">
                        {formatCurrency(due)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                            isPaid
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : isAdvance
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {paymentStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {due > 0 && !isVoided && (
                            <button
                              onClick={() => setSaleToRecordPayment(sale)}
                              className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition"
                              title="Record Subsequent Payment"
                            >
                              <DollarSign size={15} />
                            </button>
                          )}
                          <button
                            onClick={() => setActiveReceiptSale(sale)}
                            className="p-1.5 rounded-lg bg-[#16233B] hover:bg-[#1E2E4A] text-[#D6B36A] transition"
                            title="View / Print Tax Invoice"
                          >
                            <Printer size={15} />
                          </button>
                          {!isVoided && (
                            <button
                              onClick={() => {
                                setSaleToVoid(sale);
                                setActionError(null);
                              }}
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
                              title="Void Invoice (Restore Stock)"
                            >
                              <RotateCcw size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Modal */}
      {activeReceiptSale && (
        <InvoiceReceiptModal
          sale={activeReceiptSale}
          onClose={() => setActiveReceiptSale(null)}
        />
      )}

      {/* Void Invoice Confirmation Modal */}
      {saleToVoid && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#111B2E] border border-[#1E2B45] rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle size={24} />
              <h3 className="font-semibold text-base text-[#F5F3EE]">Void Wholesale Invoice?</h3>
            </div>

            <p className="text-xs text-[#AAB4C5] leading-relaxed">
              Voiding invoice <strong>{saleToVoid.invoice_number}</strong> will automatically restore
              all deducted quantities back into your inventory and reverse recorded sales totals.
            </p>

            {actionError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-xs">
                {actionError}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[#AAB4C5] mb-1">
                Reason for cancellation *
              </label>
              <textarea
                rows={2}
                required
                placeholder="e.g. Order cancelled by buyer / incorrect items entered"
                value={voidReason}
                onChange={e => setVoidReason(e.target.value)}
                className="w-full bg-[#0B1220] border border-[#1E2B45] rounded-lg p-2.5 text-xs text-[#F5F3EE] focus:outline-none focus:border-[#D6B36A] transition"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSaleToVoid(null)}
                className="px-4 py-2 bg-[#16233B] hover:bg-[#1E2E4A] text-[#F5F3EE] rounded-lg text-xs font-medium transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isVoiding}
                onClick={handleConfirmVoid}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow transition disabled:opacity-50"
              >
                {isVoiding ? 'Voiding...' : 'Confirm Void & Restore Stock'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record Subsequent Payment Modal */}
      {saleToRecordPayment && (
        <RecordPaymentModal
          sale={saleToRecordPayment}
          onClose={() => setSaleToRecordPayment(null)}
        />
      )}
    </div>
  );
};
