import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

/**
 * Cycle 20: one HTML file, no external requests.
 * - target es2019 for Android WebView / Chrome 90+
 * - terser for dead-code elimination and mangling
 * - singlefile inlines JS, CSS and the Rapier WASM (base64) into index.html
 */
export default defineConfig({
  base: './',
  plugins: [viteSingleFile({ removeViteModuleLoader: true })],
  build: {
    target: 'es2019',
    minify: 'terser',
    cssMinify: true,
    sourcemap: false,
    assetsInlineLimit: 100_000_000,
    chunkSizeWarningLimit: 12_000,
    rollupOptions: {
      output: { inlineDynamicImports: true },
      onwarn(warning, warn) {
        if (warning.code === 'CIRCULAR_DEPENDENCY') return;
        warn(warning);
      },
    },
    terserOptions: {
      compress: {
        passes: 2,
        drop_debugger: true,
        pure_funcs: ['console.debug'],
      },
      format: { comments: false },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
    allowedHosts: true,
  },
  preview: { host: '0.0.0.0', port: 4173, allowedHosts: true },
});
