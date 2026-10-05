import React, { useState } from 'react';
import { X, Plus, Sparkles, Upload, FileText, Lightbulb, FolderPlus, Check } from 'lucide-react';
import { Project } from '../../types';

interface QuickActionModalProps {
  actionType: 'topic' | 'script' | 'thumbnail' | 'project' | null;
  onClose: () => void;
  onAddProject: (p: Partial<Project>) => void;
}

export const QuickActionModal: React.FC<QuickActionModalProps> = ({
  actionType,
  onClose,
  onAddProject,
}) => {
  const [title, setTitle] = useState('');
  const [theme, setTheme] = useState('Dark Psychology');
  const [notes, setNotes] = useState('');
  const [success, setSuccess] = useState(false);

  if (!actionType) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (actionType === 'project' || actionType === 'topic') {
      onAddProject({
        title: title.trim(),
        theme: theme,
        status: actionType === 'project' ? 'IN PRODUCTION' : 'SCRIPT READY',
        progress: actionType === 'project' ? 15 : 0,
        scenesCompleted: 1,
        totalScenes: 8,
        visualsCount: 6,
        thumbnailCount: 1,
        scriptCount: 1,
        pipelineStage: actionType === 'project' ? 'SCENES' : 'IDEA',
        coverImage: '/assets/project_disappear.png',
        characters: ['peter', 'elias'],
        description: notes || 'New creative episode exploring deep behavioral patterns and self-transformation.',
        runtime: '10:00'
      });
    }

    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1200);
  };

  const actionTitles = {
    topic: 'Draft New Episode Topic',
    script: 'Create New Production Script',
    thumbnail: 'Upload Thumbnail for A/B Testing',
    project: 'Initiate New Studio Project',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-[#0e111a] border border-[#232938] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="p-4 border-b border-[#1c2230] flex items-center justify-between bg-[#121520]">
          <div className="flex items-center gap-2 text-white">
            <Sparkles className="w-4 h-4 text-red-500" />
            <span className="text-xs font-bold uppercase tracking-wider font-mono">
              {actionTitles[actionType]}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        {success ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/40">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white font-display">Successfully Added!</h3>
            <p className="text-xs text-zinc-400 font-mono">Changes synchronized to Studio Content Desk.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 text-left">
            <div>
              <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                {actionType === 'topic' ? 'Topic Hook / Working Title' : 'Title'}
              </label>
              <input 
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={actionType === 'topic' ? 'e.g. Why People Test You Before They Respect You' : 'Project Title...'}
                className="w-full bg-[#121622] border border-[#202738] rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-red-500/60 transition"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">Category / Theme</label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full bg-[#121622] border border-[#202738] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-red-500/60 transition font-mono"
              >
                <option value="Dark Psychology">Dark Psychology</option>
                <option value="Attachment Theory">Attachment Theory</option>
                <option value="Self Development">Self Development</option>
                <option value="Power Dynamics">Power Dynamics</option>
                <option value="Behavioral Economics">Behavioral Economics</option>
              </select>
            </div>

            {actionType === 'thumbnail' ? (
              <div>
                <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">Upload File (JPG, PNG)</label>
                <div className="border-2 border-dashed border-[#232a3d] hover:border-red-500/50 rounded-xl p-6 text-center cursor-pointer transition bg-[#11141e]">
                  <Upload className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
                  <p className="text-xs text-zinc-300 font-medium">Click to select or drag and drop thumbnail</p>
                  <p className="text-[10px] text-zinc-500 mt-1 font-mono">1920x1080 recommended (16:9)</p>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                  {actionType === 'script' ? 'Scene Breakdown Notes' : 'Psychological Hook & Core Concept'}
                </label>
                <textarea 
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Outline key psychological insights, dialogue hooks, or visual cues..."
                  className="w-full bg-[#121622] border border-[#202738] rounded-xl p-3 text-xs text-white placeholder-zinc-500 outline-none focus:border-red-500/60 transition"
                />
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-mono text-zinc-400 hover:text-white hover:bg-white/5 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs shadow-[0_0_12px_#ef4444] transition flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Save to Studio</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
