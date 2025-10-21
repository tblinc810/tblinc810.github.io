import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import ViteFonts from 'unplugin-fonts/vite'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/tblinc810.github.io/',
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
    ViteFonts({
      google: {
        families: ['Roboto', 'Montserrat'],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
   build: {
    chunkSizeWarningLimit: 1600,
  },
})
