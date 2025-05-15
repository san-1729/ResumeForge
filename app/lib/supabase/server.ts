import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { AppLoadContext } from '@remix-run/cloudflare';

interface ServerSupabaseClientOptions {
  request: Request;
  response: Response;
  context: AppLoadContext;
}

/**
 * Creates a Supabase client for server-side usage in Remix actions and loaders
 */
export function createServerSupabaseClient({ request, response, context }: ServerSupabaseClientOptions): SupabaseClient {
  const supabaseUrl = context.SUPABASE_URL as string;
  const supabaseAnonKey = context.SUPABASE_ANON_KEY as string;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
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
