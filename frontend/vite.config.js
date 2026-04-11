import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      "crispy-space-telegram-4jwg4jxpvpgv257xr-5173.app.github.dev"
    ],
    proxy: {
      "/api":{
        target:"http://localhost:3000",
        changeOrigin: true,
        secure: false,
        //Opcional
        // rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  }
})
