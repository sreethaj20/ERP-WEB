import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('react-router-dom')) return 'router'
          if (id.includes('react-calendar')) return 'calendar'
          if (id.includes('react-icons')) return 'icons'
          if (id.includes('axios')) return 'axios'
          return 'vendor'
        },
      },
    },
  },
  server: {
    port: 3000, // ✅ force Vite to always use port 3000
    open: true, // ✅ auto-open browser on start
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        //secure: false,
      },
    },
  },
})
