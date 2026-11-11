import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Figma Make's development-only plugins are intentionally not included here.
// Vercel builds the homepage; preserve-static.mjs copies the original labs.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: { outDir: "dist" },
});