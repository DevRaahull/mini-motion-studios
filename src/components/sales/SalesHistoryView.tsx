import React, { useState, useMemo } from 'react';
import {
  Search,
  Calendar,
  Eye,
  RotateCcw,
  AlertTriangle,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Filter
} from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import { Sale, DateFilterPreset } from '../../types';
import { formatCurrency, formatDateTime } from '../../lib/formatters';
import { exportToCsv } from '../../lib/exportUtils';
import { InvoiceReceiptModal } from './InvoiceReceiptModal';

export const SalesHistoryView: React.FC = () => {
  const { sales, voidSale, isOnline } = useAppData();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPreset, setFilterPreset] = useState<DateFilterPreset>('this_month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'voided'>('all');

  // Modal states
  const [activeReceiptSale, setActiveReceiptSale] = useState<Sale | null>(null);
  const [saleToVoid, setSaleToVoid] = useState<Sale | null>(null);
  const [voidReason, setVoidReason] = useState('');
  const [isVoiding, setIsVoiding] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Filtered sales
  const filteredSales = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    // Calculate preset date ranges
    let rangeStart: Date | null = null;
    let rangeEnd: Date | null = null;

    if (filterPreset === 'today') {
      rangeStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      rangeEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    } else if (filterPreset === 'this_week') {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday as first day
      rangeStart = new Date(now.getFullYear(), now.getMonth(), diff, 0, 0, 0);
      rangeEnd = new Date(now.getFullYear(), now.getMonth(), diff + 6, 23, 59, 59);
    } else if (filterPreset === 'this_month') {
      rangeStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      rangeEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    } else if (filterPreset === 'custom' && customStartDate && customEndDate) {
      rangeStart = new Date(`${customStartDate}T00:00:00`);
      rangeEnd = new Date(`${customEndDate}T23:59:59`);
    }

    return sales.filter((sale) => {
      // Status filter
      if (statusFilter !== 'all' && sale.status !== statusFilter) return false;

      // Date Range filter
      const saleDate = new Date(sale.sale_date);
      if (rangeStart && saleDate < rangeStart) return false;
      if (rangeEnd && saleDate > rangeEnd) return false;

      // Search query (invoice #, customer, item)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesInvoice = sale.invoice_number.toLowerCase().includes(query);
        const matchesCustomer = (sale.customer_name || '').toLowerCase().includes(query) || (sale.customer_phone || '').includes(query);
        const matchesItem = sale.items?.some(i => i.item_name.toLowerCase().includes(query));

        if (!matchesInvoice && !matchesCustomer && !matchesItem) return false;
      }

      return true;
    });
  }, [sales, filterPreset, customStartDate, customEndDate, statusFilter, searchQuery]);

  // Financial aggregates of filtered results
  const summary = useMemo(() => {
    let totalRevenue = 0;
    let totalCost = 0;
    let totalProfit = 0;
    let completedCount = 0;

    filteredSales.forEach(s => {
      if (s.status === 'completed') {
        totalRevenue += s.total_amount;
        totalCost += s.total_cost;
        totalProfit += s.gross_profit;
        completedCount++;
      }
    });

    return { totalRevenue, totalCost, totalProfit, completedCount };
  }, [filteredSales]);

  // Controlled Reversal / Void Sale
  const handleConfirmVoid = async () => {
    if (!saleToVoid) return;
    if (!voidReason.trim()) {
      setActionError('Please provide a reason for cancelling this sale.');
      return;
    }
    setActionError(null);
    setIsVoiding(true);

    try {
      await voidSale(saleToVoid.id, voidReason.trim());
      setSaleToVoid(null);
      setVoidReason('');
    } catch (err: any) {
      setActionError(err.message || 'Failed to void sale');
    } finally {
      setIsVoiding(false);
    }
  };

  // CSV Export
  const handleExportCsv = () => {
    const headers = [
      'Invoice Number',
      'Sale Date',
      'Customer Name',
      'Customer Phone',
      'Payment Method',
      'Items Count',
      'Total Amount (₹)',
      'Total Cost (₹)',
      'Gross Profit (₹)',
      'Status',
      'Void Reason'
    ];

    const rows = filteredSales.map(s => [
      s.invoice_number,
      formatDateTime(s.sale_date),
      s.customer_name || 'Walk-in Customer',
      s.customer_phone || '',
      s.payment_method,
      s.items?.length || 1,
      s.total_amount.toFixed(2),
      s.total_cost.toFixed(2),
      s.gross_profit.toFixed(2),
      s.status,
      s.void_reason || ''
    ]);

    exportToCsv(`Sales_Register_${new Date().toISOString().slice(0, 10)}`, headers, rows);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1E2B45]">
        <div>
          <h2 className="text-xl lg:text-2xl font-serif font-bold text-gold-gradient tracking-wide">
            Sales Register & History
          </h2>
          <p className="text-xs text-[#AAB4C5] mt-0.5">
            Audit-grade sales register with controlled reversal workflows and receipt generation.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center gap-2 px-4 py-2 bg-[#16233B] hover:bg-[#1E2E4A] border border-[#1E2B45] text-[#D6B36A] rounded-lg text-xs font-semibold shadow transition active:scale-95 self-start sm:self-auto"
        >
          <FileSpreadsheet size={16} />
          <span>Export Register to CSV</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#111B2E] border border-[#1E2B45] rounded-xl p-4 space-y-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input (5 Cols) */}
          <div className="md:col-span-5 relative">
            <input
              type="text"
              placeholder="Search by invoice #, customer name, phone, or item..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0B1220] border border-[#1E2B45] rounded-lg pl-9 pr-4 py-2 text-xs text-[#F5F3EE] focus:outline-none focus:border-[#D6B36A] transition placeholder-[#7A8699]"
            />
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A8699]" />
          </div>

          {/* Date Filter Preset (3 Cols) */}
          <div className="md:col-span-3">
            <select
              value={filterPreset}
              onChange={(e) => setFilterPreset(e.target.value as any)}
              className="w-full bg-[#0B1220] border border-[#1E2B45] rounded-lg px-3 py-2 text-xs text-[#F5F3EE] focus:outline-none focus:border-[#D6B36A] transition cursor-pointer"
            >
              <option value="today">Today</option>
              <option value="this_week">This Week</option>
              <option value="this_month">This Month</option>
              <option value="custom">Custom Date Range</option>
            </select>
          </div>

          {/* Status Filter (4 Cols) */}
          <div className="md:col-span-4 flex items-center gap-2">
            <span className="text-xs text-[#AAB4C5] whitespace-nowrap">Status:</span>
            <div className="grid grid-cols-3 gap-1 flex-1">
              {(['all', 'completed', 'voided'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`py-1.5 text-xs font-medium rounded-lg capitalize transition border ${
                    statusFilter === st
                      ? 'bg-[#D6B36A]/20 border-[#D6B36A] text-[#F5F3EE]'
                      : 'bg-[#0B1220] border-[#1E2B45] text-[#AAB4C5] hover:text-[#F5F3EE]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Custom Date Range Picker */}
        {filterPreset === 'custom' && (
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-[#1E2B45]/60">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#AAB4C5]">From:</span>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="bg-[#0B1220] border border-[#1E2B45] rounded-lg px-3 py-1.5 text-xs text-[#F5F3EE] focus:outline-none focus:border-[#D6B36A]"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#AAB4C5]">To:</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="bg-[#0B1220] border border-[#1E2B45] rounded-lg px-3 py-1.5 text-xs text-[#F5F3EE] focus:outline-none focus:border-[#D6B36A]"
              />
            </div>
          </div>
        )}

        {/* Aggregate KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-[#1E2B45]/60 text-xs">
          <div>
            <span className="text-[#AAB4C5]">Filtered Completed Sales:</span>
            <p className="font-bold text-[#F5F3EE] font-mono text-sm mt-0.5">{summary.completedCount}</p>
          </div>
          <div>
            <span className="text-[#AAB4C5]">Total Revenue:</span>
            <p className="font-bold text-blue-400 font-mono text-sm mt-0.5">{formatCurrency(summary.totalRevenue)}</p>
          </div>
          <div>
            <span className="text-[#AAB4C5]">Total Cost (COGS):</span>
            <p className="font-bold text-slate-400 font-mono text-sm mt-0.5">{formatCurrency(summary.totalCost)}</p>
          </div>
          <div>
            <span className="text-[#AAB4C5]">Gross Profit:</span>
            <p className="font-bold text-[#D6B36A] font-mono text-sm mt-0.5">
              {formatCurrency(summary.totalProfit)}
            </p>
          </div>
        </div>
      </div>

      {/* Sales Register Table */}
      <div className="bg-[#111B2E] border border-[#1E2B45] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#0E1729] border-b border-[#1E2B45] text-[#7A8699] uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4 font-medium">Invoice #</th>
                <th className="py-3.5 px-4 font-medium">Date & Time</th>
                <th className="py-3.5 px-4 font-medium">Customer</th>
                <th className="py-3.5 px-4 font-medium text-center">Items</th>
                <th className="py-3.5 px-4 font-medium text-right">Invoice Total</th>
                <th className="py-3.5 px-4 font-medium text-right">Cost (COGS)</th>
                <th className="py-3.5 px-4 font-medium text-right">Gross Profit</th>
                <th className="py-3.5 px-4 font-medium text-center">Status</th>
                <th className="py-3.5 px-4 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2B45]/50">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#7A8699]">
                    No sales matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => {
                  const isVoid = sale.status === 'voided';
                  const itemsCount = sale.items?.length || 1;

                  return (
                    <tr
                      key={sale.id}
                      className={`hover:bg-[#16233B]/60 transition ${isVoid ? 'opacity-60 bg-rose-950/10' : ''}`}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-[#F5F3EE] whitespace-nowrap">
                        {sale.invoice_number}
                      </td>
                      <td className="py-3.5 px-4 text-[#AAB4C5] whitespace-nowrap">
                        {formatDateTime(sale.sale_date)}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-[#F5F3EE] font-medium">{sale.customer_name || 'Walk-in'}</div>
                        {sale.customer_phone && (
                          <div className="text-[10px] text-[#7A8699] font-mono">{sale.customer_phone}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-[#F5F3EE]">
                        {itemsCount}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-[#F5F3EE] whitespace-nowrap">
                        {formatCurrency(sale.total_amount)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-[#AAB4C5] whitespace-nowrap">
                        {formatCurrency(sale.total_cost)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold whitespace-nowrap text-[#D6B36A]">
                        {formatCurrency(sale.gross_profit)}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {isVoid ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                            <XCircle size={11} />
                            <span>Voided</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 size={11} />
                            <span>Completed</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* View Invoice Button */}
                          <button
                            onClick={() => setActiveReceiptSale(sale)}
                            className="p-1.5 text-[#AAB4C5] hover:text-[#D6B36A] hover:bg-[#16233B] rounded-lg transition"
                            title="View / Print Invoice"
                          >
                            <Eye size={16} />
                          </button>

                          {/* Controlled Reversal Button */}
                          {!isVoid && (
                            <button
                              onClick={() => {
                                setSaleToVoid(sale);
                                setVoidReason('');
                                setActionError(null);
                              }}
                              className="p-1.5 text-[#AAB4C5] hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                              title="Cancel / Void Sale (Controlled Reversal)"
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

      {/* Invoice Receipt Modal */}
      {activeReceiptSale && (
        <InvoiceReceiptModal
          sale={activeReceiptSale}
          onClose={() => setActiveReceiptSale(null)}
        />
      )}

      {/* Controlled Void / Reversal Confirmation Dialog */}
      {saleToVoid && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#111B2E] border border-rose-500/40 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 rounded-full bg-rose-500/20 border border-rose-500/30">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-base text-[#F5F3EE]">Void Sale & Restore Inventory</h3>
                <p className="text-xs text-[#AAB4C5]">Invoice #{saleToVoid.invoice_number}</p>
              </div>
            </div>

            <p className="text-xs text-[#AAB4C5] leading-relaxed">
              This action will mark the invoice as <strong>Voided</strong>, reverse financial records, and <strong>automatically restore the sold quantities back into inventory stock</strong> with a recorded audit trail.
            </p>

            {actionError && (
              <p className="text-xs text-rose-400 font-medium bg-rose-500/10 p-2 rounded border border-rose-500/30">
                {actionError}
              </p>
            )}

            <div>
              <label className="block text-xs font-medium text-[#AAB4C5] mb-1.5">
                Cancellation Reason (Required for Audit Trail) *
              </label>
              <textarea
                rows={3}
                required
                placeholder="e.g. Customer returned items, punch error, duplicate invoice..."
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                className="w-full bg-[#0B1220] border border-[#1E2B45] rounded-lg p-2.5 text-xs text-[#F5F3EE] focus:outline-none focus:border-rose-400 transition"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSaleToVoid(null)}
                className="px-4 py-2 bg-[#16233B] hover:bg-[#1E2E4A] text-[#F5F3EE] rounded-lg text-xs font-medium transition"
              >
                Keep Invoice
              </button>
              <button
                type="button"
                disabled={isVoiding || !voidReason.trim()}
                onClick={handleConfirmVoid}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold shadow transition disabled:opacity-50"
              >
                {isVoiding ? 'Restoring Stock...' : 'Confirm Void & Restock'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
