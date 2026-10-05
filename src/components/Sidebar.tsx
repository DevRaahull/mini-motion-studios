import React from 'react';
import { 
  LayoutDashboard, 
  Tv, 
  Lightbulb, 
  FileText, 
  Users, 
  Image as ImageIcon, 
  Clapperboard, 
  Calendar as CalendarIcon, 
  BarChart3, 
  FolderArchive, 
  Settings, 
  PlusCircle, 
  FilePlus2, 
  Upload, 
  FolderPlus,
  Sliders,
  Mail,
  ChevronDown
} from 'lucide-react';
import { StudioSettings } from '../types';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onOpenQuickAction: (action: 'topic' | 'script' | 'thumbnail' | 'project') => void;
  settings: StudioSettings;
  onOpenCustomizer: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentTab, 
  onTabChange,
  onOpenQuickAction,
  settings,
  onOpenCustomizer
}) => {
  const iconMap: Record<string, any> = {
    dashboard: LayoutDashboard,
    channels: Tv,
    topics: Lightbulb,
    scripts: FileText,
    characters: Users,
    thumbnails: ImageIcon,
    production: Clapperboard,
    calendar: CalendarIcon,
    analytics: BarChart3,
    assets: FolderArchive,
    settings: Settings,
  };

  const visibleTabs = (settings.nav_tabs || []).filter(t => t.visible);

  return (
    <aside className="w-64 min-w-64 bg-[#0a0c10] border-r border-[#181b24] flex flex-col h-screen select-none z-30">
      {/* Brand Logo Header */}
      <div className="p-4 flex items-center gap-3 border-b border-[#151821]">
        <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-black/80 border border-red-500/50 flex items-center justify-center shadow-[0_0_15px_rgba(229,43,43,0.4)] group">
          <img 
            src={settings.logo_url || "/assets/logo_mark.png"} 
            alt={settings.studio_name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        </div>
        <div className="flex flex-col text-left">
          <h1 className="text-xs font-black tracking-wider text-white uppercase font-display leading-tight">
            {settings.studio_name}
          </h1>
          <span className="text-[9px] font-mono text-zinc-400 tracking-wider uppercase mt-0.5">CONTENT DESK</span>
          <span className="text-[7px] text-zinc-400 tracking-tighter truncate max-w-[130px]">{settings.tagline}</span>
        </div>
      </div>

      {/* Main Navigation Scroll Area */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {visibleTabs.map((item) => {
          const Icon = iconMap[item.id] || LayoutDashboard;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 group relative ${
                isActive
                  ? 'bg-gradient-to-r from-red-950/60 to-red-900/20 text-white font-semibold border-l-2 border-red-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-[#12151e]'
              }`}
            >
              <Icon 
                className={`w-4 h-4 transition-colors ${
                  isActive ? 'text-red-500 filter drop-shadow-[0_0_6px_rgba(239,68,68,0.8)]' : 'text-zinc-500 group-hover:text-zinc-300'
                }`} 
              />
              <span>{item.label}</span>
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
              )}
            </button>
          );
        })}

        {/* User Account Tile */}
        <div className="pt-4 pb-2">
          <div 
            onClick={onOpenCustomizer}
            className="bg-[#0f1219] border border-[#1d222e] rounded-xl p-2.5 flex items-center justify-between hover:border-zinc-700 transition cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <img 
                  src={settings.avatar_url || "/assets/user_avatar_sidebar.png"} 
                  alt="Rahul Soni" 
                  className="w-8 h-8 rounded-full border border-red-500/40 object-cover"
                />
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-[#0f1219] ring-1 ring-emerald-500/50" />
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-zinc-100 leading-tight">Rahul Soni</p>
                <p className="text-[10px] text-zinc-400 font-mono">Studio Master</p>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="pt-2">
          <p className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider px-2 mb-2">QUICK ACTIONS</p>
          <div className="space-y-1.5">
            <button 
              onClick={() => onOpenQuickAction('topic')}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[#11141c] hover:bg-[#181c26] text-zinc-300 hover:text-white border border-[#1b202c] text-xs font-medium transition text-left group"
            >
              <PlusCircle className="w-3.5 h-3.5 text-red-500 group-hover:scale-110 transition-transform" />
              <span>New Topic</span>
            </button>
            <button 
              onClick={() => onOpenQuickAction('script')}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[#11141c] hover:bg-[#181c26] text-zinc-300 hover:text-white border border-[#1b202c] text-xs font-medium transition text-left group"
            >
              <FilePlus2 className="w-3.5 h-3.5 text-red-500 group-hover:scale-110 transition-transform" />
              <span>New Script</span>
            </button>
            <button 
              onClick={() => onOpenQuickAction('thumbnail')}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[#11141c] hover:bg-[#181c26] text-zinc-300 hover:text-white border border-[#1b202c] text-xs font-medium transition text-left group"
            >
              <Upload className="w-3.5 h-3.5 text-red-500 group-hover:scale-110 transition-transform" />
              <span>Upload Thumbnail</span>
            </button>
            <button 
              onClick={() => onOpenQuickAction('project')}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[#11141c] hover:bg-[#181c26] text-zinc-300 hover:text-white border border-[#1b202c] text-xs font-medium transition text-left group"
            >
              <FolderPlus className="w-3.5 h-3.5 text-red-500 group-hover:scale-110 transition-transform" />
              <span>Create Project</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar Footer with Customize Button & Studio Metadata */}
      <div className="p-3 border-t border-[#161922] bg-[#090b0f] space-y-3">
        {/* Customize Studio CTA */}
        <button
          onClick={onOpenCustomizer}
          className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#17131b] to-[#1e1319] hover:from-[#221827] hover:to-[#281720] border border-red-500/30 flex items-center justify-between text-xs text-white font-mono transition group"
        >
          <div className="flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-red-500 group-hover:rotate-45 transition-transform" />
            <span>Customize Studio</span>
          </div>
          <span className="text-[9px] bg-red-950/80 text-red-400 px-1.5 py-0.5 rounded border border-red-800/40">
            {settings.version_label}
          </span>
        </button>

        {/* Social Icons & Copyright */}
        <div className="pt-1 text-center">
          <div className="flex items-center justify-center gap-3 text-zinc-400 mb-2">
            <a href={`https://youtube.com/channel/${settings.youtube_channel_id}`} target="_blank" rel="noreferrer" className="hover:text-red-500 transition">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
            <a href="mailto:contact@minimotion.com" className="hover:text-zinc-200 transition">
              <Mail className="w-3.5 h-3.5" />
            </a>
          </div>
          <p className="text-[8px] text-zinc-400 tracking-tight">
            © 2026 {settings.studio_name}. English Channel.
          </p>
        </div>
      </div>
    </aside>
  );
};
