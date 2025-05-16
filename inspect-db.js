/**
 * Supabase Database Inspector
 * 
 * This script uses raw SQL queries to inspect the Supabase database structure,
 * focusing on the LinkedIn profile tables needed for integration.
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import fs from 'fs';

// Load environment variables from .env.local
try {
  const envFile = fs.readFileSync('.env.local', 'utf8');
  const envVars = {};
  envFile.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  });

  process.env.SUPABASE_URL = envVars.SUPABASE_URL;
  process.env.SUPABASE_SERVICE_ROLE_KEY = envVars.SUPABASE_SERVICE_ROLE_KEY;
} catch (err) {
  console.error(`❌ Error loading .env.local file: ${err.message}`);
  process.exit(1);
}

// Get credentials from environment
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error(`   SUPABASE_URL: ${SUPABASE_URL ? '✅ Found' : '❌ Missing'}`);
  console.error(`   SUPABASE_SERVICE_ROLE_KEY: ${SUPABASE_SERVICE_ROLE_KEY ? '✅ Found' : '❌ Missing'}`);
  process.exit(1);
}

// Initialize Supabase client with service role key to bypass RLS
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

/**
 * Execute raw SQL query against Supabase
 */
async function executeQuery(query) {
  const { data, error } = await supabase.rpc('exec_sql', { query });
  
  if (error) {
    throw new Error(`SQL query error: ${error.message}`);
  }
  
  return data;
}

/**
 * Inspect database schema and tables
 */
