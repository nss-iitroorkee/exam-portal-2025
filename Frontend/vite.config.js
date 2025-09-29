import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "/jee/",
  server: {
    host: true,
    port: 6000
  },
  preview: {
    host: true,
    port: 6000
  }
});
