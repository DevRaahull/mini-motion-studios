import React, { useState, useEffect } from 'react';
import { X, Wallet, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Expense, ExpenseCategory } from '../../types';
import { useAppData } from '../../context/AppDataContext';

interface ExpenseFormModalProps {
  expenseToEdit: Expense | null;
  onClose: () => void;
}

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Rent',
  'Electricity',
  'Salary',
  'Transport',
  'Packaging',
  'Repairs',
  'Internet / Phone',
  'Marketing',
  'Refreshments',
  'Other'
];

export const ExpenseFormModal: React.FC<ExpenseFormModalProps> = ({ expenseToEdit, onClose }) => {
  const { saveExpense } = useAppData();

  const isEditing = !!expenseToEdit;

  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().slice(0, 10));
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Rent');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (expenseToEdit) {
      setExpenseDate(expenseToEdit.expense_date.slice(0, 10));
      setTitle(expenseToEdit.title);
      setCategory(expenseToEdit.category as ExpenseCategory);
      setAmount(expenseToEdit.amount.toString());
      setPaymentMethod(expenseToEdit.payment_method || 'Cash');
      setNotes(expenseToEdit.notes || '');
    } else {
      setExpenseDate(new Date().toISOString().slice(0, 10));
      setTitle('');
      setCategory('Rent');
      setAmount('');
      setPaymentMethod('Cash');
      setNotes('');
    }
  }, [expenseToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!title.trim()) {
      setErrorMessage('Expense Title is required.');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMessage('Expense Amount must be a positive number greater than zero.');
      return;
    }

    setIsSubmitting(true);
    try {
      await saveExpense({
        id: expenseToEdit?.id,
        expense_date: new Date(expenseDate).toISOString(),
        title: title.trim(),
        category,
        amount: numAmount,
        payment_method: paymentMethod,
        notes: notes.trim() || undefined,
        is_cancelled: false
      });
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#111B2E] border border-[#1E2B45] rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#1E2B45]">
          <div className="flex items-center gap-2">
            <Wallet size={18} className="text-[#D6B36A]" />
            <h3 className="font-semibold text-base text-[#F5F3EE]">
              {isEditing ? 'Edit Expense Record' : 'Record Operating Expense'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#AAB4C5] hover:text-[#F5F3EE] hover:bg-[#16233B] rounded-lg transition"
          >
            <X size={18} />
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Expense Date */}
            <div>
              <label className="block text-xs font-medium text-[#AAB4C5] mb-1">
                Expense Date *
              </label>
              <input
                type="date"
                required
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="w-full bg-[#0B1220] border border-[#1E2B45] rounded-lg px-3 py-2 text-xs text-[#F5F3EE] focus:outline-none focus:border-[#D6B36A] transition cursor-pointer"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-medium text-[#AAB4C5] mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full bg-[#0B1220] border border-[#1E2B45] rounded-lg px-3 py-2 text-xs text-[#F5F3EE] focus:outline-none focus:border-[#D6B36A] transition cursor-pointer"
              >
                {EXPENSE_CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#AAB4C5] mb-1">
                Expense Title / Description *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Monthly Shop Rent, Velvet Gift Boxes, Electricity Bill..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#0B1220] border border-[#1E2B45] rounded-lg px-3 py-2 text-xs text-[#F5F3EE] focus:outline-none focus:border-[#D6B36A] transition"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-medium text-[#AAB4C5] mb-1">
                Amount (₹) *
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-[#0B1220] border border-[#1E2B45] rounded-lg px-3 py-2 text-xs text-[#F5F3EE] font-mono focus:outline-none focus:border-[#D6B36A] transition"
              />
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-medium text-[#AAB4C5] mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-[#0B1220] border border-[#1E2B45] rounded-lg px-3 py-2 text-xs text-[#F5F3EE] focus:outline-none focus:border-[#D6B36A] transition cursor-pointer"
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI / GPay / PhonePe</option>
                <option value="Bank Transfer">Bank Transfer / NEFT</option>
                <option value="Card">Debit / Credit Card</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>

            {/* Notes */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#AAB4C5] mb-1">
                Notes / Voucher Ref (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Receipt #4819, Paid to Karigar Ramu"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-[#0B1220] border border-[#1E2B45] rounded-lg px-3 py-2 text-xs text-[#F5F3EE] focus:outline-none focus:border-[#D6B36A] transition"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#1E2B45]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#16233B] hover:bg-[#1E2E4A] text-[#F5F3EE] rounded-lg text-xs font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2 bg-[#D6B36A] hover:bg-[#c9a356] text-[#0B1220] rounded-lg text-xs font-semibold shadow transition active:scale-95 disabled:opacity-50"
            >
              <CheckCircle2 size={16} strokeWidth={2.5} />
              <span>{isEditing ? 'Update Expense' : 'Save Expense'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
