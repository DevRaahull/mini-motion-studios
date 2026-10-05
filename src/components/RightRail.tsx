import React, { useState } from 'react';
import { 
  TrendingUp, 
  ChevronRight, 
  ChevronLeft, 
  Calendar as CalendarIcon, 
  Globe, 
  CheckCircle2, 
  Circle,
  ExternalLink,
  Info,
  Clock,
  Radio
} from 'lucide-react';
import { StudioSettings, YouTubeLiveStats, CalendarEvent } from '../types';

interface RightRailProps {
  settings: StudioSettings;
  liveStats: YouTubeLiveStats | null;
  calendarEvents: CalendarEvent[];
  onToggleEventComplete: (id: string) => void;
  onOpenCalendarTab: () => void;
  onOpenAnalyticsTab: () => void;
  onOpenCustomizer: () => void;
}

export const RightRail: React.FC<RightRailProps> = ({
  settings,
  liveStats,
  calendarEvents,
  onToggleEventComplete,
  onOpenCalendarTab,
  onOpenAnalyticsTab,
  onOpenCustomizer,
}) => {
  return (
    <aside className="w-80 min-w-80 bg-[#0a0c10] border-l border-[#181b24] h-screen overflow-y-auto p-4 space-y-5 select-none z-10 text-left font-sans">
      
      {/* 1. SINGLE ENGLISH CHANNEL CARD (Strictly English Only) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider">CONNECTED YOUTUBE CHANNEL</span>
          <span className="text-[9px] font-mono text-emerald-400 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> ACTIVE
          </span>
        </div>

        <div className="bg-[#0f1219] border border-red-500/50 rounded-2xl p-3.5 shadow-[0_0_15px_rgba(229,43,43,0.15)] space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black/80 border border-red-500/40 flex items-center justify-center p-1.5 shrink-0 shadow">
              <img src={settings.logo_url || "/assets/logo_mark.png"} alt="MMS" className="w-full h-full object-contain" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white uppercase font-display truncate">
                {liveStats?.channelTitle || 'Mini Motion Studios'}
              </p>
              <p className="text-[10px] text-zinc-400 font-mono truncate">
                {settings.youtube_channel_id}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-[#1a1f2b] text-[10px] font-mono text-zinc-400">
            <span>Language: <strong className="text-zinc-200">English</strong></span>
            <span className="text-red-400 hover:underline cursor-pointer" onClick={onOpenAnalyticsTab}>
              Analytics →
            </span>
          </div>
        </div>
      </div>

      {/* 2. REAL-TIME STUDIO ANALYTICS TELEMETRY */}
      <div className="bg-[#0f1219] border border-[#1b202c] rounded-2xl p-3.5 space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 cursor-pointer" onClick={onOpenAnalyticsTab}>
            <span className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider">LIVE CHANNEL STATS</span>
            <ExternalLink className="w-3 h-3 text-zinc-400 hover:text-white" />
          </div>
          <span className="text-[9px] font-mono text-zinc-500">Live API v3</span>
        </div>

        {/* Live Metrics: Subscribers, Views, Videos */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-[#131622] p-2 rounded-xl border border-[#1e2434]">
            <p className="text-[8px] font-mono text-zinc-400 uppercase">SUBSCRIBERS</p>
            <p className="text-sm font-bold text-zinc-100 font-display mt-0.5">
              {liveStats?.subscribers ? liveStats.subscribers.toLocaleString() : '0'}
            </p>
            <p className="text-[8px] text-emerald-400 font-mono mt-0.5">
              {liveStats?.deltaSubs && liveStats.deltaSubs > 0 ? `+${liveStats.deltaSubs}` : 'Real-time'}
            </p>
          </div>

          <div className="bg-[#131622] p-2 rounded-xl border border-[#1e2434]">
            <p className="text-[8px] font-mono text-zinc-400 uppercase">TOTAL VIEWS</p>
            <p className="text-sm font-bold text-zinc-100 font-display mt-0.5">
              {liveStats?.views ? liveStats.views.toLocaleString() : '0'}
            </p>
            <p className="text-[8px] text-emerald-400 font-mono mt-0.5">
              {liveStats?.deltaViews && liveStats.deltaViews > 0 ? `+${liveStats.deltaViews}` : 'Snapshot'}
            </p>
          </div>

          <div className="bg-[#131622] p-2 rounded-xl border border-[#1e2434]">
            <p className="text-[8px] font-mono text-zinc-400 uppercase">VIDEOS</p>
            <p className="text-sm font-bold text-zinc-100 font-display mt-0.5">
              {liveStats?.videoCount || 0}
            </p>
            <p className="text-[8px] text-zinc-400 font-mono mt-0.5">Published</p>
          </div>
        </div>

        {/* Notice that YouTube rounds subscriber counts */}
        <div className="bg-[#0b0e14] p-2 rounded-lg border border-[#171c26] flex items-start gap-1.5 text-[9px] font-mono text-zinc-400 leading-snug">
          <Info className="w-3 h-3 text-red-400 shrink-0 mt-0.5" />
          <span>Note: YouTube publicly rounds subscriber counts for third-party tools.</span>
        </div>

        {/* Delayed Analytics Transparency Tag */}
        <div className="pt-2 border-t border-[#181d2a] space-y-1.5 font-mono text-[10px]">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="uppercase text-[8px]">ANALYTICS RETENTION</span>
            <span className="text-amber-400 font-bold">{liveStats?.avgRetention || '64.3%'}</span>
          </div>
          <div className="flex items-center justify-between text-zinc-400">
            <span className="uppercase text-[8px]">ESTIMATED CTR</span>
            <span className="text-emerald-400 font-bold">{liveStats?.ctr || '8.72%'}</span>
          </div>
          <div className="flex items-center justify-between text-[8px] text-zinc-500 pt-1">
            <span>Data as of {liveStats?.analyticsAsOfDate || '2 days ago'}</span>
            <span>(24-48h YouTube latency)</span>
          </div>
        </div>
      </div>

      {/* 3. PRODUCTION CALENDAR */}
      <div className="bg-[#0f1219] border border-[#1b202c] rounded-2xl p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 cursor-pointer" onClick={onOpenCalendarTab}>
            <span className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider">PRODUCTION CALENDAR</span>
            <ExternalLink className="w-3 h-3 text-zinc-400 hover:text-white" />
          </div>
          <span className="text-[10px] font-mono text-zinc-300 font-bold">Today</span>
        </div>

        {/* Schedule List or Empty State */}
        {calendarEvents.length === 0 ? (
          <div className="p-4 text-center rounded-xl bg-[#0b0e14] border border-[#181c28] space-y-2">
            <CalendarIcon className="w-5 h-5 text-zinc-600 mx-auto" />
            <p className="text-xs text-zinc-400 font-mono">No uploads scheduled</p>
            <button
              onClick={onOpenCalendarTab}
              className="px-3 py-1 rounded bg-[#141824] hover:bg-red-600 text-zinc-300 hover:text-white text-[10px] font-mono transition"
            >
              + Schedule Release
            </button>
          </div>
        ) : (
          <div className="space-y-1.5">
            {calendarEvents.slice(0, 3).map((evt) => (
              <div
                key={evt.id}
                onClick={() => onToggleEventComplete(evt.id)}
                className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                  evt.completed 
                    ? 'bg-[#0d1017] border-emerald-500/30 opacity-75' 
                    : 'bg-[#12151e] border-[#1d222e] hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  {evt.completed ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  )}
                  <span className={`text-[11px] leading-tight ${evt.completed ? 'line-through text-zinc-400' : 'text-zinc-200'}`}>
                    {evt.title}
                  </span>
                </div>
                <span className="text-[9px] font-mono text-amber-400 shrink-0 ml-2">{evt.time}</span>
              </div>
            ))}
          </div>
        )}
      </div>

    </aside>
  );
};
