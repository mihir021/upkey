import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// ==============================================================================
// Vite Configuration for Joyory Client
// ==============================================================================
export default defineConfig({
  // GLB assets are loaded by @react-three/drei at runtime and emitted as files.
  assetsInclude: ['**/*.glb'],
  plugins: [
    tailwindcss(),
    react()
  ],
  // In local dev, Vite proxies /api requests to the Express backend (:5000)
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
});