async function inspectDatabase() {
  console.log('🔍 SUPABASE DATABASE INSPECTOR');
  console.log('============================');
  console.log(`Database URL: ${SUPABASE_URL}`);
  
  try {
    // 1. Test connection by getting database version
    console.log('\n1️⃣ Testing database connection...');
    
    try {
      // Try direct PostgreSQL version query
      const pgVersionQuery = `SELECT version();`;
      const versionData = await executeQuery(pgVersionQuery);
      console.log('✅ Connection successful!');
      console.log(`   PostgreSQL version: ${versionData[0]?.version || 'Unknown'}`);
    } catch (err) {
      console.error(`❌ Connection test error: ${err.message}`);
      
      // Try an alternative query that always works with Supabase
      try {
        const { data, error } = await supabase.from('_dummy_table_').select().limit(1);
        if (error && error.message.includes('does not exist')) {
          console.log('✅ Connection successful! (verified via error response)');
        } else {
          console.error('❌ Could not verify database connection');
          return;
        }
      } catch (innerErr) {
        console.error('❌ All connection attempts failed');
        return;
      }
    }
    
    // 2. List all tables in public schema
    console.log('\n2️⃣ Listing tables in public schema...');
    
    try {
      const tablesQuery = `
        SELECT 
          tablename AS table_name,
          (SELECT count(*) FROM information_schema.columns WHERE table_name=tables.tablename AND table_schema='public') AS column_count
        FROM 
          pg_catalog.pg_tables AS tables
        WHERE 
          schemaname = 'public'
        ORDER BY
          tablename;
      `;
      
      const tables = await executeQuery(tablesQuery);
      
      if (!tables || tables.length === 0) {
        console.log('   No tables found in public schema');
      } else {
        console.log(`   Found ${tables.length} tables:`);
        tables.forEach(table => {
          console.log(`   - ${table.table_name} (${table.column_count} columns)`);
        });
        
        // Store table names for reference
        const tableNames = tables.map(t => t.table_name);
        
        // 3. Focus on LinkedIn-related tables
        console.log('\n3️⃣ Examining LinkedIn profile tables...');
        
        // Check if the tables exist
        const linkedInTables = [
          'linkedin_profiles',
          'linkedin_profile_versions'
        ];
        
        for (const tableName of linkedInTables) {
          if (tableNames.includes(tableName)) {
            console.log(`   ✅ Table '${tableName}' exists`);
            
            // Get table structure
            const tableStructureQuery = `
              SELECT 
                column_name, 
                data_type, 
                is_nullable,
                column_default
              FROM 
                information_schema.columns
              WHERE 
                table_schema = 'public' 
                AND table_name = '${tableName}'
              ORDER BY
                ordinal_position;
            `;
            
            const columns = await executeQuery(tableStructureQuery);
            
            console.log(`      Structure (${columns.length} columns):`);
            columns.forEach(col => {
              console.log(`      - ${col.column_name} (${col.data_type}, ${col.is_nullable === 'YES' ? 'nullable' : 'not null'}${col.column_default ? `, default: ${col.column_default}` : ''})`);
            });
            
            // Count rows in table
            const rowCountQuery = `SELECT COUNT(*) FROM ${tableName};`;
            const rowCount = await executeQuery(rowCountQuery);
            
            console.log(`      Records: ${rowCount[0]?.count || 0}`);
            
            // If it's a profile table and has records, show a sample
            if (tableName === 'linkedin_profiles' && rowCount[0]?.count > 0) {
              const sampleQuery = `SELECT id, user_id, url, created_at FROM ${tableName} LIMIT 3;`;
              const samples = await executeQuery(sampleQuery);
              
              console.log('      Sample profiles:');
              samples.forEach((sample, i) => {
                console.log(`        ${i+1}. ID: ${sample.id}, User: ${sample.user_id}, URL: ${sample.url}`);
              });
            }
            
            // If it's a version table and has records, show count by profile
            if (tableName === 'linkedin_profile_versions' && rowCount[0]?.count > 0) {
              const versionQuery = `
                SELECT 
                  profile_id, 
                  COUNT(*) as version_count
                FROM 
                  ${tableName}
                GROUP BY 
                  profile_id
                LIMIT 5;
              `;
              
              const versionCounts = await executeQuery(versionQuery);
              
              console.log('      Version counts by profile:');
              versionCounts.forEach((v, i) => {
                console.log(`        - Profile ${v.profile_id}: ${v.version_count} version(s)`);
              });
            }
          } else {
            console.log(`   ❌ Table '${tableName}' does not exist`);
          }
        }
        
        // 4. Check for core MCG tables
        console.log('\n4️⃣ Examining core MCG tables...');
        
        const coreTables = [
          'users',
          'resumes',
          'resume_versions'
        ];
        
        for (const tableName of coreTables) {
          if (tableNames.includes(tableName)) {
            console.log(`   ✅ Table '${tableName}' exists`);
            
            // Count rows in table
            const rowCountQuery = `SELECT COUNT(*) FROM ${tableName};`;
            const rowCount = await executeQuery(rowCountQuery);
            
            console.log(`      Records: ${rowCount[0]?.count || 0}`);
          } else {
            console.log(`   ❌ Table '${tableName}' does not exist`);
          }
        }
        
        // 5. Check for foreign key relationships
        console.log('\n5️⃣ Verifying table relationships...');
        
        const fkQuery = `
          SELECT
            tc.table_name AS table_name,
            kcu.column_name AS column_name,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name
          FROM
            information_schema.table_constraints AS tc
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
              AND ccu.table_schema = tc.table_schema
          WHERE
            tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_schema = 'public'
            AND (tc.table_name = 'linkedin_profiles' OR tc.table_name = 'linkedin_profile_versions')
          ORDER BY
            tc.table_name,
            kcu.column_name;
        `;
        
        const foreignKeys = await executeQuery(fkQuery);
        
        if (foreignKeys && foreignKeys.length > 0) {
          console.log('   Found foreign key relationships:');
          foreignKeys.forEach(fk => {
            console.log(`   - ${fk.table_name}.${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}`);
          });
        } else {
          console.log('   No foreign key relationships found for LinkedIn tables');
        }
      }
      
      console.log('\n✅ Database inspection complete!');
      
    } catch (err) {
      console.error(`❌ Error listing tables: ${err.message}`);
    }
    
  } catch (err) {
    console.error(`❌ Error during database inspection: ${err.message}`);
    console.error(err);
  }
}

// Run the database inspection
(async () => {
  try {
    await inspectDatabase();
  } catch (err) {
    console.error('Unhandled error:', err);
  }
})();
