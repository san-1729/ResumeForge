/**
 * Environment variable utilities specifically for Vercel deployment
 * This centralizes how we access environment variables across the application
 */

// Define the structure of our environment variables
interface AppEnv {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  NODE_ENV: string;
  VERCEL?: string;
  VERCEL_ENV?: string;
}

// Load environment variables with detailed logging for debugging
export function getServerEnv(): AppEnv {
  console.log('ENV LOADER - Initializing environment variables');
  console.log('ENV LOADER - NODE_ENV:', process.env.NODE_ENV);
  console.log('ENV LOADER - VERCEL:', process.env.VERCEL);
  console.log('ENV LOADER - VERCEL_ENV:', process.env.VERCEL_ENV);
  console.log('ENV LOADER - Available keys:', Object.keys(process.env).join(', '));
  
  // Check for Supabase variables from process.env
  let supabaseUrl = process.env.SUPABASE_URL;
  let supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  
  // Extra debugging for Vercel environment
  if (process.env.VERCEL === '1') {
    console.log('ENV LOADER - Running in Vercel environment, checking for env vars set in UI');
    // Try alternative env var access methods for Vercel
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('ENV LOADER - Critical: Supabase env vars missing in Vercel despite being set in dashboard');
      console.log('ENV LOADER - Please check that env vars are set at the Project level, not just Deployment level');
    }
  }
  
  console.log('ENV LOADER - SUPABASE_URL exists after failsafe:', !!supabaseUrl);
  console.log('ENV LOADER - SUPABASE_ANON_KEY exists after failsafe:', !!supabaseAnonKey);
  
  // Return the environment with appropriate values
  return {
    SUPABASE_URL: supabaseUrl || '',
    SUPABASE_ANON_KEY: supabaseAnonKey || '',
    NODE_ENV: process.env.NODE_ENV || 'development',
    VERCEL: process.env.VERCEL,
    VERCEL_ENV: process.env.VERCEL_ENV,
  };
}

// Get client-side safe environment variables
export function getClientEnv() {
  const env = getServerEnv();
  
  return {
    SUPABASE_URL: env.SUPABASE_URL,
    SUPABASE_ANON_KEY: env.SUPABASE_ANON_KEY
  };
}
