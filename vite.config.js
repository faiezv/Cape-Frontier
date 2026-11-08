import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { tours } from './src/data/tours.js'

// One codebase, two builds: VITE_SITE=coza | com (defaults to coza)
const SITE = process.env.VITE_SITE === 'com' ? 'com' : 'coza'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: `dist/${SITE}`,
    rollupOptions: {
      output: {
        // Name depends only on file content, so the client and SSR builds
        // always agree, even when two source files are identical.
        assetFileNames: 'assets/[hash][extname]',
      },
    },
  },
  ssgOptions: {
    dirStyle: 'nested',
    includedRoutes(paths) {
      const tourPaths = tours.map(t => `/tours/${t.slug}`)
      return [...paths.filter(p => !p.includes(':slug')), ...tourPaths]
    },
  },
})