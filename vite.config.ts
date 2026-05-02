import { defineConfig } from 'vite';
// @ts-ignore (у меня ругался VS CODE)
import eslint from 'vite-plugin-eslint';

export default defineConfig(({ mode }) => ({
  base: '/',
  build: {
    rollupOptions: {
      input: mode === 'support' 
        ? { index: './support/index.html' }
        : 'index.html'  
    }
  },
  resolve: {
    alias: {
      '@router-dom': '/src/RouterDOM/index.ts', 
    },
  },
  plugins: [
    eslint({
      failOnWarning: false,
      failOnError: false,
    }),
  ],
}));