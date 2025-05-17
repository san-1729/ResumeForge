/**
 * LinkedIn profile data API endpoint
 * Route: /api/linkedin-profile/:id/latest
 */

import { json } from '@remix-run/node';
import type { LoaderFunction, TypedResponse } from '@remix-run/node';
import { createClient } from '@supabase/supabase-js';

import { requireUser } from '~/lib/auth.server';

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
export async function loader({ request, params }: RequestContext): Promise<Response> {
  console.log('🔵 [LinkedIn API] LATEST PROFILE VERSION REQUEST STARTED');
  
  if (!params.id) {
    console.error('❌ [LinkedIn API] No profile ID provided');
    return json({ error: 'Profile ID is required' }, { status: 400 });
  }
  
  try {
    // Authenticate the user
    console.log('🔍 [Auth] DEBUG - Requiring user authentication...');
    const user = await requireUser(request);
    console.log('✅ [LinkedIn API] User authenticated:', user.email);
    
    // Get profile with the given ID
    console.log('✅ [LinkedIn API] Fetching profile data for ID:', params.id);
    const profileData = await getLinkedInProfileData(params.id, user);
    
    if (!profileData) {
      console.error('❌ [LinkedIn API] Profile not found or unauthorized access');
      return json({ error: 'Profile not found or unauthorized access' }, { status: 404 });
    }
    
    // Log success and return the data
    console.log('✅ [LinkedIn API] Found profile data:', {
      name: profileData.full_name || 'Not available',
      skills: (profileData.skills || []).length,
      experiences: (profileData.experiences || []).length
    });
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
    
    // CRITICAL: Use service role key for development to bypass RLS restrictions
    const hasServiceRoleKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    console.log(`💡 [LinkedIn API] IMPORTANT: Service role key ${hasServiceRoleKey ? 'IS' : 'is NOT'} available.`);
    
    // Check environment variables
    if (!process.env.SUPABASE_URL || (!process.env.SUPABASE_ANON_KEY && !process.env.SUPABASE_SERVICE_ROLE_KEY)) {
      throw new Error('Missing required Supabase environment variables');
    }
    
    // Choose appropriate key (use service role in development)
    const supabaseUrl = process.env.SUPABASE_URL as string;
    const useServiceKey = process.env.NODE_ENV !== 'production' && hasServiceRoleKey;
    const supabaseKey = useServiceKey 
      ? (process.env.SUPABASE_SERVICE_ROLE_KEY as string)
      : (process.env.SUPABASE_ANON_KEY as string);
    
    console.log(`🔍 [LinkedIn API] Using ${useServiceKey ? 'SERVICE ROLE KEY' : 'ANON KEY'} for database access`);
    
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    let profileAccess = true;
    
    // First verify ownership (can skip with service role key for testing)
    if (!useServiceKey) {
      const { data: userProfiles, error: ownershipError } = await supabase
        .from('linkedin_profiles')
        .select('id')
        .eq('id', profileId)
        .eq('user_id', user.id)
        .limit(1);
      
      if (ownershipError) {
        console.error('❌ [LinkedIn API] Error verifying profile ownership:', ownershipError);
        throw ownershipError;
      }
      
      if (!userProfiles || userProfiles.length === 0) {
        console.error('❌ [LinkedIn API] Profile not found or does not belong to the user');
        profileAccess = false;
      }
    }
    
    // For development with service role: show all profiles regardless of ownership
    if (useServiceKey || profileAccess) {
      // Let's first examine the table structure to diagnose the column issue
      console.log('🔍 [LinkedIn API] Inspecting linkedin_profile_versions table structure...');
      const { data: tableInfo, error: tableError } = await supabase
        .from('linkedin_profile_versions')
        .select('*')
        .limit(1);
      
      if (tableError) {
        console.error('❌ [LinkedIn API] Error inspecting table:', tableError);
      } else if (tableInfo && tableInfo.length > 0) {
        console.log('📊 [LinkedIn API] Available columns in linkedin_profile_versions:', Object.keys(tableInfo[0]));
        console.log('📄 [LinkedIn API] Sample record:', tableInfo[0]);
      } else {
        console.log('⚠️ [LinkedIn API] Table exists but no records found');
      }
      
      // Try to get the latest profile version
      // Modify the query to be adaptable to different column names
      // We'll try both 'data' and 'profile_data' as potential column names
      const { data: profileVersions, error: versionError } = await supabase
        .from('linkedin_profile_versions')
        .select('*') // Select all columns to see what's available
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (versionError) {
        console.error('❌ [LinkedIn API] Error fetching profile versions:', versionError);
        throw versionError;
      } else if (profileVersions && profileVersions.length > 0) {
        console.log('📋 [LinkedIn API] Retrieved profile version with columns:', Object.keys(profileVersions[0]));
      }
      
      if (!profileVersions || profileVersions.length === 0) {
        console.error('❌ [LinkedIn API] No profile versions found');
        return null;
      }
      
      // Success! We found a profile version
      console.log(`✅ [LinkedIn API] Found profile version ${profileVersions[0].id}`);
      return parseProfileData(profileVersions[0]);
    }
    
    return null;
  } catch (error) {
    console.error('❌ [LinkedIn API] Error fetching profile data:', error);
    throw new Error('Failed to retrieve LinkedIn profile data: ' + String(error));
  }
}
    
