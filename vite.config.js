import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '~': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'es2020',
    minify: 'esbuild',
    sourcemap: false,
    cssCodeSplit: true,
    assetsInlineLimit: 2048,
    modulePreload: {
      polyfill: false,
    },
    rollupOptions: {
      external: ['html2canvas'],
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined;
          }

          if (id.includes('react') || id.includes('scheduler')) {
            return 'vendor-react';
          }

          if (id.includes('@capacitor')) {
            return 'vendor-capacitor';
          }

          if (id.includes('i18next') || id.includes('react-i18next')) {
            return 'vendor-i18n';
          }

          if (id.includes('framer-motion')) {
            return 'vendor-motion';
          }

          return undefined;
        },
      },
    },
  },
});
