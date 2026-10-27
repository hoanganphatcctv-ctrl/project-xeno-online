// Project Xeno: Reloaded - PWA Service Worker v2.0.0
const CACHE_NAME = 'project-xeno-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/game.min.js',
  '/manifest.json',
  '/favicon.ico',
  '/favicon.png',
  '/favicon-32x32.png',
  '/favicon-48x48.png',
  '/apple-touch-icon.png',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Use individual caching so single asset 404 does not fail install
      await Promise.allSettled(
        STATIC_ASSETS.map(async (asset) => {
          try {
            const res = await fetch(asset, { cache: 'no-cache' });
            if (res && res.ok) {
              await cache.put(asset, res);
            }
          } catch (e) {
            // Non-blocking prefetch
          }
        })
      );
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Network-first strategy with robust cache fallback
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Don't intercept API, WebSocket, or cross-origin CDNs (PeerJS, Tailwind, etc.)
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/socket.io/') ||
    url.hostname !== self.location.hostname
  ) {
    return;
  }

  event.respondWith(
    fetch(req)
      .then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(req, responseToCache).catch(() => {});
          });
        }
        return response;
      })
      .catch(async () => {
        // Try matching request with ignoreSearch: true
        const cachedResponse = await caches.match(req, { ignoreSearch: true });
        if (cachedResponse) {
          return cachedResponse;
        }

        // If navigation request (cold launch from PWA icon), fallback to cached index.html or root
        if (req.mode === 'navigate') {
          const cachedIndex =
            (await caches.match('/index.html', { ignoreSearch: true })) ||
            (await caches.match('/', { ignoreSearch: true })) ||
            (await caches.match('./index.html', { ignoreSearch: true }));
          if (cachedIndex) {
            return cachedIndex;
          }
        }

        return new Response('Network error occurred', {
          status: 408,
          headers: { 'Content-Type': 'text/plain' }
        });
      })
  );
});
