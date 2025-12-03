import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'TryOn',
      formats: ['umd'],
      fileName: () => 'try-on.js',
    },
    rollupOptions: {
      output: {
        // Put all CSS into one file
        assetFileNames: 'try-on.css'
      }
    },
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
      },
    },
  },
  css: {
    postcss: {},
  }
});
