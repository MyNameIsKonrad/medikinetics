// Medikinetics Service Worker v3
const VERSION = 'medikinetics-20260425.1823';
const CACHE   = VERSION;
const ASSETS  = ['./index.html'];

self.addEventListener('install', e => {
e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
e.waitUntil(caches.keys().then(keys =>
Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
e.respondWith(caches.match(e.request).then(cached => cached || fetch(e.request)));
});
