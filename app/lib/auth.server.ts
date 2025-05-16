import { createSupabaseClient } from '~/lib/supabase/client';

export async function requireUser(request: Request) {
  console.log('🔍 [Auth] DEBUG - Requiring user authentication...');
  
  // Check for Authorization header (Bearer token)
  const authHeader = request.headers.get('authorization');
  console.log('🔍 [Auth] DEBUG - Authorization header present:', !!authHeader);
  
  let token = '';
  
  if (authHeader) {
    // Parse standard Bearer token format
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    } else {
      // Try alternative formats
      const [authType, authToken] = authHeader.split(' ');
      if (authToken) {
        token = authToken;
      } else if (authHeader) {
        // If there's just one part, use it directly
        token = authHeader;
      }
    }
  }
  
  if (!token) {
    console.log('❌ [Auth] ERROR - No valid token found in request');
    throw new Response('Unauthorized', { status: 401 });
  }
  
  console.log('🔍 [Auth] DEBUG - Token extracted, verifying with Supabase...');
  const supabase = createSupabaseClient();
  
  try {
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error) {
      console.log('❌ [Auth] ERROR - Supabase getUser error:', error.message);
      throw new Response('Unauthorized', { status: 401 });
    }
    
    if (!data?.user) {
      console.log('❌ [Auth] ERROR - No user found for token');
      throw new Response('Unauthorized', { status: 401 });
    }
    
    console.log('✅ [Auth] User authenticated successfully:', data.user.email);
    return data.user;
  } catch (e) {
    console.log('❌ [Auth] ERROR - Exception during authentication:', e);
    throw new Response('Unauthorized', { status: 401 });
  }
} 