import React, { useEffect, useState } from 'react';
import { createSupabaseClient } from '~/lib/supabase/client.client';

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  // Auth state
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Auth modal state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Handle sign in/sign up
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setAuthLoading(true);

    const supabase = createSupabaseClient();
    if (!supabase) {
      setError('Could not connect to authentication service');
      setAuthLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        // Sign up
        console.log('Attempting to sign up with:', email);
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        });

        if (error) throw error;

        if (data.session) {
          // Auto-signed in (email confirmation might be disabled)
          console.log('Signed up and authenticated successfully');
          setUser(data.session.user);
          setShowAuthModal(false);
        } else {
          setMessage('Please check your email for a confirmation link');
        }
      } else {
        // Sign in
        console.log('Attempting to sign in with:', email);
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;

        console.log('Signed in successfully:', data.session?.user.email);
        setUser(data.session?.user);
        setShowAuthModal(false);
      }
    } catch (err: any) {
      console.error('Authentication error:', err);
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setAuthLoading(false);
    }
  };
  
  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      console.log('Checking authentication status...');
      const supabase = createSupabaseClient();
      if (!supabase) {
        setIsLoading(false);
        setShowAuthModal(true);
        return;
      }

      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error checking auth session:', error.message);
          setShowAuthModal(true);
          return;
        }
        
        if (data.session) {
          console.log('User is authenticated:', data.session.user.email);
          setUser(data.session.user);
          setShowAuthModal(false);
        } else {
          console.log('No active session found');
          setShowAuthModal(true);
        }
      } catch (err) {
        console.error('Unexpected error during auth check:', err);
        setShowAuthModal(true);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
    
    // Set up auth state change listener
    const supabase = createSupabaseClient();
    if (!supabase) return;
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event);
        if (event === 'SIGNED_IN' && session) {
          setUser(session.user);
          setShowAuthModal(false);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setShowAuthModal(true);
        }
      }
    );
    
    // Clean up subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Log out function
  const handleLogout = async () => {
    const supabase = createSupabaseClient();
    if (!supabase) return;
    
    await supabase.auth.signOut();
    setUser(null);
    setShowAuthModal(true);
  };

  // Auth Modal Component
  const AuthModal = () => (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Backdrop with blur effect */}
      <div className="absolute inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm"></div>
      
      {/* Auth modal */}
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8 relative z-10">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          {isSignUp ? 'Create an Account' : 'Welcome Back'}
        </h2>
        
        <p className="text-center text-gray-600 mb-6">
          {isSignUp 
            ? 'Create an account to save your resumes and access them anywhere' 
            : 'Sign in to access your saved resumes and continue your work'}
        </p>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        {message && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
            <p className="text-green-700">{message}</p>
          </div>
        )}
        
        <form onSubmit={handleAuth}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={authLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            {authLoading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            {isSignUp 
              ? 'Already have an account? Sign In' 
              : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
  
  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl">
          <p className="text-lg font-semibold">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Note: We've removed the standalone logout button injection
  // as we now have a unified user profile dropdown with logout functionality
  
  return (
    <>
      {children}
      {showAuthModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Backdrop with stronger blur effect */}
          <div className="absolute inset-0 bg-bolt-elements-background-depth-1 bg-opacity-60 backdrop-blur-md"></div>
          
          {/* Auth modal */}
          <div className="bg-bolt-elements-background-depth-1 rounded-lg border border-bolt-elements-borderColor shadow-2xl w-full max-w-md p-8 relative z-10 dark:text-bolt-elements-textPrimary">
            <h2 className="text-2xl font-bold mb-4 text-center text-bolt-elements-textPrimary">
              <span className="bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500 bg-clip-text text-transparent drop-shadow-sm">
                {isSignUp ? 'Create an Account' : 'Welcome Back'}
              </span>
            </h2>
            
            <p className="text-center text-bolt-elements-textSecondary mb-6">
              {isSignUp 
                ? 'Create an account to save your resumes and access them anywhere' 
                : 'Sign in to access your saved resumes and continue your work'}
            </p>
            
            {error && (
              <div className="bg-red-500 bg-opacity-10 border-l-4 border-red-500 p-4 mb-6 rounded">
                <p className="text-red-500">{error}</p>
              </div>
            )}
            
            {message && (
              <div className="bg-green-500 bg-opacity-10 border-l-4 border-green-500 p-4 mb-6 rounded">
                <p className="text-green-500">{message}</p>
              </div>
            )}
            
            <form onSubmit={handleAuth}>
              <div className="mb-4">
                <label htmlFor="auth-email" className="block text-sm font-medium text-bolt-elements-textSecondary mb-1">
                  Email
                </label>
                <input
                  id="auth-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    console.log('Email input change:', e.target.value);
                    setEmail(e.target.value);
                  }}
                  className="w-full px-3 py-2 bg-bolt-elements-background-depth-2 border border-bolt-elements-borderColor rounded-md text-bolt-elements-textPrimary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                  // Prevent React from re-rendering this component during typing
                  data-lpignore="true"
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="auth-password" className="block text-sm font-medium text-bolt-elements-textSecondary mb-1">
                  Password
                </label>
                <input
                  id="auth-password"
                  name="password"
                  type="password"
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  value={password}
                  onChange={(e) => {
                    console.log('Password input change:', e.target.value.replace(/./g, '*'));
                    setPassword(e.target.value);
                  }}
                  className="w-full px-3 py-2 bg-bolt-elements-background-depth-2 border border-bolt-elements-borderColor rounded-md text-bolt-elements-textPrimary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                  // Prevent React from re-rendering this component during typing
                  data-lpignore="true"
                />
              </div>
              
              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-gradient-to-br from-blue-500 to-blue-600 text-white py-2 px-4 rounded-md hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors shadow-md font-medium"
              >
                {authLoading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
              >
                {isSignUp 
                  ? 'Already have an account? Sign In' 
                  : "Don't have an account? Sign Up"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
