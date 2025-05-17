import { useStore } from '@nanostores/react';
import type { LinksFunction, MetaFunction, LoaderFunctionArgs } from '@remix-run/node';
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from '@remix-run/react';
// Using Tailwind CSS as primary styling method per project requirements
// import tailwindReset from '@unocss/reset/tailwind-compat.css?url';
import { themeStore } from './lib/stores/theme';
import { stripIndents } from './utils/stripIndent';
import { createHead } from 'remix-island';
import { useEffect } from 'react';
import { json } from '@remix-run/node';
import { getClientEnv } from './lib/env.server';
import { ClientOnly } from 'remix-utils/client-only';
import AuthProvider from './components/auth/AuthProvider.client';
// Debug components removed

import reactToastifyStyles from 'react-toastify/dist/ReactToastify.css?url';
import globalStyles from './styles/index.scss?url';
import layoutStyles from './styles/layout.css?url';
// Debug styles removed
import xtermStyles from '@xterm/xterm/css/xterm.css?url';

// UnoCSS is disabled for Vercel compatibility
// import 'virtual:uno.css';

// Pass environment variables to the client using our centralized env utility
export async function loader({ request }: LoaderFunctionArgs) {
  // Get environment variables through our utility
  const clientEnv = getClientEnv();
  
  // Enhanced logging for debugging environment variables
  console.log('ROOT LOADER - Using centralized env utility');
  console.log('ROOT LOADER - Request URL:', request.url);
  console.log('ROOT LOADER - SUPABASE_URL exists:', !!clientEnv.SUPABASE_URL);
  console.log('ROOT LOADER - SUPABASE_ANON_KEY exists:', !!clientEnv.SUPABASE_ANON_KEY);

  return json({
    ENV: clientEnv
  });
}

export const meta: MetaFunction = () => {
  return [
    { title: "MCG - My Career Growth" },
    { name: "description", content: "Create professional, ATS-optimized resumes with AI" },
  ];
};

export const links: LinksFunction = () => [
  {
    rel: 'icon',
    href: '/favicon.svg',
    type: 'image/svg+xml',
  },
  {
    rel: 'icon',
    href: '/favicon.png',
    type: 'image/png',
  },
  { rel: 'stylesheet', href: reactToastifyStyles },
  // Tailwind reset removed for Vercel compatibility
  // { rel: 'stylesheet', href: tailwindReset },
  { rel: 'stylesheet', href: globalStyles },
  { rel: 'stylesheet', href: layoutStyles },
  // Debug styles removed
  { rel: 'stylesheet', href: xtermStyles },
  {
    rel: 'preconnect',
    href: 'https://fonts.googleapis.com',
  },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  },
];

const inlineThemeCode = stripIndents`
  setTutorialKitTheme();

  function setTutorialKitTheme() {
    let theme = localStorage.getItem('bolt_theme');

    if (!theme) {
      theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    document.querySelector('html')?.setAttribute('data-theme', theme);
  }
`;

export const Head = createHead(() => (
  <>
    <meta charSet="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <Meta />
    <Links />
    <script dangerouslySetInnerHTML={{ __html: inlineThemeCode }} />
  </>
));

