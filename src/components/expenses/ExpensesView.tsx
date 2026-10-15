import React, { useState, useMemo } from 'react';
import {
  Wallet,
  Plus,
  Search,
  Edit,
  Trash2,
  FileSpreadsheet,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import { Expense, DateFilterPreset } from '../../types';
import { formatCurrency, formatDate } from '../../lib/formatters';
import { exportToCsv } from '../../lib/exportUtils';
import { ExpenseFormModal } from './ExpenseFormModal';

export const ExpensesView: React.FC = () => {
  const { expenses, deleteExpense } = useAppData();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [datePreset, setDatePreset] = useState<DateFilterPreset>('this_month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    const now = new Date();

    let rangeStart: Date | null = null;
    let rangeEnd: Date | null = null;

    if (datePreset === 'today') {
      rangeStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      rangeEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    } else if (datePreset === 'this_month') {
      rangeStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      rangeEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    } else if (datePreset === 'last_month') {
      rangeStart = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0);
      rangeEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    } else if (datePreset === 'this_year') {
      rangeStart = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
      rangeEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
    } else if (datePreset === 'custom' && customStart && customEnd) {
      rangeStart = new Date(`${customStart}T00:00:00`);
      rangeEnd = new Date(`${customEnd}T23:59:59`);
    }

    return expenses.filter(exp => {
      if (exp.is_cancelled) return false;

      const expDate = new Date(exp.expense_date);
      if (rangeStart && expDate < rangeStart) return false;
      if (rangeEnd && expDate > rangeEnd) return false;

      if (categoryFilter !== 'all' && exp.category !== categoryFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = exp.title.toLowerCase().includes(q);
        const matchesNotes = (exp.notes || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesNotes) return false;
      }

      return true;
    });
  }, [expenses, datePreset, customStart, customEnd, categoryFilter, searchQuery]);

  // Total filtered amount
  const totalAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [filteredExpenses]);

  // CSV Export
  const handleExportCsv = () => {
    const headers = ['Expense Date', 'Title', 'Category', 'Amount (₹)', 'Payment Method', 'Notes'];
    const rows = filteredExpenses.map(e => [
      formatDate(e.expense_date),
      e.title,
      e.category,
      e.amount.toFixed(2),
      e.payment_method,
      e.notes || ''
    ]);

    exportToCsv(`Operating_Expenses_${new Date().toISOString().slice(0, 10)}`, headers, rows);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteExpense(deletingId);
      setDeletingId(null);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1E2B45]">
        <div>
          <h2 className="text-xl lg:text-2xl font-serif font-bold text-gold-gradient tracking-wide">
            Operating Expense Ledger
          </h2>
          <p className="text-xs text-[#AAB4C5] mt-0.5">
            Track business operating costs separately from inventory purchase costs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#16233B] hover:bg-[#1E2E4A] border border-[#1E2B45] text-[#D6B36A] rounded-lg text-xs font-semibold shadow transition active:scale-95"
          >
            <FileSpreadsheet size={15} />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              setEditingExpense(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#D6B36A] hover:bg-[#c9a356] text-[#0B1220] rounded-lg text-xs font-bold shadow-md transition active:scale-95"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* KPI Card */}
      <div className="bg-[#111B2E] border border-[#1E2B45] rounded-xl p-4 flex items-center justify-between max-w-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-[#881337]/40 text-[#FB7185] flex items-center justify-center shrink-0 border border-[#881337]/60">
            <Wallet size={18} />
          </div>
          <div>
            <p className="text-xs text-[#AAB4C5]">Total Filtered Expenses</p>
            <p className="text-xl font-bold text-[#F5F3EE] font-mono mt-0.5">
              {formatCurrency(totalAmount)}
            </p>
          </div>
        </div>
        <span className="text-xs text-[#7A8699] font-mono">
          {filteredExpenses.length} entries
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#111B2E] border border-[#1E2B45] rounded-xl p-4 space-y-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search */}
          <div className="md:col-span-6 relative">
            <input
              type="text"
              placeholder="Search expenses by title or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0B1220] border border-[#1E2B45] rounded-lg pl-9 pr-4 py-2 text-xs text-[#F5F3EE] focus:outline-none focus:border-[#D6B36A] transition placeholder-[#7A8699]"
            />
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A8699]" />
          </div>

          {/* Date Preset */}
          <div className="md:col-span-3">
            <select
              value={datePreset}
              onChange={(e) => setDatePreset(e.target.value as any)}
              className="w-full bg-[#0B1220] border border-[#1E2B45] rounded-lg px-3 py-2 text-xs text-[#F5F3EE] focus:outline-none focus:border-[#D6B36A] transition cursor-pointer"
            >
              <option value="today">Today</option>
              <option value="this_month">This Month</option>
              <option value="last_month">Previous Month</option>
              <option value="this_year">This Year</option>
              <option value="custom">Custom Date Range</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="md:col-span-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-[#0B1220] border border-[#1E2B45] rounded-lg px-3 py-2 text-xs text-[#F5F3EE] focus:outline-none focus:border-[#D6B36A] transition cursor-pointer"
            >
              <option value="all">All Categories</option>
              {['Rent', 'Electricity', 'Salary', 'Transport', 'Packaging', 'Repairs', 'Internet / Phone', 'Marketing', 'Refreshments', 'Other'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Custom Date Range Picker */}
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

      {/* Expenses Table */}
      <div className="bg-[#111B2E] border border-[#1E2B45] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#0E1729] border-b border-[#1E2B45] text-[#7A8699] uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4 font-medium">Date</th>
                <th className="py-3.5 px-4 font-medium">Title / Description</th>
                <th className="py-3.5 px-4 font-medium">Category</th>
                <th className="py-3.5 px-4 font-medium">Payment Method</th>
                <th className="py-3.5 px-4 font-medium text-right">Amount</th>
                <th className="py-3.5 px-4 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2B45]/50">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#7A8699]">
                    No expenses recorded in the selected period.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-[#16233B]/60 transition">
                    <td className="py-3.5 px-4 text-[#AAB4C5] whitespace-nowrap">
                      {formatDate(exp.expense_date)}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#F5F3EE]">{exp.title}</div>
                      {exp.notes && (
                        <div className="text-[10px] text-[#7A8699] mt-0.5">{exp.notes}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 bg-[#0B1220] border border-[#1E2B45] rounded text-[11px] text-[#AAB4C5]">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#AAB4C5] whitespace-nowrap">
                      {exp.payment_method}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-rose-300 whitespace-nowrap">
                      {formatCurrency(exp.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditingExpense(exp);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 text-[#AAB4C5] hover:text-[#F5F3EE] hover:bg-[#16233B] rounded-lg transition"
                          title="Edit Expense"
                        >
                          <Edit size={15} />
                        </button>

                        <button
                          onClick={() => setDeletingId(exp.id)}
                          className="p-1.5 text-[#AAB4C5] hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                          title="Delete Expense"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <ExpenseFormModal
          expenseToEdit={editingExpense}
          onClose={() => {
            setIsModalOpen(false);
            setEditingExpense(null);
          }}
        />
      )}

      {/* Delete Confirmation */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#111B2E] border border-rose-500/40 rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4">
            <h3 className="font-semibold text-base text-[#F5F3EE]">Delete Expense</h3>
            <p className="text-xs text-[#AAB4C5]">
              Are you sure you want to delete this expense record? This will remove it from monthly accounts.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 bg-[#16233B] text-[#F5F3EE] rounded-lg text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
