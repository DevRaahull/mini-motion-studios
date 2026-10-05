import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { RightRail } from './components/RightRail';
import { DashboardView } from './components/DashboardView';
import { SciFiHudView } from './components/SciFiHudView';
import { ScriptsView } from './components/views/ScriptsView';
import { ThumbnailsView } from './components/views/ThumbnailsView';
import { CalendarView } from './components/views/CalendarView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { AssetLibraryView } from './components/views/AssetLibraryView';
import { ChannelsView } from './components/views/ChannelsView';
import { ProjectModal } from './components/modals/ProjectModal';
import { CastModal } from './components/modals/CastModal';
import { SearchModal } from './components/modals/SearchModal';
import { QuickActionModal } from './components/modals/QuickActionModal';
import { OnboardingWizard } from './components/onboarding/OnboardingWizard';
import { StudioCustomizerModal } from './components/customizer/StudioCustomizerModal';
import { ToastUndo } from './components/common/ToastUndo';
import { EmptyState } from './components/common/EmptyState';
import { 
  loadSettings, 
  saveSettings, 
  loadProjects, 
  saveProject, 
  deleteProject, 
  loadCharacters, 
  saveCharacter, 
  deleteCharacter, 
  loadIdeas, 
  saveIdea, 
  deleteIdea, 
  loadAssets, 
  saveAsset, 
  deleteAsset, 
  loadPipelineStages, 
  savePipelineStages, 
  loadAIModels, 
  saveAIModels, 
  loadCustomFields, 
  saveCustomField, 
  deleteCustomField 
} from './lib/storage';
import { fetchYouTubeStats } from './lib/youtube';
import { 
  StudioSettings, 
  Project, 
  Character, 
  Idea, 
  Asset, 
  PipelineStage, 
  AIModel, 
  CustomFieldDefinition, 
  CalendarEvent, 
  YouTubeLiveStats, 
  YouTubeVideo 
} from './types';
import { defaultSettings } from './data/initialConfig';
import { Users, Lightbulb, Plus } from 'lucide-react';

