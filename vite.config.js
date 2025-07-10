import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@fonts': path.resolve(__dirname, 'src/assets/fonts'),
      '@assets': path.resolve(__dirname, 'src/assets')
    }
  }
})
