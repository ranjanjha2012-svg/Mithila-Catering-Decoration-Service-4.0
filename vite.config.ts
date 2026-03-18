import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        tiffin: path.resolve(__dirname, 'tiffin.html'),
        contact: path.resolve(__dirname, 'contact.html'),
        gallery: path.resolve(__dirname, 'gallery.html'),
        planner: path.resolve(__dirname, 'planner.html'),
      },
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    hmr: process.env.DISABLE_HMR !== 'true',
  },
});
