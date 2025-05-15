import { createClient } from '@supabase/supabase-js';

// Create a single supabase client for server-side usage
export const createSupabaseClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL!;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
  
  return createClient(supabaseUrl, supabaseAnonKey);
};
