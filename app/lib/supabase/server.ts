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

export function createServerSupabaseClient({ request, response, context }: ServerSupabaseClientOptions): SupabaseClient {
  console.log('🔵 [DB] Initializing Supabase connection using centralized env utility');
  
  // Use our centralized environment utility to get Supabase credentials
  const env = getServerEnv();
  const supabaseUrl = env.SUPABASE_URL;
  const supabaseAnonKey = env.SUPABASE_ANON_KEY;
  
  // Enhanced logging for diagnostic purposes
  console.log(`[DB DEBUG] NODE_ENV: ${env.NODE_ENV}`);
  console.log(`[DB DEBUG] SUPABASE_URL found: ${!!supabaseUrl}`);
  console.log(`[DB DEBUG] SUPABASE_ANON_KEY found: ${!!supabaseAnonKey}`);
  
  // If environment variables are missing, use appropriate fallbacks
  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('⚠️ [DB] Missing required Supabase environment variables');
    
    // For non-production environments, use a mock client to prevent crashes
    if (env.NODE_ENV !== 'production') {
      console.log('⚠️ [DB] Using mock Supabase client for development');
      return createMockSupabaseClient();
    }
    
    // In production, we should still error out but with better error messages
    console.error('❌ [DB] Cannot proceed without Supabase credentials in production environment');
    throw new Error('Missing Supabase environment variables (SUPABASE_URL and SUPABASE_ANON_KEY)');
  }
  
  // Extract cookies from the request to maintain the auth session
  const cookies = Object.fromEntries(
    request.headers.get('cookie')?.split(';').map(cookie => {
      const [key, value] = cookie.trim().split('=');
      return [key, value];
    }) || []
  );
  
  // Create the Supabase client with auth context from cookies
  return createClient(supabaseUrl, supabaseAnonKey, {
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
}
