import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000
  },
  define: {
    'process.env': {
      NODE_ENV: process.env.NODE_ENV
    }
  }
}) 