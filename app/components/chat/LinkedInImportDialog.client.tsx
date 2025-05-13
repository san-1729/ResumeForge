import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { setLinkedInProfile, type LinkedInProfile } from '~/lib/stores/linkedin';

interface LinkedInImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (profileData: LinkedInProfile) => void;
}

export const LinkedInImportDialog: React.FC<LinkedInImportDialogProps> = ({
  isOpen,
  onClose,
  onImportSuccess
}) => {
  const [profileUrl, setProfileUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleImport = async () => {
    setIsLoading(true);
    setError(null);
    console.log('LinkedIn import started with URL:', profileUrl);
    
    try {
      // Step 1: Fetch LinkedIn profile data
      console.log('Fetching LinkedIn profile data...');
      const fetchResponse = await fetch('/api/linkedin-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profileUrl }),
      });
      
      console.log('Fetch response status:', fetchResponse.status);
      const responseData = await fetchResponse.json() as { data?: LinkedInProfile, error?: string };
      
      if (!fetchResponse.ok) {
        console.error('LinkedIn profile fetch error:', responseData);
        throw new Error(responseData.error || 'Failed to fetch LinkedIn profile');
      }
      
      const profileData = responseData.data as LinkedInProfile;
      console.log('LinkedIn profile fetched successfully:', 
        profileData ? `${profileData.full_name} (${profileData.headline || 'No headline'})` : 'No data'
      );
      
      // Step 2: Save the profile data
      console.log('Saving LinkedIn profile data...');
      const saveResponse = await fetch('/api/save-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });
      
      console.log('Save response status:', saveResponse.status);
      const saveResult = await saveResponse.json() as { success?: boolean, error?: string };
      
      if (!saveResponse.ok) {
        console.error('LinkedIn profile save error:', saveResult);
        throw new Error(saveResult.error || 'Failed to save LinkedIn profile');
      }
      
      console.log('LinkedIn profile saved successfully:', saveResult);
      
      // Step 3: Update the global store
      setLinkedInProfile(profileData);
      
      // Step 4: Notify success and close
      toast.success('LinkedIn profile imported successfully!');
      onImportSuccess(profileData);
      onClose();
      
    } catch (err: any) {
      console.error('LinkedIn import error:', err);
      setError(err.message || 'An error occurred during import');
      toast.error(err.message || 'Failed to import LinkedIn profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative z-10 w-full max-w-md bg-gradient-to-br from-gray-900/90 to-gray-800/95 rounded-xl border border-gray-700/50 shadow-2xl p-6 mx-4">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600/0 via-blue-500/80 to-blue-600/0"></div>
        
        <div className="flex items-center justify-between mb-4">
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
        
        <p className="text-gray-300 mb-4 text-sm">
          Enter your LinkedIn profile URL to import your professional details.
        </p>
        
        <div className="mb-4">
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
          <div className="mb-4 p-3 bg-red-900/30 border border-red-700/50 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}
        
        <div className="flex gap-3 justify-end">
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
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-medium rounded-lg flex items-center disabled:opacity-50 disabled:hover:from-blue-600 disabled:hover:to-blue-700 transition-all"
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
    </div>
  );
}; 