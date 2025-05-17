import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { AppLoadContext } from '@remix-run/node';
// No longer importing getServerEnv as we'll use a more direct approach

// Define fail-safe values - these are last resort if env vars aren't available
// NOTE: In production, you would NEVER hardcode these, but we're in an emergency situation
// where Vercel environment variables aren't being passed correctly
const FAILSAFE_SUPABASE_URL = 'https://xlfwyjwlrcwxylzvvcyz.supabase.co';
const FAILSAFE_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsZnd5andscmN3eHlsenZ2Y3l6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMTk1ODYsImV4cCI6MjA2Mjc5NTU4Nn0.4nCgzoaxA--dAm7XVTBwfyciNnVOmMEYfxKFgW5gB3g';

interface ServerSupabaseClientOptions {
  request: Request;
  response: Response;
  context: AppLoadContext;
}

/**
 * Creates a Supabase client for server-side usage in Remix actions and loaders
 */
/**
 * Creates a mock Supabase client that won't crash the app when real credentials are missing
 * This should only be used during development and testing
 */
function createMockSupabaseClient(): SupabaseClient {
  // Return a mock client with stub methods that won't crash
  return {
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      signOut: () => Promise.resolve({ error: null }),
      // Add other auth methods as stubs as needed
    },
    from: () => ({
      select: () => ({
        eq: () => Promise.resolve({ data: [], error: null }),
        // Add other query chain methods as needed
      })
    }),
    // Add minimal implementation to prevent crashes
    // These won't actually work but will prevent the app from crashing
  } as unknown as SupabaseClient;
}

// Hardcoded Supabase client for Vercel deployment issue
// IMPORTANT: This is a temporary solution and should be removed once environment variables are working
let cachedSupabaseClient: SupabaseClient | null = null;

// Always use the failsafe credentials for Vercel deployment - this is TEMPORARY
// In a normal situation, we would NEVER hardcode these values
const SUPABASE_URL = 'https://xlfwyjwlrcwxylzvvcyz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsZnd5andscmN3eHlsenZ2Y3l6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMTk1ODYsImV4cCI6MjA2Mjc5NTU4Nn0.4nCgzoaxA--dAm7XVTBwfyciNnVOmMEYfxKFgW5gB3g';

// This is purely for diagnostic purposes
export function createServerSupabaseClient({ request, response, context }: ServerSupabaseClientOptions): SupabaseClient {
  console.log('🔵 [DB] Initializing Supabase connection - ULTRA HARDCODED VERSION');
  
  // If we have a cached client, return it
  if (cachedSupabaseClient) {
    console.log('[DB] Returning cached Supabase client');
    return cachedSupabaseClient;
  }
  
  // Try to get environment variables (for diagnostic purposes only)
  const envVars = {
    VERCEL: process.env.VERCEL,
    NODE_ENV: process.env.NODE_ENV,
    SUPABASE_URL_ENV: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY_ENV: process.env.SUPABASE_ANON_KEY,
    SUPABASE_URL_CONTEXT: context?.SUPABASE_URL,
    SUPABASE_ANON_KEY_CONTEXT: context?.SUPABASE_ANON_KEY
  };
  
  // Log everything for diagnostic purposes
  console.log('[DB DEBUG] Environment:', JSON.stringify(envVars));
  console.log('[DB DEBUG] ALL ENV KEYS:', Object.keys(process.env).join(', '));
  console.log('[DB DEBUG] ALL CONTEXT KEYS:', Object.keys(context || {}).join(', '));
  
  // ULTRA HARDCODED: Always use our hardcoded values for now
  // This is TEMPORARY for debugging and should be removed
  console.log('[DB] Using hardcoded Supabase credentials - TEMPORARY FIX');
  
  try {
    // Create the client with our hardcoded credentials
    cachedSupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
      global: {
        headers: {
          cookie: request.headers.get('cookie') || '',
        },
      },
    });
    
    console.log('[DB] Successfully created Supabase client with hardcoded credentials');
    return cachedSupabaseClient;
  } catch (error) {
    console.error('[DB] Error creating Supabase client:', error);
    throw new Error('Failed to create Supabase client even with hardcoded credentials');
  }
  
  // Everything is handled in the try/catch block above
  // This unreachable code is only kept to satisfy TypeScript
  throw new Error('Unreachable code');
}
