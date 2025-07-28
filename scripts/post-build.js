#!/usr/bin/env node

/**
 * Post-build script to fix manifest.json paths for GitHub Pages deployment
 * This ensures all manifest paths use the correct base path without manual editing
 */

import fs from 'fs';
import path from 'path';

const BASE_PATH = '/kage-app';
const DIST_DIR = 'dist';
const MANIFEST_PATH = path.join(DIST_DIR, 'manifest.json');

console.log('🔧 Running post-build optimizations...');

// Fix manifest.json paths
if (fs.existsSync(MANIFEST_PATH)) {
  console.log('📱 Updating manifest.json paths...');
  
  const manifestContent = fs.readFileSync(MANIFEST_PATH, 'utf8');
  const manifest = JSON.parse(manifestContent);
  
  // Update start_url and scope
  manifest.start_url = `${BASE_PATH}/`;
  manifest.scope = `${BASE_PATH}/`;
  
  // Update icon paths
  if (manifest.icons) {
    manifest.icons = manifest.icons.map(icon => ({
      ...icon,
      src: icon.src.startsWith('/') && !icon.src.startsWith(BASE_PATH) 
        ? `${BASE_PATH}${icon.src}` 
        : icon.src
    }));
  }
  
  // Update screenshot paths
  if (manifest.screenshots) {
    manifest.screenshots = manifest.screenshots.map(screenshot => ({
      ...screenshot,
      src: screenshot.src.startsWith('/') && !screenshot.src.startsWith(BASE_PATH)
        ? `${BASE_PATH}${screenshot.src}`
        : screenshot.src
    }));
  }
  
  // Update shortcut URLs and icons
  if (manifest.shortcuts) {
    manifest.shortcuts = manifest.shortcuts.map(shortcut => ({
      ...shortcut,
      url: shortcut.url.includes('?') 
        ? `${BASE_PATH}/?${shortcut.url.split('?')[1]}`
        : shortcut.url,
      icons: shortcut.icons?.map(icon => ({
        ...icon,
        src: icon.src.startsWith('/') && !icon.src.startsWith(BASE_PATH)
          ? `${BASE_PATH}${icon.src}`
          : icon.src
      }))
    }));
  }
  
  // Write updated manifest
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log('✅ Manifest paths updated successfully');
} else {
  console.log('⚠️  manifest.json not found');
}

// Add cache busting headers to index.html
const indexPath = path.join(DIST_DIR, 'index.html');
if (fs.existsSync(indexPath)) {
  console.log('🚀 Adding cache busting to index.html...');
  
  let indexContent = fs.readFileSync(indexPath, 'utf8');
  
  // Check if cache headers already exist
  if (!indexContent.includes('Cache-Control')) {
    // Add cache control meta tag
    const cacheControlMeta = `  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
  <meta http-equiv="Pragma" content="no-cache">
  <meta http-equiv="Expires" content="0">
  <meta name="version" content="${Date.now()}">`;
    
    // Insert after charset meta tag
    indexContent = indexContent.replace(
      '<meta charset="UTF-8" />',
      `<meta charset="UTF-8" />
${cacheControlMeta}`
    );
  } else {
    console.log('⏭️  Cache headers already present, skipping');
  }
  
  fs.writeFileSync(indexPath, indexContent);
  console.log('✅ Cache busting headers added');
} else {
  console.log('⚠️  index.html not found');
}

console.log('🎉 Post-build optimizations complete!');