export const App: React.FC = () => {
  // Studio Configuration State
  const [settings, setSettings] = useState<StudioSettings>(defaultSettings);
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [hudMode, setHudMode] = useState<boolean>(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState<boolean>(false);

  // Studio Collections (Clean Slate: Loaded from Supabase/Persistent Storage)
  const [projects, setProjects] = useState<Project[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [aiModels, setAiModels] = useState<AIModel[]>([]);
  const [customFields, setCustomFields] = useState<CustomFieldDefinition[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);

  // YouTube Live Stats Engine State
  const [liveStats, setLiveStats] = useState<YouTubeLiveStats | null>(null);
  const [channelVideos, setChannelVideos] = useState<YouTubeVideo[]>([]);
  const [isRefreshingYouTube, setIsRefreshingYouTube] = useState<boolean>(false);

  // Modals & Interaction State
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [quickActionType, setQuickActionType] = useState<'topic' | 'script' | 'thumbnail' | 'project' | null>(null);

  // Undo Toast state
  const [undoToast, setUndoToast] = useState<{ message: string; rollback: () => void } | null>(null);

  // 1. Initial Load of Persistent Data
  useEffect(() => {
    const initializeStudio = async () => {
      const s = await loadSettings();
      setSettings(s);
      setHudMode(s.theme_mode === 'scifi');

      const p = await loadProjects();
      setProjects(p);

      const c = await loadCharacters();
      setCharacters(c);

      const i = await loadIdeas();
      setIdeas(i);

      const a = await loadAssets();
      setAssets(a);

      const st = await loadPipelineStages();
      setStages(st);

      const m = await loadAIModels();
      setAiModels(m);

      const cf = await loadCustomFields();
      setCustomFields(cf);
    };

    initializeStudio();
  }, []);

  // 2. Real-Time YouTube Telemetry Poller (60s interval with visibility detector)
  const refreshYouTubeTelemetry = useCallback(async () => {
    setIsRefreshingYouTube(true);
    try {
      const res = await fetchYouTubeStats(settings.youtube_channel_id, settings.youtube_api_key);
      setLiveStats(res.stats);
      setChannelVideos(res.videos);
    } catch (e) {
      console.warn('Failed refreshing YouTube stats:', e);
    } finally {
      setIsRefreshingYouTube(false);
    }
  }, [settings.youtube_channel_id, settings.youtube_api_key]);

  useEffect(() => {
    refreshYouTubeTelemetry();

    // 60-second auto poller (pauses when browser tab is hidden)
    const poller = setInterval(() => {
      if (!document.hidden) {
        refreshYouTubeTelemetry();
      }
    }, 60000);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshYouTubeTelemetry();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(poller);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refreshYouTubeTelemetry]);

  // 3. Dynamic Accent Color & Glow Intensity Injection
  useEffect(() => {
    document.documentElement.style.setProperty('--accent-color', settings.accent_color);
  }, [settings.accent_color]);

  // Handlers for Project & Asset modifications
  const handleUpdateSettings = async (updated: StudioSettings) => {
    setSettings(updated);
    setHudMode(updated.theme_mode === 'scifi');
    await saveSettings(updated);
  };

  const handleAddProject = async (pData: Partial<Project>) => {
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      channel_id: settings.youtube_channel_id,
      title: pData.title || 'Untitled Project',
      format: pData.format || 'Long-form',
      series: pData.series || '',
      stage_id: pData.stage_id || stages[0]?.id || 'stage-idea',
      status: pData.status || 'Draft',
      tags: pData.tags || [],
      description: pData.description || '',
      thumbnail_url: pData.thumbnail_url || '/assets/current_project_card.png',
      deadline: pData.deadline,
      pinned: pData.pinned || false,
      custom_fields: pData.custom_fields || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    await saveProject(newProj);
    setProjects(prev => [newProj, ...prev]);
  };

  const handleDeleteProject = async (id: string) => {
    const previous = [...projects];
    await deleteProject(id);
    setProjects(prev => prev.filter(p => p.id !== id));
    setUndoToast({
      message: 'Project deleted',
      rollback: async () => {
        const deleted = previous.find(p => p.id === id);
        if (deleted) {
          await saveProject(deleted);
          setProjects(previous);
        }
      }
    });
  };

  const handleAddCharacter = async (char: Character) => {
    await saveCharacter(char);
    setCharacters(prev => [char, ...prev]);
  };

  const handleDeleteCharacter = async (id: string) => {
    const previous = [...characters];
    await deleteCharacter(id);
    setCharacters(prev => prev.filter(c => c.id !== id));
    setUndoToast({
      message: 'Character deleted',
      rollback: async () => {
        const deleted = previous.find(c => c.id === id);
        if (deleted) {
          await saveCharacter(deleted);
          setCharacters(previous);
        }
      }
    });
  };

  const handleAddIdea = async (idea: Idea) => {
    await saveIdea(idea);
    setIdeas(prev => [idea, ...prev]);
  };

  const handleDeleteIdea = async (id: string) => {
    const previous = [...ideas];
    await deleteIdea(id);
    setIdeas(prev => prev.filter(i => i.id !== id));
    setUndoToast({
      message: 'Topic idea deleted',
      rollback: async () => {
        const deleted = previous.find(i => i.id === id);
        if (deleted) {
          await saveIdea(deleted);
          setIdeas(previous);
        }
      }
    });
  };

  const handleAddAsset = async (asset: Asset) => {
    await saveAsset(asset);
    setAssets(prev => [asset, ...prev]);
  };

  return (
    <div 
      className="flex h-screen w-screen overflow-hidden bg-[#08090d] text-slate-100 font-sans select-none"
      style={{
        fontSize: settings.font_size === 'small' ? '13px' : settings.font_size === 'large' ? '15px' : '14px',
      }}
    >
      {/* Onboarding Wizard (First-Run, Skippable) */}
      {!settings.onboarding_completed && (
        <OnboardingWizard
          settings={settings}
          onComplete={(up) => handleUpdateSettings(up)}
          onSkip={() => handleUpdateSettings({ ...settings, onboarding_completed: true })}
        />
      )}

      {/* Left Navigation Sidebar */}
      {!hudMode && (
        <Sidebar 
          currentTab={currentTab}
          onTabChange={(tab) => setCurrentTab(tab)}
          onOpenQuickAction={(action) => setQuickActionType(action)}
          settings={settings}
          onOpenCustomizer={() => setIsCustomizerOpen(true)}
        />
      )}

      {/* Central Viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-[#08090d]">
        <Header 
          hudMode={hudMode}
          onToggleHudMode={(val) => {
            setHudMode(val);
            handleUpdateSettings({ ...settings, theme_mode: val ? 'scifi' : 'cinematic' });
          }}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenCustomizer={() => setIsCustomizerOpen(true)}
          liveStats={liveStats}
          onRefreshYouTube={refreshYouTubeTelemetry}
          isRefreshing={isRefreshingYouTube}
          settings={settings}
        />

        <main className="flex-1 overflow-y-auto scrollbar-thin">
          {hudMode ? (
            <SciFiHudView 
              projects={projects}
              characters={characters}
              stages={stages}
              settings={settings}
              liveStats={liveStats}
              onOpenProject={(p) => setSelectedProject(p)}
              onOpenCharacter={(c) => setSelectedCharacter(c)}
              onOpenQuickAction={(act) => setQuickActionType(act)}
              onNavigateToTab={(tab) => {
                setHudMode(false);
                setCurrentTab(tab);
              }}
            />
          ) : (
            <>
              {(currentTab === 'dashboard' || currentTab === 'production') && (
                <DashboardView 
                  projects={projects}
                  characters={characters}
                  stages={stages}
                  settings={settings}
                  liveStats={liveStats}
                  onOpenProject={(p) => setSelectedProject(p)}
                  onOpenCharacter={(c) => setSelectedCharacter(c)}
                  onNavigateToTab={(tab) => setCurrentTab(tab)}
                  onOpenQuickAction={(act) => setQuickActionType(act)}
                />
              )}

              {currentTab === 'channels' && (
                <ChannelsView 
                  settings={settings}
                  liveStats={liveStats}
                />
              )}

              {currentTab === 'topics' && (
                <div className="p-6 max-w-[1300px] mx-auto text-left space-y-6 font-sans">
                  <div className="bg-[#0e111a] border border-[#202738] p-5 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase bg-red-950/60 text-red-400 border border-red-800/40 px-2 py-0.5 rounded">
                        VIRAL INCUBATOR
                      </span>
                      <h2 className="text-2xl font-black text-white font-display mt-1">Topic & Idea Backlog</h2>
                      <p className="text-xs text-zinc-400 font-mono mt-0.5">English channel concepts and viral probability scoring</p>
                    </div>
                    <button
                      onClick={() => setQuickActionType('topic')}
                      className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold shadow-[0_0_12px_#ef4444] transition flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Draft New Topic</span>
                    </button>
                  </div>

                  {ideas.length === 0 ? (
                    <EmptyState
                      icon={Lightbulb}
                      title="No Topics in Idea Backlog"
                      description="Your idea bank is empty. Draft your first dark psychology concept, narrative angle, or research hook."
                      actionLabel="Draft First Topic"
                      onAction={() => setQuickActionType('topic')}
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                      {ideas.map((topic) => (
                        <div key={topic.id} className="bg-[#0f121a] border border-[#1e2436] p-4 rounded-xl space-y-2 hover:border-red-500/50 transition">
                          <span className="text-[9px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            {topic.viral_index || '90% Viral Index'}
                          </span>
                          <h4 className="text-sm font-bold text-white font-sans">{topic.title}</h4>
                          <p className="text-[11px] text-zinc-400 line-clamp-2">{topic.notes || topic.theme}</p>
                          <div className="flex justify-between items-center pt-2 border-t border-[#1a1f2c] text-[10px] text-zinc-400">
                            <span>{topic.status}</span>
                            <button
                              onClick={() => handleDeleteIdea(topic.id)}
                              className="text-zinc-600 hover:text-red-400"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {currentTab === 'scripts' && (
                <ScriptsView 
                  projects={projects}
                  settings={settings}
                  onOpenQuickAction={(act) => setQuickActionType(act)}
                />
              )}

              {currentTab === 'characters' && (
                <div className="p-6 max-w-[1300px] mx-auto text-left space-y-6 font-sans">
                  <div className="bg-[#0e111a] border border-[#202738] p-5 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase bg-red-950/60 text-red-400 border border-red-800/40 px-2 py-0.5 rounded">
                        CHARACTER UNIVERSE
                      </span>
                      <h2 className="text-2xl font-black text-white font-display mt-1">Cast & Archetype Matrix</h2>
                      <p className="text-xs text-zinc-400 font-mono mt-0.5">Canon characters, voice IDs, and Midjourney prompt formulas</p>
                    </div>
                    <button
                      onClick={() => {
                        const name = prompt('Enter Character Name:');
                        if (name) {
                          handleAddCharacter({
                            id: `char-${Date.now()}`,
                            name: name.toUpperCase(),
                            role: 'Character',
                            avatar_url: '/assets/cast_peter.png',
                            bio: 'New character in studio universe.',
                            archetype: 'The Catalyst',
                            voice_id: 'ElevenLabs Custom Clone',
                            prompt_formula: 'Cinematic anime character portrait, 8k, moody lighting'
                          });
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold shadow-[0_0_12px_#ef4444] transition flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Character</span>
                    </button>
                  </div>

                  {characters.length === 0 ? (
                    <EmptyState
                      icon={Users}
                      title="No Characters in Studio Universe"
                      description="Create your first canon protagonist, antagonist, or narrator with full voice IDs and AI prompt formulas."
                      actionLabel="Add Your First Character"
                      onAction={() => {
                        const name = prompt('Enter Character Name:');
                        if (name) {
                          handleAddCharacter({
                            id: `char-${Date.now()}`,
                            name: name.toUpperCase(),
                            role: 'Protagonist',
                            avatar_url: '/assets/cast_peter.png',
                            bio: 'Protagonist of the series.',
                            archetype: 'The Awakened Mind',
                            voice_id: 'Custom Voice Clone',
                            prompt_formula: 'Cinematic anime portrait, sharp focus, 8k'
                          });
                        }
                      }}
                    />
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {characters.map(char => (
                        <div
                          key={char.id}
                          onClick={() => setSelectedCharacter(char)}
                          className="bg-[#0f121a] hover:bg-[#141824] border border-[#1e2330] hover:border-red-500/50 rounded-xl p-3.5 cursor-pointer transition shadow-lg group relative"
                        >
                          <div className="aspect-square rounded-lg overflow-hidden bg-black/60 mb-3 border border-white/5">
                            <img src={char.avatar_url || '/assets/cast_peter.png'} alt={char.name} className="w-full h-full object-cover object-top hover:scale-105 transition-transform" />
                          </div>
                          <h4 className="text-sm font-bold text-white font-display uppercase group-hover:text-red-400">
                            {char.name}
                          </h4>
                          <p className="text-xs text-amber-400 font-mono mt-0.5">{char.role}</p>
                          <p className="text-[10px] text-zinc-400 mt-2 line-clamp-2 italic font-serif">
                            {char.bio}
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCharacter(char.id);
                            }}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-zinc-500 hover:text-red-400 transition"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {currentTab === 'thumbnails' && (
                <ThumbnailsView 
                  projects={projects}
                  settings={settings}
                  onOpenQuickAction={(act) => setQuickActionType(act)}
                />
              )}

              {currentTab === 'calendar' && (
                <CalendarView 
                  events={calendarEvents}
                  settings={settings}
                  onUpdateSettings={handleUpdateSettings}
                  onAddEvent={(evt) => setCalendarEvents(prev => [...prev, evt])}
                  onToggleEvent={(id) => setCalendarEvents(prev => prev.map(e => e.id === id ? { ...e, completed: !e.completed } : e))}
                />
              )}

              {currentTab === 'analytics' && (
                <AnalyticsView 
                  liveStats={liveStats}
                  videos={channelVideos}
                  onRefresh={refreshYouTubeTelemetry}
                  isRefreshing={isRefreshingYouTube}
                  settings={settings}
                  onOpenCustomizer={() => setIsCustomizerOpen(true)}
                />
              )}

              {currentTab === 'assets' && (
                <AssetLibraryView 
                  assets={assets}
                  onAddAsset={handleAddAsset}
                  onOpenQuickAction={(act) => setQuickActionType(act)}
                />
              )}

              {currentTab === 'settings' && (
                <div className="p-6 max-w-xl mx-auto text-left space-y-4 font-sans">
                  <div className="bg-[#0e111a] border border-[#202738] p-6 rounded-2xl space-y-4">
                    <h2 className="text-xl font-bold text-white font-display">Studio Configuration Hub</h2>
                    <p className="text-xs text-zinc-400 font-mono">
                      All settings are saved permanently and can be exported as JSON.
                    </p>
                    <button
                      onClick={() => setIsCustomizerOpen(true)}
                      className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs transition shadow"
                    >
                      Open Full Customization Engine
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Right Intelligence Rail */}
      {!hudMode && (
        <RightRail 
          settings={settings}
          liveStats={liveStats}
          calendarEvents={calendarEvents}
          onToggleEventComplete={(id) => setCalendarEvents(prev => prev.map(e => e.id === id ? { ...e, completed: !e.completed } : e))}
          onOpenCalendarTab={() => setCurrentTab('calendar')}
          onOpenAnalyticsTab={() => setCurrentTab('analytics')}
          onOpenCustomizer={() => setIsCustomizerOpen(true)}
        />
      )}

      {/* Studio Customizer Modal */}
      <StudioCustomizerModal 
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        stages={stages}
        onUpdateStages={async (st) => {
          setStages(st);
          await savePipelineStages(st);
        }}
        aiModels={aiModels}
        onUpdateAIModels={async (m) => {
          setAiModels(m);
          await saveAIModels(m);
        }}
        customFields={customFields}
        onAddCustomField={async (cf) => {
          await saveCustomField(cf);
          setCustomFields(prev => [...prev, cf]);
        }}
        onDeleteCustomField={async (cfId) => {
          await deleteCustomField(cfId);
          setCustomFields(prev => prev.filter(c => c.id !== cfId));
        }}
        onTriggerUndoToast={(msg, rb) => setUndoToast({ message: msg, rollback: rb })}
      />

      {/* Modals */}
      <ProjectModal 
        project={selectedProject}
        characters={characters}
        onClose={() => setSelectedProject(null)}
        onAdvanceProgress={(id) => {
          setProjects(prev => prev.map(p => p.id === id ? { ...p, status: 'Completed' } : p));
        }}
        onOpenScripts={() => {
          setSelectedProject(null);
          setCurrentTab('scripts');
        }}
      />

      <CastModal 
        character={selectedCharacter}
        projects={projects}
        onClose={() => setSelectedCharacter(null)}
        onOpenProject={(p) => setSelectedProject(p)}
      />

      <SearchModal 
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        projects={projects}
        characters={characters}
        onOpenProject={(p) => setSelectedProject(p)}
        onOpenCharacter={(c) => setSelectedCharacter(c)}
      />

      <QuickActionModal 
        actionType={quickActionType}
        onClose={() => setQuickActionType(null)}
        onAddProject={(p) => {
          if (quickActionType === 'topic') {
            handleAddIdea({
              id: `idea-${Date.now()}`,
              title: p.title || 'Untitled Idea',
              theme: p.theme || 'Dark Psychology',
              notes: p.description,
              viral_index: '92% Viral Index',
              status: 'Backlog',
            });
          } else {
            handleAddProject(p);
          }
        }}
      />

      {/* Undo Toast for Deletions */}
      {undoToast && (
        <ToastUndo 
          message={undoToast.message}
          onUndo={() => {
            undoToast.rollback();
            setUndoToast(null);
          }}
          onDismiss={() => setUndoToast(null)}
        />
      )}

    </div>
  );
};
