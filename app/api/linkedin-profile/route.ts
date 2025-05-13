import type { LinkedInProfile } from '~/lib/stores/linkedin';

export async function POST(request: Request) {
  console.log('LinkedIn Profile API called');
  try {
    const data = await request.json() as { profileUrl: string };
    const { profileUrl } = data;
    console.log('Received LinkedIn URL:', profileUrl);
    
    // Validate the URL is a LinkedIn profile
    if (!profileUrl.includes('linkedin.com/in/')) {
      console.error('Invalid LinkedIn profile URL:', profileUrl);
      return Response.json(
        { error: 'Invalid LinkedIn profile URL' },
        { status: 400 }
      );
    }
    
    // Create a URL object for proper parameter handling
    const url = new URL('https://nubela.co/proxycurl/api/v2/linkedin');
    url.searchParams.append('url', profileUrl);
    url.searchParams.append('use_cache', 'if-present');
    
    console.log('Fetching from Proxycurl API:', url.toString());
    console.log('Using API key:', process.env.PROXYCURL_API_KEY ? 'Key exists' : 'Key missing');
    
    const apiResponse = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${process.env.PROXYCURL_API_KEY}`
      },
      cache: 'no-store', // Don't cache the response
    });
    
    console.log('Proxycurl API response status:', apiResponse.status);
    
    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('Proxycurl API error:', errorText);
      try {
        const errorData = JSON.parse(errorText);
        console.error('Parsed error data:', errorData);
        return Response.json(
          { error: 'Failed to fetch LinkedIn profile', details: errorData },
          { status: apiResponse.status }
        );
      } catch (e) {
        return Response.json(
          { error: 'Failed to fetch LinkedIn profile', details: errorText },
          { status: apiResponse.status }
        );
      }
    }
    
    const profileData = await apiResponse.json() as LinkedInProfile;
    console.log('LinkedIn profile data received:', 
      JSON.stringify({
        name: profileData.full_name,
        headline: profileData.headline,
        dataLength: JSON.stringify(profileData).length
      })
    );
    
    return Response.json({ data: profileData });
  } catch (error: any) {
    console.error('Error processing LinkedIn profile:', error);
    return Response.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
} 