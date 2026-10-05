import React from 'react';
import { X, Play, CheckCircle2, Clock, Users, Film, FileText, Sparkles, ChevronRight } from 'lucide-react';
import { Project, Character } from '../../types';

interface ProjectModalProps {
  project: Project | null;
  characters: Character[];
  onClose: () => void;
  onAdvanceProgress: (projectId: string) => void;
  onOpenScripts: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  project,
  characters,
  onClose,
  onAdvanceProgress,
  onOpenScripts,
}) => {
  if (!project) return null;

  const projectCharacters = characters.filter(c => project.characters.includes(c.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-[#0e111a] border border-[#232938] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        
        {/* Modal Header with Project Banner */}
        <div className="relative h-48 bg-black overflow-hidden shrink-0">
          <img 
            src={project.coverImage} 
            alt={project.title} 
            className="w-full h-full object-cover opacity-60" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e111a] via-[#0e111a]/40 to-transparent" />
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/60 hover:bg-black/90 text-zinc-300 hover:text-white border border-white/10 transition z-10"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
            <div>
              <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase font-bold bg-red-600/80 text-white tracking-widest">
                {project.status}
              </span>
              <h2 className="text-2xl font-black text-white mt-1 font-display tracking-tight">
                {project.title}
              </h2>
              <p className="text-xs text-zinc-300 font-mono mt-0.5">
                {project.theme} • Target Runtime: {project.runtime}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onAdvanceProgress(project.id)}
                className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold font-mono transition shadow-[0_0_12px_#ef4444] flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>+ Complete Scene</span>
              </button>
              <button
                onClick={onOpenScripts}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Open Script</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-left">
          
          {/* Progress & Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-[#131622] p-3.5 rounded-xl border border-[#1f2638]">
              <p className="text-[10px] font-mono text-zinc-400 uppercase">COMPLETION</p>
              <p className="text-2xl font-black text-red-500 font-display mt-0.5">{project.progress}%</p>
              <p className="text-[10px] text-zinc-400 font-mono mt-1">
                {project.scenesCompleted} of {project.totalScenes} scenes finished
              </p>
            </div>
            <div className="bg-[#131622] p-3.5 rounded-xl border border-[#1f2638]">
              <p className="text-[10px] font-mono text-zinc-400 uppercase">PIPELINE STAGE</p>
              <p className="text-base font-bold text-amber-400 font-mono mt-1 uppercase">{project.pipelineStage}</p>
              <p className="text-[10px] text-zinc-400 font-mono mt-1">Ready for voice recording</p>
            </div>
            <div className="bg-[#131622] p-3.5 rounded-xl border border-[#1f2638]">
              <p className="text-[10px] font-mono text-zinc-400 uppercase">TARGET RELEASE</p>
              <p className="text-base font-bold text-white font-mono mt-1">28 May 2026</p>
              <p className="text-[10px] text-emerald-400 font-mono mt-1">On schedule</p>
            </div>
            <div className="bg-[#131622] p-3.5 rounded-xl border border-[#1f2638]">
              <p className="text-[10px] font-mono text-zinc-400 uppercase">PRODUCTION ASSETS</p>
              <p className="text-base font-bold text-white font-mono mt-1">
                {project.visualsCount} Visuals • {project.thumbnailCount} Thumbs
              </p>
              <p className="text-[10px] text-zinc-400 font-mono mt-1">4K ProRes Master</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">EPISODE SYNOPSIS</h4>
            <p className="text-sm text-zinc-300 leading-relaxed bg-[#11141e] p-4 rounded-xl border border-[#1d2332]">
              {project.description}
            </p>
          </div>

          {/* Cast Members in this episode */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">FEATURED CHARACTERS</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {projectCharacters.map(c => (
                <div key={c.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-[#11141e] border border-[#1d2332]">
                  <img src={c.avatar} alt={c.name} className="w-10 h-10 rounded-full object-cover border border-red-500/40" />
                  <div>
                    <p className="text-xs font-bold text-white uppercase">{c.name}</p>
                    <p className="text-[9px] text-zinc-400 font-mono">{c.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scene Breakdown List */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">SCENE PRODUCTION BREAKDOWN</h4>
            <div className="space-y-2">
              {Array.from({ length: project.totalScenes }).map((_, idx) => {
                const sceneNum = idx + 1;
                const isDone = sceneNum <= project.scenesCompleted;
                return (
                  <div 
                    key={sceneNum}
                    className={`p-3 rounded-xl border flex items-center justify-between transition ${
                      isDone 
                        ? 'bg-[#101520] border-emerald-500/30' 
                        : sceneNum === project.scenesCompleted + 1
                        ? 'bg-[#18151c] border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.15)]'
                        : 'bg-[#0f121a] border-[#1b202c]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                        isDone ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        {sceneNum}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-zinc-200">
                          Scene 0{sceneNum}: {sceneNum === 1 ? 'City At Twilight' : sceneNum === 2 ? 'The Phone Notification' : sceneNum === 3 ? 'The Monk Protocol' : sceneNum === 4 ? 'Cognitive Calibration' : sceneNum === 5 ? 'Power of Absence' : `Sequence ${sceneNum}`}
                        </p>
                        <p className="text-[10px] text-zinc-400 font-mono">
                          {sceneNum % 2 === 0 ? 'Peter • Dialogue & Foley' : 'Dr. Elias • Voiceover Analysis'}
                        </p>
                      </div>
                    </div>

                    <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded border ${
                      isDone 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                        : sceneNum === project.scenesCompleted + 1
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 font-bold'
                        : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                    }`}>
                      {isDone ? 'COMPLETED' : sceneNum === project.scenesCompleted + 1 ? 'IN RECORDING' : 'QUEUED'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
