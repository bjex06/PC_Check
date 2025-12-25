import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/PC_Check/',  // GitHub Pages用
  build: {
    outDir: 'dist'
  }
})
