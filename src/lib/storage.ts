import { 
  StudioSettings, 
  Project, 
  SceneItem, 
  Character, 
  Idea, 
  Asset, 
  PipelineStage, 
  AIModel, 
  CustomFieldDefinition, 
  StatsSnapshot 
} from '../types';
import { 
  defaultSettings, 
  defaultPipelineStages, 
  defaultAIModels, 
  defaultCustomFields 
} from '../data/initialConfig';
import { getSupabaseClient } from './supabase';

const STORAGE_KEYS = {
  SETTINGS: 'mms_studio_settings',
  PROJECTS: 'mms_studio_projects',
  SCENES: 'mms_studio_scenes',
  CHARACTERS: 'mms_studio_characters',
  IDEAS: 'mms_studio_ideas',
  ASSETS: 'mms_studio_assets',
  STAGES: 'mms_pipeline_stages',
  MODELS: 'mms_ai_models',
  CUSTOM_FIELDS: 'mms_custom_fields',
  SNAPSHOTS: 'mms_stats_snapshots',
};

// --- SETTINGS ---
export const loadSettings = async (): Promise<StudioSettings> => {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('studio_settings').select('*').eq('id', 'default').single();
      if (!error && data) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data));
        return data as StudioSettings;
      }
    } catch (e) {
      console.warn('Supabase loadSettings fallback:', e);
    }
  }

  const local = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  if (local) {
    try {
      return { ...defaultSettings, ...JSON.parse(local) };
    } catch {}
  }
  return defaultSettings;
};

export const saveSettings = async (settings: StudioSettings): Promise<void> => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  const supabase = getSupabaseClient(settings.supabase_url, settings.supabase_anon_key);
  if (supabase) {
    try {
      await supabase.from('studio_settings').upsert({ ...settings, updated_at: new Date().toISOString() });
    } catch (e) {
      console.warn('Supabase saveSettings error:', e);
    }
  }
};

// --- PIPELINE STAGES ---
export const loadPipelineStages = async (): Promise<PipelineStage[]> => {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('pipeline_stages').select('*').order('position', { ascending: true });
      if (!error && data && data.length > 0) {
        localStorage.setItem(STORAGE_KEYS.STAGES, JSON.stringify(data));
        return data as PipelineStage[];
      }
    } catch (e) {
      console.warn('Supabase stages fallback:', e);
    }
  }

  const local = localStorage.getItem(STORAGE_KEYS.STAGES);
  if (local) {
    try {
      return JSON.parse(local);
    } catch {}
  }
  return defaultPipelineStages;
};

export const savePipelineStages = async (stages: PipelineStage[]): Promise<void> => {
  localStorage.setItem(STORAGE_KEYS.STAGES, JSON.stringify(stages));
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('pipeline_stages').upsert(stages);
    } catch (e) {
      console.warn('Supabase saveStages error:', e);
    }
  }
};

// --- PROJECTS ---
export const loadProjects = async (): Promise<Project[]> => {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(data));
        return data as Project[];
      }
    } catch (e) {
      console.warn('Supabase loadProjects fallback:', e);
    }
  }

  const local = localStorage.getItem(STORAGE_KEYS.PROJECTS);
  if (local) {
    try {
      return JSON.parse(local);
    } catch {}
  }
  return []; // Clean slate: starts empty!
};

export const saveProject = async (project: Project): Promise<void> => {
  const projects = await loadProjects();
  const index = projects.findIndex(p => p.id === project.id);
  if (index >= 0) {
    projects[index] = { ...project, updated_at: new Date().toISOString() };
  } else {
    projects.unshift({ ...project, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
  }
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('projects').upsert(project);
    } catch (e) {
      console.warn('Supabase saveProject error:', e);
    }
  }
};

export const deleteProject = async (projectId: string): Promise<void> => {
  const projects = (await loadProjects()).filter(p => p.id !== projectId);
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('projects').delete().eq('id', projectId);
    } catch (e) {
      console.warn('Supabase deleteProject error:', e);
    }
  }
};

// --- SCENES ---
export const loadScenes = async (projectId: string): Promise<SceneItem[]> => {
  const local = localStorage.getItem(`${STORAGE_KEYS.SCENES}_${projectId}`);
  if (local) {
    try {
      return JSON.parse(local);
    } catch {}
  }
  return [];
};

export const saveScenes = async (projectId: string, scenes: SceneItem[]): Promise<void> => {
  localStorage.setItem(`${STORAGE_KEYS.SCENES}_${projectId}`, JSON.stringify(scenes));
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('scenes').upsert(scenes);
    } catch (e) {
      console.warn('Supabase saveScenes error:', e);
    }
  }
};

// --- CHARACTERS ---
export const loadCharacters = async (): Promise<Character[]> => {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('characters').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        localStorage.setItem(STORAGE_KEYS.CHARACTERS, JSON.stringify(data));
        return data as Character[];
      }
    } catch (e) {
      console.warn('Supabase loadCharacters fallback:', e);
    }
  }

  const local = localStorage.getItem(STORAGE_KEYS.CHARACTERS);
  if (local) {
    try {
      return JSON.parse(local);
    } catch {}
  }
  return []; // Clean slate: starts empty!
};

export const saveCharacter = async (character: Character): Promise<void> => {
  const chars = await loadCharacters();
  const index = chars.findIndex(c => c.id === character.id);
  if (index >= 0) {
    chars[index] = character;
  } else {
    chars.unshift(character);
  }
  localStorage.setItem(STORAGE_KEYS.CHARACTERS, JSON.stringify(chars));

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('characters').upsert(character);
    } catch (e) {
      console.warn('Supabase saveCharacter error:', e);
    }
  }
};

