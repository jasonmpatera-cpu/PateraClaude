import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => ({
  // GitHub Pages serves this repo at /PateraClaude/, not /, so production
  // builds need every asset URL prefixed accordingly.
  base: mode === "production" ? "/PateraClaude/" : "/",
  plugins: [react()],
  server: {
    port: 5174
  }
}));
