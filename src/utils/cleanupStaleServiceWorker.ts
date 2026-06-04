import { logger } from './logger'

const CLEANUP_KEY = 'dolphoon-sw-cleanup-v2'

const shouldRunCleanup = () => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false
  }

  if (!('serviceWorker' in navigator) || !('caches' in window)) {
    return false
  }

  return window.localStorage.getItem(CLEANUP_KEY) !== 'done'
}

const isAppCache = (name: string) =>
  /(^|-)precache-v\d+-|(^|-)runtime-|(^|-)googleAnalytics-/.test(name) ||
  ['supabase-cache', 'google-fonts-cache', 'images-cache', 'workbox-precache'].some(
    cacheName => name.includes(cacheName),
  )

export const cleanupStaleServiceWorker = async () => {
  if (!shouldRunCleanup()) return

  try {
    const registrations = await navigator.serviceWorker.getRegistrations()
    await Promise.allSettled(
      registrations
        .filter(registration => {
          const scriptURL =
            registration.active?.scriptURL ??
            registration.waiting?.scriptURL ??
            registration.installing?.scriptURL ??
            ''

          return scriptURL.endsWith('/sw.js') || scriptURL.endsWith('/registerSW.js')
        })
        .map(registration => registration.unregister()),
    )

    const cacheNames = await window.caches.keys()
    await Promise.allSettled(
      cacheNames.filter(isAppCache).map(name => window.caches.delete(name)),
    )

    window.localStorage.setItem(CLEANUP_KEY, 'done')
  } catch (error) {
    logger.warn('Service worker cleanup skipped:', error)
  }
}