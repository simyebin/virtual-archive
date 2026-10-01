import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves the site from /virtual-archive/
  base: process.env.GITHUB_PAGES ? '/virtual-archive/' : '/',
  plugins: [react(), tailwindcss()],
})
