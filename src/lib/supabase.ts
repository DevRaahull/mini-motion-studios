import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment credentials or configured credentials
const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabaseClient: SupabaseClient | null = null;

export const getSupabaseClient = (customUrl?: string, customKey?: string): SupabaseClient | null => {
  const url = customUrl || envUrl;
  const key = customKey || envKey;

  if (!url || !key) {
    return null;
  }

  if (!supabaseClient) {
    try {
      supabaseClient = createClient(url, key);
    } catch (e) {
      console.warn('Failed to initialize Supabase client:', e);
      return null;
    }
  }

  return supabaseClient;
};

export const isSupabaseConfigured = (): boolean => {
  return !!(envUrl && envKey);
};
