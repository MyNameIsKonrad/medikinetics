// Medikinetics Service Worker
const VERSION = 'medikinetics-v3';
const CACHE = VERSION;

// Core app-shell files required to boot the app offline.
const ASSETS = [
  './',
  './index.html',
  // Keep likely PWA files listed so they are cached automatically once added.
  './manifest.webmanifest',
  './manifest.json',
  './favicon.ico',
  './apple-touch-icon.png',
  './icon-192.png',
  './icon-512.png',
];

const APP_SHELL = new Set(['./', './index.html']);

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);

    // Cache required shell first (explicit + predictable install failure if missing).
    await cache.addAll(['./', './index.html']);

    // Cache optional assets only if they exist.
    await Promise.all(
      ASSETS.filter((asset) => !APP_SHELL.has(asset)).map(async (asset) => {
        try {
          const request = new Request(asset, { cache: 'no-cache' });
          const response = await fetch(request);
          if (response.ok) {
            await cache.put(request, response.clone());
          }
        } catch (_) {
          // Ignore optional files that are not present yet.
        }
      })
    );

    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

function isNavigation(request) {
  return request.mode === 'navigate';
}

function isExternal(url) {
  return url.origin !== self.location.origin;
}

function isAppShellAsset(url) {
  if (url.origin !== self.location.origin) return false;
  const path = url.pathname;
  return (
    path === '/' ||
    path === '/index.html' ||
    path.endsWith('/index.html') ||
    path.endsWith('/manifest.webmanifest') ||
    path.endsWith('/manifest.json') ||
    path.endsWith('/favicon.ico') ||
    path.endsWith('/apple-touch-icon.png') ||
    path.endsWith('/icon-192.png') ||
    path.endsWith('/icon-512.png')
  );
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  const networkPromise = fetch(request)
    .then(async (response) => {
      if (response && response.ok) {
        await cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);

  if (cached) {
    networkPromise.catch(() => null);
    return cached;
  }

  const network = await networkPromise;
  if (network) return network;

  return new Response('Offline', { status: 503, statusText: 'Offline' });
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response && response.ok) {
    await cache.put(request, response.clone());
  }
  return response;
}

async function networkFirstNavigation(request) {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      await cache.put(request, response.clone());
    }
    return response;
  } catch (_) {
    const cachedPage = await cache.match('./index.html');
    if (cachedPage) return cachedPage;
    return new Response('Offline', { status: 503, statusText: 'Offline' });
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') {
    return;
  }

  if (isNavigation(request)) {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  if (isAppShellAsset(url)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (isExternal(url)) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // Same-origin non-shell requests: prefer fresh network, fallback to cache.
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const response = await fetch(request);
      if (response && response.ok) {
        await cache.put(request, response.clone());
      }
      return response;
    } catch (_) {
      const cached = await cache.match(request);
      if (cached) return cached;
      return new Response('Offline', { status: 503, statusText: 'Offline' });
    }
  })());
});