// Create error boundary for the entire app to catch and handle errors gracefully
export function ErrorBoundary() {
  // Completely isolated from loader data - uses no hooks that might fail
  console.log('[ERROR BOUNDARY] Rendering error boundary');
  return (
    <html lang="en" data-theme="light">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>MCG - My Career Growth</title>
        <Meta />
        <Links />
      </head>
      <body>
        <div className="w-full h-full flex items-center justify-center p-8">
          <div className="max-w-md p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-4 text-red-600">Application Error</h1>
            <p className="mb-4">The application encountered an unexpected error.</p>
            <button 
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Return Home
            </button>
          </div>
        </div>
        <Scripts />
      </body>
    </html>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  // COMPLETELY fallback-safe access to ENV variables that also works in error boundaries
  let ENV = {};
  
  try {
    // First attempt to get from loader data
    const loaderData = useLoaderData<typeof loader>();
    ENV = loaderData?.ENV || {};
    console.log('[ROOT LAYOUT] Successfully loaded ENV from loader data:', !!ENV);
  } catch (error) {
    // If that fails, we're likely in an error boundary, so provide defaults
    console.error('[ROOT LAYOUT] Error accessing loader data - likely in error boundary');
    ENV = {};
  }
  
  const theme = useStore(themeStore);

  useEffect(() => {
    document.querySelector('html')?.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <>
      {children}
      <ScrollRestoration />
      <Scripts />
      <script
        dangerouslySetInnerHTML={{
          __html: `window.ENV = ${JSON.stringify(ENV)}`
        }}
      />
    </>
  );
}

// Function to create a Document component that properly includes CSS and scripts
function Document({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>MCG - My Career Growth</title>
        <meta name="description" content="Create professional, ATS-optimized resumes with AI" />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

// The App component now uses our Document component
export default function App() {
  return (
    <Document>
      <div className="h-screen w-full flex flex-col">
        {/* Simplified Header */}
        <header className="flex items-center bg-bolt-elements-background-depth-1 p-5 border-b shadow-sm">
          <div className="flex items-center gap-3 text-bolt-elements-textPrimary">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold">
              <span className="bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500 bg-clip-text text-transparent drop-shadow-sm">MCG</span>
            </h1>
          </div>
          <div className="flex-1"></div>
        </header>

        {/* Main content */}
        <main className="flex-1 flex">
          {/* Sidebar */}
          <div className="w-64 bg-bolt-elements-background-depth-1 border-r p-4 hidden md:block">
            <h2 className="font-semibold text-bolt-elements-textSecondary mb-4">Resume Templates</h2>
            <ul className="space-y-2">
              <li className="p-2 bg-blue-50 rounded border border-blue-100 text-blue-700 cursor-pointer hover:bg-blue-100 transition">Professional</li>
              <li className="p-2 hover:bg-bolt-elements-background-depth-2 rounded text-bolt-elements-textPrimary cursor-pointer transition">Modern</li>
              <li className="p-2 hover:bg-bolt-elements-background-depth-2 rounded text-bolt-elements-textPrimary cursor-pointer transition">Creative</li>
              <li className="p-2 hover:bg-bolt-elements-background-depth-2 rounded text-bolt-elements-textPrimary cursor-pointer transition">Academic</li>
            </ul>
          </div>

          {/* Content Area */}
          <div className="flex-1 flex flex-col">
            {/* Chat Area */}
            <div className="h-1/2 border-b p-4 flex flex-col">
              <div className="flex-1 overflow-y-auto mb-4 bg-bolt-elements-background-depth-1 rounded-lg p-6">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-bolt-elements-textPrimary">MCG Assistant</p>
                    <p className="text-bolt-elements-textSecondary">Welcome to MCG - My Career Growth! I can help you create professional, ATS-friendly resumes tailored to your career goals. How would you like to get started?</p>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <input 
                  type="text" 
                  placeholder="Type your message here..." 
                  className="flex-1 p-3 border border-bolt-elements-borderColor rounded-lg bg-bolt-elements-background-depth-2 text-bolt-elements-textPrimary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Resume Preview */}
            <div className="h-1/2 p-4 bg-bolt-elements-background-depth-1 flex justify-center items-center">
              <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
                <h2 className="text-2xl font-bold mb-2 text-center">Your Resume Preview</h2>
                <p className="text-gray-500 text-center mb-6">Resume content will appear here</p>
                <div className="border-t border-b py-2 mb-4">
                  <div className="text-center">
                    <h3 className="text-xl font-semibold">John Doe</h3>
                    <p className="text-gray-600">Software Engineer</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium border-b mb-2">Summary</h4>
                    <p className="text-sm text-gray-600">Experienced software engineer with expertise in web technologies...</p>
                  </div>
                  <div>
                    <h4 className="font-medium border-b mb-2">Experience</h4>
                    <p className="text-sm text-gray-600">Sample experience details will appear here...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </Document>
  );
}
