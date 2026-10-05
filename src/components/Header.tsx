import React, { useState, useEffect } from 'react';
import { Search, Monitor, Orbit, RefreshCw, Sliders, Radio, AlertCircle } from 'lucide-react';
import { YouTubeLiveStats, StudioSettings } from '../types';

interface HeaderProps {
  hudMode: boolean;
  onToggleHudMode: (val: boolean) => void;
  onOpenSearch: () => void;
  onOpenCustomizer: () => void;
  liveStats: YouTubeLiveStats | null;
  onRefreshYouTube: () => void;
  isRefreshing: boolean;
  settings: StudioSettings;
}

export const Header: React.FC<HeaderProps> = ({ 
  hudMode, 
  onToggleHudMode, 
  onOpenSearch,
  onOpenCustomizer,
  liveStats,
  onRefreshYouTube,
  isRefreshing,
  settings,
}) => {
  const [secondsAgo, setSecondsAgo] = useState<number>(0);

  // Timer to count "Updated X seconds ago"
  useEffect(() => {
    setSecondsAgo(0);
    const interval = setInterval(() => {
      setSecondsAgo(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [liveStats?.lastUpdated]);

  return (
    <header className="h-14 bg-[#0a0c11]/90 backdrop-blur-md border-b border-[#181b24] px-6 flex items-center justify-between sticky top-0 z-20 select-none">
      
      {/* Left: Search Trigger */}
      <div className="flex items-center w-80">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-[#11141c] hover:bg-[#161a25] border border-[#1e2330] text-zinc-400 text-xs transition group cursor-pointer shadow-inner text-left"
        >
          <Search className="w-3.5 h-3.5 text-zinc-500 group-hover:text-red-400 transition-colors" />
          <span className="flex-1 text-zinc-400">Search studio, projects, scripts...</span>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 bg-[#181c26] border border-[#252b3b] rounded">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Center: Real-Time YouTube Live Status Indicator */}
      <div className="flex items-center gap-3 bg-[#0d1017] border border-[#1d2332] px-3.5 py-1.5 rounded-xl font-mono text-xs">
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              liveStats?.isLive ? 'bg-emerald-400' : 'bg-amber-400'
            }`} />
            <span className={`relative inline-flex rounded-full h-2 w-2 ${
              liveStats?.isLive ? 'bg-emerald-500' : 'bg-amber-500'
            }`} />
          </span>
          <span className="text-zinc-200 font-bold uppercase tracking-wider text-[11px]">
            {liveStats?.isLive ? 'LIVE' : 'TELEMETRY'}
          </span>
        </div>

        <span className="text-zinc-600">|</span>

        <span className="text-[11px] text-zinc-400">
          Updated {secondsAgo < 5 ? 'just now' : `${secondsAgo}s ago`}
        </span>

        <button
          onClick={onRefreshYouTube}
          disabled={isRefreshing}
          title="Refresh Live YouTube Stats (60s cache)"
          className="p-1 text-zinc-400 hover:text-white rounded hover:bg-white/5 transition disabled:opacity-40"
        >
          <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-red-500' : ''}`} />
        </button>
      </div>

      {/* Right Controls: Mode Toggle & Customize Button */}
      <div className="flex items-center gap-3">
        {/* Mode Switcher */}
        <div className="flex items-center gap-1 bg-[#10131b] p-1 rounded-lg border border-[#1e2433]">
          <button
            onClick={() => onToggleHudMode(false)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition ${
              !hudMode 
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-[0_0_12px_rgba(229,43,43,0.5)]' 
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Cinematic</span>
          </button>
          <button
            onClick={() => onToggleHudMode(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition ${
              hudMode 
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-[0_0_12px_rgba(229,43,43,0.5)]' 
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Orbit className="w-3.5 h-3.5" />
            <span>Command Deck</span>
          </button>
        </div>

        {/* Customize Button */}
        <button
          onClick={onOpenCustomizer}
          className="px-3 py-1.5 rounded-lg bg-[#141824] hover:bg-[#1a2030] text-zinc-300 hover:text-white border border-[#202738] text-xs font-mono transition flex items-center gap-1.5"
        >
          <Sliders className="w-3.5 h-3.5 text-red-500" />
          <span>Customize</span>
        </button>

        {/* Profile Avatar */}
        <div 
          onClick={onOpenCustomizer}
          className="relative cursor-pointer group"
          title="Studio Settings"
        >
          <img 
            src={settings.avatar_url || "/assets/user_avatar_nav.png"} 
            alt="Rahul" 
            className="w-8 h-8 rounded-full border border-red-500/50 object-cover ring-2 ring-red-500/20 group-hover:ring-red-500/50 transition"
          />
          <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-black ring-1 ring-emerald-500/80" />
        </div>
      </div>
    </header>
  );
};
