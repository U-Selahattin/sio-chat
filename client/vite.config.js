import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    // On force l'écoute sur la bonne adresse IP Wi-Fi du Mac
    // Comme ça npm run dev fonctionne directement sans options
    host: '0.0.0.0'
  }
})
