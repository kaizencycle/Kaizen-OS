import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Add any other Render domains here (e.g., staging)
const allowed = ['citizen-shield.onrender.com']

export default defineConfig({
  plugins: [react()],

  // Local dev
  server: { host: true, port: 3007 },

  // Render web service uses Vite preview
  preview: {
    host: true,
    port: Number(process.env.PORT) || 10000,
    allowedHosts: allowed, // <-- fixes "host is not allowed"
  },

  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2020',
    sourcemap: false,
    minify: 'esbuild',
  },

  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
})


