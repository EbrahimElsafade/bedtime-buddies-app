const APP_SW_PATHS = ["/sw.js", "/service-worker.js"];
const CLEANUP_RELOAD_KEY = "dolphoon-pwa-cleanup-reloaded";

const isAppServiceWorker = (registration: ServiceWorkerRegistration) => {
  const scriptURL = registration.active?.scriptURL || registration.installing?.scriptURL || registration.waiting?.scriptURL || "";
  return APP_SW_PATHS.some((path) => scriptURL.endsWith(path)) || registration.scope === `${window.location.origin}/`;
};

const isAppCache = (name: string) => {
  const workboxCache = /(^|-)precache-v\d+-|(^|-)runtime-|(^|-)googleAnalytics-/.test(name);
  return workboxCache || ["locale-json-cache", "supabase-cache", "google-fonts-cache", "images-cache"].includes(name);
};

const cleanupStalePwa = async () => {
  if (typeof window === "undefined") return;

  const unregisterResults = "serviceWorker" in navigator
    ? await Promise.allSettled(
        (await navigator.serviceWorker.getRegistrations())
          .filter(isAppServiceWorker)
          .map((registration) => registration.unregister()),
      )
    : [];

  const deletedCaches = "caches" in window
    ? await Promise.allSettled(
        (await caches.keys())
          .filter(isAppCache)
          .map((name) => caches.delete(name)),
      )
    : [];

  const changedBrowserState = unregisterResults.length > 0 || deletedCaches.length > 0;
  if (changedBrowserState && sessionStorage.getItem(CLEANUP_RELOAD_KEY) !== "1") {
    sessionStorage.setItem(CLEANUP_RELOAD_KEY, "1");
    window.location.reload();
  }
};

cleanupStalePwa().catch(() => {
  // Cleanup must never block app startup.
});