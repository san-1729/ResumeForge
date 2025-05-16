/**
 * LinkedIn Profile Indicator Component
 * 
 * Shows a visual indicator when a user has connected their LinkedIn profile
 * Uses the linkedInStore to track profile availability
 */

import { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { linkedInStore, clearLinkedInProfile } from '~/lib/stores/linkedin';
import { checkLinkedInProfiles } from '~/lib/services/linkedin.client';
import { IconButton } from './IconButton';

interface LinkedInProfileIndicatorProps {
  className?: string;
}

export function LinkedInProfileIndicator({ className = '' }: LinkedInProfileIndicatorProps) {
  const { isImported, profileData } = useStore(linkedInStore);
  const [isChecking, setIsChecking] = useState(false);
  const [hasProfiles, setHasProfiles] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [profiles, setProfiles] = useState<any[]>([]);

  // Check for LinkedIn profiles on component mount
  useEffect(() => {
    const checkProfiles = async () => {
      setIsChecking(true);
      try {
        const response = await checkLinkedInProfiles();
        setHasProfiles(response.hasProfiles);
        if (response.profiles) {
          setProfiles(response.profiles);
        }
      } catch (error) {
        console.error('Error checking LinkedIn profiles:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkProfiles();
  }, []);

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    if (hasProfiles && profiles.length > 0) {
      setShowDropdown(!showDropdown);
    }
  };

  // Handle profile removal
  const handleClearProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearLinkedInProfile();
  };

  return (
    <div className={`relative ${className}`}>
      <div 
        className={`
          inline-flex items-center px-2 py-1 border rounded-md cursor-pointer
          ${isImported || hasProfiles ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-300'}
          hover:bg-opacity-80 transition-colors duration-150
        `}
        onClick={toggleDropdown}
        role="button"
        tabIndex={0}
      >
        {/* LinkedIn icon */}
        <svg 
          className="w-4 h-4 mr-1 text-blue-600" 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 448 512"
        >
          <path fill="currentColor" d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z"/>
        </svg>

        {/* Status text */}
        <span className={`text-sm ${isImported || hasProfiles ? 'text-green-700' : 'text-gray-600'}`}>
          {isChecking ? (
            'Checking...'
          ) : isImported || hasProfiles ? (
            'LinkedIn Connected'
          ) : (
            'Connect LinkedIn'
          )}
        </span>

        {/* Checkmark icon when profile is available */}
        {(isImported || hasProfiles) && (
          <svg 
            className="w-4 h-4 ml-1 text-green-500" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
              clipRule="evenodd" 
            />
          </svg>
        )}

        {/* Arrow icon when multiple profiles exist */}
        {hasProfiles && profiles.length > 1 && (
          <svg 
            className={`w-4 h-4 ml-1 text-gray-500 transform transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
              clipRule="evenodd" 
            />
          </svg>
        )}

        {/* Clear profile button */}
        {(isImported || hasProfiles) && (
          <button
            className="ml-1 text-gray-400 hover:text-red-500"
            onClick={handleClearProfile}
            title="Clear LinkedIn profile data"
          >
            <svg 
              className="w-3 h-3" 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
                clipRule="evenodd" 
              />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown for multiple profiles */}
      {showDropdown && hasProfiles && profiles.length > 1 && (
        <div className="absolute z-10 w-64 mt-1 right-0 bg-white border border-gray-200 rounded shadow-lg">
          <div className="p-2 border-b border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700">LinkedIn Profiles</h4>
          </div>
          <ul className="max-h-48 overflow-y-auto">
            {profiles.map((profile) => (
              <li 
                key={profile.id}
                className="px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer flex items-center justify-between"
              >
                <div className="truncate text-blue-600 hover:underline">
                  {profile.url.split('linkedin.com/in/')[1] || profile.url}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(profile.created_at).toLocaleDateString()}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
