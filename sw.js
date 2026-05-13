const CACHE_NAME = 'seoul-trip-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/js/data.js',
  '/js/app.js',
  '/css/style.css',
  '/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});
