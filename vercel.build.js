#!/usr/bin/env node

/**
 * Custom build script specifically for Vercel deployment
 * This handles the ESM/CommonJS compatibility issues
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Starting Vercel-specific build process...');

// Create a temporary vite.config.ts without problematic imports
const viteConfigPath = path.resolve(__dirname, 'vite.config.ts');
const originalViteConfig = fs.readFileSync(viteConfigPath, 'utf8');

// Create a simplified vite config that works in both ESM and CommonJS environments
const simplifiedViteConfig = originalViteConfig
  // Remove UnoCSS import
  .replace(/import UnoCSS from ['"]unocss\/vite['"];?(\r?\n)?/g, '')
  // Remove UnoCSS from plugins array
  .replace(/UnoCSS\(\),?(\r?\n)?/g, '// UnoCSS disabled for Vercel compatibility\n');

// Create a backup of the original file
fs.writeFileSync(`${viteConfigPath}.bak`, originalViteConfig);
console.log('✅ Created backup of original vite.config.ts');

// Write the simplified config
fs.writeFileSync(viteConfigPath, simplifiedViteConfig);
console.log('✅ Created simplified vite.config.ts for Vercel build');

try {
  // Set an environment variable to use our Vercel-specific Vite config
  process.env.REMIX_VITE_CONFIG_PATH = path.resolve(__dirname, 'vite.config.vercel.ts');
  
  // Run the Remix build with our specialized config
  console.log('🏗️ Running Remix build with Vercel-specific configuration...');
  execSync('remix vite:build', { stdio: 'inherit', env: process.env });
  console.log('✅ Remix build completed successfully');
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
} finally {
  // Restore the original vite.config.ts
  fs.copyFileSync(`${viteConfigPath}.bak`, viteConfigPath);
  fs.unlinkSync(`${viteConfigPath}.bak`);
  console.log('✅ Restored original vite.config.ts');
}

console.log('🎉 Vercel build process completed successfully');
