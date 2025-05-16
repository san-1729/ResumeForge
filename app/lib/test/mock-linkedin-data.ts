import type { LinkedInProfile } from '~/lib/stores/linkedin';

/**
 * Mock LinkedIn profile data for testing database storage and retrieval
 */
export const mockLinkedInProfile: LinkedInProfile = {
  full_name: 'Jane Smith',
  headline: 'Senior Software Engineer at Tech Company',
  occupation: 'Software Engineer',
  summary: 'Experienced software engineer with 8+ years in full-stack development, specializing in React, Node.js, and cloud infrastructure.',
  experiences: [
    {
      company: 'Tech Company',
      title: 'Senior Software Engineer',
      description: 'Lead developer for customer-facing web applications. Improved performance by 40% and implemented CI/CD pipelines.',
      location: 'San Francisco, CA',
      starts_at: {
        month: 6,
        year: 2020
      },
      ends_at: null // Current job
    },
    {
      company: 'Previous Corp',
      title: 'Software Engineer',
      description: 'Full-stack developer working on e-commerce platforms using React, Node.js and MongoDB.',
      location: 'Austin, TX',
      starts_at: {
        month: 3,
        year: 2017
      },
      ends_at: {
        month: 5,
        year: 2020
      }
    }
  ],
  education: [
    {
      school: 'University of California, Berkeley',
      degree_name: 'Master of Computer Science',
      field_of_study: 'Computer Science',
      starts_at: {
        year: 2015
      },
      ends_at: {
        year: 2017
      }
    },
    {
      school: 'Stanford University',
      degree_name: 'Bachelor of Science',
      field_of_study: 'Computer Engineering',
      starts_at: {
        year: 2011
      },
      ends_at: {
        year: 2015
      }
    }
  ],
  skills: [
    'JavaScript',
    'TypeScript',
    'React',
    'Node.js',
    'AWS',
    'Docker',
    'Kubernetes',
    'CI/CD',
    'Database Design',
    'System Architecture'
  ]
};

/**
 * Generate a unique LinkedIn profile URL based on the profile name
 */
export const generateMockProfileUrl = (profile: LinkedInProfile): string => {
  if (!profile.full_name) return 'https://linkedin.com/in/unknown-user';
  
  // Create a URL-friendly version of the name
  const urlName = profile.full_name.toLowerCase().replace(/\s+/g, '-');
  return `https://linkedin.com/in/${urlName}`;
};
