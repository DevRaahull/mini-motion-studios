import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, DollarSign, Calendar, CreditCard, History } from 'lucide-react';
import { Sale } from '../../types';
import { formatCurrency, formatDate } from '../../lib/formatters';
import { useAppData } from '../../context/AppDataContext';

interface RecordPaymentModalProps {
  sale: Sale;
  onClose: () => void;
  onSuccess?: (updatedSale: Sale) => void;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  sale,
  onClose,
  onSuccess
}) => {
  const { recordSalePayment } = useAppData();

  const currentDue = sale.amount_due !== undefined ? sale.amount_due : Math.max(0, sale.grand_total - (sale.amount_received || 0));
  const currentReceived = sale.amount_received !== undefined ? sale.amount_received : 0;

  const [paymentAmount, setPaymentAmount] = useState<number | ''>(currentDue);
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<string>('Cash');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const numAmount = typeof paymentAmount === 'number' ? paymentAmount : 0;
  const remainingAfterPayment = Math.max(0, Math.round((currentDue - numAmount) * 100) / 100);
  const isOverpaying = numAmount > currentDue;

  const handleFullPaymentClick = () => {
    setPaymentAmount(currentDue);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (numAmount <= 0) {
      setErrorMessage('Please enter a valid payment amount greater than ₹0.');
      return;
    }

    if (numAmount > currentDue + 0.01) {
      setErrorMessage(`Payment cannot exceed the outstanding balance of ${formatCurrency(currentDue)}.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await recordSalePayment(
        sale.id,
        numAmount,
        paymentMethod,
        new Date(paymentDate).toISOString(),
        notes.trim() || undefined
      );

      if (onSuccess) {
        onSuccess(updated);
      }
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to record payment.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative bg-[#111B2E] border border-[#1E2B45] rounded-2xl w-full max-w-lg p-5 sm:p-6 space-y-5 shadow-2xl text-[#F5F3EE] max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1E2B45]">
          <div>
            <span className="text-[11px] font-mono text-[#D6B36A] uppercase tracking-wider block">
              Subsequent Payment Entry
            </span>
            <h3 className="text-lg font-serif font-bold text-gold-gradient">
              Invoice #{sale.invoice_number}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#AAB4C5] hover:text-white hover:bg-[#16233B] transition"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Buyer Info */}
        <div className="bg-[#0B1220]/70 border border-[#1E2B45]/60 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div>
            <span className="text-[#AAB4C5] block text-[10px]">Buyer Name</span>
            <span className="font-semibold text-[#F5F3EE]">{sale.customer_name || 'Counter Buyer'}</span>
          </div>
          <div>
            <span className="text-[#AAB4C5] block text-[10px]">Invoice Date</span>
            <span className="font-mono text-[#F5F3EE]">{formatDate(sale.sale_date)}</span>
          </div>
          <div>
            <span className="text-[#AAB4C5] block text-[10px]">Current Status</span>
            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
              currentDue <= 0
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : sale.payment_status === 'Advance Paid'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}>
              {sale.payment_status}
            </span>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="bg-[#16233B]/70 border border-[#1E2B45] rounded-xl p-2.5 text-center">
            <span className="text-[10px] text-[#AAB4C5] block">Invoice Total</span>
            <span className="text-sm sm:text-base font-bold font-mono text-[#F5F3EE]">
              {formatCurrency(sale.grand_total)}
            </span>
          </div>
          <div className="bg-[#16233B]/70 border border-[#1E2B45] rounded-xl p-2.5 text-center">
            <span className="text-[10px] text-[#AAB4C5] block">Total Received</span>
            <span className="text-sm sm:text-base font-bold font-mono text-emerald-400">
              {formatCurrency(currentReceived)}
            </span>
          </div>
          <div className="bg-[#16233B]/70 border border-[#1E2B45] rounded-xl p-2.5 text-center">
            <span className="text-[10px] text-[#AAB4C5] block">Balance Due</span>
            <span className="text-sm sm:text-base font-bold font-mono text-rose-400">
              {formatCurrency(currentDue)}
            </span>
          </div>
        </div>

        {/* Payment History Log */}
        {sale.payments && sale.payments.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-[#AAB4C5] font-medium">
              <History size={13} className="text-[#D6B36A]" />
              <span>Prior Payments ({sale.payments.length})</span>
            </div>
            <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1">
              {sale.payments.map((p, idx) => (
                <div
                  key={p.id || idx}
                  className="bg-[#0B1220]/50 border border-[#1E2B45]/40 rounded-lg px-3 py-1.5 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#7A8699] font-mono">#{idx + 1}</span>
                    <span className="text-[#AAB4C5]">{formatDate(p.payment_date)}</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-[#16233B] text-[#D6B36A] rounded">
                      {p.payment_method || 'Cash'}
                    </span>
                    {p.notes && <span className="text-[10px] text-[#7A8699] italic">({p.notes})</span>}
                  </div>
                  <span className="font-mono font-semibold text-emerald-400">
                    +{formatCurrency(p.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-rose-400 text-xs">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Payment Amount Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#D6B36A] flex items-center gap-1">
                <span>Payment Amount (₹)</span>
                <span className="text-rose-400">*</span>
              </label>
              <button
                type="button"
                onClick={handleFullPaymentClick}
                className="text-[11px] text-[#D6B36A] hover:underline font-medium"
              >
                Pay Full Due ({formatCurrency(currentDue)})
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#D6B36A] font-bold text-sm">
                ₹
              </span>
              <input
                type="number"
                inputMode="decimal"
                step="any"
                min="0.01"
                max={currentDue}
                value={paymentAmount}
                onChange={(e) => {
                  const val = e.target.value === '' ? '' : parseFloat(e.target.value);
                  setPaymentAmount(val);
                  setErrorMessage(null);
                }}
                placeholder="0.00"
                className={`w-full bg-[#0B1220] border rounded-xl pl-8 pr-4 py-2.5 text-base font-mono font-semibold text-[#F5F3EE] focus:outline-none transition ${
                  isOverpaying
                    ? 'border-rose-500 focus:border-rose-500'
                    : 'border-[#1E2B45] focus:border-[#D6B36A]'
                }`}
                required
                autoFocus
              />
            </div>
            {isOverpaying && (
              <p className="text-[11px] text-rose-400">
                Amount cannot exceed outstanding due balance of {formatCurrency(currentDue)}.
              </p>
            )}
          </div>

          {/* Payment Mode & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-[#AAB4C5]">Payment Mode</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-[#0B1220] border border-[#1E2B45] rounded-xl px-3 py-2 text-xs text-[#F5F3EE] focus:border-[#D6B36A] focus:outline-none"
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI / QR Code</option>
                <option value="Bank Transfer / RTGS">Bank Transfer / RTGS</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-[#AAB4C5]">Payment Date</label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full bg-[#0B1220] border border-[#1E2B45] rounded-xl px-3 py-2 text-xs text-[#F5F3EE] focus:border-[#D6B36A] focus:outline-none font-mono"
                required
              />
            </div>
          </div>

          {/* Notes / Reference */}
          <div className="space-y-1">
            <label className="text-xs text-[#AAB4C5]">Reference / Notes (Optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. UTR #, Cheque #, or Counter Cash"
              className="w-full bg-[#0B1220] border border-[#1E2B45] rounded-xl px-3 py-2 text-xs text-[#F5F3EE] focus:border-[#D6B36A] focus:outline-none"
            />
          </div>

          {/* Remaining Balance Summary Preview */}
          <div className="p-3 bg-[#0B1220]/80 border border-[#1E2B45] rounded-xl flex items-center justify-between text-xs">
            <span className="text-[#AAB4C5]">Remaining Balance After Payment:</span>
            <div className="text-right">
              <span className={`font-mono font-bold text-sm ${
                remainingAfterPayment === 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {formatCurrency(remainingAfterPayment)}
              </span>
              {remainingAfterPayment === 0 && (
                <span className="block text-[10px] text-emerald-400 font-semibold">
                  ✓ Bill will be fully settled (Payment Complete)
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-[#16233B] hover:bg-[#1E2E4A] border border-[#1E2B45] text-[#AAB4C5] hover:text-white rounded-xl text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isOverpaying || numAmount <= 0}
              className="flex-1 py-2.5 px-4 bg-[#D6B36A] hover:bg-[#c9a356] text-[#0B1220] rounded-xl text-xs font-bold transition shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              {isSubmitting ? (
                <span>Recording...</span>
              ) : (
                <>
                  <CheckCircle2 size={15} />
                  <span>Confirm Payment</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
