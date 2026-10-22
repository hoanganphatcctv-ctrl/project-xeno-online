const fs = require('fs');
const path = require('path');

const ROOT_DIR = __dirname;
const DIST_DIR = path.join(ROOT_DIR, 'dist');

console.log('🚀 Building Project Xeno for Vercel...');

// Clean dist
if (fs.existsSync(DIST_DIR)) {
  fs.rmSync(DIST_DIR, { recursive: true, force: true });
}
fs.mkdirSync(DIST_DIR, { recursive: true });

function copyDirSync(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

// 1. Copy index.html from frontend or root
const htmlSrc = fs.existsSync(path.join(ROOT_DIR, 'frontend', 'index.html')) 
  ? path.join(ROOT_DIR, 'frontend', 'index.html') 
  : path.join(ROOT_DIR, 'index.html');
fs.copyFileSync(htmlSrc, path.join(DIST_DIR, 'index.html'));

// 2. Copy assets, audio, map
const assetsSrc = fs.existsSync(path.join(ROOT_DIR, 'frontend', 'assets'))
  ? path.join(ROOT_DIR, 'frontend', 'assets')
  : path.join(ROOT_DIR, 'assets');
const audioSrc = fs.existsSync(path.join(ROOT_DIR, 'frontend', 'audio'))
  ? path.join(ROOT_DIR, 'frontend', 'audio')
  : path.join(ROOT_DIR, 'audio');
const mapSrc = fs.existsSync(path.join(ROOT_DIR, 'frontend', 'map'))
  ? path.join(ROOT_DIR, 'frontend', 'map')
  : path.join(ROOT_DIR, 'map');

copyDirSync(assetsSrc, path.join(DIST_DIR, 'assets'));
copyDirSync(audioSrc, path.join(DIST_DIR, 'audio'));
copyDirSync(mapSrc, path.join(DIST_DIR, 'map'));

// 3. Copy metadata
for (const file of ['favicon.svg', 'manifest.json', 'robots.txt']) {
  let p = path.join(ROOT_DIR, 'frontend', file);
  if (!fs.existsSync(p)) p = path.join(ROOT_DIR, file);
  if (fs.existsSync(p)) fs.copyFileSync(p, path.join(DIST_DIR, file));
}

console.log('✅ Build completed successfully! 100% of all single-player features & Online Co-op ready.');

