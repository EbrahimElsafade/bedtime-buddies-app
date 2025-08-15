
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

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
      
      console.log('SW registered successfully:', registration);
      
      // Listen for updates
      registration.addEventListener('updatefound', () => {
        console.log('New service worker available');
      });
      
      // Check if there's an active service worker
      if (registration.active) {
        console.log('Service worker is active');
      }
      
    } catch (error) {
      console.error('SW registration failed:', error);
    }
  });

  // Listen for service worker messages
  navigator.serviceWorker.addEventListener('message', (event) => {
    console.log('Received message from service worker:', event.data);
  });
}

// Debug PWA installability
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('beforeinstallprompt event fired - PWA is installable!');
});

window.addEventListener('appinstalled', () => {
  console.log('PWA was installed successfully');
});

// Check if app is running as PWA
if (window.matchMedia('(display-mode: standalone)').matches) {
  console.log('App is running as PWA');
} else {
  console.log('App is running in browser');
}
