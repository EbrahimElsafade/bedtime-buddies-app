
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Enhanced service worker registration for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      // Check if service worker is ready
      if (registration.active) {
        // Service worker is active and ready
      }
      
      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New content is available, refresh needed
                window.location.reload();
              }
            }
          });
        }
      });
      
    } catch (error) {
      // Handle registration error silently
    }
  });

  // Listen for service worker messages
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
      window.location.reload();
    }
  });
}

// Check if app is running as PWA
const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
const isInWebAppiOS = (window.navigator as any).standalone === true;

if (isStandalone || isInWebAppiOS) {
  // App is running as PWA - add any PWA-specific initialization here
  document.body.classList.add('pwa-mode');
}
