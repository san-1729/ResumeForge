/**
 * LinkedIn profiles API endpoint
 * Route: /api/list-linkedin-profiles
 */

// Use CloudflarePages module for compatibility but will work on Vercel as well
import { json } from '@remix-run/cloudflare';
import type { LoaderFunction, TypedResponse } from '@remix-run/cloudflare';

import { requireUser } from '~/lib/auth.server';
import { db } from '~/lib/db.server';

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
 * API endpoint to list LinkedIn profiles for the authenticated user
 */
export async function loader({ request }: RequestContext): Promise<TypedResponse<LinkedInProfile[]>> {
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
    
    return json(profiles);
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
// Specify proper user type from Supabase
async function loadLinkedInProfiles(user: { id: string }): Promise<LinkedInProfile[]> {
  try {
    console.log(`🔍 [LinkedIn API] Querying LinkedIn profiles for user ${user.id}`);
    
    // Use our Supabase-based adapter
    const profiles = await db.select({
      table: 'linkedin_profiles',
      fields: {
        id: 'id',
        createdAt: 'created_at',
        profileUrl: 'url'
      },
      where: {
        'linkedin_profiles.user_id': user.id
      }
    });
    
    console.log(`✅ [LinkedIn API] Found ${profiles.length} LinkedIn profiles for user`);
    
    return profiles.map((profile: any) => ({
      id: profile.id,
      createdAt: typeof profile.createdAt === 'string' ? profile.createdAt : new Date(profile.createdAt).toISOString(),
      profileUrl: profile.profileUrl,
    }));
  } catch (error) {
    console.error('❌ [LinkedIn API] Error fetching LinkedIn profiles from database:', error);
    throw new Error('Failed to load LinkedIn profiles: ' + String(error));
  }
}

// No runtime JavaScript for API endpoint
export const config = { unstable_runtimeJS: false };

