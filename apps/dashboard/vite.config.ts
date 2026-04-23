import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// AI briefs are pre-generated at build time via `pnpm ai-briefs`.
// Chat widget uses canned responses grounded in committed data.
// No runtime API key required for forkers.
export default defineConfig({
  plugins: [react()],
  server: { port: 5180 },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          recharts: ['recharts'],
          react: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
});
