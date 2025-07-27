import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/kage-app/',
  plugins: [
    react()
  ],
  server: {
    host: true, // Allow external access
    port: 5174, // Consistent port
    strictPort: true, // Fail if port is already in use
  },
})