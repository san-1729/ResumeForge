import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { AppLoadContext } from '@remix-run/node';

interface ServerSupabaseClientOptions {
  request: Request;
  response: Response;
  context: AppLoadContext;
}

// IMPORTANT NOTE:
// This file is a replacement for server.ts that uses DIRECT hardcoded credentials
// It's a temporary solution that will be removed once environment variables are working in Vercel
// In a normal situation, we would NEVER hardcode these credentials

// Use Supabase singleton pattern for better performance
let cachedSupabaseClient: SupabaseClient | null = null;

// Hardcoded credentials for immediate use
const DIRECT_SUPABASE_URL = 'https://xlfwyjwlrcwxylzvvcyz.supabase.co';
const DIRECT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsZnd5andscmN3eHlsenZ2Y3l6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMTk1ODYsImV4cCI6MjA2Mjc5NTU4Nn0.4nCgzoaxA--dAm7XVTBwfyciNnVOmMEYfxKFgW5gB3g';

/**
 * Creates a Supabase client with direct hardcoded credentials
 * This is a TEMPORARY solution and will be removed once environment variables are working in Vercel
 */
export function createServerSupabaseClient({ request }: ServerSupabaseClientOptions): SupabaseClient {
  console.log('🔵 [DB] Using DIRECT Supabase client with hardcoded credentials');
  
  // Return cached client if we have one
  if (cachedSupabaseClient) {
    return cachedSupabaseClient;
  }
  
  try {
    // Create the client with direct hardcoded credentials
    cachedSupabaseClient = createClient(DIRECT_SUPABASE_URL, DIRECT_SUPABASE_ANON_KEY, {
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
    
    console.log('✅ [DB] Successfully created direct Supabase client');
    return cachedSupabaseClient;
  } catch (error) {
    console.error('❌ [DB] Error creating direct Supabase client:', error);
    
    // Ultimate fallback - create a dummy client that won't crash
    return {
      auth: {
        getSession: () => ({ data: { session: null }, error: null }),
      },
      from: () => ({
        select: () => ({
          eq: () => Promise.resolve({ data: [], error: null }),
        }),
      }),
    } as unknown as SupabaseClient;
  }
}
