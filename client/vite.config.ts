import { defineConfig } from 'vite'
import path from 'path'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  resolve: {
    alias: {
      shared: fileURLToPath(new URL('../shared', import.meta.url)),
    }
  },
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress warnings about optional dependencies
        if (warning.code === 'MODULE_NOT_FOUND' && warning.message.includes('@rollup/rollup-')) {
          return
        }
        warn(warning)
      }
    },
    // Increase memory limit for build
    chunkSizeWarningLimit: 1000
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'socket.io-client', 'styled-components']
  },
  server: {
    fs: {
      allow: ['..', '../shared', '../../shared', '../../../shared']
    },
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
