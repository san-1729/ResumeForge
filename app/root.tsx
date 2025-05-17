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

export default function App() {
  return (
    <ClientOnly fallback={
      <div className="flex h-screen w-full items-center justify-center text-center">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Loading MCG</h2>
          <p className="text-gray-600">Please wait while we prepare your resume builder...</p>
        </div>
      </div>
    }>
      {() => {
        try {
          // Wrap in error boundary to catch any client-side rendering errors
          return (
            <AuthProvider>
              <Outlet />
            </AuthProvider>
          );
        } catch (error) {
          console.error('Critical error rendering app:', error);
          // Emergency fallback UI in case client-side rendering fails completely
          return (
            <div className="p-8">
              <h1 className="text-2xl font-bold mb-4">MCG - My Career Growth</h1>
              <Outlet />
            </div>
          );
        }
      }}
    </ClientOnly>
  );
}
