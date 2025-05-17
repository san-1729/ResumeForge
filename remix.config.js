/**
 * @type {import('@remix-run/dev').AppConfig}
 */
export default {
  ignoredRouteFiles: ["**/.*"],
  // When running in Vercel, we need to use the Vercel adapter
  serverModuleFormat: "cjs",
  serverPlatform: "node",
  // Explicitly set the server entry for each platform so Remix bundles the correct file
  server: "./app/entry.server.node.tsx",
  // Use the Vercel adapter when deploying to Vercel
  serverDependenciesToBundle: [],
  // Add your diagnostic routes
  routes: {
    // If you have additional routes to add, you can do so here
  },
  // This adds logging during the build process
  future: {
    v2_errorBoundary: true,
    v2_meta: true,
    v2_normalizeFormMethod: true,
    v2_routeConvention: true,
  },
};

// Add build-time logging
console.log('=== REMIX CONFIG ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('VERCEL:', process.env.VERCEL);
console.log('REMIX_ENTRY_SERVER_PATH:', process.env.REMIX_ENTRY_SERVER_PATH);
console.log('Server Platform:', process.env.VERCEL ? "node" : "cloudflare");
console.log('Server Module Format:', "cjs");
console.log('==================');
