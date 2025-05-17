/**
 * Simplified Vite config specifically for Vercel production deployment
 * This avoids ESM/CommonJS compatibility issues with UnoCSS and other packages
 */
import { vitePlugin as remixVitePlugin } from '@remix-run/dev';
import { vercelPreset } from '@vercel/remix/vite';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { optimizeCssModules } from 'vite-plugin-optimize-css-modules';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig((config) => {
  return {
    build: {
      target: 'esnext',
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
      config.mode === 'production' && optimizeCssModules({ apply: 'build' }),
    ].filter(Boolean),
  };
});
