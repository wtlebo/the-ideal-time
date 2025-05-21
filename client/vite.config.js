import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/conditions': {
        target: process.env.VITE_API_URL || 'http://localhost:5000',
        changeOrigin: true,
        secure: true,
      },
    },
  },
  build: {
    base: process.env.NODE_ENV === 'production' ? '' : '/',
  },
});
