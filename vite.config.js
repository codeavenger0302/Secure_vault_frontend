import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/auth/': 'http://localhost:8090',
      '/store/': 'http://localhost:8090',
      '/share/': 'http://localhost:8090',
    },
  },
})
