// Basic service worker for offline PWA — prefer fresh HTML, cache-first for assets
const CACHE_NAME = 'kiddoxy-cache-v8';
const ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/scripts/game-brand.js',
  '/game-shell.js',
  '/scripts/kid-kit.js',
  '/styles/kid-kit.css',
  '/game/newGame.html',
  '/game/missing-letter.html',
  '/manifest.json'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  const isDocument = e.request.destination === 'document' || e.request.headers.get('accept')?.includes('text/html');
  const isGamePage = url.pathname.startsWith('/game/');

  if (isDocument || isGamePage) {
    // Network-first for HTML/game pages: ensures latest content; fallback to cache offline
    e.respondWith(
      fetch(e.request).then((res) => {
        // Optionally update cache for offline
        if (!res.ok) return res;
        const clone = res.clone();
        caches.open(CACHE_NAME).then((c) => c.put(e.request, clone)).catch(()=>{});
        return res;
      }).catch(() => caches.match(e.request))
    );
    return;
  }

  // Stale-while-revalidate for same-origin static assets: fast, and updates reach users on next load
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  e.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(e.request);
      const network = fetch(e.request).then((res) => {
        if (res && res.ok) cache.put(e.request, res.clone()).catch(()=>{});
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
