/**
 * Simplified Vite config specifically for Vercel production deployment
 * This leverages Tailwind CSS as the primary styling method for MCG per project requirements
 * and avoids ESM/CommonJS compatibility issues with UnoCSS
 */
import { vitePlugin as remixVitePlugin } from '@remix-run/dev';
import { vercelPreset } from '@vercel/remix/vite';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { optimizeCssModules } from 'vite-plugin-optimize-css-modules';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig((configEnv) => {
  const { mode, isSsrBuild } = configEnv as any;
  // Some Vite versions expose `ssrBuild`, ensure compatibility
  const ssr = (configEnv as any).ssrBuild ?? isSsrBuild;

  return {
    build: {
      target: 'esnext',
      // Force the server build to use CommonJS for Vercel compatibility
      // This is critical for fixing the "Cannot use import statement outside a module" error
      rollupOptions: {
        // Make sure server output is CommonJS to avoid ESM import issues
        output: {
          format: ssr ? 'cjs' : 'esm'
        }
      }
    },
    // Configure JSX runtime to use CommonJS format for server builds
    esbuild: {
      jsx: 'automatic',
      jsxImportSource: 'react',
    },
    ssr: {
      // Ensure server builds can handle both ESM and CommonJS modules
      noExternal: ['react', 'react-dom', 'react/jsx-runtime'],
    },
    plugins: [
      nodePolyfills({
        include: ['path', 'buffer'],
      }),
      remixVitePlugin({
        future: {
          v3_fetcherPersist: true,
          v3_relativeSplatPath: true,
          v3_throwAbortReason: true,
        },
        presets: [vercelPreset()],
      }),
      // UnoCSS disabled for Vercel compatibility
      // This is fine since Tailwind CSS is the primary styling method for MCG
      tsconfigPaths(),
      // Don't include the Chrome 129 plugin in production
      mode === 'production' && optimizeCssModules({ apply: 'build' }),
    ].filter(Boolean),
  };
});
