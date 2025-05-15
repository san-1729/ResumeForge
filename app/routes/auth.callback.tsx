import { redirect } from '@remix-run/cloudflare';
import { useEffect } from 'react';
import { useNavigate } from '@remix-run/react';
import { createSupabaseClient } from '~/lib/supabase/client.client';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      console.log('Auth callback route loaded');
      
      // Get code from URL
      const url = new URL(window.location.href);
      const code = url.searchParams.get('code');
      
      if (!code) {
        console.log('No code found in URL, redirecting to home');
        window.location.href = '/';
        return;
      }
      
      console.log('Auth code found, exchanging for session');
      
      try {
        // Use our singleton Supabase client implementation
        const supabase = createSupabaseClient();
        
        if (!supabase) {
          console.error('Could not create Supabase client');
          window.location.href = '/';
          return;
        }
        
        // Exchange the code for a session
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        
        if (error) {
          console.error('Error exchanging code for session:', error);
        } else {
          console.log('Successfully authenticated!');
        }
      } catch (err) {
        console.error('Unexpected error during auth:', err);
      }
      
      // Redirect to home page after processing
      window.location.href = '/';
    };
    
    handleCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Authenticating...</h2>
        <p>Please wait while we complete your sign-in process.</p>
      </div>
    </div>
  );
}

// Server-side redirect if accessed directly
export function loader() {
  return redirect('/login');
}
