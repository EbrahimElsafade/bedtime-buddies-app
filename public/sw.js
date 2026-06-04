function isAppCache(name) {
  return (
    /(^|-)precache-v\d+-|(^|-)runtime-|(^|-)googleAnalytics-/.test(name) ||
    [
      'supabase-cache',
      'google-fonts-cache',
      'images-cache',
      'workbox-precache',
    ].some(cacheName => name.includes(cacheName))
  )
}

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      try {
        const cacheNames = await caches.keys()
        await Promise.allSettled(
          cacheNames.filter(isAppCache).map(name => caches.delete(name)),
        )
        await self.clients.claim()
        const windowClients = await self.clients.matchAll({ type: 'window' })
        await Promise.allSettled(
          windowClients.map(client => client.navigate(client.url)),
        )
      } finally {
        await self.registration.unregister()
      }
    })(),
  )
})