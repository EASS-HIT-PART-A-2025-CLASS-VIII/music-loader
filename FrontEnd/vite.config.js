import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/pieces': {
        target: 'http://0.0.0.0:8000/', //https://music-loader.onrender.com/
        changeOrigin: true,
        secure: false,
      },
      '/styles': {
        target: 'http://0.0.0.0:8000/',
        changeOrigin: true,
        secure: false,
      },
      '/instruments': {
        target: 'http://0.0.0.0:8000/',
        changeOrigin: true,
        secure: false,
      },
      '/composers': {
        target: 'http://0.0.0.0:8000/',
        changeOrigin: true,
        secure: false,
      },
      '/composer': {
        target: 'http://0.0.0.0:8000/',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
