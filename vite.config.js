import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import process from 'node:process'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Respeta el puerto asignado por el entorno; 5173 sigue siendo el valor local.
    port: Number(process.env.PORT) || 5173,
  },
  build: {
    // Dos entradas con la misma app: / (español) y /en/ (inglés), cada una con su
    // título y su vista previa al compartir, porque los rastreadores no ejecutan JS.
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        en: resolve(import.meta.dirname, 'en/index.html'),
      },
    },
  },
})
