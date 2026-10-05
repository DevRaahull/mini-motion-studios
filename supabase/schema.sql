-- =========================================================================
-- MINI MOTION STUDIOS: FULL PRODUCTION DATABASE SCHEMA
-- Clean Slate: No seeded projects or characters. Fully user-customizable.
-- =========================================================================

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. STUDIO SETTINGS & CONFIGURATION
CREATE TABLE IF NOT EXISTS studio_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  studio_name TEXT NOT NULL DEFAULT 'Mini Motion Studios',
  tagline TEXT NOT NULL DEFAULT 'Stories that stay with you',
  version_label TEXT NOT NULL DEFAULT 'v3.5',
  logo_url TEXT DEFAULT '/assets/logo_mark.png',
  avatar_url TEXT DEFAULT '/assets/user_avatar_nav.png',
  theme_mode TEXT NOT NULL DEFAULT 'cinematic', -- 'cinematic' | 'scifi'
  accent_color TEXT NOT NULL DEFAULT '#e52b2b',
  font_size TEXT NOT NULL DEFAULT 'medium', -- 'small' | 'medium' | 'large'
  glow_intensity INTEGER NOT NULL DEFAULT 65, -- 0 to 100
  default_clip_length INTEGER NOT NULL DEFAULT 5, -- in seconds
  monthly_credit_budget INTEGER DEFAULT 2500,
  ultra_discount_enabled BOOLEAN DEFAULT FALSE,
  calendar_week_start TEXT NOT NULL DEFAULT 'mon', -- 'sun' | 'mon'
  default_upload_time TEXT DEFAULT '18:00',
  batch_short_per_day INTEGER DEFAULT 1,
  batch_long_every_n_days INTEGER DEFAULT 7,
  pinned_project_id TEXT,
  home_widgets JSONB DEFAULT '[
    {"id": "hero_banner", "visible": true, "order": 1},
    {"id": "story_tracker", "visible": true, "order": 2},
    {"id": "pinned_project", "visible": true, "order": 3},
    {"id": "pipeline_stepper", "visible": true, "order": 4},
    {"id": "projects_grid", "visible": true, "order": 5},
    {"id": "storyboard_cuts", "visible": true, "order": 6},
    {"id": "cast_roster", "visible": true, "order": 7}
  ]'::jsonb,
  nav_tabs JSONB DEFAULT '[
    {"id": "dashboard", "label": "Dashboard", "visible": true, "order": 1},
    {"id": "channels", "label": "Channels", "visible": true, "order": 2},
    {"id": "topics", "label": "Topics", "visible": true, "order": 3},
    {"id": "scripts", "label": "Scripts", "visible": true, "order": 4},
    {"id": "characters", "label": "Characters", "visible": true, "order": 5},
    {"id": "thumbnails", "label": "Thumbnails", "visible": true, "order": 6},
    {"id": "production", "label": "Production", "visible": true, "order": 7},
    {"id": "calendar", "label": "Calendar", "visible": true, "order": 8},
    {"id": "analytics", "label": "Analytics", "visible": true, "order": 9},
    {"id": "assets", "label": "Asset Library", "visible": true, "order": 10},
    {"id": "settings", "label": "Settings", "visible": true, "order": 11}
  ]'::jsonb,
  script_columns JSONB DEFAULT '[
    {"id": "timing", "name": "Timing", "visible": true, "order": 1},
    {"id": "visual_prompt", "name": "AI Visual Prompt", "visible": true, "order": 2},
    {"id": "voiceover_script", "name": "Voiceover / Audio Script", "visible": true, "order": 3}
  ]'::jsonb,
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  youtube_channel_id TEXT NOT NULL DEFAULT 'UCFw0IWvKFQNsUoAHeyMgihA',
  youtube_api_key TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. CHANNELS (Default English Channel)
