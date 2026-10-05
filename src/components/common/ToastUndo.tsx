import React, { useEffect, useState } from 'react';
import { RotateCcw, X, AlertCircle } from 'lucide-react';

interface ToastUndoProps {
  message: string;
  onUndo: () => void;
  onDismiss: () => void;
  durationSec?: number;
}

export const ToastUndo: React.FC<ToastUndoProps> = ({
  message,
  onUndo,
  onDismiss,
  durationSec = 5,
}) => {
  const [timeLeft, setTimeLeft] = useState(durationSec);

  useEffect(() => {
    if (timeLeft <= 0) {
      onDismiss();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onDismiss]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#11141e] border-2 border-red-500/80 rounded-xl p-3.5 shadow-[0_0_25px_rgba(229,43,43,0.35)] animate-slide-up text-left max-w-sm">
      <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-zinc-100 truncate">{message}</p>
        <p className="text-[10px] text-zinc-400 font-mono mt-0.5">Undo available ({timeLeft}s)</p>
      </div>

      <button
        onClick={onUndo}
        className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold transition flex items-center gap-1 shadow"
      >
        <RotateCcw className="w-3 h-3" />
        <span>Undo</span>
      </button>

      <button
        onClick={onDismiss}
        className="p-1 text-zinc-500 hover:text-zinc-200 transition"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
