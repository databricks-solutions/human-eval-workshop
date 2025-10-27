import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/users': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/workshops': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/dbsql-export': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/test': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/databricks': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'build',
  },
})