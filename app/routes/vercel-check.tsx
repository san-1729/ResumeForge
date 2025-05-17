import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

// Simple loader that doesn't depend on any complex browser APIs
export async function loader() {
  return json({
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    message: "Vercel deployment check successful",
    platform: "Vercel Node.js Runtime"
  });
}

// Simple component that renders the loader data
export default function VercelCheck() {
  const data = useLoaderData<typeof loader>();
  
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Vercel Deployment Check</h1>
      
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
        <p className="text-green-600 font-semibold">{data.message}</p>
        <p className="text-sm text-gray-600">Environment: {data.environment}</p>
        <p className="text-sm text-gray-600">Timestamp: {data.timestamp}</p>
        <p className="text-sm text-gray-600">Platform: {data.platform}</p>
      </div>
      
      <p className="mb-4">
        This is a minimal test page to verify that the Remix application is working correctly on Vercel.
      </p>
      
      <div className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <h2 className="font-semibold mb-2">Next Steps:</h2>
        <ol className="list-decimal pl-5 space-y-2">
          <li>If you're seeing this page, basic server-side rendering is working</li>
          <li>Check that environment variables are properly configured</li>
          <li>Verify that database connections are working</li>
          <li>Test client-side functionality</li>
        </ol>
      </div>
    </div>
  );
}
