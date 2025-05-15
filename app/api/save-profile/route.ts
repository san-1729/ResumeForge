import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import type { LinkedInProfile } from '~/lib/stores/linkedin';

// Since this is a demo, we'll save data to a JSON file
// In a real app, you would use a proper database
const PROFILES_DIR = join(process.cwd(), 'data', 'profiles');

// Use a simple in-memory cache instead of global variable
const profileCache: Record<string, any> = {};

export async function POST(request: Request) {
  console.log('[Save Profile API] API endpoint called');
  try {
    const profileData = await request.json() as LinkedInProfile;
    console.log('[Save Profile API] Received profile data for user:', profileData.full_name);
    console.log('[Save Profile API] Profile data size:', JSON.stringify(profileData).length, 'bytes');
    
    // Ensure directory exists
    if (!existsSync(PROFILES_DIR)) {
      console.log('[Save Profile API] Creating profiles directory at:', PROFILES_DIR);
      mkdirSync(PROFILES_DIR, { recursive: true });
    } else {
      console.log('[Save Profile API] Using existing profiles directory at:', PROFILES_DIR);
    }
    
    // Generate a unique ID for the profile
    const profileId = `linkedin_${Date.now()}`;
    const filePath = join(PROFILES_DIR, `${profileId}.json`);
    
    console.log('[Save Profile API] Saving profile data to file path:', filePath);
    try {
      writeFileSync(filePath, JSON.stringify(profileData, null, 2));
      console.log('[Save Profile API] File successfully written');
    } catch (fileError) {
      console.error('[Save Profile API] Error writing file:', fileError);
      throw new Error(`Failed to write profile data to file: ${(fileError as Error).message}`);
    }
    
    // Store in a local cache so we can access it
    // In a real app, you would use a database or state management
    profileCache[profileId] = profileData;
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
    
    return Response.json({ 
      success: true,
      message: 'Profile data saved successfully',
      profileId
    });
  } catch (error: any) {
    console.error('[Save Profile API] Error saving profile data:', error);
    console.error('[Save Profile API] Error stack:', error.stack);
    return Response.json(
      { error: 'Failed to save profile data', message: error.message },
      { status: 500 }
    );
  }
} 