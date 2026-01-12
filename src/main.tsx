import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Initialize Sentry error monitoring (before rendering)
import { initSentry } from "./lib/sentry";
initSentry();

createRoot(document.getElementById("root")!).render(<App />);
