import React from 'react';
import { Tv, Globe, Users, PlaySquare, Eye, ExternalLink, Lock, CheckCircle2 } from 'lucide-react';
import { StudioSettings, YouTubeLiveStats } from '../../types';

interface ChannelsViewProps {
  settings: StudioSettings;
  liveStats: YouTubeLiveStats | null;
}

export const ChannelsView: React.FC<ChannelsViewProps> = ({
  settings,
  liveStats,
}) => {
  return (
    <div className="p-6 space-y-6 max-w-[1300px] mx-auto select-none text-left font-sans">
      
      {/* Header */}
      <div className="bg-[#0e111a] border border-[#202738] p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <span className="text-[10px] font-mono uppercase bg-red-950/60 text-red-400 border border-red-800/40 px-2 py-0.5 rounded">
            CHANNEL COMMAND (ENGLISH ONLY)
          </span>
          <h2 className="text-2xl font-black text-white font-display tracking-tight mt-1">
            Connected YouTube Channel
          </h2>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">
            Primary channel control center • Live YouTube Data API v3 synchronization
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-zinc-500 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141824] border border-[#1f2638]">
            <Lock className="w-3.5 h-3.5 text-zinc-500" />
            <span>Add Channel (Disabled)</span>
          </span>
        </div>
      </div>

      {/* English Channel Primary Card */}
      <div className="bg-[#0f121a] border-2 border-red-500/60 rounded-2xl p-6 space-y-5 shadow-[0_0_25px_rgba(229,43,43,0.15)] relative">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-black/80 border border-red-500/40 flex items-center justify-center p-2 shrink-0 shadow">
              <img src={settings.logo_url || "/assets/logo_mark.png"} alt="MMS" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white uppercase font-display">
                  {liveStats?.channelTitle || 'Mini Motion Studios'}
                </h3>
                <span className="text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded uppercase">
                  Active
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                Channel ID: {settings.youtube_channel_id}
              </p>
            </div>
          </div>

          <a
            href={`https://youtube.com/channel/${settings.youtube_channel_id}`}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold transition flex items-center gap-1.5 shadow"
          >
            <span>View Channel</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
          <div className="bg-[#121622] p-4 rounded-xl border border-[#1f2638]">
            <p className="text-[9px] text-zinc-400 uppercase">SUBSCRIBERS</p>
            <p className="text-xl font-bold text-white mt-1">
              {liveStats?.subscribers ? liveStats.subscribers.toLocaleString() : 'Not Connected'}
            </p>
            <p className="text-[10px] text-zinc-500 mt-1">Publicly rounded by YouTube</p>
          </div>

          <div className="bg-[#121622] p-4 rounded-xl border border-[#1f2638]">
            <p className="text-[9px] text-zinc-400 uppercase">LIFETIME VIEWS</p>
            <p className="text-xl font-bold text-white mt-1">
              {liveStats?.views ? liveStats.views.toLocaleString() : 'Not Connected'}
            </p>
            <p className="text-[10px] text-emerald-400 mt-1">Real Data API v3</p>
          </div>

          <div className="bg-[#121622] p-4 rounded-xl border border-[#1f2638]">
            <p className="text-[9px] text-zinc-400 uppercase">TOTAL PUBLISHED VIDEOS</p>
            <p className="text-xl font-bold text-white mt-1">
              {liveStats?.videoCount || 0}
            </p>
            <p className="text-[10px] text-zinc-500 mt-1">Official catalog</p>
          </div>
        </div>

        {/* Channel Details */}
        <div className="space-y-2 pt-2 border-t border-[#1c2230] text-xs font-mono text-zinc-300">
          <div className="flex justify-between py-1 border-b border-[#161a25]">
            <span className="text-zinc-500">Target Language:</span>
            <span className="text-white font-bold">English (Global)</span>
          </div>
          <div className="flex justify-between py-1 border-b border-[#161a25]">
            <span className="text-zinc-500">Channel Type:</span>
            <span>Original Narrative & Dark Psychology Studio</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-zinc-500">Architecture Status:</span>
            <span className="text-emerald-400 font-bold">Multi-Channel Schema Ready (Channel 1 Active)</span>
          </div>
        </div>
      </div>

    </div>
  );
};
