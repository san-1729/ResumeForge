import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { AppLoadContext } from '@remix-run/node';
import { getServerEnv } from '../env.server';

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
  
  // First try to get direct from context (Remix pattern) and fallback to process.env
  let supabaseUrl = context?.SUPABASE_URL as string || process.env.SUPABASE_URL;
  let supabaseAnonKey = context?.SUPABASE_ANON_KEY as string || process.env.SUPABASE_ANON_KEY;

  // Enhanced debugging for Vercel environment
  console.log(`[DB DEBUG] In Vercel: ${process.env.VERCEL === '1' ? 'Yes' : 'No'}`);
  console.log(`[DB DEBUG] NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`[DB DEBUG] SUPABASE_URL found: ${!!supabaseUrl}`);
  console.log(`[DB DEBUG] SUPABASE_ANON_KEY found: ${!!supabaseAnonKey}`);
  
  // Check all available environment variables for debugging
  console.log(`[DB DEBUG] ENV KEYS: ${Object.keys(process.env).join(', ')}`);

  // If environment variables are missing, use appropriate fallbacks
  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('⚠️ [DB] Missing required Supabase environment variables');
    
    // For non-production environments, use a mock client to prevent crashes
    if (process.env.NODE_ENV !== 'production') {
      console.log('⚠️ [DB] Using mock Supabase client for development');
      return createMockSupabaseClient();
    }
    
    // In production, we should still error out but with better error messages
    console.error('❌ [DB] Cannot proceed without Supabase credentials in production environment');
    console.error('Please check that SUPABASE_URL and SUPABASE_ANON_KEY are set in Vercel project settings');
    throw new Error('Missing Supabase environment variables (SUPABASE_URL and SUPABASE_ANON_KEY)');
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
