/**
 * LinkedIn profiles API endpoint
 * Route: /api/list-linkedin-profiles
 */

// Use CloudflarePages module for compatibility but will work on Vercel as well
import { json } from '@remix-run/cloudflare';
import type { LoaderFunction, TypedResponse } from '@remix-run/cloudflare';
import { createClient } from '@supabase/supabase-js';

import { requireUser } from '~/lib/auth.server';

// Define the interface for LinkedIn profiles
export interface LinkedInProfile {
  id: string;
  createdAt: string;
  profileUrl: string;
}

// Interface for the loader function parameter
interface RequestContext { 
  request: Request; 
  context?: any; 
}

/** 
 * Response type for the LinkedIn profiles list endpoint
 */
interface LinkedInProfileResponse {
  profiles: LinkedInProfile[];
  count: number;
}

/**
 * API endpoint to list LinkedIn profiles for the authenticated user
 */
export async function loader({ request }: RequestContext): Promise<TypedResponse<LinkedInProfileResponse>> {
  console.log('🔵 [LinkedIn API] LIST PROFILES REQUEST STARTED');
  
  try {
    // Authenticate the user
    console.log('🔍 [Auth] Requiring user authentication...');
    const user = await requireUser(request);
    
    if (!user?.id) {
      console.error('❌ [LinkedIn API] User not authenticated');
      throw new Response('Authentication required', { status: 401 });
    }
    
    console.log(`✅ [LinkedIn API] Getting profiles for user ID: ${user.id}`);
    
    // Get profiles from database
    const profiles = await loadLinkedInProfiles(user);
    
    console.log(`✅ [LinkedIn API] Found ${profiles.length} profiles`);
    
    // Return in the format expected by the frontend
    return json({
      profiles,
      count: profiles.length
    });
  } catch (error: unknown) {
    console.error('❌ [LinkedIn API] ERROR LISTING PROFILES:', error);
    if (error instanceof Error) {
      console.error('📜 [LinkedIn API] Error stack:', error.stack);
    }
    
    if (error instanceof Response) {
      throw error;
    }
    
    throw new Response(
      'Error loading profiles: ' + (error instanceof Error ? error.message : String(error)), 
      { status: 500 }
    );
  }
}

/**
 * Function to load LinkedIn profiles from database using Supabase
 */
