import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

// Simple loader that doesn't depend on any complex browser APIs
export async function loader() {
  return json({
    status: 'healthy',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    message: "Server is running correctly",
    runtime: typeof process !== 'undefined' ? 'Node.js' : 'Browser'
  });
}

// Simple component that renders the loader data
export default function HealthCheck() {
  const data = useLoaderData<typeof loader>();
  
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">MCG Server Health Check</h1>
      
      <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-4">
        <p className="text-green-600 font-semibold">Status: {data.status}</p>
        <p className="text-sm text-gray-600">Environment: {data.environment}</p>
        <p className="text-sm text-gray-600">Timestamp: {data.timestamp}</p>
        <p className="text-sm text-gray-600">Runtime: {data.runtime}</p>
        <p className="text-sm text-gray-600">Message: {data.message}</p>
      </div>
      
      <p className="mb-4">
        This is a diagnostic page to verify that the Remix application is working correctly.
      </p>
    </div>
  );
}
