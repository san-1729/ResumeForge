import { createClient, SupabaseClient } from '@supabase/supabase-js';

// HARDCODED CREDENTIALS - TEMPORARY SOLUTION FOR VERCEL DEPLOYMENT
// This should be removed once environment variables are working correctly
const HARDCODED_SUPABASE_URL = 'https://xlfwyjwlrcwxylzvvcyz.supabase.co';
const HARDCODED_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsZnd5andscmN3eHlsenZ2Y3l6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMTk1ODYsImV4cCI6MjA2Mjc5NTU4Nn0.4nCgzoaxA--dAm7XVTBwfyciNnVOmMEYfxKFgW5gB3g';

// Create a singleton Supabase client for client-side usage
let supabaseInstance: SupabaseClient | null = null;

export const createSupabaseClient = () => {
  console.log('[CLIENT DB] Creating Supabase client'); 
  
  // Return existing instance if already created
  if (supabaseInstance) {
    console.log('[CLIENT DB] Returning existing Supabase client instance');
    return supabaseInstance;
  }
  
  try {
    // Try window.ENV first (if available)
    const envUrl = window.ENV?.SUPABASE_URL;
    const envKey = window.ENV?.SUPABASE_ANON_KEY;
    
    if (envUrl && envKey) {
      console.log('[CLIENT DB] Using window.ENV Supabase credentials');
      supabaseInstance = createClient(envUrl, envKey);
      return supabaseInstance;
    }
    
    // Then try directly set window variables (fallback)
    const windowUrl = window.SUPABASE_URL;
    const windowKey = window.SUPABASE_ANON_KEY;
    
    if (windowUrl && windowKey) {
      console.log('[CLIENT DB] Using window.SUPABASE_* credentials');
      supabaseInstance = createClient(windowUrl, windowKey);
      return supabaseInstance;
    }
    
    // Final fallback - use hardcoded credentials
    console.log('[CLIENT DB] Using HARDCODED credentials');  
    supabaseInstance = createClient(HARDCODED_SUPABASE_URL, HARDCODED_SUPABASE_ANON_KEY);
    return supabaseInstance;
  } catch (error) {
    console.error('[CLIENT DB] Error creating Supabase client:', error);
    
    // Create with hardcoded credentials as ultimate fallback
    console.log('[CLIENT DB] Creating client with hardcoded credentials after error');
    supabaseInstance = createClient(HARDCODED_SUPABASE_URL, HARDCODED_SUPABASE_ANON_KEY);
    return supabaseInstance;
  }
};

// Declare the ENV type for TypeScript
declare global {
  interface Window {
    ENV?: {
      SUPABASE_URL?: string;
      SUPABASE_ANON_KEY?: string;
    };
    // Direct window properties (alternative way of setting env vars)
    SUPABASE_URL?: string;
    SUPABASE_ANON_KEY?: string;
  }
}