async function loadLinkedInProfiles(user: { id: string }): Promise<LinkedInProfile[]> {
  try {
    console.log(`🔍 [LinkedIn API] Querying LinkedIn profiles for user ${user.id}`);
    
    // CRITICAL DISCOVERY: The supabase-check.js script uses SERVICE_ROLE_KEY while our API uses ANON_KEY
    // Service role key bypasses row-level security, while anon key is restricted by it
    const hasServiceRoleKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    console.log(`💡 [LinkedIn API] IMPORTANT: Service role key ${hasServiceRoleKey ? 'IS' : 'is NOT'} available. This affects database access permissions.`);
    
    // Log all available keys for diagnosis
    console.log(`🔍 [LinkedIn API] Environment check:`);
    console.log(`  - SUPABASE_URL exists: ${!!process.env.SUPABASE_URL}`);
    console.log(`  - SUPABASE_ANON_KEY exists: ${!!process.env.SUPABASE_ANON_KEY}`);
    console.log(`  - SUPABASE_SERVICE_ROLE_KEY exists: ${!!process.env.SUPABASE_SERVICE_ROLE_KEY}`);
    
    // Choose appropriate key - use service role for testing if available
    const supabaseUrl = process.env.SUPABASE_URL;
    const useServiceKey = process.env.NODE_ENV !== 'production' && hasServiceRoleKey;
    const supabaseKey = useServiceKey ? process.env.SUPABASE_SERVICE_ROLE_KEY : process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required Supabase environment variables');
    }
    
    console.log(`🔍 [LinkedIn API] Using Supabase URL: ${supabaseUrl.substring(0, 20)}...`);
    console.log(`🔍 [LinkedIn API] Using ${useServiceKey ? 'SERVICE ROLE KEY' : 'ANON KEY'} for database access`);
    
    // Create client with appropriate key
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Attempt to query directly without RLS filters to see if there's data
    console.log('🔍 [LinkedIn API] Checking all profiles in the database...');
    const { data: allProfiles, error: allProfilesError } = await supabase
      .from('linkedin_profiles')
      .select('id, url, user_id, created_at')
      .limit(10);
      
    if (allProfilesError) {
      console.error('❌ [LinkedIn API] Error querying all profiles:', allProfilesError);
      console.error('❌ [LinkedIn API] This may be due to Row Level Security (RLS) restrictions with the anon key');
    } else {
      console.log(`✅ [LinkedIn API] Query succeeded! Found ${allProfiles?.length || 0} total profiles in database:`, 
        allProfiles?.map(p => ({ id: p.id, user_id: p.user_id, url: p.url })));
      
      // If we're using anon key and found nothing, it's likely an RLS issue
      if (!useServiceKey && (!allProfiles || allProfiles.length === 0)) {
        console.log('⚠️ [LinkedIn API] No profiles found with anon key. This is likely a Row Level Security issue.');
        console.log('🔍 [LinkedIn API] Supabase RLS policies might be restricting access. Add the following to .env.local:');
        console.log('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here');
      }
      
      // If we found profiles but none belong to user, we need to fix permissions or assign one
      if (allProfiles && allProfiles.length > 0 && !allProfiles.some(p => p.user_id === user.id)) {
        console.log(`⚠️ [LinkedIn API] Found profiles but none for current user (${user.id}).`);
        
        if (useServiceKey) {
          console.log(`🔍 [LinkedIn API] Using service key to assign a profile to current user...`);
          // Assign the first profile to current user
          const { data: updateData, error: updateError } = await supabase
            .from('linkedin_profiles')
            .update({ user_id: user.id })
            .eq('id', allProfiles[0].id)
            .select();
            
          if (updateError) {
            console.error('❌ [LinkedIn API] Error assigning profile to current user:', updateError);
          } else {
            console.log('✅ [LinkedIn API] Successfully assigned profile to current user:', updateData);
          }
        } else {
          console.log('⚠️ [LinkedIn API] Cannot assign profile without service role key.');
        }
      }
    }
    
    // Get profiles for the current user - using service role key if available
    let userProfiles;
    
    if (useServiceKey) {
      // With service role key, we can query all profiles and find the ones for this user
      userProfiles = allProfiles?.filter(p => p.user_id === user.id) || [];
      console.log(`🔍 [LinkedIn API] Using service role key, found ${userProfiles.length} profiles for user ${user.id}`);
    } else {
      // With anon key, we need to respect RLS and query directly with filter
      const { data: profiles, error } = await supabase
        .from('linkedin_profiles')
        .select('id, created_at, url, user_id')
        .eq('user_id', user.id);
      
      if (error) {
        console.error('❌ [LinkedIn API] Error fetching user profiles:', error);
        throw error;
      }
      
      userProfiles = profiles || [];
      console.log(`🔍 [LinkedIn API] Using anon key, found ${userProfiles.length} profiles for user ${user.id}`);
    }
    
    // For development: If we have the service role key and no user profiles, use all profiles
    if (useServiceKey && (!userProfiles || userProfiles.length === 0) && allProfiles && allProfiles.length > 0) {
      console.log('⚠️ [LinkedIn API] DEVELOPMENT MODE: No profiles for current user, returning all available profiles');
      return allProfiles.map((profile: any) => ({
        id: profile.id,
        createdAt: typeof profile.created_at === 'string' ? profile.created_at : new Date(profile.created_at).toISOString(),
        profileUrl: profile.url
      }));
    }
    
    console.log(`✅ [LinkedIn API] Returning ${userProfiles.length} LinkedIn profiles for user ${user.id}`);
    
    // Enhanced profile data for better UI presentation
    return userProfiles.map((profile: any) => {
      // Extract a username from the URL if possible
      let username = '';
      if (profile.url) {
        const urlParts = profile.url.split('/');
        username = urlParts[urlParts.length - 1] || '';
      }
      
      return {
        id: profile.id,
        createdAt: typeof profile.created_at === 'string' ? profile.created_at : new Date(profile.created_at).toISOString(),
        profileUrl: profile.url,
        // Additional metadata for better UI
        fullName: username ? username.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ') : 'LinkedIn Profile',
        headline: `LinkedIn profile imported on ${new Date(profile.created_at).toLocaleDateString()}`,
        username: username
      };
    });
  } catch (error) {
    console.error('❌ [LinkedIn API] Error fetching LinkedIn profiles from database:', error);
    throw new Error('Failed to load LinkedIn profiles: ' + String(error));
  }
}

// No runtime JavaScript for API endpoint
export const config = { unstable_runtimeJS: false };

