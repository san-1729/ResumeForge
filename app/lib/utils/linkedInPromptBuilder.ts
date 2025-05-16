/**
 * LinkedIn Profile Prompt Builder
 * Fetches LinkedIn profile data and generates dynamic prompts
 */

import { formatLinkedInDataForPrompt, type LinkedInProfile } from '~/lib/stores/linkedin';

/**
 * Function to fetch all LinkedIn profiles for the authenticated user
 */
export async function fetchUserLinkedInProfiles(): Promise<Array<{id: string, profileUrl: string, createdAt: string}>> {
  console.log('🔄 Fetching LinkedIn profiles for user...');
  
  try {
    const response = await fetch('/api/list-linkedin-profiles', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Include auth header if needed
        ...(localStorage.getItem('supabase.auth.token') && {
          'Authorization': `Bearer ${JSON.parse(localStorage.getItem('supabase.auth.token') || '{}').access_token}`
        })
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch profiles: ${response.statusText}`);
    }
    
    const profiles = await response.json();
    console.log(`✅ Found ${profiles.length} LinkedIn profiles`);
    return profiles;
  } catch (error) {
    console.error('❌ Error fetching LinkedIn profiles:', error);
    throw error;
  }
}

/**
 * Function to fetch a specific LinkedIn profile's latest version
 */
export async function fetchLinkedInProfileData(profileId: string): Promise<LinkedInProfile> {
  console.log(`🔄 Fetching details for LinkedIn profile ID: ${profileId}`);
  
  try {
    const response = await fetch(`/api/linkedin-profile/${profileId}/latest`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Include auth header if needed
        ...(localStorage.getItem('supabase.auth.token') && {
          'Authorization': `Bearer ${JSON.parse(localStorage.getItem('supabase.auth.token') || '{}').access_token}`
        })
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch profile details: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log(`✅ Successfully fetched LinkedIn profile data for: ${result.data?.full_name || 'Unknown'}`);
    return result.data;
  } catch (error) {
    console.error('❌ Error fetching LinkedIn profile details:', error);
    throw error;
  }
}

/**
 * Function that builds a dynamic prompt using the latest LinkedIn profile data
 * This function:
 * 1. Fetches all profiles for the user
 * 2. If a profileId is provided, fetches that specific profile 
 * 3. Otherwise, fetches the most recent profile
 * 4. Formats the data for consumption by the AI
 */
export async function buildLinkedInProfilePrompt(profileId?: string): Promise<string> {
  try {
    // Step 1: Fetch all profiles
    const profiles = await fetchUserLinkedInProfiles();
    
    if (profiles.length === 0) {
      console.log('⚠️ No LinkedIn profiles found for the user');
      return '';
    }
    
    // Step 2: Determine which profile to use
    let targetProfileId = profileId;
    
    if (!targetProfileId) {
      // Sort by date (newest first) and pick the first one
      const sortedProfiles = [...profiles].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      targetProfileId = sortedProfiles[0].id;
      console.log(`📌 Using most recent LinkedIn profile: ${targetProfileId}`);
    }
    
    // Step 3: Fetch the profile data
    const profileData = await fetchLinkedInProfileData(targetProfileId);
    
    // Step 4: Format the data for the AI
    const formattedPrompt = formatLinkedInDataForPrompt(profileData);
    
    return `
    # LinkedIn Profile Data for Resume Generation
    
    I want to create a professional resume based on my LinkedIn profile.
    Please use the information below to generate a comprehensive, well-formatted resume.
    
    ${formattedPrompt}
    
    Please create a resume that:
    1. Highlights my most relevant skills and experiences
    2. Uses modern, professional formatting
    3. Quantifies achievements where possible
    4. Is optimized for ATS systems
    5. Creates compelling bullet points that demonstrate impact
    
    Focus particularly on my role at ${profileData.experiences?.[0]?.company || 'my most recent company'}.
    `;
  } catch (error) {
    console.error('❌ Error building LinkedIn profile prompt:', error);
    return '';
  }
}
