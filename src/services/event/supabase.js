/**
 * Supabase Client for Event System
 * Handles database operations for tickets, users, and notes
 */
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create Supabase client
let supabase = null;

export function getSupabaseClient() {
  if (!supabase && isSupabaseConfigured()) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabase;
}

/**
 * Check if Supabase is properly configured
 */
export function isSupabaseConfigured() {
  return (
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== "https://your-project.supabase.co" &&
    supabaseAnonKey !== "your-supabase-anon-key"
  );
}

export default getSupabaseClient;
