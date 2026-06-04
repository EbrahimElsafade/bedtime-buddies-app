(async function clearStaleDolphoonShell() {
  try {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.allSettled(registrations.map((registration) => registration.unregister()));
    }

    if ('caches' in window) {
      const staleCaches = ['locale-json-cache', 'supabase-cache', 'google-fonts-cache', 'images-cache'];
      const cacheNames = await caches.keys();
      await Promise.allSettled(
        cacheNames
          .filter((name) => /(^|-)precache-v\d+-|(^|-)runtime-|(^|-)googleAnalytics-/.test(name) || staleCaches.includes(name))
          .map((name) => caches.delete(name)),
      );
    }
  } finally {
    const cleanUrl = new URL(window.location.href);
    cleanUrl.searchParams.set('cache-cleared', String(Date.now()));
    window.location.replace(cleanUrl.toString());
  }
})();
