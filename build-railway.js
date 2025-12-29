#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting Railway build process...');

// Clean everything
console.log('🧹 Cleaning old files...');
try {
  if (fs.existsSync('node_modules')) fs.rmSync('node_modules', { recursive: true });
  if (fs.existsSync('package-lock.json')) fs.unlinkSync('package-lock.json');
  if (fs.existsSync('client/node_modules')) fs.rmSync('client/node_modules', { recursive: true });
  if (fs.existsSync('client/package-lock.json')) fs.unlinkSync('client/package-lock.json');
  if (fs.existsSync('server/node_modules')) fs.rmSync('server/node_modules', { recursive: true });
  if (fs.existsSync('server/package-lock.json')) fs.unlinkSync('server/package-lock.json');
} catch (error) {
  console.log('⚠️ Some cleanup failed, continuing...');
}

// Clear npm cache
console.log('🗑️ Clearing npm cache...');
execSync('npm cache clean --force', { stdio: 'inherit' });

// Install root dependencies
console.log('📦 Installing root dependencies...');
execSync('npm install --no-package-lock', { stdio: 'inherit' });

// Build client
console.log('🎨 Building client...');
process.chdir('client');
execSync('npm install --include=dev --no-package-lock', { stdio: 'inherit' });
execSync('npm run build', { stdio: 'inherit' });
process.chdir('..');

// Build server
console.log('⚙️ Building server...');
process.chdir('server');
execSync('npm install --include=dev --no-package-lock', { stdio: 'inherit' });
execSync('npm run build', { stdio: 'inherit' });
process.chdir('..');

console.log('✅ Build completed successfully!');
console.log('📁 Server output should be at: server/dist/server/src/index.js');

// Verify the file exists - CRITICAL for Railway
if (fs.existsSync('server/dist/server/src/index.js')) {
  console.log('✅ server/dist/server/src/index.js exists!');
  console.log('✅ Build verification passed!');
} else {
  console.log('❌ server/dist/server/src/index.js NOT found!');
  console.log('📂 Checking server/dist/ directory...');
  try {
    if (fs.existsSync('server/dist')) {
      const findIndexJs = (dir) => {
        const items = fs.readdirSync(dir);
        for (const item of items) {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory()) {
            findIndexJs(fullPath);
          } else if (item === 'index.js') {
            console.log(`   Found index.js at: ${fullPath}`);
          }
        }
      };
      findIndexJs('server/dist');
    } else {
      console.log('   Directory server/dist does not exist');
    }
  } catch (error) {
    console.log(`   Error checking directory: ${error.message}`);
  }
  console.log('❌ BUILD FAILED: server/dist/server/src/index.js not found!');
  process.exit(1);
}
