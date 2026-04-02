import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000
  },
  build: {
    sourcemap: true,
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return

          if (id.includes('vue-router') || id.includes('/vue/')) {
            return 'core-vue'
          }

          if (
            id.includes('/katex/')
          ) {
            return 'math'
          }

          if (
            id.includes('/qrcode/') ||
            id.includes('/jsqr/') ||
            id.includes('/dijkstrajs/')
          ) {
            return 'qrcode'
          }

          if (
            id.includes('/marked/') ||
            id.includes('/dompurify/') ||
            id.includes('/turndown/')
          ) {
            return 'markdown'
          }

          if (id.includes('/crypto-js/')) {
            return 'crypto'
          }
        }
      }
    }
  }
})
