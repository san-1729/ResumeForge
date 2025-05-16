import { useEffect, useState } from 'react';
import { useStore } from '@nanostores/react';
import { linkedInStore, setLinkedInProfile } from '~/lib/stores/linkedin';
import { buildLinkedInProfilePrompt } from '~/lib/utils/linkedInPromptBuilder';

interface LinkedInProfilePromptProps {
  onPromptReady?: (prompt: string) => void;
  profileId?: string; // Optional - if not provided, will use the most recent profile
}

/**
 * Component that dynamically builds a LinkedIn profile prompt
 * and integrates it with the chat interface
 */
export const LinkedInProfilePrompt: React.FC<LinkedInProfilePromptProps> = ({ 
  onPromptReady,
  profileId 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const linkedInState = useStore(linkedInStore);

  useEffect(() => {
    const fetchAndBuildPrompt = async () => {
      if (isLoading) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Build the LinkedIn profile prompt
        const prompt = await buildLinkedInProfilePrompt(profileId);
        
        // If a callback function was provided, call it with the prompt
        if (onPromptReady && prompt) {
          onPromptReady(prompt);
        }
      } catch (err) {
        console.error('Error building LinkedIn profile prompt:', err);
        setError(err instanceof Error ? err.message : 'Failed to build LinkedIn profile prompt');
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch if we don't already have profile data loaded or if a specific profile ID is provided
    if (!linkedInState.isImported || (profileId && linkedInState.profileData?.id !== profileId)) {
      fetchAndBuildPrompt();
    }
  }, [profileId]);
  
  return (
    <>
      {isLoading && (
        <div className="flex items-center text-blue-400 text-sm p-2">
          <div className="i-ph:circle-notch-bold mr-2 animate-spin" />
          Loading LinkedIn profile data...
        </div>
      )}
      
      {error && (
        <div className="bg-red-900/20 border border-red-800/30 text-red-400 p-3 rounded-md text-sm">
          Error: {error}
        </div>
      )}
    </>
  );
};
