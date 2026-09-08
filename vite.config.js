import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import process from 'node:process'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Respeta el puerto asignado por el entorno; 5173 sigue siendo el valor local.
    port: Number(process.env.PORT) || 5173,
  },
})
