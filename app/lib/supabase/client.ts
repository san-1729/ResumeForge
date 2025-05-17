import { createClient } from '@supabase/supabase-js';

// HARDCODED CREDENTIALS - TEMPORARY SOLUTION FOR VERCEL DEPLOYMENT
// This should be removed once environment variables are working correctly
const HARDCODED_SUPABASE_URL = 'https://xlfwyjwlrcwxylzvvcyz.supabase.co';
const HARDCODED_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsZnd5andscmN3eHlsenZ2Y3l6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMTk1ODYsImV4cCI6MjA2Mjc5NTU4Nn0.4nCgzoaxA--dAm7XVTBwfyciNnVOmMEYfxKFgW5gB3g';

// Create a single supabase client for server-side usage
export const createSupabaseClient = () => {
  console.log('🔵 [DB] Creating Supabase client with HARDCODED credentials in client.ts');
  
  try {
    // Try environment variables first (for local development)
    const envUrl = process.env.SUPABASE_URL;
    const envKey = process.env.SUPABASE_ANON_KEY;
    
    if (envUrl && envKey) {
      console.log('[DB] Using environment variables for Supabase client');
      return createClient(envUrl, envKey);
    }
    
    // Fall back to hardcoded credentials
    console.log('[DB] Using HARDCODED credentials for Supabase client');
    return createClient(HARDCODED_SUPABASE_URL, HARDCODED_SUPABASE_ANON_KEY);
  } catch (error) {
    console.error('[DB] Error creating Supabase client:', error);
    // Always use hardcoded values as final fallback
    return createClient(HARDCODED_SUPABASE_URL, HARDCODED_SUPABASE_ANON_KEY);
  }
};
