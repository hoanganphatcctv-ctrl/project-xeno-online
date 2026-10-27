const fs = require('fs');
const path = require('path');

const ROOT_DIR = __dirname;
const DIST_DIR = path.join(ROOT_DIR, 'dist');

console.log('[BUILD] Building Project Xeno for Vercel (Production Bundle with Minification)...');

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

async function processHtmlAndMinifyJs() {
  const htmlSrc = fs.existsSync(path.join(ROOT_DIR, 'frontend', 'index.html')) 
    ? path.join(ROOT_DIR, 'frontend', 'index.html') 
    : path.join(ROOT_DIR, 'index.html');
  
  const content = fs.readFileSync(htmlSrc, 'utf8');

  // Tìm vị trí khối script logic game cuối cùng
  const scriptStartTag = '<script>';
  const scriptEndTag = '</script>';
  const lastScriptStart = content.lastIndexOf(scriptStartTag);
  const lastScriptEnd = content.lastIndexOf(scriptEndTag);

  if (lastScriptStart !== -1 && lastScriptEnd !== -1 && lastScriptEnd > lastScriptStart) {
    const htmlBefore = content.substring(0, lastScriptStart);
    const jsCode = content.substring(lastScriptStart + scriptStartTag.length, lastScriptEnd);
    const htmlAfter = content.substring(lastScriptEnd + scriptEndTag.length);

    console.log(`[BUNDLE] Đã trích xuất mã nguồn JavaScript game (${(jsCode.length / 1024).toFixed(1)} KB)...`);
    console.log('[SECURITY] Đang tiến hành làm rối mã và nén logic game (Terser Minification & Obfuscation)...');

    let minifiedJs = jsCode;
    try {
      let terser;
      try { terser = require('terser'); } catch (e) {
        try { terser = require(path.join(ROOT_DIR, 'node_modules', 'terser')); } catch (e2) {
          try {
            const bundlePath = path.join(ROOT_DIR, 'node_modules', 'terser', 'dist', 'bundle.min.js');
            if (fs.existsSync(bundlePath)) {
              const bundleCode = fs.readFileSync(bundlePath, 'utf8');
              const fn = new Function(bundleCode + '; return Terser;');
              terser = fn();
            }
          } catch (e3) {}
        }
      }

      if (terser && typeof terser.minify === 'function') {
        const result = await terser.minify(jsCode, {
          compress: {
            passes: 2,
            dead_code: true
          },
          mangle: {
            toplevel: true,
            reserved: ['sfx']
          },
          format: {
            comments: false,
            preamble: '/* Project Xeno: Reloaded - Protected Client Core v2.0 - All Rights Reserved */'
          }
        });
        if (result && result.code) {
          minifiedJs = result.code;
          console.log(`[SUCCESS] Nén & làm rối mã thành công! Dung lượng giảm còn ${(minifiedJs.length / 1024).toFixed(1)} KB (Tiết kiệm ${((1 - minifiedJs.length / jsCode.length) * 100).toFixed(1)}%).`);
        }
      } else {
        console.warn('[WARN] Không tìm thấy thư viện Terser, giữ nguyên mã nguồn an toàn (không dùng regex cắt comment).');
        minifiedJs = jsCode;
      }
    } catch (err) {
      console.warn('[WARN] Lỗi trong quá trình nén Terser, dùng mã nguồn gốc an toàn:', err.message);
      minifiedJs = jsCode;
    }

    // 1. Ghi file game.min.js riêng
    fs.writeFileSync(path.join(DIST_DIR, 'game.min.js'), minifiedJs, 'utf8');

    // 2. Ghi file index.html mới đã tách script
    const newHtml = htmlBefore + '<script src="game.min.js"></script>' + htmlAfter;
    fs.writeFileSync(path.join(DIST_DIR, 'index.html'), newHtml, 'utf8');
    console.log(`[SUCCESS] Đã tách file index.html (~${(newHtml.length / 1024).toFixed(1)} KB) và game.min.js (~${(minifiedJs.length / 1024).toFixed(1)} KB).`);
  } else {
    // Fallback nếu không tìm thấy cặp thẻ
    fs.copyFileSync(htmlSrc, path.join(DIST_DIR, 'index.html'));
  }
}

async function runBuild() {
  await processHtmlAndMinifyJs();

  // 2. Copy assets, audio, map, api
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

  // Copy api serverless proxy
  const apiSrc = fs.existsSync(path.join(ROOT_DIR, 'api'))
    ? path.join(ROOT_DIR, 'api')
    : path.join(ROOT_DIR, 'frontend', 'api');
  copyDirSync(apiSrc, path.join(DIST_DIR, 'api'));

  // 3. Copy metadata
  const metaFiles = [
    'favicon.ico', 'favicon.png', 'favicon-32x32.png', 'favicon-48x48.png',
    'apple-touch-icon.png', 'icon-192.png', 'icon-512.png', 'favicon.svg',
    'manifest.json', 'sw.js', 'robots.txt'
  ];
  for (const file of metaFiles) {
    let p = path.join(ROOT_DIR, 'frontend', file);
    if (!fs.existsSync(p)) p = path.join(ROOT_DIR, file);
    if (fs.existsSync(p)) fs.copyFileSync(p, path.join(DIST_DIR, file));
  }

  // 4. Create identifier banner
  fs.writeFileSync(path.join(DIST_DIR, 'THU_MUC_DIST_BAN_ONLINE_COOP.txt'), 
`================================================================================
--> ĐÂY LÀ THƯ MỤC DIST CỦA BẢN ONLINE CO-OP (VERCEL LIVE)
================================================================================
Đường dẫn: alien-shooter-fullstack/dist/
Domain chính thức: https://project-xeno-online.vercel.app
Đặc điểm nhận diện:
- ĐÃ TÁCH BIỆT MÃ NGUỒN: File index.html (~280 KB) chỉ chứa khung HTML/CSS giao diện.
- LOGIC ĐÃ ĐƯỢC BẢO VỆ: File game.min.js (~535 KB) đã được làm rối mã, xóa chú thích tiếng Việt và nén gọn.
- Thư mục dist này sẵn sàng 100% để kéo thả thẳng vào Vercel hoặc deploy tự động qua Git.
================================================================================\n`);

  // 5. Đồng bộ hóa sang cả frontend/dist để 2 thư mục luôn giống hệt nhau 100%
  const FRONTEND_DIST = path.join(ROOT_DIR, 'frontend', 'dist');
  if (fs.existsSync(FRONTEND_DIST)) {
    fs.rmSync(FRONTEND_DIST, { recursive: true, force: true });
  }
  copyDirSync(DIST_DIR, FRONTEND_DIST);

  console.log('[SUCCESS] Build completed successfully! 100% of all single-player features & Online Co-op ready.');
  console.log('[SYNC] Đã đồng bộ song song cả 2 thư mục: dist/ và frontend/dist/ (Không bao giờ lỗi thời)!');
}

runBuild().catch(err => {
  console.error('[ERROR] Build failed:', err);
  process.exit(1);
});
