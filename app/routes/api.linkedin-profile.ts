import type { LinkedInProfile } from '~/lib/stores/linkedin';

export const action = async ({ request, context }: { request: Request, context: any }) => {
  console.log('🔵 [LinkedIn API] PROFILE REQUEST STARTED');
  try {
    console.log('🔵 [LinkedIn API] Step 1: Parsing request data...');
    const data = await request.json() as { profileUrl: string };
    const { profileUrl } = data;
    console.log('✅ [LinkedIn API] Received profile URL:', profileUrl);
    
    // Validate the URL is a LinkedIn profile
    console.log('🔵 [LinkedIn API] Step 2: Validating LinkedIn URL format...');
    if (!profileUrl.includes('linkedin.com/in/')) {
      console.error('❌ [LinkedIn API] Invalid LinkedIn profile URL format:', profileUrl);
      return new Response(
        JSON.stringify({ error: 'Invalid LinkedIn profile URL' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Create a URL object for proper parameter handling with enhanced parameters
    console.log('🔵 [LinkedIn API] Step 3: Preparing ScrapingDog API request...');
    
    // Extract LinkedIn profile ID/handle from the URL
    let linkId = profileUrl.split('/in/')[1];
    if (linkId.includes('?')) {
      linkId = linkId.split('?')[0];
    }
    if (linkId.includes('/')) {
      linkId = linkId.split('/')[0];
    }
    
    const url = new URL('https://api.scrapingdog.com/linkedin');
    // Don't add the api_key parameter here yet, will set it after retrieving from env
    url.searchParams.append('type', 'profile');
    url.searchParams.append('linkId', linkId);
    url.searchParams.append('private', 'true');
    
    console.log('📊 [LinkedIn API] ScrapingDog API request details:', {
      targetUrl: profileUrl,
      linkId: linkId,
      endpoint: url.toString(),
      parameters: Object.fromEntries(url.searchParams.entries())
    });
    // Get the API key from context.env in Remix
    console.log('🔵 [LinkedIn API] Step 4: Retrieving ScrapingDog API key...');
    const apiKey = context?.env?.SCRAPINGDOG_API_KEY || process.env.SCRAPINGDOG_API_KEY;
    
    // Debug info to check API key
    if (apiKey) {
      console.log('✅ [LinkedIn API] API key found, starts with:', apiKey.substring(0, 4) + '***');
    } else {
      console.error('❌ [LinkedIn API] API key missing!');
    }
    
    if (!apiKey) {
      console.error('❌ [LinkedIn API] No API key found in environment variables!');
      return new Response(
        JSON.stringify({ error: 'API configuration error', details: 'Missing API key' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('🔵 [LinkedIn API] Step 5: Sending request to ScrapingDog API...');
    
    const requestStartTime = Date.now();
    // Set the API key in the URL parameters instead of headers
    console.log('🔵 [LinkedIn API] Setting API key in URL parameters...');
    url.searchParams.set('api_key', apiKey);
    
    // Verify the API key was set correctly
    const params = Object.fromEntries(url.searchParams.entries());
    console.log('🔍 [LinkedIn API] URL parameters after setting API key:', {
      ...params,
      api_key: params.api_key ? `${params.api_key.substring(0, 4)}***` : 'MISSING' 
    });
    
    const apiResponse = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      cache: 'no-store',
    });
    const requestDuration = Date.now() - requestStartTime;
    
    console.log('📊 [LinkedIn API] ScrapingDog API response details:', {
      status: apiResponse.status,
      statusText: apiResponse.statusText,
      duration: `${requestDuration}ms`,
      headers: Object.fromEntries([...apiResponse.headers.entries()])
    });
    
    if (!apiResponse.ok) {
      // Special handling for 403 Forbidden errors which are likely API key issues
      if (apiResponse.status === 403) {
        console.error('❌ [LinkedIn API] 403 Forbidden response - likely an API key issue or rate limit');
        
        // Try to get more details about what went wrong
        const errorText = await apiResponse.text();
        console.error('❌ [LinkedIn API] ScrapingDog error details:', errorText);
        
        return new Response(
          JSON.stringify({ 
            error: 'API authentication failed', 
            details: 'The API key was rejected. This is likely because the key is invalid, expired, or has reached its usage limit.',
            apiResponse: errorText
          }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      // Handle other errors
      const errorText = await apiResponse.text();
      console.error('❌ [LinkedIn API] ScrapingDog error response:', errorText);
      
      try {
        const errorData = JSON.parse(errorText);
        console.error('[LinkedIn API] Parsed error details:', errorData);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch LinkedIn profile', details: errorData }),
          { status: apiResponse.status, headers: { 'Content-Type': 'application/json' } }
        );
      } catch (e) {
        console.error('[LinkedIn API] Error parsing error response:', e);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch LinkedIn profile', details: errorText }),
          { status: apiResponse.status, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }
    
    console.log('🔵 [LinkedIn API] Step 6: Processing ScrapingDog profile response...');
    // ScrapingDog returns an array with a single profile object
    const rawData = await apiResponse.json();
    // Use the first item from the array (ScrapingDog response format)
    const scrapingDogProfile = Array.isArray(rawData) ? rawData[0] : rawData;
    
    // Map ScrapingDog response format to our LinkedInProfile format
    const profileData: LinkedInProfile = {
      public_identifier: scrapingDogProfile.public_identifier,
      full_name: scrapingDogProfile.fullName,
      headline: scrapingDogProfile.headline,
      summary: scrapingDogProfile.about,
      profile_pic_url: scrapingDogProfile.profile_photo,
      background_cover_image_url: scrapingDogProfile.background_cover_image_url,
      location: scrapingDogProfile.location,
      // Map experiences array
      experiences: scrapingDogProfile.experience?.map((exp: any) => ({
        company: exp.company_name,
        title: exp.position,
        description: exp.summary,
        logo_url: exp.company_image,
        location: exp.location,
        starts_at: {
          year: exp.starts_at ? parseInt(exp.starts_at.split(' ')[1]) : undefined,
          month: exp.starts_at ? getMonthNumber(exp.starts_at.split(' ')[0]) : undefined
        },
        ends_at: exp.ends_at === 'Present' ? null : {
          year: exp.ends_at ? parseInt(exp.ends_at.split(' ')[1]) : undefined,
          month: exp.ends_at ? getMonthNumber(exp.ends_at.split(' ')[0]) : undefined
        }
      })),
      // Map education array
      education: scrapingDogProfile.education?.map((edu: any) => {
        const duration = edu.college_duration?.split(' - ') || [];
        return {
          school: edu.college_name,
          degree_name: edu.college_degree,
          field_of_study: edu.college_degree_field,
          logo_url: edu.college_image,
          starts_at: duration[0] ? {
            year: parseInt(duration[0])
          } : undefined,
          ends_at: duration[1] ? {
            year: parseInt(duration[1])
          } : null
        };
      }),
      // Map certifications
      certifications: scrapingDogProfile.certification?.map((cert: any) => ({
        name: cert.certification,
        authority: cert.company_name,
        url: cert.credential_url
      })),
      // Map skills - extract from certification if not available
      skills: scrapingDogProfile.skills || 
        // Try to extract skill names from certification titles if no skills provided
        scrapingDogProfile.certification?.map((cert: any) => cert.certification) || []
    };
    
    // Helper function to convert month name to number
    function getMonthNumber(monthName: string): number | undefined {
      const months: {[key: string]: number} = {
        'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
        'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12,
        'January': 1, 'February': 2, 'March': 3, 'April': 4, 'June': 6,
        'July': 7, 'August': 8, 'September': 9, 'October': 10, 'November': 11, 'December': 12
      };
      return months[monthName];
    }
    console.log('✅ [LinkedIn API] Profile data retrieved successfully');
    console.log('📊 [LinkedIn API] LinkedIn profile summary:', {
      name: profileData.full_name,
      headline: profileData.headline,
      currentJob: profileData.experiences?.[0]?.title,
      currentCompany: profileData.experiences?.[0]?.company,
      experienceCount: profileData.experiences?.length || 0,
      educationCount: profileData.education?.length || 0,
      skillsCount: profileData.skills?.length || 0,
      summary: profileData.summary ? `${profileData.summary.substring(0, 50)}...` : 'None',
      responseSize: JSON.stringify(profileData).length + ' bytes',
      publicIdentifier: profileData.public_identifier || 'Not available'
    });
    
    console.log('✅ [LinkedIn API] Step 7: Returning profile data to client');
    console.log('✨ [LinkedIn API] PROFILE REQUEST COMPLETED SUCCESSFULLY');
    return new Response(
      JSON.stringify({ data: profileData }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('❌ [LinkedIn API] ERROR PROCESSING LINKEDIN PROFILE REQUEST:', error);
    console.error('📜 [LinkedIn API] Error stack:', error.stack);
    console.error('❌ [LinkedIn API] PROFILE REQUEST FAILED');
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 