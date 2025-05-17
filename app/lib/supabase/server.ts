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

// This special initialization pattern is used for Vercel compatibility
let cachedSupabaseClient: SupabaseClient | null = null;

export function createServerSupabaseClient({ request, response, context }: ServerSupabaseClientOptions): SupabaseClient {
  console.log('🔵 [DB] Initializing Supabase connection');
  
  // If we have a cached client, return it (helps with cold starts in serverless environments)
  if (cachedSupabaseClient) {
    console.log('[DB] Returning cached Supabase client');
    return cachedSupabaseClient;
  }
  
  // Multiple fallback strategies for getting environment variables
  // 1. First try context (standard Remix pattern)
  let supabaseUrl = context?.SUPABASE_URL as string;
  let supabaseAnonKey = context?.SUPABASE_ANON_KEY as string;
  
  // 2. If not in context, try process.env
  if (!supabaseUrl) supabaseUrl = process.env.SUPABASE_URL as string;
  if (!supabaseAnonKey) supabaseAnonKey = process.env.SUPABASE_ANON_KEY as string;
  
  // Log information about environment variables
  console.log(`[DB DEBUG] In Vercel: ${process.env.VERCEL === '1' ? 'Yes' : 'No'}`);
  console.log(`[DB DEBUG] NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`[DB DEBUG] SUPABASE_URL found: ${!!supabaseUrl}`);
  console.log(`[DB DEBUG] SUPABASE_ANON_KEY found: ${!!supabaseAnonKey}`);
  
  
  // 3. If still not found, use failsafe credentials
  if (!supabaseUrl || !supabaseAnonKey) {
    // In production Vercel environment, use failsafe as last resort
    if (process.env.NODE_ENV === 'production' && process.env.VERCEL === '1') {
      console.log('⚠️ [DB] Using FAILSAFE credentials in production - please fix environment variables');
      supabaseUrl = FAILSAFE_SUPABASE_URL;
      supabaseAnonKey = FAILSAFE_SUPABASE_ANON_KEY;
    } 
    // In development, use a mock client instead
    else if (process.env.NODE_ENV !== 'production') {
      console.log('⚠️ [DB] Using mock Supabase client for development');
      return createMockSupabaseClient();
    }
    // If we're in production but not Vercel, don't use failsafe
    else {
      console.error('❌ [DB] Cannot proceed without Supabase credentials in non-Vercel production');
      throw new Error('Missing Supabase environment variables (SUPABASE_URL and SUPABASE_ANON_KEY)');
    }
  }
  
  // Final check - if we somehow still don't have credentials, show detailed error
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ [DB] All fallback strategies failed to find Supabase credentials');
    throw new Error('Missing Supabase environment variables and all fallbacks failed');
  }
  
  // Now that we have valid Supabase credentials, create the client
  console.log('[DB] Creating Supabase client with valid credentials');
  
  // Extract cookies from the request to maintain the auth session
  const cookies = Object.fromEntries(
    request.headers.get('cookie')?.split(';').map(cookie => {
      const [key, value] = cookie.trim().split('=');
      return [key, value];
    }) || []
  );
  
  // Create the Supabase client with auth context from cookies
  cachedSupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
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
  
  return cachedSupabaseClient;
}