CREATE TABLE IF NOT EXISTS channels (
  id TEXT PRIMARY KEY, -- YouTube Channel ID (e.g. 'UCFw0IWvKFQNsUoAHeyMgihA')
  name TEXT NOT NULL,
  handle TEXT,
  language TEXT NOT NULL DEFAULT 'English',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. PIPELINE STAGES (Fully Customizable)
CREATE TABLE IF NOT EXISTS pipeline_stages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#ef4444',
  icon TEXT NOT NULL DEFAULT 'Lightbulb',
  position INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. CUSTOM FIELDS DEFINITION
CREATE TABLE IF NOT EXISTS custom_fields_definition (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL, -- 'project' | 'scene' | 'character' | 'idea' | 'asset'
  name TEXT NOT NULL,
  field_type TEXT NOT NULL, -- 'text' | 'number' | 'date' | 'dropdown' | 'checkbox' | 'url'
  options TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. PROJECTS (CLEAN SLATE: 0 rows seeded)
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  channel_id TEXT NOT NULL DEFAULT 'UCFw0IWvKFQNsUoAHeyMgihA',
  title TEXT NOT NULL,
  format TEXT NOT NULL DEFAULT 'Long-form', -- 'Short' | 'Reel' | 'Long-form'
  series TEXT,
  stage_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Idea',
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  description TEXT,
  thumbnail_url TEXT,
  deadline TEXT,
  pinned BOOLEAN DEFAULT FALSE,
  custom_fields JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. SCENES
CREATE TABLE IF NOT EXISTS scenes (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  scene_number INTEGER NOT NULL,
  timing TEXT DEFAULT '0:05',
  visual_prompt TEXT,
  voiceover_script TEXT,
  character_id TEXT,
  status TEXT NOT NULL DEFAULT 'Pending',
  custom_fields JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. CHARACTERS (CLEAN SLATE: 0 rows seeded)
CREATE TABLE IF NOT EXISTS characters (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT,
  archetype TEXT,
  bio TEXT,
  avatar_url TEXT,
  voice_id TEXT,
  prompt_formula TEXT,
  custom_fields JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. TOPICS & IDEAS (CLEAN SLATE)
CREATE TABLE IF NOT EXISTS ideas (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  theme TEXT,
  notes TEXT,
  viral_index TEXT,
  status TEXT NOT NULL DEFAULT 'Backlog',
  custom_fields JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. ASSET REPOSITORY
CREATE TABLE IF NOT EXISTS assets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  asset_type TEXT NOT NULL, -- 'image' | 'audio' | 'video' | 'document'
  url TEXT NOT NULL,
  file_size TEXT,
  custom_fields JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. AI GENERATION MODELS & BUDGET
CREATE TABLE IF NOT EXISTS ai_models (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  provider TEXT NOT NULL,
  credits_per_gen INTEGER NOT NULL DEFAULT 10,
  seconds_options INTEGER[] DEFAULT ARRAY[5, 10]::INTEGER[],
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. PROMPT TEMPLATES & REUSABLE SNIPPETS
CREATE TABLE IF NOT EXISTS prompt_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. STATS SNAPSHOTS (For Real Historical Deltas)
CREATE TABLE IF NOT EXISTS stats_snapshots (
  id TEXT PRIMARY KEY,
  channel_id TEXT NOT NULL,
  subscribers BIGINT NOT NULL,
  views BIGINT NOT NULL,
  video_count INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. ACTIVITY STREAM
CREATE TABLE IF NOT EXISTS activity_logs (
  id TEXT PRIMARY KEY,
  action_type TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- SEED ONLY DEFAULT CONFIGURATION (NOT DEMO CONTENT)
INSERT INTO studio_settings (id, studio_name, tagline, version_label, onboarding_completed, youtube_channel_id)
VALUES ('default', 'Mini Motion Studios', 'Stories that stay with you', 'v3.5', false, 'UCFw0IWvKFQNsUoAHeyMgihA')
ON CONFLICT (id) DO NOTHING;

INSERT INTO channels (id, name, handle, language, is_active)
VALUES ('UCFw0IWvKFQNsUoAHeyMgihA', 'Mini Motion Studios', '@minimotionstudios', 'English', true)
ON CONFLICT (id) DO NOTHING;

-- Default Suggested Pipeline Stages
INSERT INTO pipeline_stages (id, name, color, icon, position) VALUES
('stage-idea', 'IDEA', '#3b82f6', 'Lightbulb', 1),
('stage-script', 'SCRIPT', '#10b981', 'FileText', 2),
('stage-characters', 'CHARACTERS', '#8b5cf6', 'Users', 3),
('stage-scenes', 'SCENES', '#ec4899', 'Clapperboard', 4),
('stage-voiceover', 'VOICEOVER', '#f59e0b', 'Mic', 5),
('stage-edit', 'EDIT', '#6366f1', 'Monitor', 6),
('stage-thumbnail', 'THUMBNAIL', '#06b6d4', 'Image', 7),
('stage-published', 'PUBLISHED', '#ef4444', 'Send', 8)
ON CONFLICT (id) DO NOTHING;

-- Default AI Models Configuration
INSERT INTO ai_models (id, name, provider, credits_per_gen, seconds_options, is_active) VALUES
('model-midjourney', 'Midjourney v6.1', 'Midjourney', 10, ARRAY[0], true),
('model-flux', 'FLUX.1 Pro', 'Black Forest Labs', 15, ARRAY[0], true),
('model-runway', 'Runway Gen-3 Alpha', 'RunwayML', 40, ARRAY[5, 10], true),
('model-kling', 'Kling AI 1.5 HD', 'Kuaishou', 35, ARRAY[5, 10], true),
('model-elevenlabs', 'ElevenLabs Turbo v2.5', 'ElevenLabs', 5, ARRAY[30, 60], true)
ON CONFLICT (id) DO NOTHING;
