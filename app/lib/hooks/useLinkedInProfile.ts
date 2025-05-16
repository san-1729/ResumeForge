/**
 * React hook for working with LinkedIn profiles in frontend components
 */

import { useEffect, useState } from 'react';
import { useStore } from '@nanostores/react';
import { linkedInStore } from '~/lib/stores/linkedin';
import { checkLinkedInProfiles, getLatestLinkedInProfile } from '~/lib/services/linkedin.client';

export function useLinkedInProfile() {
  const linkedInState = useStore(linkedInStore);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Check for LinkedIn profile on hook init
  useEffect(() => {
    // Only fetch if we don't already have profile data in the store
    if (!linkedInState.isImported && !linkedInState.profileData && !loading) {
      loadLatestProfile();
    }
  }, []);
  
  // Function to load the latest profile data
  const loadLatestProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First check if the user has any profiles
      const { hasProfiles } = await checkLinkedInProfiles();
      
      if (hasProfiles) {
        // If profiles exist, get the latest one
        await getLatestLinkedInProfile();
      }
    } catch (err: any) {
      console.error('Error loading LinkedIn profile:', err);
      setError(err.message || 'Failed to load LinkedIn profile');
    } finally {
      setLoading(false);
    }
  };
  
  return {
    profile: linkedInState.profileData,
    isImported: linkedInState.isImported,
    loading,
    error,
    loadLatestProfile,
  };
}
