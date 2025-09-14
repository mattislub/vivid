import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 6000,
    proxy: {
      '/api': 'http://localhost:6001',
    },
  },
  preview: {
    port: 6000,
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
