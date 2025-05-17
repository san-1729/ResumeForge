/**
 * This module provides a safe way to import WebContainer only on the client side
 * to prevent server-side rendering issues in Vercel's serverless environment.
 */

// Flag to check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Placeholder for the WebContainer API
let WebContainerAPI: any = null;

// Dynamic import function that only runs in the browser
export async function getWebContainerAPI() {
  // Only attempt to load WebContainer in the browser
  if (isBrowser && !WebContainerAPI) {
    try {
      // Dynamically import the WebContainer API
      const { WebContainer } = await import('@webcontainer/api');
      WebContainerAPI = WebContainer;
      return WebContainer;
    } catch (error) {
      console.error('Failed to load WebContainer API:', error);
      throw new Error('WebContainer API failed to load');
    }
  }
  
  return WebContainerAPI;
}

// Helper function to check if WebContainer is supported in the current environment
export function isWebContainerSupported() {
  return isBrowser;
}
