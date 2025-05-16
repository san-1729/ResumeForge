#!/usr/bin/env node

// This script checks the LinkedIn profile data in Supabase
// It queries both the profiles and versions tables

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import { dirname } from 'path';

// Set up __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Initialize Supabase client with admin privileges
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkDatabase() {
  console.log('🔍 Checking Supabase database structure and LinkedIn profiles...');
  
  // 1. Check the linked_profiles table structure
  console.log('\n📊 Examining linkedin_profiles table structure:');
  const { data: profilesStructure, error: structureError } = await supabase
    .rpc('get_table_info', { table_name: 'linkedin_profiles' });
  
  if (structureError) {
    console.error('❌ Error fetching table structure:', structureError.message);
  } else {
    console.log(profilesStructure);
  }
  
  // 2. Check all LinkedIn profiles
  console.log('\n📋 Fetching all LinkedIn profiles:');
  const { data: profiles, error: profilesError } = await supabase
    .from('linkedin_profiles')
    .select('*');
  
  if (profilesError) {
    console.error('❌ Error fetching profiles:', profilesError.message);
  } else {
    profiles.forEach(profile => {
      console.log(`Profile ID: ${profile.id}, User ID: ${profile.user_id}, URL: ${profile.url}`);
    });
  }
  
  // 3. Check LinkedIn profile versions with their payload
  console.log('\n📜 Fetching LinkedIn profile versions with payload data:');
  const { data: versions, error: versionsError } = await supabase
    .from('linkedin_profile_versions')
    .select('id, profile_id, created_at, payload');
  
  if (versionsError) {
    console.error('❌ Error fetching profile versions:', versionsError.message);
  } else {
    versions.forEach(version => {
      console.log(`\nVersion ID: ${version.id}, Profile ID: ${version.profile_id}, Created: ${version.created_at}`);
      console.log('Payload preview:', version.payload ? {
        name: version.payload.full_name || version.payload.name || 'Not found',
        headline: version.payload.headline || 'Not found',
        fields: Object.keys(version.payload)
      } : 'No payload');
    });
  }
  
  console.log('\n✅ Database check complete!');
}

// Execute the database check
(async () => {
  try {
    await checkDatabase();
  } catch (err) {
    console.error('❌ Error executing script:', err);
  }
})();
