/*
 * Service worker: keeps the app itself on the phone so it opens with no signal.
 * The data is not cached here: it lives in IndexedDB (src/shared/db). Backend calls go straight
 * to the network, because the sync module already handles failures and retries.
 */
const CACHE = 'lacocha-app-v9';
const SHELL = ['/', '/index.html', '/manifest.webmanifest', '/icons/icon.svg', '/icons/icon-192.png', '/icons/icon-512.png',
  // The trout: its picture and the two 3D models, saved up front so they also show with no signal
  '/objects/trucha.png', '/models/trucha.glb', '/models/trucha-lod.glb'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    fetch('/offline-assets.json', { cache: 'no-store' })
      .then((response) => { if (!response.ok) throw new Error('No se pudo preparar la app sin señal'); return response.json(); })
      .then((files) => caches.open(CACHE).then((cache) => cache.addAll([...SHELL, ...files]))),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  // Only our own files. The backend lives on another address and is never cached.
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    // Opening the app: fresh version if there is signal, saved copy if not
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put('/index.html', copy));
          return response;
        })
        .catch(() => caches.match('/index.html')),
    );
    return;
  }

  // JS, CSS and icons: Vite gives them a new name on every build, so a saved copy is always valid
  event.respondWith(
    // These are our versioned static files. A server's Vary: Origin must not make a module
    // request miss the copy saved at install time (cache.addAll sends a different Origin header).
    caches.match(request, { ignoreVary: true }).then(
      (cached) =>
        cached ??
        fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        }),
    ),
  );
});
