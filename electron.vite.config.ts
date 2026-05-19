import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const appVersion = JSON.parse(readFileSync(resolve('package.json'), 'utf8')).version

export default defineConfig({
  main: {},
  preload: {},
  renderer: {
    define: {
      __APP_VERSION__: JSON.stringify(appVersion)
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) {
              return undefined
            }

            if (id.includes('framer-motion')) {
              return 'framer-motion'
            }

            if (id.includes('lucide-react')) {
              return 'lucide'
            }

            if (id.includes('react')) {
              return 'react-vendor'
            }

            return 'vendor'
          }
        }
      }
    },
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [react(), tailwindcss()]
  }
})
