import React, { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { linkedInStore, setLinkedInProfile, type LinkedInProfile } from '~/lib/stores/linkedin';
import { toast } from 'react-toastify';
import { createSupabaseClient } from '~/lib/supabase/client.client';

interface LinkedInProfileSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileSelect: (profileData: LinkedInProfile) => void;
}

interface ProfileListItem {
  id: string;
  name?: string;
  headline?: string;
  current_company?: string;
  profileUrl?: string;
  createdAt: string;
  versionCreatedAt: string;
}

export const LinkedInProfileSelector: React.FC<LinkedInProfileSelectorProps> = ({
  isOpen,
  onClose,
  onProfileSelect
}) => {
  const [profiles, setProfiles] = useState<ProfileListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);

  // Fetch profiles when dialog opens
  useEffect(() => {
    if (isOpen) {
      fetchProfiles();
    }
  }, [isOpen]);

  // If dialog is not open, don't render anything
  if (!isOpen) return null;

  const fetchProfiles = async () => {
    console.log('🔵 [LinkedIn Selector] Fetching saved profiles');
    setIsLoading(true);
    setError(null);
    
    try {
      // Get authentication token from Supabase
      const supabase = createSupabaseClient();
      if (!supabase) {
        throw new Error('Could not initialize Supabase client');
      }
      
      const { data: authData } = await supabase.auth.getSession();
      const token = authData.session?.access_token;
      
      if (!token) {
        throw new Error('Not authenticated');
      }
      
      console.log('🔵 [LinkedIn Selector] Using auth token for API request');
      
      const response = await fetch('/api/list-linkedin-profiles', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Parse JSON response only once
      const data = await response.json() as { profiles?: any[], count?: number, error?: string };
      
      if (!response.ok) {
        throw new Error(data?.error || `Failed to load profiles: ${response.status}`);
      }
      console.log('🔵 [LinkedIn Selector] Raw API response:', data);
      
      if (!data || !data.profiles) {
        console.error('❌ [LinkedIn Selector] Invalid response format:', data);
        throw new Error('Invalid response format from API');
      }
      
      // Transform API data into our expected format
      const formattedProfiles = data.profiles.map(profile => ({
        id: profile.id,
        name: profile.fullName || 'LinkedIn Profile',  // Try to extract name from URL if not provided
        headline: profile.headline || (profile.profileUrl ? `Profile from ${profile.profileUrl.split('/').pop()}` : undefined),
        current_company: profile.currentCompany,
        profileUrl: profile.profileUrl || profile.url,
        createdAt: profile.createdAt || new Date().toISOString(),
        versionCreatedAt: profile.updatedAt || profile.createdAt || new Date().toISOString()
      }));
      
      console.log(`✅ [LinkedIn Selector] Loaded ${formattedProfiles.length} profiles:`, formattedProfiles);
      setProfiles(formattedProfiles);
    } catch (err: any) {
      console.error('❌ [LinkedIn Selector] Error loading profiles:', err);
      setError(err.message || 'Failed to load LinkedIn profiles');
      toast.error('Could not load LinkedIn profiles');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileSelect = async (profileId: string) => {
    console.log(`🔵 [LinkedIn Selector] Selected profile: ${profileId}`);
    setSelectedProfileId(profileId);
    
    try {
      // Get authentication token from Supabase
      const supabase = createSupabaseClient();
      if (!supabase) {
        throw new Error('Could not initialize Supabase client');
      }
      
      const { data: authData } = await supabase.auth.getSession();
      const token = authData.session?.access_token;
      
      if (!token) {
        throw new Error('Not authenticated');
      }
      
      console.log(`🔵 [LinkedIn Selector] Fetching profile detail from /api/linkedin-profile/${profileId}/latest`);
      const response = await fetch(`/api/linkedin-profile/${profileId}/latest`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ [LinkedIn Selector] API error (${response.status}):`, errorText);
        throw new Error(`Profile not found or unauthorized access (${response.status})`);
      }
      
      const data = await response.json() as { data?: LinkedInProfile | string, error?: string };
      console.log('🔵 [LinkedIn Selector] Raw profile data response:', data);
      
      if (!data.data) {
        throw new Error('Profile data is empty or invalid');
      }
      
      // Parse the profile data if it's a string
      let profileData: LinkedInProfile;
      try {
        profileData = typeof data.data === 'string' 
          ? JSON.parse(data.data) as LinkedInProfile
          : data.data as LinkedInProfile;
      } catch (e) {
        console.error('❌ [LinkedIn Selector] Error parsing profile data:', e);
        throw new Error('Failed to parse profile data');
      }
      
      console.log('✅ [LinkedIn Selector] Profile data parsed successfully:', {
        name: profileData.full_name,
        headline: profileData.headline,
        experiences: profileData.experiences?.length || 0,
        skills: profileData.skills?.length || 0
      });
      
      // Save the profile in the store
      setLinkedInProfile(profileData);
      
      // Call the onProfileSelect callback
      onProfileSelect(profileData);
      
      // Close the dialog
      onClose();
      
      toast.success(`LinkedIn profile for ${profileData.full_name || 'user'} selected`);
    } catch (err: any) {
      console.error('❌ [LinkedIn Selector] Error loading profile data:', err);
      toast.error(`Could not load profile: ${err.message}`);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative z-10 w-full max-w-xl bg-gradient-to-br from-gray-900/90 to-gray-800/95 rounded-xl border border-gray-700/50 shadow-2xl p-6 mx-4 max-h-[90vh] overflow-y-auto">
        {/* Glowing header line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600/0 via-blue-500/80 to-blue-600/0"></div>
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="i-ph:linkedin-logo-fill text-[#0077B5] text-3xl mr-3"></div>
            <div>
              <h3 className="text-xl font-bold text-white">
                Your LinkedIn Profiles
              </h3>
              <p className="text-gray-400 text-sm">Select a profile to use for your resume</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <div className="i-ph:x-circle text-xl"></div>
          </button>
        </div>
        
        {/* Content */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="i-svg-spinners:90-ring-with-bg text-blue-500 text-3xl"></div>
              <span className="ml-3 text-blue-400">Loading profiles...</span>
            </div>
          ) : error ? (
            <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-4 text-red-400">
              <div className="flex items-center">
                <div className="i-ph:warning-circle-fill text-xl"></div>
                <span className="ml-2">{error}</span>
              </div>
              <button 
                onClick={fetchProfiles}
                className="mt-3 px-3 py-1.5 bg-red-900/30 hover:bg-red-900/50 rounded-lg text-sm transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : profiles.length === 0 ? (
            <div className="bg-gray-800/50 rounded-lg p-6 text-center border border-gray-700/50">
              <div className="i-ph:linkedin-logo-fill text-[#0077B5] text-4xl mx-auto mb-3"></div>
              <h4 className="text-gray-300 font-medium mb-2">No LinkedIn Profiles Found</h4>
              <p className="text-gray-400 text-sm mb-4">You haven't imported any LinkedIn profiles yet.</p>
              <button 
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Import New Profile
              </button>
            </div>
          ) : (
            <>
              <div className="text-xs text-gray-400 mb-2">
                {profiles.length} {profiles.length === 1 ? 'profile' : 'profiles'} found
              </div>
              
              <div className="space-y-3">
                {profiles.map((profile) => (
                  <div 
                    key={profile.id}
                    className={`bg-gray-800/50 hover:bg-gray-800/80 border ${
                      selectedProfileId === profile.id 
                        ? 'border-blue-500/50 ring-1 ring-blue-500/30' 
                        : 'border-gray-700/50 hover:border-gray-600/50'
                    } rounded-lg p-4 cursor-pointer transition-all`}
                    onClick={() => handleProfileSelect(profile.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-white flex items-center">
                          {profile.name || 'Unnamed Profile'}
                          {selectedProfileId === profile.id && (
                            <div className="i-ph:check-circle-fill ml-2 text-blue-500"></div>
                          )}
                        </h4>
                        {profile.headline && (
                          <p className="text-gray-300 text-sm">{profile.headline}</p>
                        )}
                        {profile.current_company && (
                          <p className="text-blue-400 text-xs mt-1">{profile.current_company}</p>
                        )}
                        <div className="mt-2 text-xs text-gray-500">
                          <div>Profile URL: {profile.profileUrl || 'N/A'}</div>
                          <div>Last updated: {formatDate(profile.versionCreatedAt)}</div>
                        </div>
                      </div>
                      <button 
                        className="bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 px-3 py-1 rounded-md text-sm transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProfileSelect(profile.id);
                        }}
                      >
                        Use
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 flex justify-between">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-700/50 hover:bg-gray-700/80 text-gray-300 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-blue-900/50 hover:bg-blue-900/80 text-blue-300 rounded-lg transition-colors flex items-center"
                >
                  <div className="i-ph:plus-circle mr-1.5"></div>
                  Import New Profile
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
