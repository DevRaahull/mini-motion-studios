import React, { useState } from 'react';
import { 
  Play, 
  FolderOpen, 
  Lightbulb, 
  Users, 
  Clapperboard, 
  Plus,
  ArrowRight,
  TrendingUp,
  Info,
  Layers,
  Sparkles
} from 'lucide-react';
import { Project, Character, PipelineStage, StudioSettings, YouTubeLiveStats } from '../types';
import { EmptyState } from './common/EmptyState';

interface DashboardViewProps {
  projects: Project[];
  characters: Character[];
  stages: PipelineStage[];
  settings: StudioSettings;
  liveStats: YouTubeLiveStats | null;
  onOpenProject: (project: Project) => void;
  onOpenCharacter: (character: Character) => void;
  onNavigateToTab: (tab: string) => void;
  onOpenQuickAction: (action: 'topic' | 'script' | 'thumbnail' | 'project') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  projects,
  characters,
  stages,
  settings,
  liveStats,
  onOpenProject,
  onOpenCharacter,
  onNavigateToTab,
  onOpenQuickAction,
}) => {
  const [activeStageId, setActiveStageId] = useState<string>(stages[0]?.id || 'stage-idea');
  const [bannerStyle, setBannerStyle] = useState<'master' | 'sunset'>('master');

  // Check which widgets are visible based on user customization
  const isWidgetVisible = (id: string) => {
    const w = (settings.home_widgets || []).find(item => item.id === id);
    return w ? w.visible : true;
  };

  const pinnedProject = projects.find(p => p.pinned) || projects[0] || null;

  return (
    <div className="p-6 space-y-6 max-w-[1300px] mx-auto select-none font-sans text-left">
      
      {/* 1. STUDIO HERO BANNER (Configurable) */}
      {isWidgetVisible('hero_banner') && (
        <div className="relative rounded-2xl overflow-hidden border border-[#232938] bg-[#0c0e14] shadow-2xl">
          <div className="absolute inset-0">
            <img 
              src={bannerStyle === 'master' ? '/assets/studio_master_banner.jpg' : '/assets/hero_banner_full.png'} 
              alt={settings.studio_name} 
              className="w-full h-full object-cover object-center opacity-85 brightness-95 transition-all duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#090b10] via-[#090b10]/75 to-transparent w-3/4" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#090b10] via-transparent to-transparent" />
          </div>

          <div className="relative z-10 p-6 md:p-8 flex flex-col justify-between min-h-[220px]">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-mono tracking-widest text-red-500 uppercase px-2 py-0.5 rounded bg-red-950/60 border border-red-800/40">
                    {settings.studio_name}
                  </span>
                  <span className="text-xs text-zinc-400 font-serif italic">{settings.tagline}</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight font-display">
                  Welcome, <span className="text-red-500 text-glow">Rahul.</span>
                </h2>
                <p className="text-sm text-zinc-300 mt-1 max-w-md font-sans">
                  English channel content desk • Clean slate ready for your productions.
                </p>
              </div>

              {/* Banner Selector */}
              <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md p-1 rounded-lg border border-white/10 text-[10px] font-mono">
                <button
                  onClick={() => setBannerStyle('master')}
                  className={`px-2.5 py-1 rounded transition ${
                    bannerStyle === 'master' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  HD Brand Banner
                </button>
                <button
                  onClick={() => setBannerStyle('sunset')}
                  className={`px-2.5 py-1 rounded transition ${
                    bannerStyle === 'sunset' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Sunset Cityscape
                </button>
              </div>
            </div>

            {/* Live Stats Strip on Banner */}
            <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center gap-6 font-mono text-xs">
              <div>
                <span className="text-zinc-400 text-[10px] uppercase block">LIVE SUBSCRIBERS</span>
                <span className="text-white font-bold text-base font-display">
                  {liveStats?.subscribers ? liveStats.subscribers.toLocaleString() : 'Not Connected'}
                </span>
              </div>
              <div className="h-6 w-px bg-white/10" />
              <div>
                <span className="text-zinc-400 text-[10px] uppercase block">LIFETIME VIEWS</span>
                <span className="text-white font-bold text-base font-display">
                  {liveStats?.views ? liveStats.views.toLocaleString() : 'Not Connected'}
                </span>
              </div>
              <div className="h-6 w-px bg-white/10" />
              <div>
                <span className="text-zinc-400 text-[10px] uppercase block">ACTIVE PROJECTS</span>
                <span className="text-red-400 font-bold text-base font-display">{projects.length}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. DYNAMIC PIPELINE STEPPER (Configurable stages) */}
      {isWidgetVisible('pipeline_stepper') && (
        <div className="bg-[#0f1219] border border-[#1e2330] rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider">PRODUCTION PIPELINE</span>
              <span className="text-[10px] text-zinc-400 font-mono">• Active Stage:</span>
              <span className="text-[10px] font-mono font-bold text-white uppercase px-2 py-0.5 rounded border border-white/20">
                {stages.find(s => s.id === activeStageId)?.name || 'IDEA'}
              </span>
            </div>
            <button
              onClick={() => onNavigateToTab('settings')}
              className="text-[10px] font-mono text-red-400 hover:text-red-300"
            >
              Customize Stages →
            </button>
          </div>

          {/* Stepper Nodes */}
          <div className="flex items-center justify-between relative px-2 overflow-x-auto pb-2 scrollbar-none">
            {stages.map((stage, idx) => {
              const isActive = stage.id === activeStageId;
              const countInStage = projects.filter(p => p.stage_id === stage.id).length;

              return (
                <React.Fragment key={stage.id}>
                  <div 
                    onClick={() => setActiveStageId(stage.id)}
                    className="flex flex-col items-center gap-2 cursor-pointer group shrink-0"
                  >
                    <div 
                      className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 border-2 relative ${
                        isActive
                          ? 'scale-110 shadow-[0_0_15px_rgba(239,68,68,0.5)] border-white bg-red-950/40 text-white'
                          : 'border-zinc-800 bg-[#12151e] text-zinc-400 group-hover:border-zinc-600'
                      }`}
                      style={{ borderColor: isActive ? stage.color : undefined }}
                    >
                      <Layers className="w-4 h-4" />
                      {countInStage > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-mono font-bold flex items-center justify-center shadow">
                          {countInStage}
                        </span>
                      )}
                    </div>
                    <span className={`text-[9px] font-mono font-bold tracking-wider uppercase ${
                      isActive ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-300'
                    }`}>
                      {stage.name}
                    </span>
                  </div>

                  {idx < stages.length - 1 && (
                    <div className="flex-1 h-[2px] mx-2 bg-[#1b202c] relative min-w-[20px]" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. PINNED / ACTIVE PROJECT SPOTLIGHT */}
      {isWidgetVisible('pinned_project') && (
        <div>
          {pinnedProject ? (
            <div className="bg-gradient-to-b from-[#131620] to-[#0e1017] border border-[#222838] rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-8 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-mono uppercase text-zinc-400 tracking-widest">
                      ACTIVE PROJECT
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-red-950/60 text-red-400 border border-red-800/40">
                      {pinnedProject.status}
                    </span>
                  </div>

                  <h3 className="text-2xl font-extrabold text-white font-display">
                    {pinnedProject.title}
                  </h3>
                  <p className="text-xs text-zinc-400 font-mono">
                    Format: {pinnedProject.format} • {pinnedProject.series || 'Stand-Alone Story'}
                  </p>
                  <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed bg-[#11141e] p-3 rounded-xl border border-[#1b212f]">
                    {pinnedProject.description || 'No description added yet.'}
                  </p>

                  <div className="pt-2 flex items-center gap-3">
                    <button
                      onClick={() => onOpenProject(pinnedProject)}
                      className="px-4 py-2 rounded-xl bg-[#1a1f2c] hover:bg-[#22293b] text-white border border-[#2a3346] text-xs font-mono font-bold transition flex items-center gap-2"
                    >
                      <FolderOpen className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Open Project</span>
                    </button>
                    <button
                      onClick={() => onNavigateToTab('scripts')}
                      className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-bold transition shadow-[0_0_15px_#ef4444] flex items-center gap-2"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Script Editor</span>
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-4 flex justify-center">
                  <div 
                    onClick={() => onOpenProject(pinnedProject)}
                    className="relative w-full max-w-xs aspect-video rounded-xl overflow-hidden bg-black border border-white/10 cursor-pointer group"
                  >
                    <img 
                      src={pinnedProject.thumbnail_url || '/assets/current_project_card.png'} 
                      alt={pinnedProject.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-2 left-2 text-[9px] font-mono text-white bg-black/70 px-2 py-0.5 rounded">
                      {pinnedProject.format}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={Clapperboard}
              title="No Projects in Production"
              description="Your studio is currently clean. Initiate your first episode or video concept to start your production pipeline."
              actionLabel="Create Your First Project"
              onAction={() => onOpenQuickAction('project')}
              secondaryActionLabel="Draft Topic Idea"
              onSecondaryAction={() => onOpenQuickAction('topic')}
            />
          )}
        </div>
      )}

      {/* 4. PROJECTS & EPISODES GRID */}
      {isWidgetVisible('projects_grid') && projects.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-zinc-400 tracking-wider">
              STUDIO PROJECTS ({projects.length})
            </span>
            <button
              onClick={() => onOpenQuickAction('project')}
              className="text-[10px] font-mono text-red-500 hover:text-red-400 flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>New Project</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {projects.map((proj) => (
              <div
                key={proj.id}
                onClick={() => onOpenProject(proj)}
                className="bg-[#0f1219] hover:bg-[#141824] border border-[#1e2330] hover:border-red-500/50 rounded-xl overflow-hidden transition cursor-pointer group flex flex-col justify-between p-3"
              >
                <div className="relative aspect-video rounded-lg overflow-hidden bg-black mb-2">
                  <img 
                    src={proj.thumbnail_url || '/assets/current_project_card.png'} 
                    alt={proj.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                  />
                  <div className="absolute bottom-1 right-1 text-[8px] font-mono bg-black/80 px-1.5 py-0.5 rounded text-white">
                    {proj.format}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-red-400 font-display line-clamp-1">
                    {proj.title}
                  </h4>
                  <p className="text-[10px] text-zinc-400 font-mono mt-0.5">{proj.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. CAST UNIVERSE SECTION */}
      {isWidgetVisible('cast_roster') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-zinc-400 tracking-wider">
              CAST UNIVERSE ({characters.length})
            </span>
            <button
              onClick={() => onNavigateToTab('characters')}
              className="text-[10px] font-mono text-red-500 hover:text-red-400 flex items-center gap-1"
            >
              <span>Manage Cast</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {characters.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No Characters in Universe"
              description="Build your canon cast list with bios, psychological archetypes, voice clone IDs, and generative Midjourney prompt formulas."
              actionLabel="Add Your First Character"
              onAction={() => onNavigateToTab('characters')}
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {characters.map((char) => (
                <div
                  key={char.id}
                  onClick={() => onOpenCharacter(char)}
                  className="bg-[#0f1219] hover:bg-[#141824] border border-[#1e2330] hover:border-red-500/50 rounded-xl p-3 cursor-pointer transition group"
                >
                  <div className="aspect-square rounded-lg overflow-hidden bg-black/60 mb-2 border border-white/5">
                    <img src={char.avatar_url || '/assets/cast_peter.png'} alt={char.name} className="w-full h-full object-cover object-top" />
                  </div>
                  <h4 className="text-xs font-bold text-white font-display uppercase group-hover:text-red-400">
                    {char.name}
                  </h4>
                  <p className="text-[10px] text-zinc-400 font-mono truncate">{char.role}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
