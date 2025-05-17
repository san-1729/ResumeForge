import type { LoaderFunction } from '@remix-run/node';

// This handles favicon.ico requests
export const loader: LoaderFunction = () => {
  // Send a transparent 1x1 pixel GIF for the favicon
  const TRANSPARENT_GIF = 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  const gifBuffer = Buffer.from(TRANSPARENT_GIF, 'base64');
  
  return new Response(gifBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'public, max-age=31536000, immutable' // Cache for a year
    }
  });
};
