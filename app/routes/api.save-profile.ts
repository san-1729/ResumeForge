import type { LinkedInProfile } from '~/lib/stores/linkedin';

// Use a simple in-memory cache for server-side storage
const profileCache = new Map<string, LinkedInProfile>();

export const action = async ({ request }: { request: Request }) => {
  console.log('[Save Profile API] API endpoint called');
  try {
    const profileData = await request.json() as LinkedInProfile;
    console.log('[Save Profile API] Received profile data for user:', profileData.full_name);
    console.log('[Save Profile API] Profile data size:', JSON.stringify(profileData).length, 'bytes');
    
    // Generate a unique ID for the profile
    const profileId = `linkedin_${Date.now()}`;
    
    // Store in memory cache
    profileCache.set(profileId, profileData);
    console.log('[Save Profile API] Profile cached in memory with ID:', profileId);
    
    // Log profile statistics
    console.log('[Save Profile API] Profile statistics:', {
      id: profileId,
      name: profileData.full_name,
      experienceCount: profileData.experiences?.length || 0,
      educationCount: profileData.education?.length || 0,
      skillsCount: profileData.skills?.length || 0,
      fileSizeBytes: JSON.stringify(profileData).length
    });
    
    console.log('[Save Profile API] Profile saved successfully');
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Profile data saved successfully',
        profileId
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('[Save Profile API] Error saving profile data:', error);
    console.error('[Save Profile API] Error stack:', error.stack);
    return new Response(
      JSON.stringify({ error: 'Failed to save profile data', message: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 