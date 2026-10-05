export type ThemeMode = 'cinematic' | 'scifi';
export type FontSize = 'small' | 'medium' | 'large';
export type EntityType = 'project' | 'scene' | 'character' | 'idea' | 'asset';
export type FieldType = 'text' | 'number' | 'date' | 'dropdown' | 'checkbox' | 'url';

export interface WidgetConfig {
  id: string;
  label?: string;
  visible: boolean;
  order: number;
}

export interface NavTabConfig {
  id: string;
  label: string;
  visible: boolean;
  order: number;
}

export interface ScriptColumnConfig {
  id: string;
  name: string;
  visible: boolean;
  order: number;
}

export interface CustomFieldDefinition {
  id: string;
  entity_type: EntityType;
  name: string;
  field_type: FieldType;
  options?: string[];
}

export interface StudioSettings {
  id: string;
  studio_name: string;
  tagline: string;
  version_label: string;
  logo_url: string;
  avatar_url: string;
  theme_mode: ThemeMode;
  accent_color: string;
  font_size: FontSize;
  glow_intensity: number; // 0-100
  default_clip_length: number; // in seconds
  monthly_credit_budget: number;
  ultra_discount_enabled: boolean;
  calendar_week_start: 'sun' | 'mon';
  default_upload_time: string;
  batch_short_per_day: number;
  batch_long_every_n_days: number;
  pinned_project_id?: string;
  home_widgets: WidgetConfig[];
  nav_tabs: NavTabConfig[];
  script_columns: ScriptColumnConfig[];
  onboarding_completed: boolean;
  youtube_channel_id: string;
  youtube_api_key?: string;
  supabase_url?: string;
  supabase_anon_key?: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  color: string;
  icon: string;
  position: number;
}

export interface Project {
  id: string;
  channel_id: string;
  title: string;
  format: string; // 'Short' | 'Long-form' | 'Reel'
  series?: string;
  stage_id: string;
  status: string; // e.g. 'Draft', 'Script Ready', 'In Production', 'Editing', 'Ready to Publish'
  tags: string[];
  description?: string;
  thumbnail_url?: string;
  deadline?: string;
  pinned?: boolean;
  custom_fields?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface SceneItem {
  id: string;
  project_id: string;
  scene_number: number;
  timing: string;
  visual_prompt: string;
  voiceover_script: string;
  character_id?: string;
  status: string;
  custom_fields?: Record<string, any>;
}

export interface Character {
  id: string;
  name: string;
  role: string;
  archetype?: string;
  bio?: string;
  avatar_url?: string;
  voice_id?: string;
  prompt_formula?: string;
  custom_fields?: Record<string, any>;
}

export interface Idea {
  id: string;
  title: string;
  theme: string;
  notes?: string;
  viral_index?: string;
  status: string;
  custom_fields?: Record<string, any>;
}

export interface Asset {
  id: string;
  name: string;
  category: string;
  asset_type: 'image' | 'audio' | 'video' | 'document';
  url: string;
  file_size?: string;
  custom_fields?: Record<string, any>;
  created_at: string;
}

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  credits_per_gen: number;
  seconds_options: number[];
  is_active: boolean;
}

export interface PromptTemplate {
  id: string;
  name: string;
  category: string;
  content: string;
}

export interface StatsSnapshot {
  id: string;
  channel_id: string;
  subscribers: number;
  views: number;
  video_count: number;
  created_at: string;
}

export interface YouTubeLiveStats {
  channelId: string;
  channelTitle: string;
  subscribers: number;
  views: number;
  videoCount: number;
  lastUpdated: string;
  isLive: boolean;
  deltaViews?: number;
  deltaSubs?: number;
  error?: string;
  analyticsAsOfDate?: string;
  avgRetention?: string;
  ctr?: string;
  watchTimeHours?: number;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  publishedAt: string;
  thumbnail: string;
  views: number;
  likes: number;
  comments: number;
  duration?: string;
  ctr?: string;
  retention?: string;
}

export interface ActivityLog {
  id: string;
  action_type: string;
  description: string;
  created_at: string;
}
