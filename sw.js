// Medikinetics Service Worker
// Bump VERSION on every deploy — triggers cache refresh on next load
const VERSION   = ‘medikinetics-v1’;
const CACHE     = VERSION;
const ASSETS    = [’./index.html’];

// Install: cache assets
self.addEventListener(‘install’, e => {
e.waitUntil(
caches.open(CACHE)
.then(c => c.addAll(ASSETS))
.then(() => self.skipWaiting())
);
});

// Activate: delete old caches, take control immediately
self.addEventListener(‘activate’, e => {
e.waitUntil(
caches.keys()
.then(keys => Promise.all(
keys.filter(k => k !== CACHE).map(k => caches.delete(k))
))
.then(() => self.clients.claim())
);
});

// Fetch: serve from cache, fall back to network
// localStorage (your pill data) is never touched — only HTML is cached
self.addEventListener(‘fetch’, e => {
e.respondWith(
caches.match(e.request)
.then(cached => cached || fetch(e.request))
);
});
