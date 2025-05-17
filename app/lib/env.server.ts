/**
 * Environment variable utilities specifically for Vercel deployment
 * This centralizes how we access environment variables across the application
 */

// Define the structure of our environment variables
interface AppEnv {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  NODE_ENV: string;
  VERCEL?: string;
  VERCEL_ENV?: string;
}

// HARDCODED CREDENTIALS - TEMPORARY SOLUTION FOR VERCEL DEPLOYMENT
// This should be removed once environment variables are working correctly
const HARDCODED_SUPABASE_URL = 'https://xlfwyjwlrcwxylzvvcyz.supabase.co';
const HARDCODED_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsZnd5andscmN3eHlsenZ2Y3l6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMTk1ODYsImV4cCI6MjA2Mjc5NTU4Nn0.4nCgzoaxA--dAm7XVTBwfyciNnVOmMEYfxKFgW5gB3g';

// Load environment variables with detailed logging for debugging
export function getServerEnv(): AppEnv {
  console.log('ENV LOADER - Initializing environment variables WITH HARDCODED FALLBACK');
  console.log('ENV LOADER - NODE_ENV:', process.env.NODE_ENV);
  console.log('ENV LOADER - VERCEL:', process.env.VERCEL);
  console.log('ENV LOADER - VERCEL_ENV:', process.env.VERCEL_ENV);
  
  // Check for Supabase variables from process.env
  let supabaseUrl = process.env.SUPABASE_URL;
  let supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  
  // Extra debugging for Vercel environment
  if (process.env.VERCEL === '1') {
    console.log('ENV LOADER - Running in Vercel environment, checking for env vars');
    // Try alternative env var access methods for Vercel
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('ENV LOADER - Using HARDCODED fallback credentials for Vercel deployment');
      supabaseUrl = HARDCODED_SUPABASE_URL;
      supabaseAnonKey = HARDCODED_SUPABASE_ANON_KEY;
    }
  } 
  // Handle development and other environments too
  else if (!supabaseUrl || !supabaseAnonKey) {
    console.log('ENV LOADER - Using HARDCODED fallback credentials (non-Vercel)');
    supabaseUrl = HARDCODED_SUPABASE_URL;
    supabaseAnonKey = HARDCODED_SUPABASE_ANON_KEY;
  }
  
  console.log('ENV LOADER - FINAL STATE: SUPABASE_URL exists:', !!supabaseUrl);
  console.log('ENV LOADER - FINAL STATE: SUPABASE_ANON_KEY exists:', !!supabaseAnonKey);
  
  // Return the environment with appropriate values and hardcoded fallbacks
  return {
    SUPABASE_URL: supabaseUrl || HARDCODED_SUPABASE_URL,
    SUPABASE_ANON_KEY: supabaseAnonKey || HARDCODED_SUPABASE_ANON_KEY,
    NODE_ENV: process.env.NODE_ENV || 'development',
    VERCEL: process.env.VERCEL,
    VERCEL_ENV: process.env.VERCEL_ENV,
  };
}

// Get client-side safe environment variables
export function getClientEnv() {
  const env = getServerEnv();
  
  return {
    SUPABASE_URL: env.SUPABASE_URL,
    SUPABASE_ANON_KEY: env.SUPABASE_ANON_KEY
  };
}
