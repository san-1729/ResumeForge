import React, { useState } from 'react';
import { useStore } from '@nanostores/react';
import { linkedInStore, type LinkedInProfile } from '~/lib/stores/linkedin';

interface LinkedInProfileDetailsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LinkedInProfileDetails: React.FC<LinkedInProfileDetailsProps> = ({ isOpen, onClose }) => {
  const linkedInState = useStore(linkedInStore);
  const profile = linkedInState.profileData;
  const [activeTab, setActiveTab] = useState<'experience' | 'education' | 'skills'>('experience');

  if (!isOpen || !profile) return null;

  // Get counts safely
  const experienceCount = profile.experiences?.length || 0;
  const educationCount = profile.education?.length || 0;
  const skillsCount = profile.skills?.length || 0;

  // Format date from LinkedIn format
  const formatProfileDate = (dateObj?: { year?: number, month?: number } | null) => {
    if (!dateObj) return 'Present';
    const { year, month } = dateObj;
    if (!year) return '';
    const monthName = month ? new Date(2000, month - 1, 1).toLocaleString('default', { month: 'short' }) : '';
    return monthName ? `${monthName} ${year}` : `${year}`;
  };

  const TabButton = ({ name, active, count }: { name: string, active: boolean, count: number }) => (
    <button
      className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
        active ? 'bg-blue-600/20 text-blue-400 border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-300'
      }`}
      onClick={() => setActiveTab(name.toLowerCase() as any)}
    >
      {name} ({count})
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative z-10 w-full max-w-2xl bg-gradient-to-br from-gray-900/90 to-gray-800/95 rounded-xl border border-gray-700/50 shadow-2xl p-6 mx-4 max-h-[90vh] overflow-y-auto">
        {/* Glowing header line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600/0 via-blue-500/80 to-blue-600/0"></div>
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="i-ph:linkedin-logo-fill text-[#0077B5] text-3xl mr-3"></div>
            <div>
              <h3 className="text-xl font-bold text-white">
                {profile.full_name || 'LinkedIn Profile'}
              </h3>
              <p className="text-gray-400 text-sm">{profile.headline || 'Profile Details'}</p>
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
        
        {/* Profile summary */}
        <div className="bg-gray-800/50 rounded-lg p-4 mb-4 border border-gray-700/50">
          {profile.summary ? (
            <div className="text-gray-300 text-sm">
              <h4 className="text-blue-400 font-medium mb-1">Summary</h4>
              <p>{profile.summary}</p>
            </div>
          ) : (
            <div className="text-gray-400 italic text-sm">No profile summary available</div>
          )}
        </div>
        
        {/* Tab navigation */}
        <div className="flex space-x-2 mb-4 overflow-x-auto pb-2 border-b border-gray-700/50">
          <TabButton name="Experience" active={activeTab === 'experience'} count={experienceCount} />
          <TabButton name="Education" active={activeTab === 'education'} count={educationCount} />
          <TabButton name="Skills" active={activeTab === 'skills'} count={skillsCount} />
        </div>
        
        {/* Tab content */}
        <div className="space-y-3">
          {activeTab === 'experience' && (
            <>
              {profile.experiences && profile.experiences.length > 0 ? (
                profile.experiences.map((exp, index) => (
                  <div key={index} className="bg-gray-800/30 rounded-lg p-3 border border-gray-700/30">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-white">{exp.title || 'Role'}</h4>
                      <div className="text-xs bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded">
                        {formatProfileDate(exp.starts_at)} - {formatProfileDate(exp.ends_at)}
                      </div>
                    </div>
                    <p className="text-blue-400 text-sm">{exp.company || 'Company'}</p>
                    {exp.location && (
                      <p className="text-gray-400 text-xs mt-1">📍 {exp.location}</p>
                    )}
                    {exp.description && (
                      <p className="text-gray-300 text-sm mt-2 line-clamp-3">{exp.description}</p>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-gray-400 italic text-center py-6">No work experience data available</div>
              )}
            </>
          )}
          
          {activeTab === 'education' && (
            <>
              {profile.education && profile.education.length > 0 ? (
                profile.education.map((edu, index) => (
                  <div key={index} className="bg-gray-800/30 rounded-lg p-3 border border-gray-700/30">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-white">{edu.school || 'Institution'}</h4>
                      <div className="text-xs bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded">
                        {formatProfileDate(edu.starts_at)} - {formatProfileDate(edu.ends_at)}
                      </div>
                    </div>
                    {(edu.degree_name || edu.field_of_study) && (
                      <p className="text-blue-400 text-sm">
                        {[edu.degree_name, edu.field_of_study].filter(Boolean).join(' in ')}
                      </p>
                    )}
                    {edu.description && (
                      <p className="text-gray-300 text-sm mt-2">{edu.description}</p>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-gray-400 italic text-center py-6">No education data available</div>
              )}
            </>
          )}
          
          {activeTab === 'skills' && (
            <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/30">
              {profile.skills && profile.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, index) => (
                    <div key={index} className="bg-blue-900/20 text-blue-400 px-3 py-1 rounded-full text-sm">
                      {skill}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-400 italic text-center py-6">No skills data available</div>
              )}
            </div>
          )}
        </div>
        
        {/* Metadata footer */}
        <div className="mt-5 pt-3 border-t border-gray-700/50 text-xs text-gray-500 flex justify-between">
          <div>Imported on: {new Date(linkedInState.importedAt || Date.now()).toLocaleString()}</div>
          <div>Profile URL: {profile.public_identifier ? `linkedin.com/in/${profile.public_identifier}` : 'N/A'}</div>
        </div>
      </div>
    </div>
  );
};
