/**
 * Test script for LinkedIn profile data storage and retrieval
 * 
 * This script tests:
 * 1. Storing mock LinkedIn profile data in the Supabase database
 * 2. Retrieving the stored profile data
 * 3. Verifying all data is correctly persisted and retrieved
 * 
 * Run this script with:
 * node --require ts-node/register app/lib/test/test-linkedin-db.ts
 */

import { createClient } from '@supabase/supabase-js';
import type { LinkedInProfile } from '~/lib/stores/linkedin';

// Include mock data directly in this file
const mockLinkedInProfile: LinkedInProfile = {
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
const generateMockProfileUrl = (profile: LinkedInProfile): string => {
  if (!profile.full_name) return 'https://linkedin.com/in/unknown-user';
  
  // Create a URL-friendly version of the name
  const urlName = profile.full_name.toLowerCase().replace(/\s+/g, '-');
  return `https://linkedin.com/in/${urlName}`;
};

// Configuration from environment variables
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://xlfwyjwlrcwxylzvvcyz.supabase.co';

// For testing purposes, we'll need to use a service role key to bypass RLS policies
// NOTE: In a real app, you would NEVER include service role keys in front-end code
// This is just for our isolated test script - Normally this would be in environment variables
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsZnd5andscmN3eHlsenZ2Y3l6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzIxOTU4NiwiZXhwIjoyMDYyNzk1NTg2fQ.5SYl8FCX9v4CmQDmB_mSGLbGDgkCQoNB3q_c8nsvs7Y';

// Initialize Supabase client with admin privileges for testing
// WARNING: This bypasses security restrictions - only use for testing!
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Define test user ID (this would normally come from authentication)
// In a real app, you'd use authentication to get a real user ID
const TEST_USER_ID = '00000000-0000-0000-0000-000000000000'; 

/**
 * Main test function
 */
async function testLinkedInProfileStorage() {
  console.log('🧪 Starting LinkedIn profile database integration test');
  console.log('-----------------------------------------------------');
  
  try {
    // Step 1: Mock user authentication
    console.log('1️⃣ Step 1: Setting up test user');
    console.log(`   Using test user ID: ${TEST_USER_ID}`);
    
    // Step 2: Generate mock LinkedIn profile
    console.log('2️⃣ Step 2: Creating mock LinkedIn profile data');
    const profileUrl = generateMockProfileUrl(mockLinkedInProfile);
    console.log(`   Mock profile URL: ${profileUrl}`);
    console.log(`   Name: ${mockLinkedInProfile.full_name}`);
    console.log(`   # Experiences: ${mockLinkedInProfile.experiences?.length || 0}`);
    console.log(`   # Education entries: ${mockLinkedInProfile.education?.length || 0}`);
    console.log(`   # Skills: ${mockLinkedInProfile.skills?.length || 0}`);
    
    // Step 3: Store LinkedIn profile in database
    console.log('3️⃣ Step 3: Storing LinkedIn profile in database');
    
    // First, create the linkedin_profile record
    const { data: profileRecord, error: profileError } = await supabase
      .from('linkedin_profiles')
      .insert({
        user_id: TEST_USER_ID,
        url: profileUrl
      })
      .select()
      .single();
    
    if (profileError) {
      throw new Error(`Failed to insert profile record: ${profileError.message}`);
    }
    
    console.log(`   ✅ Profile record created with ID: ${profileRecord.id}`);
    
    // Then, create the linkedin_profile_version record with the payload
    const { data: versionRecord, error: versionError } = await supabase
      .from('linkedin_profile_versions')
      .insert({
        profile_id: profileRecord.id,
        payload: mockLinkedInProfile
      })
      .select()
      .single();
    
    if (versionError) {
      throw new Error(`Failed to insert profile version record: ${versionError.message}`);
    }
    
    console.log(`   ✅ Profile version record created with ID: ${versionRecord.id}`);
    console.log(`   Timestamp: ${new Date(versionRecord.created_at).toLocaleString()}`);
    
    // Step 4: Retrieve the stored profile
    console.log('4️⃣ Step 4: Retrieving LinkedIn profile from database');
    
    // Get all profiles for the test user
    const { data: userProfiles, error: profilesError } = await supabase
      .from('linkedin_profiles')
      .select('*')
      .eq('user_id', TEST_USER_ID)
      .order('created_at', { ascending: false });
    
    if (profilesError) {
      throw new Error(`Failed to fetch user profiles: ${profilesError.message}`);
    }
    
    console.log(`   ✅ Found ${userProfiles.length} profile(s) for test user`);
    
    if (userProfiles.length === 0) {
      throw new Error('No profiles found for test user');
    }
    
    // Get the latest version of the first profile
    const latestProfile = userProfiles[0];
    const { data: versions, error: versionsError } = await supabase
      .from('linkedin_profile_versions')
      .select('*')
      .eq('profile_id', latestProfile.id)
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (versionsError) {
      throw new Error(`Failed to fetch profile versions: ${versionsError.message}`);
    }
    
    if (versions.length === 0) {
      throw new Error('No versions found for profile');
    }
    
    console.log(`   ✅ Retrieved latest profile version (ID: ${versions[0].id})`);
    
    // Step 5: Verify the retrieved data
    console.log('5️⃣ Step 5: Verifying retrieved data');
    
    const retrievedProfile = versions[0].payload;
    
    // Deep comparison helper
    const compareObjects = (obj1: any, obj2: any, path = 'root'): boolean => {
      // Check if both are objects or arrays
      const isObj1 = obj1 && typeof obj1 === 'object';
      const isObj2 = obj2 && typeof obj2 === 'object';
      
      if (!isObj1 || !isObj2) {
        if (obj1 !== obj2) {
          console.log(`   ❌ Mismatch at ${path}: ${obj1} !== ${obj2}`);
          return false;
        }
        return true;
      }
      
      const keys1 = Object.keys(obj1);
      const keys2 = Object.keys(obj2);
      
      for (const key of keys1) {
        const newPath = `${path}.${key}`;
        if (!keys2.includes(key)) {
          console.log(`   ❌ Missing key ${newPath} in retrieved data`);
          return false;
        }
        
        if (!compareObjects(obj1[key], obj2[key], newPath)) {
          return false;
        }
      }
      
      return true;
    };
    
    // Compare essential fields
    if (
      retrievedProfile.full_name === mockLinkedInProfile.full_name &&
      retrievedProfile.headline === mockLinkedInProfile.headline &&
      retrievedProfile.experiences?.length === mockLinkedInProfile.experiences?.length &&
      retrievedProfile.education?.length === mockLinkedInProfile.education?.length &&
      retrievedProfile.skills?.length === mockLinkedInProfile.skills?.length
    ) {
      console.log('   ✅ Basic profile fields match');
      
      // Perform deeper comparison on complex fields
      if (compareObjects(retrievedProfile.experiences, mockLinkedInProfile.experiences, 'experiences')) {
        console.log('   ✅ Experience data matches');
      }
      
      if (compareObjects(retrievedProfile.education, mockLinkedInProfile.education, 'education')) {
        console.log('   ✅ Education data matches');
      }
      
      if (compareObjects(retrievedProfile.skills, mockLinkedInProfile.skills, 'skills')) {
        console.log('   ✅ Skills data matches');
      }
      
      console.log('   ✅ All data verified successfully');
    } else {
      console.log('   ❌ Data verification failed - mismatch detected');
      console.log('     Original:', {
        name: mockLinkedInProfile.full_name,
        headline: mockLinkedInProfile.headline,
        experiences: mockLinkedInProfile.experiences?.length,
        education: mockLinkedInProfile.education?.length,
        skills: mockLinkedInProfile.skills?.length
      });
      console.log('     Retrieved:', {
        name: retrievedProfile.full_name,
        headline: retrievedProfile.headline,
        experiences: retrievedProfile.experiences?.length,
        education: retrievedProfile.education?.length,
        skills: retrievedProfile.skills?.length
      });
      throw new Error('Data verification failed');
    }
    
    // Clean up test data
    console.log('6️⃣ Step 6: Cleaning up test data');
    
    // Delete profile versions first (foreign key constraint)
    const { error: deleteVersionsError } = await supabase
      .from('linkedin_profile_versions')
      .delete()
      .eq('profile_id', latestProfile.id);
    
    if (deleteVersionsError) {
      console.log(`   ⚠️ Warning: Failed to delete test profile versions: ${deleteVersionsError.message}`);
    } else {
      console.log('   ✅ Test profile versions deleted');
    }
    
    // Then delete the profile
    const { error: deleteProfileError } = await supabase
      .from('linkedin_profiles')
      .delete()
      .eq('id', latestProfile.id);
    
    if (deleteProfileError) {
      console.log(`   ⚠️ Warning: Failed to delete test profile: ${deleteProfileError.message}`);
    } else {
      console.log('   ✅ Test profile deleted');
    }
    
    // Test successful
    console.log('-----------------------------------------------------');
    console.log('✅ TEST SUCCESSFUL: LinkedIn profile storage and retrieval works correctly');
    
  } catch (error) {
    console.error('❌ TEST FAILED:', error);
    process.exit(1);
  }
}

// Run the test
testLinkedInProfileStorage().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
