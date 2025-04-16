// Import dark mode initializer first to set dark mode before anything renders
import "./index-dark-mode";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { Toaster } from "@/components/ui/toaster";

createRoot(document.getElementById("root")!).render(
  <>
    <App />
    <Toaster />
  </>
);
