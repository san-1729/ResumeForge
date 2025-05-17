/**
 * Vercel compatibility layer
 * 
 * This module provides utilities to ensure compatibility with Vercel's serverless environment
 * by safely handling browser-only APIs and dependencies.
 */

// Check if we're in a browser environment
export const isBrowser = typeof window !== 'undefined';

// Check if we're in a server environment
export const isServer = !isBrowser;

// Check if we're in a Vercel environment
export const isVercel = typeof process !== 'undefined' && process.env.VERCEL === '1';

// Safe way to access browser APIs
export function safeBrowserAPI<T>(browserFn: () => T, fallback: T): T {
  if (isBrowser) {
    try {
      return browserFn();
    } catch (e) {
      console.error('Browser API error:', e);
      return fallback;
    }
  }
  return fallback;
}

// Safe way to import browser-only modules
export async function safeDynamicImport<T>(
  importPath: string,
  fallback: T
): Promise<T> {
  if (isBrowser) {
    try {
      const module = await import(importPath);
      return module as unknown as T;
    } catch (e) {
      console.error(`Failed to import ${importPath}:`, e);
      return fallback;
    }
  }
  return fallback;
}

// Safe way to access environment variables
export function getEnv(key: string, defaultValue: string = ''): string {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || defaultValue;
  }
  
  if (isBrowser && window.ENV && key in window.ENV) {
    return (window.ENV as any)[key] || defaultValue;
  }
  
  return defaultValue;
}

// Declare global ENV type
declare global {
  interface Window {
    ENV?: Record<string, string>;
  }
}
