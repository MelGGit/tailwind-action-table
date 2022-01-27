import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import Icons from 'unplugin-icons/vite'

export default defineConfig({
  plugins: [vue(), Icons({autoInstall: true, compiler: 'vue3'})],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
})
