function isWorkboxCacheForThisRegistration(name) {
  const hasWorkboxBucket = /(^|-)precache-v\d+-|(^|-)runtime-|(^|-)googleAnalytics-/.test(name);
  return hasWorkboxBucket || name === "locale-json-cache" || name === "supabase-cache" || name === "google-fonts-cache" || name === "images-cache";
}

async function clearAppCaches() {
  const cacheNames = await caches.keys();
  const appCacheNames = cacheNames.filter(isWorkboxCacheForThisRegistration);
  await Promise.allSettled(appCacheNames.map((name) => caches.delete(name)));
}

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) =>
  event.waitUntil(
    (async () => {
      try {
        await clearAppCaches();
        await self.clients.claim();
        const windowClients = await self.clients.matchAll({ type: "window" });
        await Promise.allSettled(windowClients.map((client) => client.navigate(client.url)));
      } finally {
        await self.registration.unregister();
      }
    })(),
  ),
);