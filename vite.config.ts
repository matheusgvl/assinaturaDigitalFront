import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    // Same-origin proxy in development: HttpOnly cookies and the CSRF header (sent by axios only to the same origin) keep working.
    server: { proxy: { '/api': { target: env.API_PROXY_TARGET || 'http://localhost:3000' } } },
    test: { environment: 'jsdom', setupFiles: './src/test/setup.ts', globals: true },
  };
});
