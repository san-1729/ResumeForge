#!/usr/bin/env node

// This script configures the build process specifically for Vercel deployment
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Log that we're running the Vercel build script
console.log('🔨 Running Vercel-specific build setup...');

// Create a temporary package.json without "type": "module" for the server build
const packageJson = require('../package.json');
const originalType = packageJson.type;

// Remove "type": "module" for server build
delete packageJson.type;

// Write the modified package.json
fs.writeFileSync(
  path.join(__dirname, '../package.json.temp'),
  JSON.stringify(packageJson, null, 2)
);

try {
  // Back up the original package.json
  fs.copyFileSync(
    path.join(__dirname, '../package.json'),
    path.join(__dirname, '../package.json.bak')
  );
  
  // Replace with the temporary one
  fs.copyFileSync(
    path.join(__dirname, '../package.json.temp'),
    path.join(__dirname, '../package.json')
  );
  
  console.log('📦 Modified package.json for CommonJS compatibility');
  
  // Run the build command
  console.log('🏗️ Building application...');
  execSync('remix vite:build', { stdio: 'inherit' });
  
  // Verify the server build
  const serverBuildPath = path.join(__dirname, '../build/server');
  if (fs.existsSync(serverBuildPath)) {
    console.log('✅ Server build completed successfully');
    
    // Ensure the server build is using CommonJS modules
    const indexPath = path.join(serverBuildPath, 'index.js');
    if (fs.existsSync(indexPath)) {
      let content = fs.readFileSync(indexPath, 'utf8');
      
      // Check if it's still using ES module syntax
      if (content.includes('import { renderToReadableStream } from')) {
        console.log('⚠️ WARNING: Server build still contains ES Module imports. Attempting to fix...');
        
        // Replace problematic import
        content = content.replace(
          /import\s+{\s*renderToReadableStream\s*}\s+from\s+['"]react-dom\/server['"];?/g,
          `import pkg from 'react-dom/server';\nconst { renderToReadableStream } = pkg;`
        );
        
        fs.writeFileSync(indexPath, content);
        console.log('🔧 Fixed imports in server build');
      }
    }
  } else {
    console.error('❌ Server build not found!');
  }
} finally {
  // Restore the original package.json
  if (fs.existsSync(path.join(__dirname, '../package.json.bak'))) {
    fs.copyFileSync(
      path.join(__dirname, '../package.json.bak'),
      path.join(__dirname, '../package.json')
    );
    fs.unlinkSync(path.join(__dirname, '../package.json.bak'));
    console.log('📦 Restored original package.json');
  }
  
  // Clean up temporary file
  if (fs.existsSync(path.join(__dirname, '../package.json.temp'))) {
    fs.unlinkSync(path.join(__dirname, '../package.json.temp'));
  }
}

console.log('🎉 Vercel build process completed');
