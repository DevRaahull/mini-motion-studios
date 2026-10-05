import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  Palette, 
  Sliders, 
  Layers, 
  Cpu, 
  FileText, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Download, 
  Upload, 
  Check, 
  Sparkles,
  Calendar,
  Grid,
  Tag,
  Database
} from 'lucide-react';
import { 
  StudioSettings, 
  PipelineStage, 
  AIModel, 
  CustomFieldDefinition, 
  EntityType, 
  FieldType 
} from '../../types';
import { exportAllDataAsJSON, importAllDataFromJSON } from '../../lib/storage';

interface StudioCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: StudioSettings;
  onUpdateSettings: (s: StudioSettings) => void;
  stages: PipelineStage[];
  onUpdateStages: (st: PipelineStage[]) => void;
  aiModels: AIModel[];
  onUpdateAIModels: (m: AIModel[]) => void;
  customFields: CustomFieldDefinition[];
  onAddCustomField: (cf: CustomFieldDefinition) => void;
  onDeleteCustomField: (cfId: string) => void;
  onTriggerUndoToast: (msg: string, rollback: () => void) => void;
}

export const StudioCustomizerModal: React.FC<StudioCustomizerModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  stages,
  onUpdateStages,
  aiModels,
  onUpdateAIModels,
  customFields,
  onAddCustomField,
  onDeleteCustomField,
  onTriggerUndoToast,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'theme' | 'pipeline' | 'script' | 'custom_fields' | 'ai_models' | 'widgets' | 'backup'>('general');
  const [copiedExport, setCopiedExport] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // New stage form state
  const [newStageName, setNewStageName] = useState('');
  const [newStageColor, setNewStageColor] = useState('#3b82f6');

  // New custom field form state
  const [newCfEntity, setNewCfEntity] = useState<EntityType>('project');
  const [newCfName, setNewCfName] = useState('');
  const [newCfType, setNewCfType] = useState<FieldType>('text');

  // New AI model form state
  const [newModelName, setNewModelName] = useState('');
  const [newModelProvider, setNewModelProvider] = useState('');
  const [newModelCredits, setNewModelCredits] = useState(10);

  if (!isOpen) return null;

  // Pipeline stage reordering
  const moveStage = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= stages.length) return;
    const updated = [...stages];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    updated.forEach((s, i) => s.position = i + 1);
    onUpdateStages(updated);
  };

  const handleAddStage = () => {
    if (!newStageName.trim()) return;
    const newStage: PipelineStage = {
      id: `stage-${Date.now()}`,
      name: newStageName.trim().toUpperCase(),
      color: newStageColor,
      icon: 'Layers',
      position: stages.length + 1,
    };
    onUpdateStages([...stages, newStage]);
    setNewStageName('');
  };

  const handleDeleteStage = (stageId: string) => {
    const previous = [...stages];
    const updated = stages.filter(s => s.id !== stageId);
    onUpdateStages(updated);
    onTriggerUndoToast('Stage deleted', () => onUpdateStages(previous));
  };

  // Custom Field addition
  const handleAddCustomFieldSubmit = () => {
    if (!newCfName.trim()) return;
    const cf: CustomFieldDefinition = {
      id: `cf-${Date.now()}`,
      entity_type: newCfEntity,
      name: newCfName.trim(),
      field_type: newCfType,
    };
    onAddCustomField(cf);
    setNewCfName('');
  };

  // AI Model addition
  const handleAddModelSubmit = () => {
    if (!newModelName.trim()) return;
    const model: AIModel = {
      id: `model-${Date.now()}`,
      name: newModelName.trim(),
      provider: newModelProvider.trim() || 'Custom AI',
      credits_per_gen: newModelCredits,
      seconds_options: [5, 10],
      is_active: true,
    };
    onUpdateAIModels([...aiModels, model]);
    setNewModelName('');
    setNewModelProvider('');
  };

  // Export & Import
  const handleDownloadBackup = async () => {
    const jsonStr = await exportAllDataAsJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mini_motion_studios_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setCopiedExport(true);
    setTimeout(() => setCopiedExport(false), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const success = await importAllDataFromJSON(content);
      if (success) {
        setImportStatus('Backup restored successfully! Refreshing...');
        setTimeout(() => window.location.reload(), 1200);
      } else {
        setImportStatus('Failed to parse backup file. Please check JSON format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none text-left font-sans">
      <div className="bg-[#0b0e15] border border-[#232b3d] rounded-2xl w-full max-w-4xl h-[88vh] flex flex-col overflow-hidden shadow-2xl">
        
        {/* Modal Header */}
        <div className="p-4 bg-[#0f131f] border-b border-[#1c2333] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/40 text-red-500 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase font-display tracking-wider">
                Studio Customization & Config Engine
              </h2>
              <p className="text-[10px] text-zinc-400 font-mono">Customize everything • Saved permanently to database</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-md text-zinc-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Sidebar Tabs + Content Panel */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Settings Tabs Nav */}
          <div className="w-52 bg-[#090b10] border-r border-[#1a2130] p-2 space-y-1 overflow-y-auto">
            {[
              { id: 'general', label: 'Studio Identity', icon: Settings },
              { id: 'theme', label: 'Theme & Accents', icon: Palette },
              { id: 'pipeline', label: 'Pipeline Stages', icon: Layers },
              { id: 'script', label: 'Script Columns', icon: FileText },
              { id: 'custom_fields', label: 'Custom Fields', icon: Tag },
              { id: 'ai_models', label: 'AI Models & Budget', icon: Cpu },
              { id: 'widgets', label: 'Home Widgets', icon: Grid },
              { id: 'backup', label: 'Export / Import', icon: Database },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono transition text-left ${
                    isActive ? 'bg-red-600 text-white font-bold shadow' : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content Panels */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6 text-xs font-mono">
            
            {/* 1. STUDIO IDENTITY */}
            {activeTab === 'general' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white font-display uppercase tracking-wide">Studio Identity & Meta</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] uppercase text-zinc-400 mb-1">Studio Name</label>
                    <input
                      type="text"
                      value={settings.studio_name}
                      onChange={(e) => onUpdateSettings({ ...settings, studio_name: e.target.value })}
                      className="w-full bg-[#121624] border border-[#20293d] rounded-xl px-3 py-2 text-white outline-none focus:border-red-500/60"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase text-zinc-400 mb-1">Tagline</label>
                    <input
                      type="text"
                      value={settings.tagline}
                      onChange={(e) => onUpdateSettings({ ...settings, tagline: e.target.value })}
                      className="w-full bg-[#121624] border border-[#20293d] rounded-xl px-3 py-2 text-white outline-none focus:border-red-500/60"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase text-zinc-400 mb-1">Version Label</label>
                    <input
                      type="text"
                      value={settings.version_label}
                      onChange={(e) => onUpdateSettings({ ...settings, version_label: e.target.value })}
                      className="w-full bg-[#121624] border border-[#20293d] rounded-xl px-3 py-2 text-white outline-none focus:border-red-500/60"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase text-zinc-400 mb-1">Logo URL / Path</label>
                    <input
                      type="text"
                      value={settings.logo_url}
                      onChange={(e) => onUpdateSettings({ ...settings, logo_url: e.target.value })}
                      className="w-full bg-[#121624] border border-[#20293d] rounded-xl px-3 py-2 text-white outline-none focus:border-red-500/60"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase text-zinc-400 mb-1">Avatar URL / Path</label>
                    <input
                      type="text"
                      value={settings.avatar_url}
                      onChange={(e) => onUpdateSettings({ ...settings, avatar_url: e.target.value })}
                      className="w-full bg-[#121624] border border-[#20293d] rounded-xl px-3 py-2 text-white outline-none focus:border-red-500/60"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 2. THEME & ACCENTS */}
            {activeTab === 'theme' && (
              <div className="space-y-5">
                <h3 className="text-sm font-bold text-white font-display uppercase tracking-wide">Theme & Visual Accents</h3>

                {/* Accent Color */}
                <div className="space-y-2">
                  <label className="block text-[10px] uppercase text-zinc-400">Accent Color</label>
                  <div className="flex items-center gap-3">
                    {[
                      { name: 'Crimson Red', hex: '#e52b2b' },
                      { name: 'Solar Amber', hex: '#f59e0b' },
                      { name: 'Cyber Cyan', hex: '#06b6d4' },
                      { name: 'Neon Emerald', hex: '#10b981' },
                      { name: 'Royal Purple', hex: '#8b5cf6' },
                    ].map(c => (
                      <button
                        key={c.hex}
                        onClick={() => onUpdateSettings({ ...settings, accent_color: c.hex })}
                        className={`w-7 h-7 rounded-full border-2 transition-transform ${
                          settings.accent_color === c.hex ? 'scale-125 border-white shadow-lg' : 'border-transparent hover:scale-110'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      />
                    ))}
                    <input
                      type="color"
                      value={settings.accent_color}
                      onChange={(e) => onUpdateSettings({ ...settings, accent_color: e.target.value })}
                      className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
                    />
                  </div>
                </div>

                {/* Glow Intensity Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] text-zinc-400">
                    <span>Glow & Bloom Intensity</span>
                    <span className="text-white font-bold">{settings.glow_intensity}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.glow_intensity}
                    onChange={(e) => onUpdateSettings({ ...settings, glow_intensity: Number(e.target.value) })}
                    className="w-full accent-red-500 cursor-pointer"
                  />
                </div>

                {/* Font Scaling */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase text-zinc-400">Studio Font Scaling</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['small', 'medium', 'large'] as const).map(size => (
                      <button
                        key={size}
                        onClick={() => onUpdateSettings({ ...settings, font_size: size })}
                        className={`py-2 rounded-lg border text-center transition capitalize ${
                          settings.font_size === size ? 'bg-red-600 border-red-500 text-white font-bold' : 'bg-[#121624] border-[#20293d] text-zinc-400'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 3. PIPELINE STAGES */}
            {activeTab === 'pipeline' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white font-display uppercase tracking-wide">Pipeline Stages</h3>
                    <p className="text-[10px] text-zinc-400 font-mono">Projects link to stages by ID. Renaming or reordering never breaks data.</p>
                  </div>
                </div>

                {/* Add Stage Form */}
                <div className="bg-[#121624] p-3 rounded-xl border border-[#20293d] flex items-center gap-2">
                  <input
                    type="text"
                    value={newStageName}
                    onChange={(e) => setNewStageName(e.target.value)}
                    placeholder="New Stage Name (e.g. SOUND DESIGN)"
                    className="flex-1 bg-[#0b0e15] border border-[#1e2536] rounded-lg px-3 py-1.5 text-white outline-none"
                  />
                  <input
                    type="color"
                    value={newStageColor}
                    onChange={(e) => setNewStageColor(e.target.value)}
                    className="w-8 h-8 rounded bg-transparent border-0 cursor-pointer"
                  />
                  <button
                    onClick={handleAddStage}
                    className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Stage</span>
                  </button>
                </div>

                {/* Stages List */}
                <div className="space-y-2">
                  {stages.map((st, idx) => (
                    <div key={st.id} className="bg-[#121624] border border-[#1e2536] p-2.5 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: st.color }} />
                        <span className="font-bold text-white">{st.name}</span>
                        <span className="text-[9px] text-zinc-500 font-mono">({st.id})</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          disabled={idx === 0}
                          onClick={() => moveStage(idx, 'up')}
                          className="p-1 text-zinc-400 hover:text-white disabled:opacity-30"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          disabled={idx === stages.length - 1}
                          onClick={() => moveStage(idx, 'down')}
                          className="p-1 text-zinc-400 hover:text-white disabled:opacity-30"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteStage(st.id)}
                          className="p-1 text-red-400 hover:text-red-300 ml-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. SCRIPT COLUMNS */}
            {activeTab === 'script' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white font-display uppercase tracking-wide">Script Table Columns & Defaults</h3>
                <div className="space-y-2">
                  {settings.script_columns.map(col => (
                    <div key={col.id} className="bg-[#121624] border border-[#1e2536] p-2.5 rounded-xl flex items-center justify-between">
                      <span className="text-white font-bold">{col.name}</span>
                      <button
                        onClick={() => {
                          const updated = settings.script_columns.map(c => c.id === col.id ? { ...c, visible: !c.visible } : c);
                          onUpdateSettings({ ...settings, script_columns: updated });
                        }}
                        className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                          col.visible ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-zinc-800 text-zinc-500'
                        }`}
                      >
                        {col.visible ? 'Visible' : 'Hidden'}
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <label className="block text-[10px] uppercase text-zinc-400 mb-1">Default Clip Length (Seconds)</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={settings.default_clip_length}
                    onChange={(e) => onUpdateSettings({ ...settings, default_clip_length: Number(e.target.value) })}
                    className="w-32 bg-[#121624] border border-[#20293d] rounded-xl px-3 py-1.5 text-white"
                  />
                </div>
              </div>
            )}

            {/* 5. CUSTOM FIELDS BUILDER */}
            {activeTab === 'custom_fields' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white font-display uppercase tracking-wide">Custom Fields Builder</h3>
                <p className="text-[10px] text-zinc-400">Add arbitrary custom fields to Projects, Scenes, Characters, Ideas, and Assets.</p>

                {/* Add Field Form */}
                <div className="bg-[#121624] p-3 rounded-xl border border-[#20293d] grid grid-cols-4 gap-2 items-center">
                  <select
                    value={newCfEntity}
                    onChange={(e) => setNewCfEntity(e.target.value as any)}
                    className="bg-[#0b0e15] border border-[#1e2536] rounded-lg px-2 py-1.5 text-white outline-none capitalize"
                  >
                    <option value="project">Project</option>
                    <option value="scene">Scene</option>
                    <option value="character">Character</option>
                    <option value="idea">Idea</option>
                    <option value="asset">Asset</option>
                  </select>

                  <input
                    type="text"
                    value={newCfName}
                    onChange={(e) => setNewCfName(e.target.value)}
                    placeholder="Field Name"
                    className="bg-[#0b0e15] border border-[#1e2536] rounded-lg px-2 py-1.5 text-white outline-none"
                  />

                  <select
                    value={newCfType}
                    onChange={(e) => setNewCfType(e.target.value as any)}
                    className="bg-[#0b0e15] border border-[#1e2536] rounded-lg px-2 py-1.5 text-white outline-none capitalize"
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                    <option value="dropdown">Dropdown</option>
                    <option value="checkbox">Checkbox</option>
                    <option value="url">URL</option>
                  </select>

                  <button
                    onClick={handleAddCustomFieldSubmit}
                    className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>

                {/* List of Custom Fields */}
                <div className="space-y-2">
                  {customFields.map(cf => (
                    <div key={cf.id} className="bg-[#121624] border border-[#1e2536] p-2.5 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 rounded text-[9px] bg-red-950/60 text-red-400 border border-red-800/40 uppercase">
                          {cf.entity_type}
                        </span>
                        <span className="text-white font-bold">{cf.name}</span>
                        <span className="text-[10px] text-zinc-500">[{cf.field_type}]</span>
                      </div>
                      <button
                        onClick={() => onDeleteCustomField(cf.id)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. AI MODELS & BUDGET */}
            {activeTab === 'ai_models' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white font-display uppercase tracking-wide">AI Models & Credit Budget</h3>
                
                <div className="grid grid-cols-2 gap-3 bg-[#121624] p-3 rounded-xl border border-[#20293d]">
                  <div>
                    <label className="block text-[10px] uppercase text-zinc-400 mb-1">Monthly Credit Allowance</label>
                    <input
                      type="number"
                      value={settings.monthly_credit_budget}
                      onChange={(e) => onUpdateSettings({ ...settings, monthly_credit_budget: Number(e.target.value) })}
                      className="w-full bg-[#0b0e15] border border-[#1e2536] rounded-lg px-3 py-1.5 text-white"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-4">
                    <span className="text-zinc-300">Ultra Tier Discount (-20%)</span>
                    <input
                      type="checkbox"
                      checked={settings.ultra_discount_enabled}
                      onChange={(e) => onUpdateSettings({ ...settings, ultra_discount_enabled: e.target.checked })}
                      className="w-4 h-4 accent-red-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Add Model Form */}
                <div className="bg-[#121624] p-3 rounded-xl border border-[#20293d] grid grid-cols-4 gap-2 items-center">
                  <input
                    type="text"
                    value={newModelName}
                    onChange={(e) => setNewModelName(e.target.value)}
                    placeholder="Model Name"
                    className="bg-[#0b0e15] border border-[#1e2536] rounded-lg px-2 py-1.5 text-white outline-none"
                  />
                  <input
                    type="text"
                    value={newModelProvider}
                    onChange={(e) => setNewModelProvider(e.target.value)}
                    placeholder="Provider (e.g. Midjourney)"
                    className="bg-[#0b0e15] border border-[#1e2536] rounded-lg px-2 py-1.5 text-white outline-none"
                  />
                  <input
                    type="number"
                    value={newModelCredits}
                    onChange={(e) => setNewModelCredits(Number(e.target.value))}
                    placeholder="Credits"
                    className="bg-[#0b0e15] border border-[#1e2536] rounded-lg px-2 py-1.5 text-white outline-none"
                  />
                  <button
                    onClick={handleAddModelSubmit}
                    className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>

                {/* Models List */}
                <div className="space-y-2">
                  {aiModels.map(m => (
                    <div key={m.id} className="bg-[#121624] border border-[#1e2536] p-2.5 rounded-xl flex items-center justify-between">
                      <div>
                        <p className="font-bold text-white">{m.name}</p>
                        <p className="text-[10px] text-zinc-400">{m.provider} • {m.credits_per_gen} Credits/gen</p>
                      </div>
                      <button
                        onClick={() => onUpdateAIModels(aiModels.filter(mod => mod.id !== m.id))}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 7. HOME WIDGETS */}
            {activeTab === 'widgets' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white font-display uppercase tracking-wide">Home Dashboard Widget Layout</h3>
                <p className="text-[10px] text-zinc-400">Toggle which sections appear on your main dashboard.</p>
                <div className="space-y-2">
                  {settings.home_widgets.map(w => (
                    <div key={w.id} className="bg-[#121624] border border-[#1e2536] p-2.5 rounded-xl flex items-center justify-between">
                      <span className="text-white font-bold">{w.label || w.id}</span>
                      <button
                        onClick={() => {
                          const updated = settings.home_widgets.map(item => item.id === w.id ? { ...item, visible: !item.visible } : item);
                          onUpdateSettings({ ...settings, home_widgets: updated });
                        }}
                        className={`px-3 py-1 rounded text-[10px] font-bold ${
                          w.visible ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-zinc-800 text-zinc-500'
                        }`}
                      >
                        {w.visible ? 'Shown' : 'Hidden'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 8. BACKUP & RESTORE */}
            {activeTab === 'backup' && (
              <div className="space-y-5">
                <h3 className="text-sm font-bold text-white font-display uppercase tracking-wide">Studio State Export / Import</h3>
                <p className="text-[10px] text-zinc-400 leading-relaxed">
                  Export all your projects, custom fields, pipeline stages, models, and settings to a JSON file, or restore from a previous backup.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#121624] p-5 rounded-2xl border border-[#20293d] space-y-3">
                    <Download className="w-8 h-8 text-red-500" />
                    <h4 className="text-sm font-bold text-white">Export Studio JSON</h4>
                    <p className="text-[10px] text-zinc-400">Download a full timestamped JSON backup of all data and settings.</p>
                    <button
                      onClick={handleDownloadBackup}
                      className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold flex items-center gap-1.5 transition"
                    >
                      {copiedExport ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                      <span>{copiedExport ? 'Downloaded!' : 'Download JSON Backup'}</span>
                    </button>
                  </div>

                  <div className="bg-[#121624] p-5 rounded-2xl border border-[#20293d] space-y-3">
                    <Upload className="w-8 h-8 text-amber-500" />
                    <h4 className="text-sm font-bold text-white">Import Studio JSON</h4>
                    <p className="text-[10px] text-zinc-400">Restore your studio from an exported JSON file.</p>
                    <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1b2234] hover:bg-[#232c42] text-zinc-200 font-bold cursor-pointer transition">
                      <Upload className="w-4 h-4" />
                      <span>Select JSON File</span>
                      <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
                    </label>
                    {importStatus && (
                      <p className="text-[10px] text-amber-400 pt-1">{importStatus}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-[#0d0f17] border-t border-[#1a2130] flex items-center justify-between text-xs font-mono">
          <span className="text-zinc-500">Settings save automatically</span>
          <button
            onClick={onClose}
            className="px-5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition shadow"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
