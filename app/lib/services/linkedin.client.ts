/**
 * LinkedIn service client functions
 * 
 * Provides client-side functions to fetch and manage LinkedIn profiles.
 * Uses the api() helper from api.client.ts to handle authentication.
 */

import { api } from './api.client';
import type { LinkedInProfile } from '~/lib/stores/linkedin';
import { setLinkedInProfile } from '~/lib/stores/linkedin';

interface ProfileCheckResponse {
  hasProfiles: boolean;
  profiles?: {
    id: string;
    url: string;
    created_at: string;
  }[];
}

/**
 * Checks if the current user has any LinkedIn profiles
 * @returns Promise resolving to profile check response
 */
export async function checkLinkedInProfiles(): Promise<ProfileCheckResponse> {
  try {
    const response = await api('/api/check-linkedin-profile');
    return response;
  } catch (error) {
    console.error('Error checking LinkedIn profiles:', error);
    // Return default response on error
    return { hasProfiles: false };
  }
}

/**
 * Fetches a LinkedIn profile by URL, stores it in the database,
 * and updates the global state.
 * @param profileUrl LinkedIn profile URL to fetch
 * @returns Promise resolving to boolean indicating success
 */
export async function fetchLinkedInProfile(profileUrl: string): Promise<boolean> {
  try {
    // Call the LinkedIn profile fetch API
    const response = await api('/api/linkedin-profile', {
      method: 'POST',
      body: JSON.stringify({ profileUrl }),
    });

    if (response.error) {
      console.error('LinkedIn profile fetch error:', response.error);
      return false;
    }

    // If successful, update the global state
    if (response.data) {
      setLinkedInProfile(response.data);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error fetching LinkedIn profile:', error);
    return false;
  }
}

/**
 * Gets the latest LinkedIn profile for the current user
 * This will fetch from the database and update the store
 * @returns Promise resolving to the profile or null
 */
export async function getLatestLinkedInProfile(): Promise<LinkedInProfile | null> {
  try {
    // First check if the user has any profiles
    const { hasProfiles, profiles } = await checkLinkedInProfiles();
    
    if (!hasProfiles || !profiles || profiles.length === 0) {
      return null;
    }
    
    // Get the latest profile data (first in the array since we sort by created_at desc)
    const latestProfile = profiles[0];
    
    // Fetch the latest version of this profile
    const versionResponse = await api(`/api/linkedin-profile/${latestProfile.id}/latest`);
    
    if (versionResponse.error || !versionResponse.data) {
      console.error('Error fetching latest LinkedIn profile version:', versionResponse.error);
      return null;
    }
    
    // Update the store with the fetched profile
    setLinkedInProfile(versionResponse.data);
    
    return versionResponse.data;
  } catch (error) {
    console.error('Error getting latest LinkedIn profile:', error);
    return null;
  }
}
