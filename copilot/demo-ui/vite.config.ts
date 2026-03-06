import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // In production the UI is served at /copilot/ inside the main nginx container.
  // VITE_BASE is injected at build time by Dockerfile.nginx (default: '/copilot/').
  // Local dev keeps the root base so the dev server works unchanged.
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
