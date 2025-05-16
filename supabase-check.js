/**
 * Simple Supabase database check script
 * Uses standard Supabase JS client methods
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Load environment variables from .env.local
const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    env[key.trim()] = valueParts.join('=').trim();
  }
});

// Initialize Supabase client with service role key
const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

// Tables we want to check for
const targetTables = [
  'linkedin_profiles',
  'linkedin_profile_versions',
  'users',
  'resumes',
  'resume_versions'
];

async function checkDatabase() {
  console.log('🔍 SUPABASE DATABASE CHECK');
  console.log('========================');
  console.log(`URL: ${env.SUPABASE_URL}`);
  
  try {
    // 1. Test connection by trying to get user session
    console.log('\n1️⃣ Testing connection...');
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error(`❌ Connection error: ${error.message}`);
      return;
    }
    
    console.log('✅ Connection successful!');
    
    // 2. Check each table by attempting to count rows
    console.log('\n2️⃣ Checking tables...');
    
    for (const tableName of targetTables) {
      try {
        const { count, error } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.log(`❌ Table '${tableName}' error: ${error.message}`);
        } else {
          console.log(`✅ Table '${tableName}' exists with ${count} records`);
          
          // If it's a LinkedIn table, show additional details
          if (tableName === 'linkedin_profiles' && count > 0) {
            const { data, error } = await supabase
              .from(tableName)
              .select('id, url, user_id, created_at')
              .limit(3);
              
            if (!error && data) {
              console.log(`   Sample profiles:`);
              data.forEach(profile => {
                console.log(`   - ID: ${profile.id}, URL: ${profile.url}`);
              });
            }
          }
        }
      } catch (err) {
        console.error(`❌ Error checking table ${tableName}: ${err.message}`);
      }
    }
    
    // 3. Check if the LinkedIn profile tables have the right structure
    if (targetTables.includes('linkedin_profiles')) {
      console.log('\n3️⃣ Checking LinkedIn profile structure...');
      
      // Fetch one row to examine structure
      const { data: profileData, error: profileError } = await supabase
        .from('linkedin_profiles')
        .select('*')
        .limit(1);
      
      if (profileError) {
        console.log(`❌ Cannot examine structure: ${profileError.message}`);
      } else if (profileData && profileData.length > 0) {
        const profile = profileData[0];
        console.log('LinkedIn profile table structure:');
        Object.keys(profile).forEach(key => {
          console.log(`   - ${key}: ${typeof profile[key]}`);
        });
      } else {
        console.log('No LinkedIn profiles found to examine structure');
      }
      
      // Check versions table too
      const { data: versionData, error: versionError } = await supabase
        .from('linkedin_profile_versions')
        .select('*')
        .limit(1);
      
      if (versionError) {
        console.log(`❌ Cannot examine versions structure: ${versionError.message}`);
      } else if (versionData && versionData.length > 0) {
        const version = versionData[0];
        console.log('LinkedIn profile version table structure:');
        Object.keys(version).forEach(key => {
          console.log(`   - ${key}: ${typeof version[key]}`);
          
          // If this is the payload field, show its structure too
          if (key === 'payload' && version[key]) {
            console.log('     Payload contains:');
            Object.keys(version[key]).forEach(payloadKey => {
              console.log(`     - ${payloadKey}`);
            });
          }
        });
      } else {
        console.log('No LinkedIn profile versions found to examine structure');
      }
    }
    
    console.log('\n✅ Database check complete!');
    
  } catch (err) {
    console.error('❌ Unhandled error:', err);
  }
}

// Run the check
checkDatabase().catch(console.error);
