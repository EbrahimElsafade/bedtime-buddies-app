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
      
      // Listen for updates
      registration.addEventListener('updatefound', () => {
        // Handle updates if needed
      });
      
    } catch (error) {
      // Handle registration error silently
    }
  });

  // Listen for service worker messages
  navigator.serviceWorker.addEventListener('message', (event) => {
    // Handle messages if needed
  });
}

// Check if app is running as PWA (keep for functionality, but remove logs)
if (window.matchMedia('(display-mode: standalone)').matches) {
  // App is running as PWA
} else {
  // App is running in browser
}
