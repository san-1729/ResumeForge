import type { LinkedInProfile } from '~/lib/stores/linkedin';
import { json } from '@remix-run/cloudflare';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseClient } from '~/lib/supabase/client';
import { requireUser } from '~/lib/auth.server';

// Create a mock Supabase client for development testing that logs operations but doesn't execute them
function createMockSupabaseClient() {
  return {
    from: (table: string) => ({
      insert: (data: any) => {
        console.log(`💡 [MOCK DB] Would insert into ${table}:`, data);
        return {
          select: () => ({
            single: () => Promise.resolve({
              data: { id: `mock-${table}-id-${Date.now()}`, created_at: new Date().toISOString(), ...data },
              error: null
            })
          })
        };
      },
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: null })
        })
      })
    })
  };
}

export async function action({ request, context }: { request: Request, context?: any }) {
  try {
    console.log('🔵 [Save Profile API] API endpoint called');
    
    // Step 1: Authenticate the user
    console.log('🔵 [Save Profile API] Step 1: Authenticating user...');
    
    // Check if we're in development mode
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isTestUser = !!request.headers.get('x-test-mode');
    
    let user;
    try {
      // Attempt to get the authenticated user
      user = await requireUser(request);
      console.log('✅ [Save Profile API] User authenticated successfully, ID:', user.id);
    } catch (authError) {
      console.log('❌ [Save Profile API] Authentication error:', authError);
      
      // In development mode, we can use a test user ID for easier testing
      if (isDevelopment && isTestUser) {
        console.log('💡 [Save Profile API] DEV MODE: Using test user for development');
        user = { id: '00000000-0000-4000-a000-000000000001', email: 'test@example.com' };
      } else {
        console.log('❌ [Save Profile API] Authentication required');
        return json(
          { error: 'Unauthorized', message: 'Authentication required' },
          { status: 401 }
        );
      }
    }
    
    console.log('🔵 [Save Profile API] Step 2: Parsing profile data from request...');
    
    let profileData: LinkedInProfile;
    let profileUrl: string;
    
    try {
      // Handle JSON request body
      const requestData = await request.json();
      
      // Validate that we received the required data
      if (!requestData) {
        console.log('❌ [Save Profile API] No request data received');
        return json(
          { error: 'Bad Request', message: 'No profile data provided' },
          { status: 400 }
        );
      }
      
      // For debugging
      console.log('💡 [Save Profile API] DEBUG - Request data type:', typeof requestData);
      console.log('💡 [Save Profile API] DEBUG - Request data keys:', Object.keys(requestData));
      
      // Extract profile data directly
      profileData = requestData as LinkedInProfile;
      
      // Extract or generate the profile URL
      if (profileData.public_identifier) {
        profileUrl = `https://linkedin.com/in/${profileData.public_identifier}`;
      } else if (profileData.profile_id) {
        profileUrl = `https://linkedin.com/in/${profileData.profile_id}`;
      } else if (profileData.name) {
        // Create URL-friendly version of name as fallback
        const urlName = profileData.name.toLowerCase().replace(/\s+/g, '-');
        profileUrl = `https://linkedin.com/in/${urlName}`;
      } else {
        console.log('❌ [Save Profile API] Missing profile identifier');
        return json(
          { error: 'Bad Request', message: 'Missing LinkedIn profile identifier' },
          { status: 400 }
        );
      }
      
      // Log that we received the profile data (without sensitive details)
      console.log('✅ [Save Profile API] Received profile data for user:', profileData.name);
      console.log('📊 [Save Profile API] Profile statistics:', {
        name: profileData.name,
        headline: profileData.headline,
        currentJob: profileData.currentPosition,
        currentCompany: profileData.currentCompany,
        experienceCount: profileData.experiences?.length || 0,
        educationCount: profileData.education?.length || 0,
        skillsCount: profileData.skills?.length || 0,
        profileDataSize: JSON.stringify(profileData).length,
        userId: user.id
      });
    } catch (parseError) {
      console.log('❌ [Save Profile API] Error parsing request data:', parseError);
      return json(
        { error: 'Bad Request', message: 'Invalid request data format' },
        { status: 400 }
      );
    }
    
    console.log('🔵 [Save Profile API] Step 3: Generating profile URL...');
    
    // Initialize Supabase client
    console.log('🔵 [Save Profile API] Step 4: Initializing Supabase client...');
    
    // Try multiple approaches to initialize Supabase with admin privileges
    // Initialize with a default value to avoid TS errors
    let supabase: ReturnType<typeof createClient> | null = null;
    let adminClientSucceeded = false;
    
    try {
      // First attempt: Use direct service role key
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      
      if (supabaseUrl && supabaseServiceKey) {
        console.log('💡 [Save Profile API] Trying service role initialization');
        // For debug only - never log full keys in production
        console.log('💡 [Save Profile API] Service key prefix:', supabaseServiceKey.substring(0, 10));
        
        supabase = createClient(supabaseUrl, supabaseServiceKey, {
          auth: {
            persistSession: false
          }
        });
        
        // Test the admin connection with a simple query
        const { data: testData, error: testError } = await supabase
          .from('linkedin_profiles')
          .select('id')
          .limit(1);
        
        if (testError) {
          console.log('❌ [Save Profile API] Service role authentication failed:', testError.message);
          // Let it fall through to the next attempt
        } else {
          console.log('✅ [Save Profile API] Service role client created successfully');
          adminClientSucceeded = true;
        }
      }
    } catch (err) {
      console.log('❌ [Save Profile API] Error during service role initialization:', err);
    }
    
    // If service role failed, try anon key (with RLS policies)
    if (!adminClientSucceeded) {
      try {
        console.log('💡 [Save Profile API] Falling back to anon key with current user context');
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseAnonKey) {
          throw new Error('Missing Supabase environment variables');
        }
        
        // Create client with anon key - will be subject to RLS policies
        supabase = createClient(supabaseUrl, supabaseAnonKey);
        console.log('✅ [Save Profile API] Anon key client created for user:', user.id);
      } catch (err) {
        console.log('❌ [Save Profile API] All Supabase initialization methods failed');
        return json(
          { error: 'Internal Server Error', message: 'Failed to initialize database connection' },
          { status: 500 }
        );
      }
    }
    
    // Final check to ensure we have a valid client
    if (!supabase) {
      console.log('❌ [Save Profile API] Failed to initialize Supabase client');
      return json(
        { error: 'Internal Server Error', message: 'Database connection not available' },
        { status: 500 }
      );
    }
    
    // First, create the linkedin_profile record
    console.log('🔵 [Save Profile API] Step 5: Creating LinkedIn profile record in database...');
    console.log('📊 [Save Profile API] Profile record data:', {
      userId: user.id,
      url: profileUrl
    });
    
    // First try to check if the profile already exists to avoid duplicates
    const { data: existingProfile } = await supabase
      .from('linkedin_profiles')
      .select()
      .eq('user_id', user.id)
      .eq('url', profileUrl)
      .single();
    
    let profileRecord;
    
    if (existingProfile) {
      console.log('ℹ️ [Save Profile API] Profile already exists, using existing profile');
      profileRecord = existingProfile;
      console.log('💾 [Save Profile API] Using existing profile ID:', existingProfile.id);
    } else {
      // Create a new profile record if one doesn't exist
      console.log('💡 [Save Profile API] Creating new LinkedIn profile record...');
      const { data: newProfileRecord, error: profileError } = await supabase
        .from('linkedin_profiles')
        .insert({
          user_id: user.id,
          url: profileUrl
        })
        .select()
        .single();
      
      if (profileError || !newProfileRecord) {
        console.error('❌ [Save Profile API] Error creating profile record:', profileError);
        return json(
          { error: 'Failed to save profile', message: profileError?.message || 'No profile record created' },
          { status: 500 }
        );
      }
      
      profileRecord = newProfileRecord;
      console.log('✅ [Save Profile API] New profile record created with ID:', profileRecord.id);
    }
    
    // Always create a new version record with the latest data
    console.log('🔵 [Save Profile API] Step 6: Creating new LinkedIn profile version record...');
    
    // Now we have a profileRecord (either existing or newly created)
    // Always create a new version record with the full profile data payload
    console.log('📊 [Save Profile API] Version record info:', { 
      profileId: profileRecord.id, 
      payloadSize: JSON.stringify(profileData).length,
      dataFields: Object.keys(profileData).length
    });
    
    // Debug the profile data structure to see exactly what fields we're storing
    console.log('💾 [Save Profile API] DEBUG - Profile data structure:', {
      name: profileData.full_name || profileData.name,
      publicIdentifier: profileData.public_identifier,
      fields: Object.keys(profileData)
    });
    
    // Make sure we have a consistent profile structure for storage
    // This converts any variant field names to a standard format
    const standardizedProfileData = {
      ...profileData,
      // Ensure we have standard field names
      name: profileData.name || profileData.full_name,
      full_name: profileData.full_name || profileData.name,
      headline: profileData.headline,
      current_position: profileData.currentPosition || profileData.current_position,
      current_company: profileData.currentCompany || profileData.current_company,
    };
    const { data: versionRecord, error: versionError } = await supabase
      .from('linkedin_profile_versions')
      .insert({
        profile_id: profileRecord.id,
        payload: standardizedProfileData  // Using the standardized data structure
      })
      .select()
      .single();
    
    if (versionError || !versionRecord) {
      console.error('❌ [Save Profile API] Error creating version record:', versionError);
      return json(
        { error: 'Failed to save profile data version', message: versionError?.message || 'No version record created' },
        { status: 500 }
      );
    }
    
    console.log('✅ [Save Profile API] LinkedIn profile and version records created successfully');
    console.log('📊 [Save Profile API] Created records:', {
      profileId: profileRecord.id,
      versionId: versionRecord.id
    });
    
    return json({
      success: true,
      message: 'LinkedIn profile saved successfully',
      profileId: profileRecord.id,
      versionId: versionRecord.id
    });
    
  } catch (error: any) {
    console.error('❌ [Save Profile API] Unexpected error:', error);
    return json(
      { error: 'Failed to save profile data', message: error.message },
      { status: 500 }
    );
  }
} 