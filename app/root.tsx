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

// Pass environment variables to the client
export async function loader({ request }: LoaderFunctionArgs) {
  // Enhanced logging for debugging environment variables
  console.log('ROOT LOADER - Environment Variables Status:');
  console.log('SUPABASE_URL exists:', !!process.env.SUPABASE_URL);
  console.log('SUPABASE_ANON_KEY exists:', !!process.env.SUPABASE_ANON_KEY);
  console.log('Request URL:', request.url);

  return json({
    ENV: {
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY
    }
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

export function Layout({ children }: { children: React.ReactNode }) {
  // COMPLETELY fallback-safe access to ENV variables
  let ENV = {};
  try {
    // First attempt to get from loader data
    const loaderData = useLoaderData<typeof loader>();
    ENV = loaderData?.ENV || {};
    console.log('[ROOT LAYOUT] Successfully loaded ENV from loader data:', !!ENV);
  } catch (error) {
    // If that fails for any reason, provide empty defaults
    console.error('[ROOT LAYOUT] Error accessing loader data:', error);
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
    <ClientOnly fallback={<div>Loading...</div>}>
      {() => (
        <AuthProvider>
          <Outlet />
          {/* Debug components removed */}
        </AuthProvider>
      )}
    </ClientOnly>
  );
}
