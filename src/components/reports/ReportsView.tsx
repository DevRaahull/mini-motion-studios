import React, { useState, useMemo } from 'react';
import {
  FileText, Calendar, FileSpreadsheet, Printer, ChevronDown,
  TrendingUp, Coins, Percent, Wallet, Scale, CreditCard, AlertTriangle, Boxes
} from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import { ReportType, DateFilterPreset } from '../../types';
import { formatCurrency, formatDate, formatDateTime } from '../../lib/formatters';
import { exportToCsv } from '../../lib/exportUtils';

export const ReportsView: React.FC = () => {
  const { items, sales, expenses, settings } = useAppData();

  const [activeReport, setActiveReport] = useState<ReportType>('net_operating_result');
  const [datePreset, setDatePreset] = useState<DateFilterPreset>('this_month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const { startDate, endDate, dateRangeLabel } = useMemo(() => {
    const now = new Date();
    let start: Date;
    let end: Date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    let label = '';

    if (datePreset === 'today') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      label = `Today (${formatDate(now)})`;
    } else if (datePreset === 'this_month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      label = `This Month (${now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })})`;
    } else if (datePreset === 'last_month') {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      label = `Previous Month (${start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })})`;
    } else if (datePreset === 'this_year') {
      start = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
      end = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
      label = `Calendar Year ${now.getFullYear()}`;
    } else if (datePreset === 'financial_year') {
      const currentMonth = now.getMonth();
      const fyStartYear = currentMonth >= 3 ? now.getFullYear() : now.getFullYear() - 1;
      start = new Date(fyStartYear, 3, 1, 0, 0, 0);
      end = new Date(fyStartYear + 1, 2, 31, 23, 59, 59);
      label = `Financial Year FY ${fyStartYear}-${fyStartYear + 1}`;
    } else if (datePreset === 'custom' && customStart && customEnd) {
      start = new Date(`${customStart}T00:00:00`);
      end = new Date(`${customEnd}T23:59:59`);
      label = `Custom Range (${formatDate(start)} to ${formatDate(end)})`;
    } else {
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      label = `This Month (${now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })})`;
    }

    return { startDate: start, endDate: end, dateRangeLabel: label };
  }, [datePreset, customStart, customEnd]);

  const periodSales = useMemo(() => {
    return sales.filter(s => {
      if (s.status !== 'completed') return false;
      const d = new Date(s.sale_date);
      return d >= startDate && d <= endDate;
    });
  }, [sales, startDate, endDate]);

  const periodExpenses = useMemo(() => {
    return expenses.filter(e => {
      if (e.is_cancelled) return false;
      const d = new Date(e.expense_date);
      return d >= startDate && d <= endDate;
    });
  }, [expenses, startDate, endDate]);

  const totalRevenue = periodSales.reduce((s, x) => s + x.total_amount, 0);
  const totalCost = periodSales.reduce((s, x) => s + x.total_cost, 0);
  const grossProfit = totalRevenue - totalCost;
  const grossMarginPct = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
  const totalOperatingExpenses = periodExpenses.reduce((s, x) => s + x.amount, 0);
  const netOperatingResult = grossProfit - totalOperatingExpenses;

  const activeItems = useMemo(() => items.filter(i => !i.is_archived), [items]);
  const inventoryValuation = useMemo(() => {
    return activeItems.reduce((sum, i) => sum + (i.current_stock * i.purchase_rate), 0);
  }, [activeItems]);

  const itemWiseSummary = useMemo(() => {
    const map = new Map<string, {
      name: string; category: string; qtySold: number; revenue: number; cost: number; profit: number;
    }>();

    periodSales.forEach(sale => {
      sale.items?.forEach(line => {
        const key = line.item_name;
        const existing = map.get(key) || {
          name: line.item_name, category: 'Jewellery', qtySold: 0, revenue: 0, cost: 0, profit: 0
        };
        existing.qtySold += line.quantity;
        existing.revenue += line.line_total;
        existing.cost += line.line_cost;
        existing.profit += line.line_profit;
        map.set(key, existing);
      });
    });

    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
  }, [periodSales]);

  const categoryExpenses = useMemo(() => {
    const map = new Map<string, number>();
    periodExpenses.forEach(e => {
      map.set(e.category, (map.get(e.category) || 0) + e.amount);
    });
    return Array.from(map.entries())
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalOperatingExpenses > 0 ? (amount / totalOperatingExpenses) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [periodExpenses, totalOperatingExpenses]);

  const paymentMethodSummary = useMemo(() => {
    const map = new Map<string, { sales: number; expenses: number }>();
    ['Cash', 'UPI', 'Card', 'Bank Transfer'].forEach(m => map.set(m, { sales: 0, expenses: 0 }));

    periodSales.forEach(s => {
      const entry = map.get(s.payment_method) || { sales: 0, expenses: 0 };
      entry.sales += s.total_amount;
      map.set(s.payment_method, entry);
    });

    periodExpenses.forEach(e => {
      const entry = map.get(e.payment_method) || { sales: 0, expenses: 0 };
      entry.expenses += e.amount;
      map.set(e.payment_method, entry);
    });

    return Array.from(map.entries()).map(([method, data]) => ({
      method,
      sales: data.sales,
      expenses: data.expenses,
      net: data.sales - data.expenses
    }));
  }, [periodSales, periodExpenses]);

  const handleExportCsv = () => {
    const filename = `Report_${activeReport}_${new Date().toISOString().slice(0, 10)}`;
    let headers: string[] = [];
    let rows: (string | number)[][] = [];

    if (activeReport === 'daily_sales' || activeReport === 'monthly_sales' || activeReport === 'custom_sales') {
      headers = ['Invoice No.', 'Sale Date', 'Customer', 'Payment Method', 'Items Count', 'Revenue (₹)', 'Cost (₹)', 'Gross Profit (₹)'];
      rows = periodSales.map(s => [
        s.invoice_number,
        formatDateTime(s.sale_date),
        s.customer_name || 'Walk-in',
        s.payment_method,
        s.items?.length || 1,
        s.total_amount.toFixed(2),
        s.total_cost.toFixed(2),
        s.gross_profit.toFixed(2)
      ]);
    } else if (activeReport === 'item_wise_sales') {
      headers = ['Item Name', 'Quantity Sold', 'Total Revenue (₹)', 'Total COGS (₹)', 'Gross Profit (₹)', 'Margin (%)'];
      rows = itemWiseSummary.map(i => [
        i.name,
        i.qtySold,
        i.revenue.toFixed(2),
        i.cost.toFixed(2),
        i.profit.toFixed(2),
        i.revenue > 0 ? ((i.profit / i.revenue) * 100).toFixed(1) : 0
      ]);
    } else if (activeReport === 'inventory_stock' || activeReport === 'low_stock' || activeReport === 'inventory_valuation') {
      const list = activeReport === 'low_stock' ? activeItems.filter(i => i.current_stock <= i.low_stock_threshold) : activeItems;
      headers = ['Item Name', 'SKU', 'Category', 'Stock Qty', 'Low Threshold', 'Purchase Rate (₹)', 'Sale Rate (₹)', 'Valuation (₹)'];
      rows = list.map(i => [
        i.name,
        i.sku || '',
        i.category,
        i.current_stock,
        i.low_stock_threshold,
        i.purchase_rate.toFixed(2),
        i.default_sale_rate.toFixed(2),
        (i.current_stock * i.purchase_rate).toFixed(2)
      ]);
    } else if (activeReport === 'monthly_expenses' || activeReport === 'expense_summary') {
      headers = ['Category', 'Expense Amount (₹)', 'Share (%)'];
      rows = categoryExpenses.map(c => [c.category, c.amount.toFixed(2), c.percentage.toFixed(1)]);
    } else if (activeReport === 'cash_payment_summary') {
      headers = ['Payment Channel', 'Inflows / Sales (₹)', 'Outflows / Expenses (₹)', 'Net Balance (₹)'];
      rows = paymentMethodSummary.map(p => [p.method, p.sales.toFixed(2), p.expenses.toFixed(2), p.net.toFixed(2)]);
    } else {
      headers = ['Metric / Component', 'Amount (₹)'];
      rows = [
        ['Sales Revenue', totalRevenue.toFixed(2)],
        ['Cost of Goods Sold (COGS)', totalCost.toFixed(2)],
        ['Gross Profit', grossProfit.toFixed(2)],
        ['Operating Expenses', totalOperatingExpenses.toFixed(2)],
        ['Net Operating Result', netOperatingResult.toFixed(2)]
      ];
    }

    exportToCsv(filename, headers, rows);
  };

  const handlePrint = () => {
    window.print();
  };

  const REPORT_TITLES: Record<ReportType, string> = {
    daily_sales: '1. Daily Sales Report',
    monthly_sales: '2. Monthly Sales Report',
    custom_sales: '3. Custom Date-Range Sales Report',
    item_wise_sales: '4. Item-wise Sales & Profit Report',
    inventory_stock: '5. Inventory & Stock Levels Report',
    low_stock: '6. Low-Stock Reorder Alert Report',
    monthly_expenses: '7. Monthly Operating Expense Report',
    gross_profit: '8. Gross Profit & COGS Analysis',
    expense_summary: '9. Expense Category Distribution Summary',
    net_operating_result: '10. Net Operating Result Summary (P&L)',
    inventory_valuation: '11. Inventory Valuation Report (Cost Asset)',
    cash_payment_summary: '12. Cash & Digital Payment Channel Summary',
    financial_position: '13. Financial Position & Asset Summary'
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header (No-Print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1E2B45] no-print">
        <div>
          <h2 className="text-xl lg:text-2xl font-serif font-bold text-gold-gradient tracking-wide">
            Financial Statements & Reports
          </h2>
          <p className="text-xs text-[#AAB4C5] mt-0.5">
            Audit-grade business intelligence, revenue, COGS, operating results, and inventory valuation.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#16233B] hover:bg-[#1E2E4A] border border-[#1E2B45] text-[#D6B36A] rounded-lg text-xs font-semibold shadow transition active:scale-95"
          >
            <FileSpreadsheet size={15} />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#D6B36A] hover:bg-[#c9a356] text-[#0B1220] rounded-lg text-xs font-semibold shadow transition active:scale-95"
          >
            <Printer size={15} />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Selectors Bar (No-Print) */}
      <div className="bg-[#111B2E] border border-[#1E2B45] rounded-xl p-4 space-y-4 shadow-sm no-print">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-7">
            <label className="block text-[11px] font-semibold text-[#D6B36A] uppercase tracking-wider mb-1">
              Select Business Report (13 Financial Statements)
            </label>
            <select
              value={activeReport}
              onChange={(e) => setActiveReport(e.target.value as ReportType)}
              className="w-full bg-[#0B1220] border border-[#1E2B45] rounded-lg px-3 py-2 text-xs font-medium text-[#F5F3EE] focus:outline-none focus:border-[#D6B36A] transition cursor-pointer"
            >
              <optgroup label="Sales & Profitability">
                <option value="net_operating_result">10. Net Operating Result Summary (P&L)</option>
                <option value="gross_profit">8. Gross Profit & COGS Analysis</option>
                <option value="daily_sales">1. Daily Sales Report</option>
                <option value="monthly_sales">2. Monthly Sales Report</option>
                <option value="custom_sales">3. Custom Date-Range Sales Report</option>
                <option value="item_wise_sales">4. Item-wise Sales & Profit Report</option>
              </optgroup>
              <optgroup label="Inventory Assets">
                <option value="inventory_valuation">11. Inventory Valuation Report (Cost Asset)</option>
                <option value="inventory_stock">5. Inventory & Stock Levels Report</option>
                <option value="low_stock">6. Low-Stock Reorder Alert Report</option>
              </optgroup>
              <optgroup label="Expenses & Cash Flow">
                <option value="monthly_expenses">7. Monthly Operating Expense Report</option>
                <option value="expense_summary">9. Expense Category Distribution Summary</option>
                <option value="cash_payment_summary">12. Cash & Digital Payment Channel Summary</option>
                <option value="financial_position">13. Financial Position & Asset Summary</option>
              </optgroup>
            </select>
          </div>

          <div className="md:col-span-5">
            <label className="block text-[11px] font-semibold text-[#AAB4C5] uppercase tracking-wider mb-1">
              Period Preset
            </label>
            <select
              value={datePreset}
              onChange={(e) => setDatePreset(e.target.value as any)}
              className="w-full bg-[#0B1220] border border-[#1E2B45] rounded-lg px-3 py-2 text-xs text-[#F5F3EE] focus:outline-none focus:border-[#D6B36A] transition cursor-pointer"
            >
              <option value="today">Today</option>
              <option value="this_month">This Month</option>
              <option value="last_month">Previous Month</option>
              <option value="this_year">Current Calendar Year</option>
              <option value="financial_year">Indian Financial Year (1 Apr - 31 Mar)</option>
              <option value="custom">Custom Date Range</option>
            </select>
          </div>
        </div>

        {datePreset === 'custom' && (
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-[#1E2B45]/60">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#AAB4C5]">From:</span>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="bg-[#0B1220] border border-[#1E2B45] rounded-lg px-3 py-1.5 text-xs text-[#F5F3EE] focus:outline-none focus:border-[#D6B36A]"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#AAB4C5]">To:</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="bg-[#0B1220] border border-[#1E2B45] rounded-lg px-3 py-1.5 text-xs text-[#F5F3EE] focus:outline-none focus:border-[#D6B36A]"
              />
            </div>
          </div>
        )}
      </div>

      {/* Printable Report Canvas Area */}
      <div className="printable-area bg-[#111B2E] border border-[#1E2B45] rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
        <div className="text-center pb-6 border-b border-[#1E2B45]">
          <div className="text-xs font-serif font-bold text-[#D6B36A] tracking-[0.2em] mb-1">
            {settings.hindi_header || '॥ श्री ॥'}
          </div>
          <h2 className="font-serif font-bold text-2xl text-[#F5F3EE] tracking-[0.15em] uppercase">
            {settings.business_name || 'SEVEN STAR JWELS'}
          </h2>
          <p className="text-xs text-[#AAB4C5] tracking-wider mt-0.5">
            {REPORT_TITLES[activeReport]}
          </p>
          <div className="flex items-center justify-center gap-3 text-xs text-[#7A8699] mt-2 font-mono">
            <span>Period: {dateRangeLabel}</span>
            <span>&bull;</span>
            <span>Generated: {formatDateTime(new Date())}</span>
          </div>
        </div>

        {/* 10. Net Operating Result / Income Statement */}
        {activeReport === 'net_operating_result' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-[#0B1220] border border-[#1E2B45] rounded-xl">
                <span className="text-xs text-[#AAB4C5]">Gross Sales Revenue</span>
                <p className="text-xl font-bold text-blue-400 font-mono mt-1">{formatCurrency(totalRevenue)}</p>
              </div>
              <div className="p-4 bg-[#0B1220] border border-[#1E2B45] rounded-xl">
                <span className="text-xs text-[#AAB4C5]">Cost of Goods Sold</span>
                <p className="text-xl font-bold text-slate-300 font-mono mt-1">{formatCurrency(totalCost)}</p>
              </div>
              <div className="p-4 bg-[#0B1220] border border-[#1E2B45] rounded-xl">
                <span className="text-xs text-[#AAB4C5]">Gross Profit ({grossMarginPct.toFixed(1)}%)</span>
                <p className="text-xl font-bold text-[#D6B36A] font-mono mt-1">{formatCurrency(grossProfit)}</p>
              </div>
              <div className="p-4 bg-[#0B1220] border border-[#1E2B45] rounded-xl">
                <span className="text-xs text-[#AAB4C5]">Net Operating Result</span>
                <p className={`text-xl font-bold font-mono mt-1 ${netOperatingResult >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatCurrency(netOperatingResult)}
                </p>
              </div>
            </div>

            <div className="border border-[#1E2B45] rounded-xl overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[#0E1729] border-b border-[#1E2B45] text-[#7A8699] uppercase">
                    <th className="py-3 px-4 text-left">Accounting Component</th>
                    <th className="py-3 px-4 text-right">Amount (₹)</th>
                    <th className="py-3 px-4 text-right">% of Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E2B45]/50">
                  <tr>
                    <td className="py-3 px-4 font-semibold text-[#F5F3EE]">Sales Revenue (A)</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-blue-400">{formatCurrency(totalRevenue)}</td>
                    <td className="py-3 px-4 text-right font-mono text-[#AAB4C5]">100.0%</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-[#AAB4C5]">Less: Cost of Goods Sold (Purchase Cost of Items Sold) (B)</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-400">-{formatCurrency(totalCost)}</td>
                    <td className="py-3 px-4 text-right font-mono text-[#7A8699]">
                      {totalRevenue > 0 ? ((totalCost / totalRevenue) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                  <tr className="bg-[#0B1220]/60 font-bold">
                    <td className="py-3 px-4 text-[#D6B36A]">Gross Profit (C = A - B)</td>
                    <td className="py-3 px-4 text-right font-mono text-[#D6B36A]">{formatCurrency(grossProfit)}</td>
                    <td className="py-3 px-4 text-right font-mono text-[#D6B36A]">{grossMarginPct.toFixed(1)}%</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-[#AAB4C5]">Less: Operating Business Expenses (Rent, Bills, Staff, etc.) (D)</td>
                    <td className="py-3 px-4 text-right font-mono text-rose-300">-{formatCurrency(totalOperatingExpenses)}</td>
                    <td className="py-3 px-4 text-right font-mono text-[#7A8699]">
                      {totalRevenue > 0 ? ((totalOperatingExpenses / totalRevenue) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                  <tr className="bg-[#070C16] border-t-2 border-[#1E2B45] text-sm font-bold">
                    <td className="py-4 px-4 text-[#F5F3EE]">Net Operating Result (Profit / Loss) (E = C - D)</td>
                    <td className={`py-4 px-4 text-right font-mono text-base ${netOperatingResult >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {formatCurrency(netOperatingResult)}
                    </td>
                    <td className="py-4 px-4 text-right font-mono text-emerald-400">
                      {totalRevenue > 0 ? ((netOperatingResult / totalRevenue) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. Item Wise Sales */}
        {activeReport === 'item_wise_sales' && (
          <div className="border border-[#1E2B45] rounded-xl overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-[#0E1729] border-b border-[#1E2B45] text-[#7A8699] uppercase">
                  <th className="py-3 px-4">Item Name</th>
                  <th className="py-3 px-4 text-center">Qty Sold</th>
                  <th className="py-3 px-4 text-right">Revenue (₹)</th>
                  <th className="py-3 px-4 text-right">COGS (₹)</th>
                  <th className="py-3 px-4 text-right">Gross Profit (₹)</th>
                  <th className="py-3 px-4 text-right">Margin (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2B45]/50">
                {itemWiseSummary.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#7A8699]">
                      No items sold in the selected period.
                    </td>
                  </tr>
                ) : (
                  itemWiseSummary.map((item, idx) => (
                    <tr key={idx} className="hover:bg-[#16233B]/50 transition">
                      <td className="py-3 px-4 font-semibold text-[#F5F3EE]">{item.name}</td>
                      <td className="py-3 px-4 text-center font-mono">{item.qtySold}</td>
                      <td className="py-3 px-4 text-right font-mono text-blue-400 font-medium">{formatCurrency(item.revenue)}</td>
                      <td className="py-3 px-4 text-right font-mono text-slate-400">{formatCurrency(item.cost)}</td>
                      <td className="py-3 px-4 text-right font-mono text-[#D6B36A] font-bold">{formatCurrency(item.profit)}</td>
                      <td className="py-3 px-4 text-right font-mono text-emerald-400">
                        {item.revenue > 0 ? ((item.profit / item.revenue) * 100).toFixed(1) : 0}%
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 5, 6, 11: Inventory Valuation & Stock Reports */}
        {(activeReport === 'inventory_valuation' || activeReport === 'inventory_stock' || activeReport === 'low_stock') && (
          <div className="space-y-4">
            <div className="p-4 bg-[#0B1220] border border-[#1E2B45] rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs text-[#AAB4C5]">Total Inventory Asset Value (at Purchase Cost)</span>
                <p className="text-2xl font-bold text-[#D6B36A] font-mono mt-1">{formatCurrency(inventoryValuation)}</p>
              </div>
              <div className="text-right text-xs text-[#7A8699]">
                <p>Valuation Method: <strong>Purchase Cost Snapshot</strong></p>
                <p>{activeItems.length} active jewellery items</p>
              </div>
            </div>

            <div className="border border-[#1E2B45] rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-[#0E1729] border-b border-[#1E2B45] text-[#7A8699] uppercase">
                    <th className="py-3 px-4">Item Name & SKU</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-center">Stock</th>
                    <th className="py-3 px-4 text-right">Purchase Rate</th>
                    <th className="py-3 px-4 text-right">Default Sale Rate</th>
                    <th className="py-3 px-4 text-right">Total Valuation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E2B45]/50">
                  {(activeReport === 'low_stock' ? activeItems.filter(i => i.current_stock <= i.low_stock_threshold) : activeItems).map((i) => (
                    <tr key={i.id} className="hover:bg-[#16233B]/50 transition">
                      <td className="py-3 px-4">
                        <span className="font-semibold text-[#F5F3EE]">{i.name}</span>
                        {i.sku && <span className="text-[10px] text-[#7A8699] font-mono ml-2">({i.sku})</span>}
                      </td>
                      <td className="py-3 px-4 text-[#AAB4C5]">{i.category}</td>
                      <td className={`py-3 px-4 text-center font-mono font-bold ${i.current_stock <= i.low_stock_threshold ? 'text-amber-400' : 'text-[#F5F3EE]'}`}>
                        {i.current_stock}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-[#AAB4C5]">{formatCurrency(i.purchase_rate)}</td>
                      <td className="py-3 px-4 text-right font-mono text-[#F5F3EE]">{formatCurrency(i.default_sale_rate)}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#D6B36A]">{formatCurrency(i.current_stock * i.purchase_rate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 7, 9: Expenses Breakdown */}
        {(activeReport === 'monthly_expenses' || activeReport === 'expense_summary') && (
          <div className="space-y-4">
            <div className="p-4 bg-[#0B1220] border border-[#1E2B45] rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs text-[#AAB4C5]">Total Operating Expenses</span>
                <p className="text-2xl font-bold text-rose-400 font-mono mt-1">{formatCurrency(totalOperatingExpenses)}</p>
              </div>
              <div className="text-right text-xs text-[#7A8699]">
                <p>Operating Expenses are strictly isolated from inventory purchase costs</p>
              </div>
            </div>

            <div className="border border-[#1E2B45] rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-[#0E1729] border-b border-[#1E2B45] text-[#7A8699] uppercase">
                    <th className="py-3 px-4">Expense Category</th>
                    <th className="py-3 px-4 text-right">Amount (₹)</th>
                    <th className="py-3 px-4 text-right">Share (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E2B45]/50">
                  {categoryExpenses.map((cat, idx) => (
                    <tr key={idx} className="hover:bg-[#16233B]/50 transition">
                      <td className="py-3 px-4 font-semibold text-[#F5F3EE]">{cat.category}</td>
                      <td className="py-3 px-4 text-right font-mono text-rose-300 font-medium">{formatCurrency(cat.amount)}</td>
                      <td className="py-3 px-4 text-right font-mono text-[#AAB4C5]">{cat.percentage.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 12. Cash & Payment Summary */}
        {activeReport === 'cash_payment_summary' && (
          <div className="space-y-4">
            <div className="border border-[#1E2B45] rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-[#0E1729] border-b border-[#1E2B45] text-[#7A8699] uppercase">
                    <th className="py-3 px-4">Payment Channel</th>
                    <th className="py-3 px-4 text-right">Recorded Inflows / Sales</th>
                    <th className="py-3 px-4 text-right">Recorded Outflows / Expenses</th>
                    <th className="py-3 px-4 text-right">Net Channel Flow</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E2B45]/50">
                  {paymentMethodSummary.map((p, idx) => (
                    <tr key={idx} className="hover:bg-[#16233B]/50 transition">
                      <td className="py-3 px-4 font-semibold text-[#F5F3EE]">{p.method}</td>
                      <td className="py-3 px-4 text-right font-mono text-blue-400 font-medium">{formatCurrency(p.sales)}</td>
                      <td className="py-3 px-4 text-right font-mono text-rose-400">{formatCurrency(p.expenses)}</td>
                      <td className={`py-3 px-4 text-right font-mono font-bold ${p.net >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {formatCurrency(p.net)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 13. Financial Position */}
        {activeReport === 'financial_position' && (
          <div className="space-y-6">
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-200 text-xs">
              <strong>Accounting Disclosure:</strong> This summary reflects real recorded assets (Inventory stock valued at cost + recorded net liquid cash flow). Statutory liabilities, unrecorded taxes, and customer credits are strictly excluded as mandated by accounting integrity principles.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-[#1E2B45] rounded-xl overflow-hidden">
                <div className="bg-[#0E1729] px-4 py-3 border-b border-[#1E2B45] font-semibold text-xs text-[#D6B36A] uppercase tracking-wider">
                  Current Recorded Assets
                </div>
                <div className="p-4 space-y-3 text-xs">
                  <div className="flex justify-between py-2 border-b border-[#1E2B45]/60">
                    <span className="text-[#AAB4C5]">Jewellery Stock Inventory (at Purchase Cost):</span>
                    <span className="font-mono font-bold text-[#F5F3EE]">{formatCurrency(inventoryValuation)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#1E2B45]/60">
                    <span className="text-[#AAB4C5]">Net Recorded Liquid Inflows (Cash & UPI):</span>
                    <span className="font-mono font-bold text-blue-400">
                      {formatCurrency(totalRevenue - totalOperatingExpenses)}
                    </span>
                  </div>
                  <div className="flex justify-between py-3 font-bold text-sm text-[#D6B36A] border-t-2 border-[#1E2B45]">
                    <span>Total Real Recorded Assets:</span>
                    <span className="font-mono">
                      {formatCurrency(inventoryValuation + (totalRevenue - totalOperatingExpenses))}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border border-[#1E2B45] rounded-xl overflow-hidden">
                <div className="bg-[#0E1729] px-4 py-3 border-b border-[#1E2B45] font-semibold text-xs text-[#D6B36A] uppercase tracking-wider">
                  Operating Results Ledger
                </div>
                <div className="p-4 space-y-3 text-xs">
                  <div className="flex justify-between py-2 border-b border-[#1E2B45]/60">
                    <span className="text-[#AAB4C5]">Period Gross Profit:</span>
                    <span className="font-mono font-bold text-[#F5F3EE]">{formatCurrency(grossProfit)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#1E2B45]/60">
                    <span className="text-[#AAB4C5]">Period Operating Overhead:</span>
                    <span className="font-mono font-bold text-rose-300">-{formatCurrency(totalOperatingExpenses)}</span>
                  </div>
                  <div className="flex justify-between py-3 font-bold text-sm border-t-2 border-[#1E2B45]">
                    <span className="text-[#F5F3EE]">Period Net Operating Result:</span>
                    <span className={`font-mono ${netOperatingResult >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {formatCurrency(netOperatingResult)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 1, 2, 3, 8: Sales Register Views */}
        {(activeReport === 'daily_sales' || activeReport === 'monthly_sales' || activeReport === 'custom_sales' || activeReport === 'gross_profit') && (
          <div className="border border-[#1E2B45] rounded-xl overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-[#0E1729] border-b border-[#1E2B45] text-[#7A8699] uppercase">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4 text-center">Items</th>
                  <th className="py-3 px-4 text-right">Revenue (₹)</th>
                  <th className="py-3 px-4 text-right">COGS (₹)</th>
                  <th className="py-3 px-4 text-right">Gross Profit (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2B45]/50">
                {periodSales.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[#7A8699]">
                      No completed sales recorded in the selected period.
                    </td>
                  </tr>
                ) : (
                  periodSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-[#16233B]/50 transition">
                      <td className="py-3 px-4 font-mono font-bold text-[#F5F3EE]">{sale.invoice_number}</td>
                      <td className="py-3 px-4 text-[#AAB4C5]">{formatDate(sale.sale_date)}</td>
                      <td className="py-3 px-4 text-[#F5F3EE]">{sale.customer_name || 'Walk-in'}</td>
                      <td className="py-3 px-4 text-center font-mono">{sale.items?.length || 1}</td>
                      <td className="py-3 px-4 text-right font-mono text-blue-400 font-medium">{formatCurrency(sale.total_amount)}</td>
                      <td className="py-3 px-4 text-right font-mono text-slate-400">{formatCurrency(sale.total_cost)}</td>
                      <td className="py-3 px-4 text-right font-mono text-[#D6B36A] font-bold">{formatCurrency(sale.gross_profit)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
