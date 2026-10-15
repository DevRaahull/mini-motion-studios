import React from 'react';
import { WifiOff } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';

export const OfflineBanner: React.FC = () => {
  const { isOnline } = useAppData();

  if (isOnline) return null;

  return (
    <div className="offline-banner bg-amber-950/90 border-b border-amber-600/40 text-amber-200 px-4 py-2 text-xs flex items-center justify-center gap-2 sticky top-0 z-40">
      <WifiOff size={15} className="text-amber-400 shrink-0" />
      <span>
        <strong>Working Offline:</strong> You can view existing cached inventory and records. Creating new sales or expenses requires an active internet connection to guarantee data integrity across devices.
      </span>
    </div>
  );
};
