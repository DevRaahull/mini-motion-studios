import React, { useState } from 'react';
import { X, Copy, Check, Quote, Mic, Sparkles, BookOpen, Layers } from 'lucide-react';
import { Character, Project } from '../../types';

interface CastModalProps {
  character: Character | null;
  projects: Project[];
  onClose: () => void;
  onOpenProject: (p: Project) => void;
}

export const CastModal: React.FC<CastModalProps> = ({
  character,
  projects,
  onClose,
  onOpenProject,
}) => {
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  if (!character) return null;

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(character.appearancePrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const characterProjects = projects.filter(p => p.characters.includes(character.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-[#0e111a] border border-[#232938] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        
        {/* Header with Character Splash */}
        <div className="relative p-6 bg-gradient-to-r from-[#171b26] to-[#0f121a] border-b border-[#202738] flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-red-500/60 shadow-[0_0_20px_rgba(229,43,43,0.3)] shrink-0">
              <img src={character.avatar} alt={character.name} className="w-full h-full object-cover object-top" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-white uppercase font-display tracking-wide">
                  {character.name}
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950/60 text-red-400 border border-red-800/40">
                  {character.projectsCount} EPISODES
                </span>
              </div>
              <p className="text-xs text-amber-400 font-mono mt-0.5">{character.role}</p>
              <p className="text-xs text-zinc-400 italic mt-1 font-serif">"{character.tagline}"</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-full bg-black/50 hover:bg-black/80 text-zinc-400 hover:text-white border border-white/10 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-left">
          
          {/* Bio & Archetype */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#121520] p-4 rounded-xl border border-[#1e2535]">
              <div className="flex items-center gap-2 mb-2 text-xs font-mono uppercase text-zinc-400">
                <BookOpen className="w-3.5 h-3.5 text-red-500" /> CHARACTER BACKSTORY
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                {character.bio}
              </p>
            </div>

            <div className="bg-[#121520] p-4 rounded-xl border border-[#1e2535] space-y-3">
              <div>
                <p className="text-[10px] font-mono uppercase text-zinc-400">PSYCHOLOGICAL ARCHETYPE</p>
                <p className="text-sm font-bold text-white font-display mt-0.5">{character.archetype}</p>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-zinc-400">
                  <Mic className="w-3 h-3 text-amber-400" /> VOCAL PROFILE
                </div>
                <p className="text-xs text-zinc-300 mt-0.5">{character.vocalProfile}</p>
              </div>
            </div>
          </div>

          {/* AI Appearance Prompt Formula */}
          <div className="bg-[#11141e] p-4 rounded-xl border border-[#1e2536]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase text-zinc-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-red-400" /> GENERATIVE ART PROMPT (MIDJOURNEY / FLUX)
              </span>
              <button
                onClick={handleCopyPrompt}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1a202e] hover:bg-[#232b3e] text-zinc-300 hover:text-white text-[10px] font-mono transition border border-[#273248]"
              >
                {copiedPrompt ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedPrompt ? 'Copied!' : 'Copy Prompt'}</span>
              </button>
            </div>
            <p className="text-xs font-mono text-zinc-300 bg-[#0a0c12] p-3 rounded-lg border border-[#191f2c] select-text">
              {character.appearancePrompt}
            </p>
          </div>

          {/* Key Quotes */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2.5 flex items-center gap-1.5">
              <Quote className="w-3.5 h-3.5 text-zinc-400" /> ICONIC SCRIPT DIALOGUES
            </h4>
            <div className="space-y-2">
              {character.keyQuotes.map((q, i) => (
                <div key={i} className="p-3 rounded-lg bg-[#121520] border-l-2 border-red-500 text-xs text-zinc-300 italic">
                  "{q}"
                </div>
              ))}
            </div>
          </div>

          {/* Associated Episodes */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-zinc-400" /> EPISODES FEATURING {character.name}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {characterProjects.map(proj => (
                <div
                  key={proj.id}
                  onClick={() => {
                    onClose();
                    onOpenProject(proj);
                  }}
                  className="bg-[#121520] hover:bg-[#181c2b] p-2.5 rounded-lg border border-[#1e2436] hover:border-red-500/50 cursor-pointer transition flex items-center gap-2.5 group"
                >
                  <img src={proj.coverImage} alt={proj.title} className="w-8 h-10 object-cover rounded" />
                  <div className="overflow-hidden">
                    <p className="text-[11px] font-bold text-zinc-200 group-hover:text-white truncate font-display">
                      {proj.title}
                    </p>
                    <p className="text-[9px] font-mono text-red-400">{proj.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
