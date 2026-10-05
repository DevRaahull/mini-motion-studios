import { StudioSettings, PipelineStage, AIModel, CustomFieldDefinition } from '../types';

export const defaultSettings: StudioSettings = {
  id: 'default',
  studio_name: 'Mini Motion Studios',
  tagline: 'Stories that stay with you',
  version_label: 'v3.5',
  logo_url: '/assets/logo_mark.png',
  avatar_url: '/assets/user_avatar_nav.png',
  theme_mode: 'cinematic',
  accent_color: '#e52b2b',
  font_size: 'medium',
  glow_intensity: 65,
  default_clip_length: 5,
  monthly_credit_budget: 2500,
  ultra_discount_enabled: false,
  calendar_week_start: 'mon',
  default_upload_time: '18:00',
  batch_short_per_day: 1,
  batch_long_every_n_days: 7,
  home_widgets: [
    { id: 'hero_banner', label: 'Studio Hero Banner', visible: true, order: 1 },
    { id: 'story_tracker', label: 'Story & Project Goals', visible: true, order: 2 },
    { id: 'pinned_project', label: 'Pinned / Active Project', visible: true, order: 3 },
    { id: 'pipeline_stepper', label: 'Pipeline Stepper', visible: true, order: 4 },
    { id: 'projects_grid', label: 'Projects & Episodes Grid', visible: true, order: 5 },
    { id: 'cast_roster', label: 'Cast Universe Matrix', visible: true, order: 6 },
  ],
  nav_tabs: [
    { id: 'dashboard', label: 'Dashboard', visible: true, order: 1 },
    { id: 'channels', label: 'Channel', visible: true, order: 2 },
    { id: 'topics', label: 'Topics', visible: true, order: 3 },
    { id: 'scripts', label: 'Scripts', visible: true, order: 4 },
    { id: 'characters', label: 'Characters', visible: true, order: 5 },
    { id: 'thumbnails', label: 'Thumbnails', visible: true, order: 6 },
    { id: 'production', label: 'Production', visible: true, order: 7 },
    { id: 'calendar', label: 'Calendar', visible: true, order: 8 },
    { id: 'analytics', label: 'Analytics', visible: true, order: 9 },
    { id: 'assets', label: 'Asset Library', visible: true, order: 10 },
    { id: 'settings', label: 'Settings', visible: true, order: 11 },
  ],
  script_columns: [
    { id: 'timing', name: 'Timing', visible: true, order: 1 },
    { id: 'visual_prompt', name: 'AI Visual Prompt', visible: true, order: 2 },
    { id: 'voiceover_script', name: 'Voiceover / Audio Script', visible: true, order: 3 },
  ],
  onboarding_completed: false,
  youtube_channel_id: 'UCFw0IWvKFQNsUoAHeyMgihA',
};

export const defaultPipelineStages: PipelineStage[] = [
  { id: 'stage-idea', name: 'IDEA', color: '#3b82f6', icon: 'Lightbulb', position: 1 },
  { id: 'stage-script', name: 'SCRIPT', color: '#10b981', icon: 'FileText', position: 2 },
  { id: 'stage-characters', name: 'CHARACTERS', color: '#8b5cf6', icon: 'Users', position: 3 },
  { id: 'stage-scenes', name: 'SCENES', color: '#ec4899', icon: 'Clapperboard', position: 4 },
  { id: 'stage-voiceover', name: 'VOICEOVER', color: '#f59e0b', icon: 'Mic', position: 5 },
  { id: 'stage-edit', name: 'EDIT', color: '#6366f1', icon: 'Monitor', position: 6 },
  { id: 'stage-thumbnail', name: 'THUMBNAIL', color: '#06b6d4', icon: 'Image', position: 7 },
  { id: 'stage-published', name: 'PUBLISHED', color: '#ef4444', icon: 'Send', position: 8 },
];

export const defaultAIModels: AIModel[] = [
  { id: 'model-midjourney', name: 'Midjourney v6.1', provider: 'Midjourney', credits_per_gen: 10, seconds_options: [0], is_active: true },
  { id: 'model-flux', name: 'FLUX.1 Pro', provider: 'Black Forest Labs', credits_per_gen: 15, seconds_options: [0], is_active: true },
  { id: 'model-runway', name: 'Runway Gen-3 Alpha', provider: 'RunwayML', credits_per_gen: 40, seconds_options: [5, 10], is_active: true },
  { id: 'model-kling', name: 'Kling AI 1.5 HD', provider: 'Kuaishou', credits_per_gen: 35, seconds_options: [5, 10], is_active: true },
  { id: 'model-elevenlabs', name: 'ElevenLabs Turbo v2.5', provider: 'ElevenLabs', credits_per_gen: 5, seconds_options: [30, 60], is_active: true },
];

export const defaultCustomFields: CustomFieldDefinition[] = [
  { id: 'cf-proj-theme', entity_type: 'project', name: 'Psychology Theme', field_type: 'text' },
  { id: 'cf-char-voice', entity_type: 'character', name: 'Voice Clone ID', field_type: 'text' },
  { id: 'cf-idea-viral', entity_type: 'idea', name: 'Predicted Viral Score', field_type: 'dropdown', options: ['Low', 'Medium', 'High', 'Viral Outlier'] },
];

// Clean Slate: Empty collections. Everything will be created and saved by user!
export const initialCleanProjects = [];
export const initialCleanCharacters = [];
export const initialCleanIdeas = [];
export const initialCleanAssets = [];
export const initialCleanScenes = [];
export const initialCleanSnapshots = [];
