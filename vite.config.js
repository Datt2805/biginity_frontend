import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'custom-build-folder', // Change the output folder name
    rollupOptions: {
      input: {
        main: './index.html', // Entry point
      },
    },
  },
});
