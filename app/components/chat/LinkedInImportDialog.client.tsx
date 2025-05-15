import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { setLinkedInProfile, type LinkedInProfile } from '~/lib/stores/linkedin';

export interface LinkedInImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (profileData: LinkedInProfile) => void;
}

export const LinkedInImportDialog: React.FC<LinkedInImportDialogProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [profileUrl, setProfileUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchedProfile, setFetchedProfile] = useState<LinkedInProfile | null>(null);
  const [currentStep, setCurrentStep] = useState<'input' | 'preview'>('input');

  // Get counts safely
  const experienceCount = fetchedProfile?.experiences?.length || 0;
  const educationCount = fetchedProfile?.education?.length || 0;
  const skillsCount = fetchedProfile?.skills?.length || 0;

  // Reset state when dialog opens/closes
  React.useEffect(() => {
    if (!isOpen) {
      setProfileUrl('');
      setError(null);
      setFetchedProfile(null);
      setCurrentStep('input');
    }
  }, [isOpen]);

  // If dialog is not open, don't render anything
  if (!isOpen) return null;

  const handleImport = async () => {
    console.log('[LinkedIn Import] Process started with URL:', profileUrl);
    setIsLoading(true);
    setError(null);
    
    try {
      // Step 1: Fetch LinkedIn profile data
      console.log('[LinkedIn Import] Sending request to API endpoint...');
      const fetchResponse = await fetch('/api/linkedin-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profileUrl }),
      });
      
      console.log('[LinkedIn Import] Received API response with status:', fetchResponse.status);
      
      const responseData = await fetchResponse.json() as { data?: LinkedInProfile, error?: string };
      console.log('[LinkedIn Import] Parsed API response');
      
      if (!fetchResponse.ok) {
        console.error('[LinkedIn Import] API error:', responseData);
        throw new Error(responseData.error || 'Failed to fetch LinkedIn profile');
      }
      
      const profileData = responseData.data as LinkedInProfile;
      console.log('[LinkedIn Import] Profile data successfully retrieved:', 
        profileData ? {
          name: profileData.full_name,
          headline: profileData.headline,
          experienceCount: profileData.experiences?.length,
          educationCount: profileData.education?.length,
          skillsCount: profileData.skills?.length
        } : 'No data'
      );
      
      // Step 2: Save the profile data
      console.log('[LinkedIn Import] Saving profile to server storage...');
      const saveResponse = await fetch('/api/save-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });
      
      console.log('[LinkedIn Import] Save response status:', saveResponse.status);
      const saveResult = await saveResponse.json() as { success?: boolean, error?: string, profileId?: string };
      
      if (!saveResponse.ok) {
        console.error('[LinkedIn Import] Profile save error:', saveResult);
        throw new Error(saveResult.error || 'Failed to save LinkedIn profile');
      }
      
      console.log('[LinkedIn Import] Profile saved successfully with ID:', saveResult.profileId);
      
      // Step 3: Update the global store
      console.log('[LinkedIn Import] Updating global state with LinkedIn data...');
      setLinkedInProfile(profileData);
      
      // Step 4: Show profile data preview
      console.log('[LinkedIn Import] Showing profile data preview');
      setFetchedProfile(profileData);
      setCurrentStep('preview');
      toast.success('LinkedIn profile imported successfully!');
      
    } catch (err: any) {
      console.error('[LinkedIn Import] Error during import process:', err);
      console.error('[LinkedIn Import] Error stack:', err.stack);
      
      // Check for specific API key related errors
      if (err.message?.includes('API authentication failed') || err.message?.includes('403')) {
        setError('API key error: The LinkedIn import feature is currently unavailable due to API key limitations. Please try again later.');
        toast.error('LinkedIn API service unavailable');
      } else {
        // Set generic error message
        setError(err.message || 'An error occurred during import');
        toast.error('Failed to import LinkedIn profile');
      }
      
      setIsLoading(false);
    } finally {
      console.log('[LinkedIn Import] Import process finished');
    }
  };
  
  const handleComplete = () => {
    console.log('[LinkedIn Import] Import process complete, notifying UI');
    if (fetchedProfile) {
      onSuccess(fetchedProfile);
    }
    onClose();
  };
  
  // Format date from LinkedIn format
  const formatDate = (dateObj?: { year?: number, month?: number } | null) => {
    if (!dateObj) return 'Present';
    const { year, month } = dateObj;
    if (!year) return '';
    const monthName = month ? new Date(2000, month - 1, 1).toLocaleString('default', { month: 'short' }) : '';
    return monthName ? `${monthName} ${year}` : `${year}`;
  };

  const renderProgressSteps = () => (
    <div className="flex items-center mb-6 pt-1">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'input' ? 'bg-blue-600 text-white' : 'bg-blue-600/20 text-blue-400'}`}>
        1
      </div>
      <div className={`h-1 flex-1 mx-2 ${currentStep === 'input' ? 'bg-gray-700' : 'bg-blue-600/70'}`}></div>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'preview' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
        2
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative z-10 w-full max-w-lg bg-gradient-to-br from-gray-900/90 to-gray-800/95 rounded-xl border border-gray-700/50 shadow-2xl p-6 mx-4 max-h-[90vh] overflow-y-auto">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600/0 via-blue-500/80 to-blue-600/0"></div>
        
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold text-white flex items-center">
            <div className="i-ph:linkedin-logo-fill text-[#0077B5] mr-2 text-2xl"></div>
            Import LinkedIn Profile
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <div className="i-ph:x-circle text-xl"></div>
          </button>
        </div>
        
        {renderProgressSteps()}
        
        {currentStep === 'input' ? (
          <div className="space-y-4">
            <p className="text-gray-300 text-sm">
              Enter your LinkedIn profile URL to import your professional details. We'll use this data to create a personalized resume.
            </p>
            
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
              <label htmlFor="linkedin-url" className="block text-sm font-medium text-gray-300 mb-1">
                LinkedIn Profile URL
              </label>
              <input
                id="linkedin-url"
                type="url"
                placeholder="https://www.linkedin.com/in/yourprofile/"
                value={profileUrl}
                onChange={(e) => setProfileUrl(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800/60 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-500"
                disabled={isLoading}
              />
              <p className="mt-1 text-xs text-gray-500">
                Example: https://www.linkedin.com/in/john-doe/
              </p>
            </div>
            
            {error && (
              <div className="p-3 bg-red-900/30 border border-red-700/50 rounded-lg text-red-200 text-sm">
                <div className="flex items-start">
                  <div className="i-ph:warning-circle-fill text-red-400 mr-2 text-lg flex-shrink-0 mt-0.5"></div>
                  <div>{error}</div>
                </div>
              </div>
            )}
            
            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={!profileUrl.includes('linkedin.com/in/') || isLoading}
                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-medium rounded-lg flex items-center disabled:opacity-50 disabled:hover:from-blue-600 disabled:hover:to-blue-700 transition-all"
              >
                {isLoading ? (
                  <>
                    <div className="i-svg-spinners:90-ring-with-bg text-white mr-2"></div>
                    Importing...
                  </>
                ) : (
                  <>
                    <div className="i-ph:arrow-down-bold mr-2"></div>
                    Import Profile
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Header card with profile info */}
            <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
              <div className="flex items-start">
                {fetchedProfile?.profile_pic_url ? (
                  <img 
                    src={fetchedProfile.profile_pic_url} 
                    alt={fetchedProfile.full_name || 'Profile'} 
                    className="w-20 h-20 rounded-full mr-5 object-cover bg-gray-700 border-2 border-blue-500/20"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full mr-5 bg-gray-700 flex items-center justify-center text-2xl text-gray-500 border-2 border-blue-500/20">
                    {fetchedProfile?.full_name?.charAt(0) || '?'}
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-white mb-1">{fetchedProfile?.full_name || 'Unknown'}</h4>
                  <p className="text-blue-300 font-medium">{fetchedProfile?.headline || ''}</p>
                  <div className="flex items-center mt-2 text-gray-400 text-sm">
                    <div className="i-ph:map-pin mr-1.5"></div>
                    <span>{fetchedProfile?.country_full_name || fetchedProfile?.city || 'Location not specified'}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Summary section */}
            {fetchedProfile?.summary && (
              <div className="bg-gray-800/30 rounded-xl p-5 border border-gray-700/40">
                <h5 className="text-sm uppercase tracking-wider font-semibold text-blue-400/90 mb-3 flex items-center">
                  <div className="i-ph:note text-lg mr-2"></div>
                  Summary
                </h5>
                <p className="text-sm text-gray-300 leading-relaxed">{fetchedProfile.summary}</p>
              </div>
            )}
            
            {/* Experience section */}
            {fetchedProfile?.experiences && fetchedProfile.experiences.length > 0 && (
              <div className="bg-gray-800/30 rounded-xl p-5 border border-gray-700/40">
                <h5 className="text-sm uppercase tracking-wider font-semibold text-blue-400/90 mb-3 flex items-center">
                  <div className="i-ph:briefcase text-lg mr-2"></div>
                  Experience <span className="ml-2 text-xs bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded-full">({experienceCount})</span>
                </h5>
                <div className="space-y-4">
                  {fetchedProfile.experiences.slice(0, 3).map((exp, idx) => (
                    <div key={idx} className="relative pl-6 pb-2">
                      {idx < fetchedProfile.experiences.length - 1 && idx < 2 && (
                        <div className="absolute left-[0.55rem] top-[1.75rem] bottom-0 w-0.5 bg-gray-700/50"></div>
                      )}
                      <div className="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-blue-600/70 border border-blue-400/30"></div>
                      <div>
                        <h6 className="font-semibold text-white">{exp.title || 'Unknown Role'}</h6>
                        <p className="text-blue-400/90 font-medium">{exp.company || 'Unknown Company'}</p>
                        <p className="text-gray-400 text-sm mt-1 flex items-center">
                          <div className="i-ph:calendar-blank text-base mr-1.5"></div>
                          {formatDate(exp.starts_at)} - {formatDate(exp.ends_at)}
                          {exp.location && (
                            <>
                              <span className="mx-2">•</span>
                              <div className="i-ph:map-pin text-base mr-1.5"></div>
                              {exp.location}
                            </>
                          )}
                        </p>
                        {exp.description && (
                          <p className="text-sm text-gray-300 mt-1.5 line-clamp-2">{exp.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                                     {experienceCount > 3 && (
                     <p className="text-xs text-blue-400 bg-blue-900/20 inline-block px-3 py-1.5 rounded-full mt-1">
                       + {experienceCount - 3} more experiences
                     </p>
                   )}
                </div>
              </div>
            )}
            
            {/* Education section */}
            {fetchedProfile?.education && fetchedProfile.education.length > 0 && (
              <div className="bg-gray-800/30 rounded-xl p-5 border border-gray-700/40">
                <h5 className="text-sm uppercase tracking-wider font-semibold text-blue-400/90 mb-3 flex items-center">
                  <div className="i-ph:graduation-cap text-lg mr-2"></div>
                  Education <span className="ml-2 text-xs bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded-full">({educationCount})</span>
                </h5>
                <div className="space-y-4">
                  {fetchedProfile.education.slice(0, 2).map((edu, idx) => (
                    <div key={idx} className="relative pl-6 pb-2">
                      {idx < fetchedProfile.education.length - 1 && idx < 1 && (
                        <div className="absolute left-[0.55rem] top-[1.75rem] bottom-0 w-0.5 bg-gray-700/50"></div>
                      )}
                      <div className="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-blue-600/70 border border-blue-400/30"></div>
                      <div>
                        <h6 className="font-semibold text-white">{edu.school || 'Unknown Institution'}</h6>
                        <p className="text-blue-400/90">{edu.degree_name || ''} {edu.field_of_study || ''}</p>
                        <p className="text-gray-400 text-sm mt-1 flex items-center">
                          <div className="i-ph:calendar-blank text-base mr-1.5"></div>
                          {formatDate(edu.starts_at)} - {formatDate(edu.ends_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {educationCount > 2 && (
                    <p className="text-xs text-blue-400 bg-blue-900/20 inline-block px-3 py-1.5 rounded-full mt-1">
                      + {educationCount - 2} more education entries
                    </p>
                  )}
                </div>
              </div>
            )}
            
            {/* Skills section */}
            {fetchedProfile?.skills && fetchedProfile.skills.length > 0 && (
              <div className="bg-gray-800/30 rounded-xl p-5 border border-gray-700/40">
                <h5 className="text-sm uppercase tracking-wider font-semibold text-blue-400/90 mb-3 flex items-center">
                  <div className="i-ph:lightning text-lg mr-2"></div>
                  Skills <span className="ml-2 text-xs bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded-full">({skillsCount})</span>
                </h5>
                <div className="flex flex-wrap gap-2">
                  {fetchedProfile.skills.slice(0, 10).map((skill, idx) => (
                    <span key={idx} className="text-sm px-3 py-1.5 rounded-full bg-blue-900/20 text-blue-300 border border-blue-700/30 hover:bg-blue-900/40 transition-colors">
                      {skill}
                    </span>
                  ))}
                  {skillsCount > 10 && (
                    <span className="text-sm px-3 py-1.5 rounded-full bg-gray-800/80 text-gray-400 border border-gray-700/30">
                      +{skillsCount - 10} more
                    </span>
                  )}
                </div>
              </div>
            )}
            
            {/* Action buttons */}
            <div className="flex gap-3 justify-between pt-2 border-t border-gray-700/50 mt-2">
              <button
                onClick={() => setCurrentStep('input')}
                className="px-4 py-2 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors flex items-center"
              >
                <div className="i-ph:arrow-left mr-1.5"></div>
                Back
              </button>
              <button
                onClick={handleComplete}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-medium rounded-lg flex items-center"
              >
                Continue with Profile
                <div className="i-ph:arrow-right ml-2"></div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 