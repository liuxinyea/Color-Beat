import { defineConfig } from 'vite';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { visualizer } from 'rollup-plugin-visualizer';
import viteCompression from 'vite-plugin-compression';

const rootDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.debug', 'console.info'],
      },
    },
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name].[hash].min.[ext]',
        chunkFileNames: 'chunks/[name].[hash].min.js',
        entryFileNames: 'index.min.js',
        manualChunks: {
          phaser: ['phaser'],
        },
      },
    },
    assetsInlineLimit: 8192,
    target: 'es2020',
  },
  resolve: {
    alias: {
      '@': resolve(rootDir, 'src'),
    },
  },
  server: {
    open: true,
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [
    visualizer({
      open: false,
      filename: 'dist/volume-analysis.html',
    }),
    viteCompression({
      algorithm: 'brotliCompress',
      threshold: 10240,
      ext: '.br',
    }),
  ],
});
