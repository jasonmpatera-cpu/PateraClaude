import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => ({
  // GitHub Pages serves this repo at /PateraClaude/, not /, so production
  // builds need every asset URL prefixed accordingly. `vite build` and
  // `vite preview` both resolve mode to "production"; only `vite dev`
  // (mode "development") should stay at the root. Keying this off
  // `command` instead would be wrong: `vite preview` reports command
  // "serve" even though it's serving the production build, which left
  // preview requesting /PateraClaude/assets/* while thinking base was "/"
  // and silently falling back to index.html for every asset (a real bug
  // caught by testing the built output before deploying).
  base: mode === "production" ? "/PateraClaude/" : "/",
  plugins: [react()],
  server: {
    port: 5173
  }
}));
