import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    'process.env': process.env
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        tiffin: path.resolve(__dirname, 'tiffin.html'),
        gallery: path.resolve(__dirname, 'gallery.html'),
        planner: path.resolve(__dirname, 'planner.html'),
        contact: path.resolve(__dirname, 'contact.html'),
      },
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    hmr: process.env.DISABLE_HMR !== 'true',
  },
});
