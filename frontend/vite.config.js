import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    target: 'esnext',
    assetsDir: 'assets',
  },

  server: {
    host: '0.0.0.0',
    port: 8001
  },

  base: '/',  // Ensures correct asset loading

  plugins: [react()],
})
