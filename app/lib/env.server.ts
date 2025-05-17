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
  console.log('ENV LOADER - Available keys:', Object.keys(process.env).join(', '));
  
  // Check for Supabase variables
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  
  console.log('ENV LOADER - SUPABASE_URL exists:', !!supabaseUrl);
  console.log('ENV LOADER - SUPABASE_ANON_KEY exists:', !!supabaseAnonKey);
  
  // Return the environment with fallbacks for development
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
