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
execSync('npm install --no-package-lock', { stdio: 'inherit' });
execSync('npm run build', { stdio: 'inherit' });
process.chdir('..');

// Build server
console.log('⚙️ Building server...');
process.chdir('server');
execSync('npm install --no-package-lock', { stdio: 'inherit' });
execSync('npm run build', { stdio: 'inherit' });
process.chdir('..');

console.log('✅ Build completed successfully!');
console.log('📁 Server output should be at: server/dist/index.js');

// Verify the file exists
if (fs.existsSync('server/dist/index.js')) {
  console.log('✅ server/dist/index.js exists!');
} else {
  console.log('❌ server/dist/index.js NOT found!');
  console.log('📂 Contents of server/dist/:');
  try {
    const files = fs.readdirSync('server/dist');
    files.forEach(file => console.log(`   - ${file}`));
  } catch (error) {
    console.log('   Directory does not exist');
  }
}
