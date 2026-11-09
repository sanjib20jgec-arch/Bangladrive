import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

const singleFile = process.env.BUILD_MODE === 'singlefile';

function vendorChunk(id) {
  if (!id.includes('node_modules')) return undefined;
  if (id.includes('/three/')) return 'vendor-three';
  if (id.includes('/@dimforge/rapier3d-compat/')) return 'vendor-rapier';
  return 'vendor';
}

export default defineConfig({
  // Relative URLs work both from Vite preview and Capacitor's local https://localhost origin.
  base: './',
  plugins: singleFile ? [viteSingleFile({ removeViteModuleLoader: true })] : [],
  build: {
    outDir: singleFile ? 'dist-single' : 'dist',
    emptyOutDir: true,
    target: 'es2020',
    minify: 'terser',
    cssMinify: true,
    sourcemap: false,
    // Keep WASM, fonts, GLBs, and larger textures as files for Android WebView.
    // Tiny icons/data assets may still be inlined.
    assetsInlineLimit: singleFile ? 100_000_000 : 4096,
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        ...(singleFile ? { inlineDynamicImports: true } : { manualChunks: vendorChunk }),
      },
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
