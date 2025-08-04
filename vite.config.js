import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: '/saaran-peli/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        pepepeli: resolve(__dirname, 'src/pepepeli/index.html'),
        ihmissimulaattori: resolve(__dirname, 'src/ihmissimulaattori/index.html')
      }
    }
  }
})