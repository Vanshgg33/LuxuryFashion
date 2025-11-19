import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/ 
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Production optimizations
    minify: 'esbuild', // Use esbuild (default, faster and doesn't require terser)
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['lucide-react'],
        },
      },
    },
    sourcemap: false, // Set to true if you need source maps in production
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 5173,
    strictPort: false,
  },
  preview: {
    port: 4173,
    strictPort: false,
  },
})
