
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
// Keep icons (remix icon pack) if present in assets
import "./assets/css/icons.min.css";
// Use Bootstrap from node_modules instead of the large theme CSS
import "bootstrap/dist/css/bootstrap.min.css";
// Import i18n configuration
import "./i18n.ts";

createRoot(document.getElementById("root")!).render(
  
    <App />
  
);
