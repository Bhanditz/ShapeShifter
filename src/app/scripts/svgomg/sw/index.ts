import { idbKeyval as storage } from '../utils/storage.js';

const version = '1.0.0';
const cachePrefix = 'svgomg-';
const staticCacheName = `${cachePrefix}static-${version}`;
const fontCacheName = `${cachePrefix}fonts`;
const expectedCaches = [staticCacheName, fontCacheName];

addEventListener('install', (event: any) => {
  event.waitUntil(
    (async () => {
      const activeVersionPromise = storage.get('active-version');
      const cache = await caches.open(staticCacheName);

      await cache.addAll([
        './',
        'imgs/icon.png',
        'css/all.css',
        'js/gzip-worker.js',
        'js/page.js',
        'js/prism-worker.js',
        'js/svgo-worker.js',
        'changelog.json',
        'https://fonts.googleapis.com/css?family=Roboto:400,700|Inconsolata',
      ]);

      const activeVersion = await activeVersionPromise;

      // If it's a major version change, don't skip waiting
      if (!activeVersion || (activeVersion as string).split('.')[0] === version.split('.')[0]) {
        (self as any).skipWaiting();
      }
    })(),
  );
});

addEventListener('activate', (event: any) => {
  event.waitUntil(
    (async () => {
      // remove caches beginning "svgomg-" that aren't in expectedCaches
      for (const cacheName of await caches.keys()) {
        if (!cacheName.startsWith(cachePrefix)) continue;
        if (!expectedCaches.includes(cacheName)) await caches.delete(cacheName);
      }

      await storage.set('active-version', version);
    })(),
  );
});

async function handleFontRequest(request) {
  const match = await caches.match(request);
  if (match) return match;

  const [response, fontCache] = Promise.all([
    await fetch(request),
    await caches.open(fontCacheName),
  ]) as any;

  fontCache.put(request, response.clone());
  return response;
}

addEventListener('fetch', (event: any) => {
  const url = new URL(event.request.url);

  if (url.host == 'fonts.gstatic.com') {
    event.respondWith(handleFontRequest(event.request));
    return;
  }
  event.respondWith(caches.match(event.request).then(r => r || fetch(event.request)));
});