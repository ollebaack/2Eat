import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

const port = Number(process.env['PORT']) || 5173

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port,
    strictPort: Boolean(process.env['PORT']),
    hmr: false,
    proxy: {
      '/api': {
        target: process.env['services__api__http__0'] ?? 'http://localhost:5264',
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
