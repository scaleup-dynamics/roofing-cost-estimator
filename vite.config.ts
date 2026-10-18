import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      // Raise warning threshold — Three.js chunk will be large by design
      chunkSizeWarningLimit: 800,
      rollupOptions: {
        output: {
          // Vite 8 / rolldown requires manualChunks to be a function, not an object.
          // The function form is also supported by Vite 5/6 (Rollup), so this is backwards-compatible.
          manualChunks(id: string) {
            // Three.js and its addons are isolated into their own async chunk.
            // This prevents them from blocking the main React bundle's first paint.
            if (id.includes('node_modules/three')) return 'three-vendor';
            // Framer Motion is large — split it out too
            if (id.includes('node_modules/framer-motion') || id.includes('node_modules/motion')) return 'motion-vendor';
          },
        },
      },
    },
  };
});
