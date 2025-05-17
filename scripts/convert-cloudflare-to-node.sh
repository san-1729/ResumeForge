#!/bin/bash

# Loop through all TypeScript files and replace the imports
find /Users/sanchay/Documents/projects/sinx/ResumeForge/bolt.new/app -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/@remix-run\/cloudflare/@remix-run\/node/g'

echo "Converted all Cloudflare imports to Node"
