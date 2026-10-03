import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { securityHeaders, toHeadersFile } from './config/security-headers.js';

// Writes dist/_headers so the host applies the same policy used in preview and tests.
function emitHeadersFile() {
  return {
    name: 'emit-security-headers',
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: '_headers', source: toHeadersFile() });
    },
  };
}

export default defineConfig({
  plugins: [react(), emitHeadersFile()],
  build: { sourcemap: false },
  preview: { headers: securityHeaders },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.js'],
    include: ['tests/unit/**/*.test.{js,jsx}'],
    css: false,
  },
});
