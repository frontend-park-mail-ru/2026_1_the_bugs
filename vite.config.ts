import { defineConfig } from 'vite';
// @ts-ignore (у меня ругался VS CODE)
import eslint from 'vite-plugin-eslint';

export default defineConfig({
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
});
