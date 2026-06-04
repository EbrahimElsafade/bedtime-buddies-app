// Kill-switch service worker.
// Replaces the old vite-plugin-pwa Workbox SW so returning devices unregister
// and clear stale app-shell caches. Safe to keep deployed indefinitely.

function isWorkboxCacheForThisRegistration(name) {
  const hasWorkboxBucket = /(^|-)precache-v\d+-|(^|-)runtime-|(^|-)googleAnalytics-|supabase-cache|google-fonts-cache|images-cache/.test(name);
  return hasWorkboxBucket;
}

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) =>
  event.waitUntil(
    (async () => {
      try {
        const cacheNames = await caches.keys();
        const toDelete = cacheNames.filter(isWorkboxCacheForThisRegistration);
        await Promise.allSettled(toDelete.map((name) => caches.delete(name)));
        await self.clients.claim();
        const windowClients = await self.clients.matchAll({ type: 'window' });
        await Promise.allSettled(
          windowClients.map((client) => client.navigate(client.url)),
        );
      } finally {
        await self.registration.unregister();
      }
    })(),
  ),
);
