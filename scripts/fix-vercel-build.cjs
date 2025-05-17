// @ts-check
/**
 * This script fixes the CommonJS module compatibility issues in the build output.
 * It should be run after the build is complete but before deployment.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Define the paths to search
const serverBuildDir = path.resolve(__dirname, '../build/server');

// Get all JavaScript files in the server build
function getAllJsFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      files.push(...getAllJsFiles(fullPath));
    } else if (item.name.endsWith('.js') || item.name.endsWith('.mjs')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function fixImportStatements(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // If the file has the problematic import, fix it
    if (content.includes('import { renderToReadableStream } from "react-dom/server"') || 
        content.includes('import { renderToReadableStream } from \'react-dom/server\'')) {
      
      console.log(`Fixing problematic import in ${filePath}`);
      
      // Replace the problematic import with the CommonJS-compatible version
      const fixedContent = content
        .replace(
          /import\s+{\s*renderToReadableStream\s*}\s+from\s+['"](react-dom\/server)['"]/g,
          'import pkg from "$1";\nconst { renderToReadableStream } = pkg;'
        )
        .replace(
          /import\s+\*\s+as\s+ReactDOMServer\s+from\s+['"](react-dom\/server)['"]/g,
          'import ReactDOMServer from "$1";'
        );
      
      fs.writeFileSync(filePath, fixedContent);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error);
    return false;
  }
}

// Main execution
console.log('🔍 Scanning for problematic imports in server build...');

if (!fs.existsSync(serverBuildDir)) {
  console.error(`❌ Server build directory not found: ${serverBuildDir}`);
  process.exit(1);
}

const jsFiles = getAllJsFiles(serverBuildDir);
console.log(`Found ${jsFiles.length} JavaScript files in the server build.`);

let fixedCount = 0;
for (const file of jsFiles) {
  if (fixImportStatements(file)) {
    fixedCount++;
  }
}

if (fixedCount > 0) {
  console.log(`✅ Fixed ${fixedCount} files with problematic imports.`);
} else {
  console.log('✅ No problematic imports found.');
}

// Look specifically for the entry file
const indexPaths = [
  path.join(serverBuildDir, 'index.js'),
  path.join(serverBuildDir, 'nodejs-eyJydW50aW1lIjoibm9kZWpzIn0/index.js'),
  path.join(serverBuildDir, 'nodejs-eyJydW50aW1lIjoibm9kZWpzIn0/index.mjs')
];

for (const indexPath of indexPaths) {
  if (fs.existsSync(indexPath)) {
    console.log(`Found server index at ${indexPath}, checking for issues...`);
    fixImportStatements(indexPath);
  }
}

console.log('🎉 Server build fixes completed!');
