import React from 'react';
import { LucideIcon, Plus } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}) => {
  return (
    <div className="bg-[#0b0e15] border border-dashed border-[#1f2738] rounded-2xl p-8 sm:p-12 text-center max-w-xl mx-auto my-6 shadow-inner space-y-4 animate-fade-in">
      <div className="w-14 h-14 rounded-2xl bg-[#121624] border border-red-500/30 flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(229,43,43,0.2)]">
        <Icon className="w-7 h-7 text-red-500" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-lg font-bold text-white font-display tracking-tight">{title}</h3>
        <p className="text-xs text-zinc-400 font-mono max-w-sm mx-auto leading-relaxed">{description}</p>
      </div>

      <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-mono text-xs font-bold transition shadow-[0_0_15px_rgba(229,43,43,0.4)] flex items-center gap-2 group"
          >
            <Plus className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
            <span>{actionLabel}</span>
          </button>
        )}

        {secondaryActionLabel && onSecondaryAction && (
          <button
            onClick={onSecondaryAction}
            className="px-4 py-2.5 rounded-xl bg-[#121624] hover:bg-[#181d2e] border border-[#20293d] text-zinc-300 hover:text-white font-mono text-xs transition"
          >
            {secondaryActionLabel}
          </button>
        )}
      </div>
    </div>
  );
};
