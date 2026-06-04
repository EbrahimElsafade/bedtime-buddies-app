
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./components/home/skillPathThemes.css";
import "./i18n";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { cleanupStaleServiceWorker } from "@/utils/cleanupStaleServiceWorker";

void cleanupStaleServiceWorker();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
