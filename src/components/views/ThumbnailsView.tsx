import React, { useState } from 'react';
import { Image as ImageIcon, Sparkles, TrendingUp, Smartphone, Monitor, Upload, Plus } from 'lucide-react';
import { Project, StudioSettings } from '../../types';
import { EmptyState } from '../common/EmptyState';

interface ThumbnailsViewProps {
  projects: Project[];
  settings: StudioSettings;
  onOpenQuickAction: (action: 'topic' | 'script' | 'thumbnail' | 'project') => void;
}

export const ThumbnailsView: React.FC<ThumbnailsViewProps> = ({
  projects,
  settings,
  onOpenQuickAction,
}) => {
  const [devicePreview, setDevicePreview] = useState<'desktop' | 'mobile'>('desktop');
  const [selectedVariant, setSelectedVariant] = useState<'A' | 'B'>('A');

  if (projects.length === 0) {
    return (
      <div className="p-6 max-w-[1300px] mx-auto select-none text-left font-sans">
        <EmptyState
          icon={ImageIcon}
          title="No Thumbnails in A/B Testing Lab"
          description="Upload your thumbnail variants (16:9) to test CTR predictions and simulate how they render on YouTube search feeds."
          actionLabel="Upload Thumbnail"
          onAction={() => onOpenQuickAction('thumbnail')}
          secondaryActionLabel="Create Project First"
          onSecondaryAction={() => onOpenQuickAction('project')}
        />
      </div>
    );
  }

  const project = projects[0];

  return (
    <div className="p-6 space-y-6 max-w-[1300px] mx-auto select-none text-left font-sans">
      
      {/* Header */}
      <div className="bg-[#0e111a] border border-[#202738] p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase bg-red-950/60 text-red-400 border border-red-800/40 px-2 py-0.5 rounded">
              A/B THUMBNAIL LAB & YOUTUBE FEED SIMULATOR
            </span>
          </div>
          <h2 className="text-2xl font-black text-white font-display tracking-tight">
            Thumbnail Optimization Engine
          </h2>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">
            CTR prediction algorithm • YouTube algorithm feed preview for {settings.studio_name}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenQuickAction('thumbnail')}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold transition flex items-center gap-1.5 shadow"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Variant</span>
          </button>
        </div>
      </div>

      {/* Feed Mockup */}
      <div className="bg-[#0b0d13] border border-[#202738] rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#1c2230] pb-3">
          <span className="text-xs font-mono uppercase text-zinc-400 tracking-wider">
            YOUTUBE RECOMMENDATION FEED PREVIEW
          </span>
          <div className="flex items-center gap-2 bg-[#121622] p-1 rounded-lg border border-[#1f2638]">
            <button
              onClick={() => setDevicePreview('desktop')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono transition ${
                devicePreview === 'desktop' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" /> Desktop
            </button>
            <button
              onClick={() => setDevicePreview('mobile')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono transition ${
                devicePreview === 'mobile' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" /> Mobile
            </button>
          </div>
        </div>

        <div className={`mx-auto bg-[#0f0f0f] border border-[#272727] rounded-xl overflow-hidden p-3 ${
          devicePreview === 'mobile' ? 'max-w-sm' : 'max-w-2xl flex gap-4'
        }`}>
          <div className={`relative aspect-video rounded-lg overflow-hidden bg-black shrink-0 ${
            devicePreview === 'mobile' ? 'w-full mb-3' : 'w-72'
          }`}>
            <img 
              src={project.thumbnail_url || '/assets/current_project_card.png'} 
              alt="Thumbnail" 
              className="w-full h-full object-cover" 
            />
            <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-white font-bold">
              10:00
            </div>
          </div>

          <div className="space-y-1.5 flex-1 text-left">
            <h4 className="text-sm font-semibold text-white leading-snug line-clamp-2">
              {project.title}
            </h4>
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-sans">
              <span>{settings.studio_name}</span>
              <span className="w-1 h-1 rounded-full bg-zinc-500" />
              <span>Live English Channel</span>
            </div>
            <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1">
              {project.description}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
