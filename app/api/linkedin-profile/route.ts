import type { LinkedInProfile } from '~/lib/stores/linkedin';
import { db } from '~/lib/db.server';
import { linkedinProfiles, linkedinProfileVersions } from '~/db/schema';
import { requireUser } from '~/lib/auth.server';
import { eq, and } from 'drizzle-orm';

export async function POST(request: Request) {
  console.log('[LinkedIn API] Profile endpoint called');
  try {
    const data = await request.json() as { profileUrl: string };
    const { profileUrl } = data;
    console.log('[LinkedIn API] Received profile URL:', profileUrl);
    
    // Validate the URL is a LinkedIn profile
    if (!profileUrl.includes('linkedin.com/in/')) {
      console.error('[LinkedIn API] Invalid LinkedIn profile URL format:', profileUrl);
      return Response.json(
        { error: 'Invalid LinkedIn profile URL' },
        { status: 400 }
      );
    }
    
    // Create a URL object for proper parameter handling
    const url = new URL('https://nubela.co/proxycurl/api/v2/linkedin');
    url.searchParams.append('url', profileUrl);
    url.searchParams.append('use_cache', 'if-present');
    
    console.log('[LinkedIn API] Calling ProxyCurl API with URL:', url.toString());
    console.log('[LinkedIn API] API key status:', process.env.PROXYCURL_API_KEY ? 'Available' : 'Missing');
    
    const apiResponse = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${process.env.PROXYCURL_API_KEY}`
      },
      cache: 'no-store', // Don't cache the response
    });
    
    console.log('[LinkedIn API] ProxyCurl response status:', apiResponse.status);
    console.log('[LinkedIn API] ProxyCurl response headers:', Object.fromEntries([...apiResponse.headers.entries()]));
    
    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('[LinkedIn API] ProxyCurl error response:', errorText);
      try {
        const errorData = JSON.parse(errorText);
        console.error('[LinkedIn API] Parsed error details:', errorData);
        return Response.json(
          { error: 'Failed to fetch LinkedIn profile', details: errorData },
          { status: apiResponse.status }
        );
      } catch (e) {
        console.error('[LinkedIn API] Error parsing error response:', e);
        return Response.json(
          { error: 'Failed to fetch LinkedIn profile', details: errorText },
          { status: apiResponse.status }
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
    
    /* -------------------- Persist to DB (non-blocking) ------------------- */
    (async () => {
      try {
        const user = await requireUser(request).catch(() => null);
        if (!user) return; // anonymous session – skip persistence

        // Upsert profile row
        const existing = await db
          .select({ id: linkedinProfiles.id })
          .from(linkedinProfiles)
          .where(and(eq(linkedinProfiles.userId, user.id), eq(linkedinProfiles.url, profileUrl)))
          .limit(1);

        let profileId: string;
        if (existing.length) {
          profileId = existing[0].id;
        } else {
          const [row] = await db
            .insert(linkedinProfiles)
            .values({ userId: user.id, url: profileUrl })
            .returning();
          profileId = row.id;
        }

        // Insert version
        await db.insert(linkedinProfileVersions).values({ profileId, payload: profileData });
      } catch (err) {
        console.warn('[LinkedIn API] Failed to persist profile:', err);
      }
    })();

    console.log('[LinkedIn API] Returning profile data to client');
    return Response.json({ data: profileData });
  } catch (error: any) {
    console.error('[LinkedIn API] Error processing LinkedIn profile request:', error);
    console.error('[LinkedIn API] Error stack:', error.stack);
    return Response.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
} 