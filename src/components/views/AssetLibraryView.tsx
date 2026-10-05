import React, { useState } from 'react';
import { FolderArchive, Image as ImageIcon, Music, Download, Upload, Plus } from 'lucide-react';
import { Asset } from '../../types';
import { EmptyState } from '../common/EmptyState';

interface AssetLibraryViewProps {
  assets: Asset[];
  onAddAsset: (a: Asset) => void;
  onOpenQuickAction: (action: 'topic' | 'script' | 'thumbnail' | 'project') => void;
}

export const AssetLibraryView: React.FC<AssetLibraryViewProps> = ({
  assets,
  onAddAsset,
  onOpenQuickAction,
}) => {
  const [filterCat, setFilterCat] = useState<string>('All');

  const filteredAssets = filterCat === 'All' ? assets : assets.filter(a => a.category === filterCat);

  return (
    <div className="p-6 space-y-6 max-w-[1300px] mx-auto select-none text-left font-sans">
      
      {/* Header */}
      <div className="bg-[#0e111a] border border-[#202738] p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <span className="text-[10px] font-mono uppercase bg-red-950/60 text-red-400 border border-red-800/40 px-2 py-0.5 rounded">
            CENTRAL MEDIA REPOSITORY
          </span>
          <h2 className="text-2xl font-black text-white font-display tracking-tight mt-1">
            Studio Asset Library
          </h2>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">
            Key art renders • Master audio stems • Generative references
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold transition flex items-center gap-1.5 shadow cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Media</span>
            <input 
              type="file" 
              className="hidden" 
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  onAddAsset({
                    id: `ast-${Date.now()}`,
                    name: f.name,
                    category: 'User Upload',
                    asset_type: f.type.startsWith('image') ? 'image' : 'audio',
                    url: URL.createObjectURL(f),
                    file_size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
                    created_at: new Date().toISOString()
                  });
                }
              }} 
            />
          </label>
        </div>
      </div>

      {assets.length === 0 ? (
        <EmptyState
          icon={FolderArchive}
          title="Asset Library Is Empty"
          description="Your media vault is clean. Upload your key art, audio tracks, voiceover WAV files, and 4K storyboards."
          actionLabel="Upload First Asset"
          onAction={() => onOpenQuickAction('thumbnail')}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssets.map(asset => (
            <div
              key={asset.id}
              className="bg-[#0f121a] border border-[#1e2436] rounded-xl overflow-hidden p-3 space-y-3 group hover:border-red-500/50 transition shadow-lg"
            >
              {asset.asset_type === 'image' ? (
                <div className="relative aspect-video rounded-lg overflow-hidden bg-black/60 border border-white/5">
                  <img src={asset.url} alt={asset.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <span className="absolute top-2 right-2 bg-black/70 px-2 py-0.5 rounded text-[9px] font-mono text-white">
                    {asset.category}
                  </span>
                </div>
              ) : (
                <div className="relative aspect-video rounded-lg overflow-hidden bg-[#131622] border border-white/5 flex flex-col items-center justify-center space-y-2">
                  <Music className="w-8 h-8 text-red-500" />
                  <span className="text-xs font-mono text-zinc-300">{asset.category} Track</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <div>
                  <p className="text-xs font-bold text-white truncate max-w-[200px]">{asset.name}</p>
                  <p className="text-[10px] text-zinc-400 font-mono mt-0.5">{asset.file_size || '1.2 MB'}</p>
                </div>
                <a
                  href={asset.url}
                  download
                  className="p-2 rounded-lg bg-[#151926] hover:bg-red-600 text-zinc-300 hover:text-white transition"
                >
                  <Download className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
