import { useEffect, useState } from 'react';
import { createSupabaseClient } from '~/lib/supabase/client.client';
import { UserProfileDropdown } from './UserProfileDropdown.client';

export function LandingLoginIndicator() {
  console.log('LandingLoginIndicator rendering');
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createSupabaseClient();
      if (!supabase) {
        setIsLoading(false);
        return;
      }
      
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          setUser(data.session.user);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  if (isLoading) {
    return null; // Don't show anything while loading
  }
  
  if (user) {
    // User is logged in - show avatar dropdown
    return <UserProfileDropdown />;
  }
  
  // User is not logged in - show sign in button
  return (
    <button 
      onClick={() => {
        // This will trigger the AuthProvider modal to show
        document.dispatchEvent(new Event('mcg-show-auth-modal'));
        console.log('Auth modal trigger event dispatched');
      }}
      className="py-2 px-4 rounded-md bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition-colors shadow-md flex items-center gap-2"
      style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}
    >
      <div className="i-ph:user-circle-plus w-4 h-4" />
      Sign In
    </button>
  );
}
