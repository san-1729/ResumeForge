/**
 * LinkedIn profile data API endpoint
 * Route: /api/linkedin-profile/:id/latest
 */

import { json } from '@remix-run/cloudflare';
import type { LoaderFunction, TypedResponse } from '@remix-run/cloudflare';

import { requireUser } from '~/lib/auth.server';
import { db } from '~/lib/db.server';

// Interface for the loader function parameter
interface RequestContext { 
  request: Request; 
  params: { id: string };
  context?: any; 
}

// Interface for LinkedIn profile data
export interface LinkedInProfileData {
  data: {
    full_name: string;
    headline: string;
    occupation: string;
    summary: string;
    experiences: Array<{
      company: string;
      title: string;
      description: string;
      location?: string;
      starts_at: { year: number; month: number };
      ends_at: { year: number; month: number } | null;
    }>;
    education: Array<{
      school: string;
      degree_name: string;
      field_of_study: string;
      starts_at: { year: number; month: number };
      ends_at: { year: number; month: number } | null;
    }>;
    skills: string[];
  };
}

// Demo profile data for development
const DEMO_PROFILES = {
  'profile-1': {
    full_name: "John Doe",
    headline: "Senior Software Engineer at Tech Company",
    occupation: "Software Engineering",
    summary: "Results-driven software engineer with 10+ years experience building scalable applications.",
    experiences: [
      {
        company: "Tech Company",
        title: "Senior Software Engineer",
        description: "Lead development of cloud-based solutions for enterprise clients.",
        location: "San Francisco, CA",
        starts_at: { year: 2018, month: 6 },
        ends_at: null
      },
      {
        company: "Startup Inc",
        title: "Software Engineer",
        description: "Developed and maintained RESTful APIs for mobile applications.",
        starts_at: { year: 2015, month: 4 },
        ends_at: { year: 2018, month: 5 },
        location: "San Francisco, CA"
      }
    ],
    education: [
      {
        school: "University of California, Berkeley",
        degree_name: "Bachelor of Science",
        field_of_study: "Computer Science",
        starts_at: { year: 2011, month: 9 },
        ends_at: { year: 2015, month: 5 }
      }
    ],
    skills: [
      "JavaScript",
      "React",
      "Node.js",
      "AWS",
      "Python",
      "SQL",
      "Docker"
    ]
  },
  'profile-2': {
    full_name: "Jane Smith",
    headline: "Product Manager at Tech Innovators",
    occupation: "Product Management",
    summary: "Strategic product manager with expertise in launching successful SaaS products.",
    experiences: [
      {
        company: "Tech Innovators",
        title: "Senior Product Manager",
        description: "Leading product strategy and roadmap for AI-powered analytics platform.",
        starts_at: { year: 2019, month: 2 },
        ends_at: null,
        location: "New York, NY"
      },
      {
        company: "Global Solutions",
        title: "Product Manager",
        description: "Managed full product lifecycle for enterprise software solutions.",
        starts_at: { year: 2016, month: 8 },
        ends_at: { year: 2019, month: 1 },
        location: "Boston, MA"
      }
    ],
    education: [
      {
        school: "Massachusetts Institute of Technology",
        degree_name: "Master of Business Administration",
        field_of_study: "Technology Management",
        starts_at: { year: 2014, month: 9 },
        ends_at: { year: 2016, month: 6 }
      },
      {
        school: "Cornell University",
        degree_name: "Bachelor of Science",
        field_of_study: "Information Systems",
        starts_at: { year: 2010, month: 9 },
        ends_at: { year: 2014, month: 5 }
      }
    ],
    skills: [
      "Product Strategy",
      "User Research",
      "Agile Methodologies",
      "Data Analysis",
      "Product Roadmapping",
      "A/B Testing",
      "Market Analysis"
    ]
  },
  'profile-3': {
    full_name: "David Johnson",
    headline: "UX Designer at Creative Digital",
    occupation: "User Experience Design",
    summary: "User-centered designer with a passion for creating intuitive digital experiences.",
    experiences: [
      {
        company: "Creative Digital",
        title: "Senior UX Designer",
        description: "Design and optimize user experiences for web and mobile applications.",
        starts_at: { year: 2020, month: 3 },
        ends_at: null,
        location: "Seattle, WA"
      },
      {
        company: "Design Studio",
        title: "UX/UI Designer",
        description: "Created wireframes, prototypes, and visual designs for various clients.",
        starts_at: { year: 2017, month: 10 },
        ends_at: { year: 2020, month: 2 },
        location: "Portland, OR"
      }
    ],
    education: [
      {
        school: "Rhode Island School of Design",
        degree_name: "Bachelor of Fine Arts",
        field_of_study: "Graphic Design",
        starts_at: { year: 2013, month: 9 },
        ends_at: { year: 2017, month: 5 }
      }
    ],
    skills: [
      "User Research",
      "Wireframing",
      "Prototyping",
      "Figma",
      "Adobe XD",
      "Interaction Design",
      "Usability Testing"
    ]
  }
};

