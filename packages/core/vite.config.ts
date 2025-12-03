import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'TryOnCore',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'js'}`,
    },
    rollupOptions: {
      external: ['@fal-ai/client', 'replicate'],
      output: {
        globals: {
          '@fal-ai/client': 'FalClient',
          'replicate': 'Replicate'
        }
      }
    },
    sourcemap: true,
    target: 'es2020'
  }
});
