import React, { useState } from 'react';
import { X, SlidersHorizontal, AlertCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Item } from '../../types';
import { useAppData } from '../../context/AppDataContext';

interface StockAdjustModalProps {
  item: Item;
  onClose: () => void;
}

export const StockAdjustModal: React.FC<StockAdjustModalProps> = ({ item, onClose }) => {
  const { adjustStock } = useAppData();

  const [adjustType, setAdjustType] = useState<'add' | 'subtract'>('add');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('New Purchase Batch');
  const [customNotes, setCustomNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const numQty = parseFloat(quantity) || 0;
  const projectedStock = adjustType === 'add' ? item.current_stock + numQty : item.current_stock - numQty;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (numQty <= 0) {
      setErrorMessage('Please enter a quantity greater than zero.');
      return;
    }

    if (adjustType === 'subtract' && projectedStock < 0) {
      setErrorMessage(`Cannot deduct ${numQty}. Current stock is only ${item.current_stock}. Negative stock is not allowed.`);
      return;
    }

    const finalChange = adjustType === 'add' ? numQty : -numQty;
    const finalReason = customNotes.trim() ? `${reason}: ${customNotes.trim()}` : reason;

    setIsSubmitting(true);
    try {
      await adjustStock(item.id, finalChange, finalReason);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to adjust stock');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#111B2E] border border-[#1E2B45] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#1E2B45]">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={18} className="text-[#D6B36A]" />
            <h3 className="font-semibold text-base text-[#F5F3EE]">Adjust Inventory Stock</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#AAB4C5] hover:text-[#F5F3EE] hover:bg-[#16233B] rounded-lg transition"
          >
            <X size={18} />
          </button>
        </div>

        <div>
          <p className="text-sm font-semibold text-[#F5F3EE]">{item.name}</p>
          <p className="text-xs text-[#AAB4C5] mt-0.5">
            Current Stock: <span className="font-mono font-bold text-[#D6B36A]">{item.current_stock} units</span>
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Add / Subtract Type */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setAdjustType('add')}
              className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition ${
                adjustType === 'add'
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                  : 'bg-[#0B1220] border-[#1E2B45] text-[#AAB4C5] hover:text-white'
              }`}
            >
              <ArrowUpRight size={15} />
              <span>Add Stock (Restock)</span>
            </button>

            <button
              type="button"
              onClick={() => setAdjustType('subtract')}
              className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition ${
                adjustType === 'subtract'
                  ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                  : 'bg-[#0B1220] border-[#1E2B45] text-[#AAB4C5] hover:text-white'
              }`}
            >
              <ArrowDownRight size={15} />
              <span>Deduct Stock (Damage/Loss)</span>
            </button>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-xs font-medium text-[#AAB4C5] mb-1">
              Quantity to {adjustType === 'add' ? 'Add' : 'Deduct'} *
            </label>
            <input
              type="number"
              min="1"
              step="1"
              required
              placeholder="e.g. 5"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full bg-[#0B1220] border border-[#1E2B45] rounded-lg px-3 py-2 text-xs text-[#F5F3EE] font-mono focus:outline-none focus:border-[#D6B36A] transition"
            />
            {numQty > 0 && (
              <p className="text-[11px] text-[#AAB4C5] mt-1">
                New Stock Balance will be:{' '}
                <strong className={`font-mono ${projectedStock < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {projectedStock} units
                </strong>
              </p>
            )}
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-medium text-[#AAB4C5] mb-1">
              Adjustment Reason *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-[#0B1220] border border-[#1E2B45] rounded-lg px-3 py-2 text-xs text-[#F5F3EE] focus:outline-none focus:border-[#D6B36A] transition cursor-pointer"
            >
              <option value="New Purchase Batch">New Purchase Batch / Supplier Receipt</option>
              <option value="Physical Stock Audit Correction">Physical Stock Audit Correction</option>
              <option value="Damaged / Broken / Melted">Damaged / Broken / Melted Piece</option>
              <option value="Supplier Return">Supplier Return / Defect</option>
              <option value="Showcase Sample Adjustment">Showcase Sample Adjustment</option>
              <option value="Other">Other Reason</option>
            </select>
          </div>

          {/* Custom Notes */}
          <div>
            <label className="block text-xs font-medium text-[#AAB4C5] mb-1">
              Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Supplier Bill #9482, Karigar repair batch..."
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              className="w-full bg-[#0B1220] border border-[#1E2B45] rounded-lg px-3 py-2 text-xs text-[#F5F3EE] focus:outline-none focus:border-[#D6B36A] transition"
            />
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
              disabled={isSubmitting || numQty <= 0 || projectedStock < 0}
              className="px-5 py-2 bg-[#D6B36A] hover:bg-[#c9a356] text-[#0B1220] rounded-lg text-xs font-semibold shadow transition active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Adjusting...' : 'Record Adjustment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
