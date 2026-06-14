import react from '@vitejs/plugin-react';
import { createRequire } from 'node:module';
import { defineConfig } from 'vitest/config';

const require = createRequire(import.meta.url);

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/graphql': {
        target:
          process.env.VITE_GRAPHQL_PROXY_TARGET || 'http://localhost:4000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/graphql/, ''),
      },
    },
  },
  resolve: {
    alias: {
      'react-transition-group/TransitionGroupContext':
        require.resolve('react-transition-group/cjs/TransitionGroupContext.js'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    exclude: ['e2e/**', 'node_modules/**', 'dist/**'],
    setupFiles: './src/setupTests.ts',
  },
});
