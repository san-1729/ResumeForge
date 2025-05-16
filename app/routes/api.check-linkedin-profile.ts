/**
 * API endpoint to check if a user has LinkedIn profiles
 * 
 * This endpoint:
 * 1. Authenticates the user via Supabase
 * 2. Queries the database for any LinkedIn profiles associated with the user
 * 3. Returns a boolean or profile metadata
 */

import { createClient } from '@supabase/supabase-js';

// Type for response data
interface ProfileCheckResponse {
  hasProfiles: boolean;
  profiles?: {
    id: string;
    url: string;
    created_at: string;
  }[];
}

export const loader = async ({ request, context }: { request: Request; context: any }) => {
  console.log('🔵 [LinkedIn Profile Check API] Request received');

  try {
    // Initialize Supabase client
    const supabaseUrl = process.env.SUPABASE_URL || context?.env?.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || context?.env?.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ [LinkedIn Profile Check API] Missing Supabase credentials');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Authenticate user from request
    // In a real app, you'd extract the session token from request headers
    // and use it to get the user's ID
    // For this example, we'll parse the Authorization header
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('❌ [LinkedIn Profile Check API] No valid authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify the token and get user info
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('❌ [LinkedIn Profile Check API] Authentication failed:', authError?.message || 'No user found');
      return new Response(
        JSON.stringify({ error: 'Authentication failed' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`✅ [LinkedIn Profile Check API] Authenticated user: ${user.id}`);
    
    // Query for LinkedIn profiles associated with this user
    const { data: profiles, error: profileError } = await supabase
      .from('linkedin_profiles')
      .select('id, url, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (profileError) {
      console.error('❌ [LinkedIn Profile Check API] Error querying profiles:', profileError.message);
      return new Response(
        JSON.stringify({ error: 'Database error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Prepare response
    const response: ProfileCheckResponse = {
      hasProfiles: profiles && profiles.length > 0,
    };
    
    // Include profiles if any exist
    if (response.hasProfiles) {
      response.profiles = profiles;
      console.log(`✅ [LinkedIn Profile Check API] Found ${profiles.length} profiles for user ${user.id}`);
    } else {
      console.log(`✅ [LinkedIn Profile Check API] No profiles found for user ${user.id}`);
    }
    
    return new Response(
      JSON.stringify(response),
      { headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error: any) {
    console.error('❌ [LinkedIn Profile Check API] Unhandled error:', error.message);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// The config is needed to avoid shipping unnecessary JavaScript to the client
export const config = { unstable_runtimeJS: false };
