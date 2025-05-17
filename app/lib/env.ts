/**
 * Environment detection utilities to safely handle server/client code separation
 */

// Check if code is running in a browser environment
export const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

// Check if code is running in a Node.js environment
export const isNode = typeof process !== 'undefined' && 
  process.versions != null && 
  process.versions.node != null;

// Check if code is running in a Vercel serverless environment
export const isVercel = process.env.VERCEL === '1';

// Safe way to check if a module exists without causing server-side errors
export function safeRequire(moduleName: string) {
  if (isBrowser) return null;
  
  try {
    // Using dynamic import would be better but requires special handling
    // This is a simple solution for our specific use case
    return require(moduleName);
  } catch (e) {
    return null;
  }
}
