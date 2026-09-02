import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { tours } from './src/data/tours.js'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  ssgOptions: {
    includedRoutes(paths) {
      const tourPaths = tours.map(t => `/tours/${t.slug}`)
      return [...paths.filter(p => !p.includes(':slug')), ...tourPaths]
    },
  },
})
