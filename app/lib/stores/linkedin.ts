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
    description?: string;
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
  isImported: boolean;
  profileData: LinkedInProfile | null;
  importedAt?: number;
}

// Initial state
export const linkedInStore = atom<LinkedInState>({
  profileData: null,
  isImported: false,
  importedAt: undefined,
});

// Action to set profile data
export const setLinkedInProfile = (profile: LinkedInProfile) => {
  linkedInStore.set({ profileData: profile, isImported: true, importedAt: Date.now() });
  console.log('LinkedIn profile data set in global state');
  console.log('Data for:', profile.full_name);
};

// Action to clear profile data
export const clearLinkedInProfile = () => {
  linkedInStore.set({ profileData: null, isImported: false, importedAt: undefined });
  console.log('LinkedIn profile data cleared from global state');
};

/**
 * Helper to format LinkedIn data into a prompt-friendly format for AI resume generation
 * 
 * The format can be easily customized by modifying the template strings below.
 * Current format is a JSON-like structure that the AI can easily parse.
 * 
 * @param profile - The LinkedIn profile data to format
 * @param customInstructions - Optional additional instructions for the AI
 * @returns Formatted string to include in the AI prompt
 */
export const formatLinkedInDataForPrompt = (profile: LinkedInProfile, customInstructions?: string): string => {
  if (!profile) return '';
  
  console.log('🔵 [LinkedIn Formatter] Formatting LinkedIn profile for prompt');
  console.log('📊 [LinkedIn Formatter] Profile summary:', {
    name: profile.full_name,
    experiences: profile.experiences?.length || 0,
    education: profile.education?.length || 0,
    skills: profile.skills?.length || 0
  });
  
  // --- CUSTOMIZATION SECTION: You can modify these template strings ---
  
  // Header section
  const HEADER = `=== LINKEDIN PROFILE INFORMATION ===\n\n`;
  
  // Closing section with instructions for the AI
  const CLOSING = `=== END OF LINKEDIN DATA ===\n\n` +
    `Please use the above LinkedIn information to create a tailored resume that highlights my relevant experience and skills.` +
    (customInstructions ? `\n\n${customInstructions}` : '') +
    `\n\n`;
  
  // --- END CUSTOMIZATION SECTION ---
  
  // Start building the formatted data string
  let formattedData = HEADER;
  
  // Basic information with JSON-like structure for clearer parsing by AI
  formattedData += `PERSONAL_INFO: {\n`;
  formattedData += `  "name": "${profile.full_name || 'N/A'}",\n`;
  formattedData += `  "headline": "${profile.headline || 'N/A'}",\n`;
  formattedData += `  "occupation": "${profile.occupation || 'N/A'}",\n`;
  formattedData += `  "location": "${profile.city || ''}, ${profile.country_full_name || ''}",\n`;
  if (profile.summary) {
    // Clean up summary and make it JSON safe
    const cleanSummary = profile.summary.replace(/"/g, '\'').replace(/\n/g, ' ');
    formattedData += `  "summary": "${cleanSummary}"\n`;
  }
  formattedData += `}\n\n`;
  
  // Work experience
  const experiences = profile.experiences || [];
  if (experiences.length > 0) {
    console.log(`📝 [LinkedIn Formatter] Processing ${experiences.length} work experiences`);
    
    formattedData += `WORK_EXPERIENCE: [\n`;
    experiences.forEach((exp, index) => {
      formattedData += `  {\n`;
      formattedData += `    "title": "${exp.title || 'Role'}",\n`;
      formattedData += `    "company": "${exp.company || 'Company'}",\n`;
      
      // Date range
      const startYear = exp.starts_at?.year;
      const startMonth = exp.starts_at?.month;
      const endYear = exp.ends_at?.year;
      const endMonth = exp.ends_at?.month;
      
      formattedData += `    "start_date": "${startMonth ? startMonth + '/' : ''}${startYear || 'N/A'}",\n`;
      formattedData += `    "end_date": "${endYear ? (endMonth ? endMonth + '/' : '') + endYear : 'Present'}",\n`;
      
      // Location
      if (exp.location) {
        formattedData += `    "location": "${exp.location}",\n`;
      }
      
      // Description - clean up for JSON
      if (exp.description) {
        const cleanDesc = exp.description.replace(/"/g, '\'').replace(/\n/g, ' ');
        formattedData += `    "description": "${cleanDesc}"\n`;
      } else {
        formattedData += `    "description": ""\n`;
      }
      
      formattedData += `  }${index < (profile.experiences?.length || 0) - 1 ? ',' : ''}\n`;
    });
    formattedData += `]\n\n`;
  }
  
  // Education
  const education = profile.education || [];
  if (education.length > 0) {
    console.log(`📚 [LinkedIn Formatter] Processing ${education.length} education entries`);
    
    formattedData += `EDUCATION: [\n`;
    education.forEach((edu, index) => {
      formattedData += `  {\n`;
      formattedData += `    "school": "${edu.school || 'Institution'}",\n`;
      formattedData += `    "degree": "${edu.degree_name || 'N/A'}",\n`;
      formattedData += `    "field": "${edu.field_of_study || 'N/A'}",\n`;
      
      // Date range
      const startYear = edu.starts_at?.year;
      const endYear = edu.ends_at?.year;
      
      formattedData += `    "start_year": "${startYear || 'N/A'}",\n`;
      formattedData += `    "end_year": "${endYear || 'Present'}",\n`;
      
      // Description - clean up for JSON
      if (edu.description) {
        const cleanDesc = edu.description.replace(/"/g, '\'').replace(/\n/g, ' ');
        formattedData += `    "description": "${cleanDesc}"\n`;
      } else {
        formattedData += `    "description": ""\n`;
      }
      
      formattedData += `  }${index < (profile.education?.length || 0) - 1 ? ',' : ''}\n`;
    });
    formattedData += `]\n\n`;
  }
  
  // Skills
  if (profile.skills && profile.skills.length > 0) {
    console.log(`🔧 [LinkedIn Formatter] Processing ${profile.skills.length} skills`);
    
    formattedData += `SKILLS: [\n`;
    formattedData += profile.skills.map(skill => `  "${skill}"`).join(',\n');
    formattedData += `\n]\n\n`;
  }
  
  // Add the closing section
  formattedData += CLOSING;
  
  console.log('✅ [LinkedIn Formatter] Completed formatting LinkedIn data');
  return formattedData;
}; 