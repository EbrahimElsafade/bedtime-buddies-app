async function clearDolphoonPwaState() {
  const appCacheNames = ["locale-json-cache", "supabase-cache", "google-fonts-cache", "images-cache"];

  if ("serviceWorker" in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.allSettled(registrations.map((registration) => registration.unregister()));
  }

  if ("caches" in window) {
    const cacheNames = await caches.keys();
    await Promise.allSettled(
      cacheNames
        .filter((name) => /(^|-)precache-v\d+-|(^|-)runtime-|(^|-)googleAnalytics-/.test(name) || appCacheNames.includes(name))
        .map((name) => caches.delete(name)),
    );
  }
}

clearDolphoonPwaState().finally(() => {
  if (sessionStorage.getItem("dolphoon-register-sw-cleaned") !== "1") {
    sessionStorage.setItem("dolphoon-register-sw-cleaned", "1");
    window.location.reload();
  }
});