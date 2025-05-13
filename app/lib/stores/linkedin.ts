import { atom } from 'nanostores';

export interface LinkedInProfile {
  full_name?: string;
  headline?: string;
  occupation?: string;
  summary?: string;
  experiences?: Array<{
    company?: string;
    title?: string;
    description?: string;
    location?: string;
    starts_at?: {
      day?: number;
      month?: number;
      year?: number;
    };
    ends_at?: {
      day?: number;
      month?: number;
      year?: number;
    } | null;
  }>;
  education?: Array<{
    school?: string;
    degree_name?: string;
    field_of_study?: string;
    starts_at?: {
      day?: number;
      month?: number;
      year?: number;
    };
    ends_at?: {
      day?: number;
      month?: number;
      year?: number;
    } | null;
  }>;
  skills?: string[];
  [key: string]: any;
}

export interface LinkedInState {
  profileData: LinkedInProfile | null;
  isImported: boolean;
}

// Initial state
export const linkedInStore = atom<LinkedInState>({
  profileData: null,
  isImported: false,
});

// Action to set profile data
export const setLinkedInProfile = (profile: LinkedInProfile) => {
  linkedInStore.set({
    profileData: profile,
    isImported: true,
  });
  
  console.log('LinkedIn profile data stored in global state');
};

// Action to clear profile data
export const clearLinkedInProfile = () => {
  linkedInStore.set({
    profileData: null,
    isImported: false,
  });
  
  console.log('LinkedIn profile data cleared from global state');
};

// Helper to format LinkedIn data into a prompt-friendly format
export const formatLinkedInDataForPrompt = (profile: LinkedInProfile): string => {
  if (!profile) return '';
  
  let formattedData = `LinkedIn Profile Information:\n\n`;
  
  // Basic information
  formattedData += `Name: ${profile.full_name || 'N/A'}\n`;
  formattedData += `Headline: ${profile.headline || 'N/A'}\n`;
  formattedData += `Occupation: ${profile.occupation || 'N/A'}\n\n`;
  
  // Summary
  if (profile.summary) {
    formattedData += `Summary:\n${profile.summary}\n\n`;
  }
  
  // Work experience
  if (profile.experiences && profile.experiences.length > 0) {
    formattedData += `Work Experience:\n`;
    profile.experiences.forEach((exp, index) => {
      formattedData += `${index + 1}. ${exp.title || 'Role'} at ${exp.company || 'Company'}`;
      
      // Date range
      const startYear = exp.starts_at?.year;
      const endYear = exp.ends_at?.year || 'Present';
      if (startYear) {
        formattedData += ` (${startYear} - ${endYear})`;
      }
      formattedData += `\n`;
      
      // Location
      if (exp.location) {
        formattedData += `   Location: ${exp.location}\n`;
      }
      
      // Description
      if (exp.description) {
        formattedData += `   Description: ${exp.description}\n`;
      }
      
      formattedData += `\n`;
    });
  }
  
  // Education
  if (profile.education && profile.education.length > 0) {
    formattedData += `Education:\n`;
    profile.education.forEach((edu, index) => {
      formattedData += `${index + 1}. ${edu.school || 'Institution'}`;
      
      if (edu.degree_name || edu.field_of_study) {
        formattedData += ` - ${edu.degree_name || ''} ${edu.field_of_study || ''}`;
      }
      
      // Date range
      const startYear = edu.starts_at?.year;
      const endYear = edu.ends_at?.year || 'Present';
      if (startYear) {
        formattedData += ` (${startYear} - ${endYear})`;
      }
      
      formattedData += `\n`;
    });
    formattedData += `\n`;
  }
  
  // Skills
  if (profile.skills && profile.skills.length > 0) {
    formattedData += `Skills: ${profile.skills.join(', ')}\n\n`;
  }
  
  return formattedData;
}; 