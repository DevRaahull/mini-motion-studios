import React from 'react';
import { 
  Activity, 
  Tv, 
  Lightbulb, 
  Plus, 
  Cpu, 
  TrendingUp,
  Layers,
  Sparkles
} from 'lucide-react';
import { Project, Character, StudioSettings, YouTubeLiveStats, PipelineStage } from '../types';
import { EmptyState } from './common/EmptyState';

interface SciFiHudViewProps {
  projects: Project[];
  characters: Character[];
  stages: PipelineStage[];
  settings: StudioSettings;
  liveStats: YouTubeLiveStats | null;
  onOpenProject: (p: Project) => void;
  onOpenCharacter: (c: Character) => void;
  onOpenQuickAction: (action: 'topic' | 'script' | 'thumbnail' | 'project') => void;
  onNavigateToTab: (tab: string) => void;
}

export const SciFiHudView: React.FC<SciFiHudViewProps> = ({
  projects,
  characters,
  stages,
  settings,
  liveStats,
  onOpenProject,
  onOpenCharacter,
  onOpenQuickAction,
  onNavigateToTab,
}) => {
  const currentProject = projects.find(p => p.pinned) || projects[0] || null;

  return (
    <div className="min-h-screen bg-[#06070a] text-zinc-100 p-4 relative overflow-hidden select-none font-sans text-left">
      
      {/* Background Holographic Grid Effect */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#141724_1px,transparent_1px),linear-gradient(to_bottom,#141724_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-25 pointer-events-none" />

      {/* Top HUD Tabs Navigation Bar */}
      <div className="relative z-10 flex items-center justify-between border-b border-red-500/30 pb-3 mb-5 bg-[#090b10]/80 backdrop-blur-md px-4 py-2 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-black/80 border border-red-500/50 flex items-center justify-center shadow-[0_0_10px_rgba(229,43,43,0.5)]">
            <img src={settings.logo_url || "/assets/logo_mark.png"} alt="MMS" className="w-5 h-5 object-contain" />
          </div>
          <div>
            <h1 className="text-xs font-black tracking-widest text-white uppercase font-display">{settings.studio_name}</h1>
            <p className="text-[9px] font-mono text-red-400 tracking-wider uppercase">CREATIVE OPERATING SYSTEM {settings.version_label}</p>
          </div>
        </div>

        {/* HUD Center Navigation Tabs */}
        <div className="flex items-center gap-1 bg-[#0e111a] border border-[#1e2436] p-1 rounded-lg text-xs font-mono">
          {['DASHBOARD', 'CHANNEL', 'PROJECTS', 'CHARACTERS', 'SCRIPTS', 'CALENDAR', 'ANALYTICS'].map((tab, idx) => (
            <button
              key={tab}
              onClick={() => {
                if (tab === 'CHARACTERS') onNavigateToTab('characters');
                else if (tab === 'PROJECTS') onNavigateToTab('production');
                else if (tab === 'ANALYTICS') onNavigateToTab('analytics');
                else if (tab === 'SCRIPTS') onNavigateToTab('scripts');
                else if (tab === 'CALENDAR') onNavigateToTab('calendar');
                else if (tab === 'CHANNEL') onNavigateToTab('channels');
              }}
              className={`px-3 py-1 rounded transition tracking-wider ${
                idx === 0 
                  ? 'bg-red-600 text-white font-bold shadow-[0_0_10px_#ef4444]' 
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Live Channel Status */}
        <div className="flex items-center gap-2 font-mono text-xs text-zinc-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
          <span>CMD // ENGLISH CHANNEL</span>
        </div>
      </div>

      {/* Main 3-Column Cockpit Layout */}
      <div className="grid grid-cols-12 gap-4 relative z-10">
        
        {/* LEFT COLUMN: Project Status Radial Gauge & Channel Command */}
        <div className="col-span-12 lg:col-span-3 space-y-4">
          
          {/* 3D Radial Gauge Box */}
          <div className="bg-[#0b0e15] border border-red-500/40 rounded-2xl p-4 shadow-[0_0_20px_rgba(229,43,43,0.15)] relative overflow-hidden">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase text-zinc-400 mb-3">
              <span className="flex items-center gap-1 text-red-400">
                <Cpu className="w-3.5 h-3.5" /> STUDIO STATUS
              </span>
              <span className="text-emerald-400 font-mono">LIVE.OK</span>
            </div>

            <div className="flex flex-col items-center justify-center my-2">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="72" cy="72" r="58" stroke="#1a2030" strokeWidth="8" fill="transparent" />
                  <circle
                    cx="72"
                    cy="72"
                    r="58"
                    stroke="#ef4444"
                    strokeWidth="8"
                    strokeDasharray="364"
                    strokeDashoffset={projects.length > 0 ? "80" : "364"}
                    strokeLinecap="round"
                    fill="transparent"
                    className="filter drop-shadow-[0_0_8px_#ef4444]"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-black text-white tracking-tight font-display text-glow">
                    {projects.length}
                  </span>
                  <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest mt-0.5">PROJECTS</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center font-mono pt-2 border-t border-[#1a2130]">
              <div className="bg-[#0f1420] p-1.5 rounded border border-[#1f293d]">
                <p className="text-sm font-bold text-white">{projects.length}</p>
                <p className="text-[8px] text-zinc-400 uppercase">ACTIVE</p>
              </div>
              <div className="bg-[#0f1420] p-1.5 rounded border border-[#1f293d]">
                <p className="text-sm font-bold text-emerald-400">{characters.length}</p>
                <p className="text-[8px] text-zinc-400 uppercase">CAST</p>
              </div>
              <div className="bg-[#0f1420] p-1.5 rounded border border-[#1f293d]">
                <p className="text-sm font-bold text-amber-400">{stages.length}</p>
                <p className="text-[8px] text-zinc-400 uppercase">STAGES</p>
              </div>
            </div>
          </div>

          {/* CHANNEL COMMAND (English Channel Telemetry) */}
          <div className="bg-[#0b0e15] border border-[#1b2232] rounded-2xl p-4 space-y-3 font-mono">
            <div className="flex items-center justify-between text-[10px] uppercase text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Tv className="w-3.5 h-3.5 text-zinc-400" /> CHANNEL TELEMETRY
              </span>
              <span className="text-emerald-400">ONLINE</span>
            </div>

            <div className="bg-[#0f131d] border border-red-500/30 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-zinc-100 uppercase">{settings.studio_name}</p>
                  <p className="text-[9px] text-zinc-400">English Channel</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-white">
                    {liveStats?.subscribers ? liveStats.subscribers.toLocaleString() : '0'}
                  </p>
                  <p className="text-[9px] text-zinc-400">Subscribers</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* CENTER COLUMN: Curved Hero Hologram or Clean Slate */}
        <div className="col-span-12 lg:col-span-6 space-y-4">
          
          {currentProject ? (
            <div className="relative rounded-2xl overflow-hidden border-2 border-red-500/50 bg-[#080a10] shadow-[0_0_30px_rgba(229,43,43,0.3)]">
              <div className="relative aspect-[16/8] overflow-hidden">
                <img 
                  src={currentProject.thumbnail_url || '/assets/hud_center_display.png'} 
                  alt={currentProject.title} 
                  className="w-full h-full object-cover brightness-95"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080a10] via-transparent to-black/40" />

                <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-white tracking-wider font-display uppercase">
                      {currentProject.title}
                    </h2>
                    <p className="text-[10px] font-mono text-zinc-300 mt-1 uppercase tracking-widest">
                      FORMAT: {currentProject.format} • {currentProject.status}
                    </p>
                  </div>
                  <button 
                    onClick={() => onOpenProject(currentProject)}
                    className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs shadow-[0_0_15px_#ef4444] transition"
                  >
                    OPEN PROJECT
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 bg-[#0b0e15] border border-red-500/30 rounded-2xl text-center space-y-3">
              <h3 className="text-base font-bold text-white font-display">Command Deck Initialized</h3>
              <p className="text-xs text-zinc-400 font-mono">No active projects loaded in the HUD console.</p>
              <button
                onClick={() => onOpenQuickAction('project')}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold transition shadow"
              >
                + Launch New Project
              </button>
            </div>
          )}

          {/* Production Pipeline Telemetry */}
          <div className="bg-[#0b0e15] border border-red-500/30 rounded-xl p-3 font-mono">
            <div className="flex items-center justify-between text-[9px] text-zinc-400 mb-2">
              <span>PIPELINE TELEMETRY MATRIX</span>
              <span className="text-amber-400">{stages.length} ACTIVE STAGES</span>
            </div>
            <div className="flex items-center justify-between gap-1 overflow-x-auto">
              {stages.map((st) => (
                <div key={st.id} className="flex-1 flex flex-col items-center gap-1 group cursor-pointer p-1">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-[#1b2232] bg-[#0f1420] text-zinc-400 hover:border-red-500">
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[8px] tracking-tighter text-zinc-400 truncate max-w-[50px]">{st.name}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Studio Analytics HUD */}
        <div className="col-span-12 lg:col-span-3 space-y-4">
          <div className="bg-[#0b0e15] border border-red-500/30 rounded-2xl p-4 space-y-3 font-mono">
            <div className="flex items-center justify-between text-[10px] uppercase text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-red-500" /> LIVE STATS
              </span>
              <span className="text-zinc-500">API v3</span>
            </div>

            <div className="space-y-2">
              <div className="bg-[#0e131f] border border-[#1a2336] p-2 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-[8px] text-zinc-400 uppercase">SUBSCRIBERS</p>
                  <p className="text-xs font-bold text-white">
                    {liveStats?.subscribers ? liveStats.subscribers.toLocaleString() : '0'}
                  </p>
                </div>
                <span className="text-[9px] text-emerald-400">Live</span>
              </div>

              <div className="bg-[#0e131f] border border-[#1a2336] p-2 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-[8px] text-zinc-400 uppercase">LIFETIME VIEWS</p>
                  <p className="text-xs font-bold text-white">
                    {liveStats?.views ? liveStats.views.toLocaleString() : '0'}
                  </p>
                </div>
                <span className="text-[9px] text-emerald-400">Snapshot</span>
              </div>

              <div className="bg-[#0e131f] border border-[#1a2336] p-2 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-[8px] text-zinc-400 uppercase">VIDEOS</p>
                  <p className="text-xs font-bold text-white">
                    {liveStats?.videoCount || 0}
                  </p>
                </div>
                <span className="text-[9px] text-zinc-400">Catalog</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