/**
 * API endpoint to get the latest version of a specific LinkedIn profile
 */
export async function loader({ request, params }: RequestContext): Promise<TypedResponse<LinkedInProfileData>> {
  console.log('🔵 [LinkedIn API] LATEST PROFILE VERSION REQUEST STARTED');
  
  try {
    // Authenticate user
    const user = await requireUser(request);
    console.log(`✅ [LinkedIn API] User authenticated: ${user.email}`);
    
    // Get the profile ID from URL params
    const { id } = params;
    
    if (!id) {
      console.error('❌ [LinkedIn API] Missing profile ID in URL params');
      throw new Response(
        JSON.stringify({ error: 'Missing profile ID' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`✅ [LinkedIn API] Fetching profile data for ID: ${id}`);
    
    // Get the profile data from the database
    const profileData = await getLinkedInProfileData(id, user);
    
    if (!profileData) {
      console.error('❌ [LinkedIn API] Profile not found or unauthorized access');
      throw new Response(
        JSON.stringify({ error: 'Profile not found or unauthorized access' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('✅ [LinkedIn API] Profile data retrieved successfully');
    
    // Return the profile data
    return json({ data: profileData });
  } catch (error: unknown) {
    console.error('❌ [LinkedIn API] Error getting latest profile version:', error);
    // Only access stack if error is an Error object
    if (error instanceof Error) {
      console.error('📜 [LinkedIn API] Error stack:', error.stack);
    }
    
    if (error instanceof Response) {
      throw error;
    }
    
    throw new Response(
      JSON.stringify({ 
        error: 'Failed to get profile data', 
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Function to fetch LinkedIn profile data from Supabase
 */
async function getLinkedInProfileData(profileId: string, user: { id: string, email?: string }): Promise<any> {
  try {
    console.log(`🔍 [LinkedIn API] Querying LinkedIn profile ${profileId} for user ${user.id}`);
    
    // First verify ownership
    const userProfiles = await db.select({
      table: 'linkedin_profiles',
      fields: {
        id: 'id'
      },
      where: {
        'linkedin_profiles.id': profileId,
        'linkedin_profiles.user_id': user.id
      }
    });
    
    if (userProfiles.length === 0) {
      console.error('❌ [LinkedIn API] Profile not found or does not belong to the user');
      return null;
    }
    
    // Get the latest profile version
    const profileVersions = await db.select({
      table: 'linkedin_profile_versions',
      fields: {
        id: 'id',
        profileId: 'profile_id',
        createdAt: 'created_at',
        data: 'data'
      },
      where: {
        'linkedin_profile_versions.profile_id': profileId
      },
      orderBy: {
        field: 'linkedin_profile_versions.created_at',
        direction: 'desc'
      },
      limit: 1
    });
    
    if (profileVersions.length === 0) {
      console.error('❌ [LinkedIn API] No profile versions found');
      return null;
    }
    
    // Parse the JSON data from the database
    const versionData = profileVersions[0];
    
    // Check if the data is a string that needs parsing
    let parsedData;
    if (typeof versionData.data === 'string') {
      try {
        parsedData = JSON.parse(versionData.data);
      } catch (e) {
        console.error('❌ [LinkedIn API] Error parsing profile data JSON:', e);
        // Use the data as-is if parsing fails
        parsedData = versionData.data;
      }
    } else {
      // If it's already an object, use it directly
      parsedData = versionData.data;
    }
    
    console.log(`✅ [LinkedIn API] Found profile version ${versionData.id} created at ${versionData.createdAt}`);
    
    return parsedData;
  } catch (error) {
    console.error('❌ [LinkedIn API] Error fetching profile data:', error);
    throw new Error('Failed to retrieve LinkedIn profile data: ' + String(error));
  }
}

// No runtime JavaScript for API endpoint
export const config = { unstable_runtimeJS: false };
