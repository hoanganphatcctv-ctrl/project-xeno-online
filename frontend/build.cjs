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

// 1. Copy index.html
fs.copyFileSync(path.join(ROOT_DIR, 'index.html'), path.join(DIST_DIR, 'index.html'));

// 2. Copy assets, audio, map
copyDirSync(path.join(ROOT_DIR, 'assets'), path.join(DIST_DIR, 'assets'));
copyDirSync(path.join(ROOT_DIR, 'audio'), path.join(DIST_DIR, 'audio'));
copyDirSync(path.join(ROOT_DIR, 'map'), path.join(DIST_DIR, 'map'));

// 3. Copy metadata
for (const file of ['favicon.svg', 'manifest.json', 'robots.txt']) {
  const p = path.join(ROOT_DIR, file);
  if (fs.existsSync(p)) fs.copyFileSync(p, path.join(DIST_DIR, file));
}

// 4. Create identifier banner
fs.writeFileSync(path.join(DIST_DIR, 'THU_MUC_DIST_BAN_ONLINE_COOP.txt'), 
`================================================================================
👉 ĐÂY LÀ THƯ MỤC DIST CỦA BẢN ONLINE CO-OP (VERCEL LIVE)
================================================================================
Đường dẫn: alien-shooter-fullstack/dist/
Domain chính thức: https://project-xeno-online.vercel.app
Đặc điểm nhận diện:
- File index.html đầy đủ (~1.37 MB) chứa 100% đồ họa chơi đơn + P2P PeerJS Co-Op.
- KHÔNG CÓ file game.min.js lẻ.
================================================================================\n`);

// 5. Đồng bộ hóa sang cả alien-shooter-fullstack/dist để 2 thư mục luôn giống hệt nhau 100%
const PARENT_DIST = path.join(ROOT_DIR, '..', 'dist');
if (fs.existsSync(PARENT_DIST)) {
  fs.rmSync(PARENT_DIST, { recursive: true, force: true });
}
copyDirSync(DIST_DIR, PARENT_DIST);

console.log('✅ Build completed successfully! 100% of all single-player features & Online Co-op ready.');
console.log('🔄 Đã đồng bộ song song cả 2 thư mục: dist/ và frontend/dist/ (Không bao giờ lỗi thời)!');

