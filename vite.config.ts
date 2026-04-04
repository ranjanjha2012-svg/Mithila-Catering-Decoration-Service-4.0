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
        order: path.resolve(__dirname, 'order.html'),
        'order-chicken': path.resolve(__dirname, 'order/chicken.html'),
        'order-fish': path.resolve(__dirname, 'order/fish.html'),
        'order-mutton': path.resolve(__dirname, 'order/mutton.html'),
        'order-egg': path.resolve(__dirname, 'order/egg.html'),
        'order-veg': path.resolve(__dirname, 'order/veg.html'),
        'order-roti': path.resolve(__dirname, 'order/roti.html'),
        'order-rice': path.resolve(__dirname, 'order/rice.html'),
        'order-starters': path.resolve(__dirname, 'order/starters.html'),
        'order-thali': path.resolve(__dirname, 'order/thali.html'),
        'order-sweets': path.resolve(__dirname, 'order/sweets.html'),
        'order-combo': path.resolve(__dirname, 'order/combo.html'),
        'order-mithilanchal': path.resolve(__dirname, 'order/mithilanchal.html'),
        'order-special-thali': path.resolve(__dirname, 'order/special-thali.html'),
      },
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    hmr: process.env.DISABLE_HMR !== 'true',
  },
});
