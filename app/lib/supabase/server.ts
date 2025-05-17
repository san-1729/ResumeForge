import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { AppLoadContext } from '@remix-run/node';

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
  console.log('🔵 [DB] Initializing Supabase connection');
  
  // Multiple fallback strategies for getting environment variables
  // 1. Try from context first (standard Remix approach)
  let supabaseUrl = context?.SUPABASE_URL as string;
  let supabaseAnonKey = context?.SUPABASE_ANON_KEY as string;
  
  // 2. Try from process.env directly if not in context
  if (!supabaseUrl) supabaseUrl = process.env.SUPABASE_URL as string;
  if (!supabaseAnonKey) supabaseAnonKey = process.env.SUPABASE_ANON_KEY as string;
  
  // More detailed logging about the environment
  console.log(`[DB DEBUG] NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`[DB DEBUG] All available environment variables: ${Object.keys(process.env).join(', ')}`);
  console.log(`[DB DEBUG] SUPABASE_URL found: ${!!supabaseUrl}`);
  console.log(`[DB DEBUG] SUPABASE_ANON_KEY found: ${!!supabaseAnonKey}`);
  
  // Log the actual context object structure
  console.log(`[DB DEBUG] Context keys: ${Object.keys(context || {}).join(', ')}`);
  console.log(`[DB DEBUG] Context has SUPABASE_URL: ${context && 'SUPABASE_URL' in context}`);
  console.log(`[DB DEBUG] Context has SUPABASE_ANON_KEY: ${context && 'SUPABASE_ANON_KEY' in context}`);
  
  // 3. If still not found, try to return a mock or fallback client
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ [DB] Error initializing database connection: Missing Supabase environment variables (SUPABASE_URL and SUPABASE_ANON_KEY)');
    
    // Instead of throwing an error, return a mock client that won't crash the app
    // This is just for development/testing - in production you should set the env vars
    if (process.env.NODE_ENV !== 'production') {
      console.warn('⚠️ [DB] Using mock Supabase client for development - features requiring Supabase will not work');
      return createMockSupabaseClient();
    }
    
    // In production, still throw but with more information
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
