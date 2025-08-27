
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n";

declare global {
  interface Navigator {
    standalone?: boolean;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Enhanced service worker registration for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      console.log('Registering service worker...');
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      console.log('Service worker registered successfully:', registration);
      
      // Check if service worker is ready
      if (registration.active) {
        console.log('Service worker is active and ready');
      }
      
      // Listen for updates (safer flow): when a new SW is installed, prompt for refresh or auto-skip-waiting
      registration.addEventListener('updatefound', () => {
        console.log('Service worker update found');
        const newWorker = registration.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('New content is available. Activating new service worker...');
            // Ask the new worker to skip waiting; page will reload on controllerchange
            newWorker.postMessage({ type: 'SKIP_WAITING' });
          }
        });
      });
      
    } catch (error) {
      console.error('Service worker registration failed:', error);
    }
  });

  // When the controller changes (new SW takes control), reload once
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload();
  });
}

// Check if app is running as PWA
const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
const isInWebAppiOS = navigator.standalone === true;

if (isStandalone || isInWebAppiOS) {
  console.log('App is running as PWA');
  // App is running as PWA - add any PWA-specific initialization here
  document.body.classList.add('pwa-mode');
}

// Debug PWA requirements
console.log('PWA Debug Info:', {
  hasServiceWorker: 'serviceWorker' in navigator,
  isHTTPS: location.protocol === 'https:' || location.hostname === 'localhost',
  hasManifest: document.querySelector('link[rel="manifest"]') !== null,
  isStandalone,
  isInWebAppiOS,
  userAgent: navigator.userAgent
});
