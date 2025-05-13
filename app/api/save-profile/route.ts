import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import type { LinkedInProfile } from '~/lib/stores/linkedin';

// Since this is a demo, we'll save data to a JSON file
// In a real app, you would use a proper database
const PROFILES_DIR = join(process.cwd(), 'data', 'profiles');

// Use a simple in-memory cache instead of global variable
const profileCache: Record<string, any> = {};

export async function POST(request: Request) {
  console.log('Save Profile API called');
  try {
    const profileData = await request.json() as LinkedInProfile;
    console.log('Received profile data for saving');
    
    // Ensure directory exists
    if (!existsSync(PROFILES_DIR)) {
      console.log('Creating profiles directory');
      mkdirSync(PROFILES_DIR, { recursive: true });
    }
    
    // Generate a unique ID for the profile
    const profileId = `linkedin_${Date.now()}`;
    const filePath = join(PROFILES_DIR, `${profileId}.json`);
    
    console.log(`Saving profile data to ${filePath}`);
    writeFileSync(filePath, JSON.stringify(profileData, null, 2));
    
    // Store in a local cache so we can access it
    // In a real app, you would use a database or state management
    profileCache[profileId] = profileData;
    
    console.log('Profile data saved successfully');
    
    return Response.json({ 
      success: true,
      message: 'Profile data saved successfully',
      profileId
    });
  } catch (error: any) {
    console.error('Error saving profile data:', error);
    return Response.json(
      { error: 'Failed to save profile data', message: error.message },
      { status: 500 }
    );
  }
} 