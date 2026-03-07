import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "")
  const defaultTarget =
    mode === "development" ? "http://localhost:8000" : "https://talknex.onrender.com"
  const apiTarget = (env.VITE_SERVER_URL || defaultTarget).replace(/\/+$/, "")

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: true,
        },
      },
    },
  }
})
