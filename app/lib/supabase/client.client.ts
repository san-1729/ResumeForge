import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Create a singleton Supabase client for client-side usage
let supabaseInstance: SupabaseClient | null = null;

export const createSupabaseClient = () => {
  // Return existing instance if already created
  if (supabaseInstance) {
    return supabaseInstance;
  }
  
  const supabaseUrl = window.ENV?.SUPABASE_URL;
  const supabaseAnonKey = window.ENV?.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables');
    return null;
  }
  
  // Create and store the instance
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseInstance;
};

// Declare the ENV type for TypeScript
declare global {
  interface Window {
    ENV?: {
      SUPABASE_URL?: string;
      SUPABASE_ANON_KEY?: string;
    };
  }
}
