import React, { useState } from 'react';
import { 
  FileText, 
  Mic, 
  Play, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  Maximize2,
  Plus
} from 'lucide-react';
import { Project, SceneItem, StudioSettings } from '../../types';
import { EmptyState } from '../common/EmptyState';

interface ScriptsViewProps {
  projects: Project[];
  settings: StudioSettings;
  onOpenQuickAction: (action: 'topic' | 'script' | 'thumbnail' | 'project') => void;
}

export const ScriptsView: React.FC<ScriptsViewProps> = ({
  projects,
  settings,
  onOpenQuickAction,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [teleprompterActive, setTeleprompterActive] = useState<boolean>(false);
  const [teleprompterSpeed, setTeleprompterSpeed] = useState<number>(2);

  // If no projects exist, render Clean Slate Empty State!
  if (projects.length === 0) {
    return (
      <div className="p-6 max-w-[1300px] mx-auto select-none text-left font-sans">
        <EmptyState
          icon={FileText}
          title="No Scripts Created Yet"
          description="Your scriptwriting studio is clean. Create a project to start writing scenes, visual prompts, and voiceover scripts."
          actionLabel="Create Project & Start Script"
          onAction={() => onOpenQuickAction('project')}
          secondaryActionLabel="Draft Topic Idea"
          onSecondaryAction={() => onOpenQuickAction('topic')}
        />
      </div>
    );
  }

  const currentProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  return (
    <div className="p-6 space-y-6 max-w-[1300px] mx-auto select-none text-left font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0e111a] border border-[#202738] p-5 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase bg-red-950/60 text-red-400 border border-red-800/40 px-2 py-0.5 rounded">
              STUDIO SCRIPTWRITER
            </span>
            <span className="text-xs text-zinc-400 font-mono">Format: {currentProject.format}</span>
          </div>
          <h2 className="text-2xl font-black text-white font-display tracking-tight">
            {currentProject.title}
          </h2>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">
            Default clip length: {settings.default_clip_length}s • Channel: English
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={currentProject.id}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="bg-[#121624] border border-[#20293d] rounded-xl px-3 py-2 text-xs font-mono text-white outline-none"
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>

          <button
            onClick={() => setTeleprompterActive(!teleprompterActive)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-mono font-bold transition shadow-[0_0_15px_rgba(229,43,43,0.4)]"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>{teleprompterActive ? 'Close Teleprompter' : 'Launch Teleprompter'}</span>
          </button>
        </div>
      </div>

      {/* Teleprompter Full-Width HUD when active */}
      {teleprompterActive && (
        <div className="bg-[#050608] border-2 border-red-500/60 rounded-2xl p-8 shadow-2xl relative">
          <div className="flex items-center justify-between border-b border-red-500/30 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
              <span className="text-sm font-bold font-mono text-red-400 uppercase tracking-widest">
                TELEPROMPTER HUD // {currentProject.title}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="text-zinc-400">Scroll Cadence:</span>
              <input 
                type="range" 
                min="1" 
                max="5" 
                value={teleprompterSpeed} 
                onChange={(e) => setTeleprompterSpeed(Number(e.target.value))}
                className="w-24 accent-red-500 cursor-pointer"
              />
              <span className="text-red-400 font-bold">{teleprompterSpeed}x</span>
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto space-y-6 text-center px-8 scrollbar-none font-serif text-2xl text-white leading-relaxed">
            {currentProject.description || 'Add scenes and dialogue in the script table below to populate the teleprompter.'}
          </div>
        </div>
      )}

      {/* Script Table with Dynamic Customizable Columns */}
      <div className="bg-[#0f121a] border border-[#202738] rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#1c2230] pb-3">
          <h3 className="text-sm font-bold text-white uppercase font-display">
            Scene Script Table
          </h3>
          <span className="text-[10px] text-zinc-400 font-mono">
            Columns configured in Settings
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-[#1f2638] text-zinc-400 text-[10px] uppercase">
                <th className="py-2 px-3">#</th>
                {settings.script_columns.filter(c => c.visible).map(col => (
                  <th key={col.id} className="py-2 px-3">{col.name}</th>
                ))}
                <th className="py-2 px-3">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[#181d2a] hover:bg-[#141824] transition">
                <td className="py-3 px-3 text-red-400 font-bold">01</td>
                {settings.script_columns.filter(c => c.visible).map(col => (
                  <td key={col.id} className="py-3 px-3 text-zinc-300">
                    {col.id === 'timing' && `0:0${settings.default_clip_length}`}
                    {col.id === 'visual_prompt' && 'Cinematic scene framing...'}
                    {col.id === 'voiceover_script' && currentProject.description}
                  </td>
                ))}
                <td className="py-3 px-3 text-emerald-400 font-bold">Ready</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