/**
 * Helper function to parse profile data from a version record
 * Adapts to different column name possibilities (data, profile_data, content, etc.)
 */
function parseProfileData(versionData: any): any {
  console.log('🔍 [LinkedIn API] Examining version data object for profile data:')
  
  // Potential column names for the profile data
  // IMPORTANT: 'payload' is the actual column name in the database
  const possibleDataColumns = ['payload', 'data', 'profile_data', 'content', 'json_data', 'profile_content'];
  
  // Find which column actually contains the profile data
  let dataColumnName = null;
  let profileData = null;
  
  // Log all available columns
  console.log('📃 [LinkedIn API] Version record columns:', Object.keys(versionData));
  
  // First check for the most likely column name based on the logs
  if ('payload' in versionData && versionData.payload !== null && versionData.payload !== undefined) {
    console.log('✅ [LinkedIn API] Found data in "payload" column');
    dataColumnName = 'payload';
    profileData = versionData.payload;
  } else {
    // Try other possible column names as fallback
    for (const column of possibleDataColumns) {
      if (column in versionData && versionData[column] !== null && versionData[column] !== undefined) {
        console.log(`✅ [LinkedIn API] Found data in column: ${column}`);
        dataColumnName = column;
        profileData = versionData[column];
        break;
      }
    }
  }
  
  if (!dataColumnName) {
    console.error('⚠️ [LinkedIn API] Could not find profile data in any expected column');
    console.log('📄 [LinkedIn API] Complete version record:', versionData);
    throw new Error('Profile data not found in any expected column');
  }
  
  // Check if the data is a string that needs parsing
  let parsedData;
  if (typeof profileData === 'string') {
    try {
      console.log('🔍 [LinkedIn API] Attempting to parse JSON string data');
      parsedData = JSON.parse(profileData);
    } catch (e) {
      console.error('❌ [LinkedIn API] Error parsing profile data JSON:', e);
      // Use the data as-is if parsing fails
      console.log('⚠️ [LinkedIn API] Using raw string data instead');
      parsedData = profileData;
    }
  } else {
    // If it's already an object, use it directly
    console.log('🔍 [LinkedIn API] Data is already in object format, using directly');
    parsedData = profileData;
  }
  
  console.log(`✅ [LinkedIn API] Found profile version ${versionData.id} created at ${versionData.created_at}`);
  
  return parsedData;
}

// No runtime JavaScript for API endpoint
export const config = { unstable_runtimeJS: false };