export const deleteCharacter = async (characterId: string): Promise<void> => {
  const chars = (await loadCharacters()).filter(c => c.id !== characterId);
  localStorage.setItem(STORAGE_KEYS.CHARACTERS, JSON.stringify(chars));

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('characters').delete().eq('id', characterId);
    } catch (e) {
      console.warn('Supabase deleteCharacter error:', e);
    }
  }
};

// --- IDEAS / TOPICS ---
export const loadIdeas = async (): Promise<Idea[]> => {
  const local = localStorage.getItem(STORAGE_KEYS.IDEAS);
  if (local) {
    try {
      return JSON.parse(local);
    } catch {}
  }
  return []; // Clean slate: starts empty!
};

export const saveIdea = async (idea: Idea): Promise<void> => {
  const ideas = await loadIdeas();
  const idx = ideas.findIndex(i => i.id === idea.id);
  if (idx >= 0) ideas[idx] = idea;
  else ideas.unshift(idea);
  localStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(ideas));

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('ideas').upsert(idea);
    } catch {}
  }
};

export const deleteIdea = async (ideaId: string): Promise<void> => {
  const ideas = (await loadIdeas()).filter(i => i.id !== ideaId);
  localStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(ideas));
};

// --- ASSETS ---
export const loadAssets = async (): Promise<Asset[]> => {
  const local = localStorage.getItem(STORAGE_KEYS.ASSETS);
  if (local) {
    try {
      return JSON.parse(local);
    } catch {}
  }
  return []; // Clean slate: starts empty!
};

export const saveAsset = async (asset: Asset): Promise<void> => {
  const assets = await loadAssets();
  const idx = assets.findIndex(a => a.id === asset.id);
  if (idx >= 0) assets[idx] = asset;
  else assets.unshift(asset);
  localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(assets));

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('assets').upsert(asset);
    } catch {}
  }
};

export const deleteAsset = async (assetId: string): Promise<void> => {
  const assets = (await loadAssets()).filter(a => a.id !== assetId);
  localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(assets));
};

// --- AI MODELS ---
export const loadAIModels = async (): Promise<AIModel[]> => {
  const local = localStorage.getItem(STORAGE_KEYS.MODELS);
  if (local) {
    try {
      return JSON.parse(local);
    } catch {}
  }
  return defaultAIModels;
};

export const saveAIModels = async (models: AIModel[]): Promise<void> => {
  localStorage.setItem(STORAGE_KEYS.MODELS, JSON.stringify(models));
};

// --- CUSTOM FIELDS ---
export const loadCustomFields = async (): Promise<CustomFieldDefinition[]> => {
  const local = localStorage.getItem(STORAGE_KEYS.CUSTOM_FIELDS);
  if (local) {
    try {
      return JSON.parse(local);
    } catch {}
  }
  return defaultCustomFields;
};

export const saveCustomField = async (cf: CustomFieldDefinition): Promise<void> => {
  const fields = await loadCustomFields();
  const idx = fields.findIndex(f => f.id === cf.id);
  if (idx >= 0) fields[idx] = cf;
  else fields.push(cf);
  localStorage.setItem(STORAGE_KEYS.CUSTOM_FIELDS, JSON.stringify(fields));
};

export const deleteCustomField = async (cfId: string): Promise<void> => {
  const fields = (await loadCustomFields()).filter(f => f.id !== cfId);
  localStorage.setItem(STORAGE_KEYS.CUSTOM_FIELDS, JSON.stringify(fields));
};

// --- SNAPSHOTS (FOR REAL DELTAS) ---
export const saveStatsSnapshot = async (snapshot: StatsSnapshot): Promise<void> => {
  const local = localStorage.getItem(STORAGE_KEYS.SNAPSHOTS);
  let list: StatsSnapshot[] = [];
  if (local) {
    try {
      list = JSON.parse(local);
    } catch {}
  }
  list.unshift(snapshot);
  if (list.length > 50) list = list.slice(0, 50);
  localStorage.setItem(STORAGE_KEYS.SNAPSHOTS, JSON.stringify(list));

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('stats_snapshots').insert(snapshot);
    } catch {}
  }
};

export const loadLatestSnapshots = async (): Promise<StatsSnapshot[]> => {
  const local = localStorage.getItem(STORAGE_KEYS.SNAPSHOTS);
  if (local) {
    try {
      return JSON.parse(local);
    } catch {}
  }
  return [];
};

// --- EXPORT & IMPORT ENTIRE STUDIO STATE ---
export const exportAllDataAsJSON = async (): Promise<string> => {
  const backup = {
    exportDate: new Date().toISOString(),
    version: '3.5',
    settings: await loadSettings(),
    stages: await loadPipelineStages(),
    projects: await loadProjects(),
    characters: await loadCharacters(),
    ideas: await loadIdeas(),
    assets: await loadAssets(),
    models: await loadAIModels(),
    customFields: await loadCustomFields(),
    snapshots: await loadLatestSnapshots(),
  };
  return JSON.stringify(backup, null, 2);
};

export const importAllDataFromJSON = async (jsonString: string): Promise<boolean> => {
  try {
    const data = JSON.parse(jsonString);
    if (data.settings) await saveSettings(data.settings);
    if (data.stages) await savePipelineStages(data.stages);
    if (data.projects) localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(data.projects));
    if (data.characters) localStorage.setItem(STORAGE_KEYS.CHARACTERS, JSON.stringify(data.characters));
    if (data.ideas) localStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(data.ideas));
    if (data.assets) localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(data.assets));
    if (data.models) localStorage.setItem(STORAGE_KEYS.MODELS, JSON.stringify(data.models));
    if (data.customFields) localStorage.setItem(STORAGE_KEYS.CUSTOM_FIELDS, JSON.stringify(data.customFields));
    return true;
  } catch (e) {
    console.error('Import failed:', e);
    return false;
  }
};
