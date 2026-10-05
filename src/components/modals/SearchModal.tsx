import React, { useState, useEffect } from 'react';
import { Search, X, Film, Users, FileText, ArrowRight } from 'lucide-react';
import { Project, Character } from '../../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  characters: Character[];
  onOpenProject: (p: Project) => void;
  onOpenCharacter: (c: Character) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  projects,
  characters,
  onOpenProject,
  onOpenCharacter,
}) => {
  const [query, setQuery] = useState('');

  // Keyboard escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(query.toLowerCase()) || 
    p.theme.toLowerCase().includes(query.toLowerCase())
  );

  const filteredCharacters = characters.filter(c => 
    c.name.toLowerCase().includes(query.toLowerCase()) || 
    c.role.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-[#0e111a] border border-[#232938] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
        
        {/* Search Input Bar */}
        <div className="p-4 border-b border-[#1c2230] flex items-center gap-3">
          <Search className="w-5 h-5 text-red-500" />
          <input 
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects, scripts, characters, scenes..."
            className="w-full bg-transparent text-sm text-white placeholder-zinc-500 outline-none font-sans"
          />
          <kbd className="px-2 py-0.5 text-[10px] font-mono text-zinc-400 bg-[#161a26] border border-[#242c3d] rounded">
            ESC
          </kbd>
        </div>

        {/* Results Body */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4 text-left">
          
          {/* Projects Results */}
          {filteredProjects.length > 0 && (
            <div>
              <p className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider mb-2">PROJECTS</p>
              <div className="space-y-1.5">
                {filteredProjects.map(p => (
                  <div
                    key={p.id}
                    onClick={() => {
                      onOpenProject(p);
                      onClose();
                    }}
                    className="p-2.5 rounded-xl bg-[#121520] hover:bg-[#181d2c] border border-[#1e2536] hover:border-red-500/50 cursor-pointer transition flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <Film className="w-4 h-4 text-red-400" />
                      <div>
                        <p className="text-xs font-bold text-white group-hover:text-red-400 transition">{p.title}</p>
                        <p className="text-[10px] text-zinc-400 font-mono">{p.theme} • {p.status}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Characters Results */}
          {filteredCharacters.length > 0 && (
            <div>
              <p className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider mb-2">CHARACTERS</p>
              <div className="space-y-1.5">
                {filteredCharacters.map(c => (
                  <div
                    key={c.id}
                    onClick={() => {
                      onOpenCharacter(c);
                      onClose();
                    }}
                    className="p-2.5 rounded-xl bg-[#121520] hover:bg-[#181d2c] border border-[#1e2536] hover:border-red-500/50 cursor-pointer transition flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <img src={c.avatar} alt={c.name} className="w-7 h-7 rounded-full object-cover border border-red-500/40" />
                      <div>
                        <p className="text-xs font-bold text-white group-hover:text-red-400 transition uppercase">{c.name}</p>
                        <p className="text-[10px] text-zinc-400 font-mono">{c.role}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredProjects.length === 0 && filteredCharacters.length === 0 && (
            <div className="p-8 text-center text-zinc-500 font-mono text-xs">
              No matching studio assets found for "{query}".
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
