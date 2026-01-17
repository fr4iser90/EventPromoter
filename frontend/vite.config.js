import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { i18nCheckPlugin } from './scripts/vite-plugin-i18n-check.js'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), i18nCheckPlugin()],
  server: {
    port: 3000,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'mui-icons': ['@mui/icons-material']
        }
      }
    },
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    }
  },
  optimizeDeps: {
    include: ['@mui/icons-material'],
    exclude: ['@mui/icons-material/MenuBookOutlined']
  }
})
