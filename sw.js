/* MK NAVKIT service worker.
   Stale-while-revalidate: loads instantly from cache (works offline), then quietly
   refreshes the cache in the background so edits show up on the next launch.
   Bump CACHE when you add/rename/remove files so old caches get cleared. */
var CACHE = 'mknav-v2';
var ASSETS = [
  './',
  './index.html',
  './core.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-512-maskable.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }));
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== location.origin) return; // leave cross-origin to the browser

  e.respondWith(
    caches.open(CACHE).then(function (cache) {
      return cache.match(req, { ignoreSearch: true }).then(function (hit) {
        // 'no-cache' = revalidate with the server instead of trusting Pages' 10 min HTTP cache
        var network = fetch(req, { cache: 'no-cache' }).then(function (res) {
          if (res && res.ok) cache.put(req, res.clone());
          return res;
        }).catch(function () { return null; });

        if (hit) { e.waitUntil(network); return hit; }
        return network.then(function (res) {
          if (res) return res;
          // Offline + not cached: only fall back to the app shell for page loads
          return req.mode === 'navigate' ? cache.match('./index.html') : Response.error();
        });
      });
    })
  );
});
