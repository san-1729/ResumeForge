import type { LinkedInProfile } from '~/lib/stores/linkedin';

export const action = async ({ request, context }: { request: Request, context: any }) => {
  console.log('[LinkedIn API] Profile endpoint called');
  try {
    const data = await request.json() as { profileUrl: string };
    const { profileUrl } = data;
    console.log('[LinkedIn API] Received profile URL:', profileUrl);
    
    // Validate the URL is a LinkedIn profile
    if (!profileUrl.includes('linkedin.com/in/')) {
      console.error('[LinkedIn API] Invalid LinkedIn profile URL format:', profileUrl);
      return new Response(
        JSON.stringify({ error: 'Invalid LinkedIn profile URL' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Create a URL object for proper parameter handling with enhanced parameters
    const url = new URL('https://nubela.co/proxycurl/api/v2/linkedin');
    url.searchParams.append('url', profileUrl);
    url.searchParams.append('extra', 'include');     // Adds gender, DOB, industry, interests (+1 credit)
    url.searchParams.append('skills', 'include');    // List of skills (+1 credit)
    url.searchParams.append('use_cache', 'if-recent'); // Fresh <29 days (+1 credit)
    url.searchParams.append('fallback_to_cache', 'on-error');
    
    console.log('[LinkedIn API] Calling ProxyCurl API with URL:', url.toString());
    // Get the API key from context.env in Remix
    const apiKey = context?.env?.PROXYCURL_API_KEY || process.env.PROXYCURL_API_KEY;
    
    // Debug info to check API key
    console.log('[LinkedIn API] API key availability:', apiKey ? 'Available' : 'Missing');
    if (apiKey) {
      console.log('[LinkedIn API] API key starts with:', apiKey.substring(0, 4) + '***');
    }
    
    if (!apiKey) {
      console.error('[LinkedIn API] No API key found in environment variables!');
      return new Response(
        JSON.stringify({ error: 'API configuration error', details: 'Missing API key' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const apiResponse = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json'
      },
      cache: 'no-store',
    });
    
    console.log('[LinkedIn API] ProxyCurl response status:', apiResponse.status);
    console.log('[LinkedIn API] ProxyCurl response headers:', Object.fromEntries([...apiResponse.headers.entries()]));
    
    if (!apiResponse.ok) {
      // Special handling for 403 Forbidden errors which are likely API key issues
      if (apiResponse.status === 403) {
        console.error('[LinkedIn API] 403 Forbidden response - likely an API key issue');
        
        // Try to get more details about what went wrong
        const errorText = await apiResponse.text();
        console.error('[LinkedIn API] ProxyCurl error details:', errorText);
        
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
      console.error('[LinkedIn API] ProxyCurl error response:', errorText);
      
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
    
    const profileData = await apiResponse.json() as LinkedInProfile;
    console.log('[LinkedIn API] Profile data retrieved successfully. Response size:', 
      JSON.stringify(profileData).length, 'bytes');
    console.log('[LinkedIn API] Profile summary:', {
      name: profileData.full_name,
      headline: profileData.headline,
      experienceCount: profileData.experiences?.length || 0,
      educationCount: profileData.education?.length || 0,
      skillsCount: profileData.skills?.length || 0
    });
    
    console.log('[LinkedIn API] Returning profile data to client');
    return new Response(
      JSON.stringify({ data: profileData }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('[LinkedIn API] Error processing LinkedIn profile request:', error);
    console.error('[LinkedIn API] Error stack:', error.stack);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 