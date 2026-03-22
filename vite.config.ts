import { defineConfig } from 'vite';
// @ts-ignore (у меня ругался VS CODE)
import eslint from 'vite-plugin-eslint';

export default defineConfig({
  resolve: {
    alias: {
      '@my-react': '/src/MyReact', 
    },
  },
  plugins: [
    eslint({
      failOnWarning: false,
      failOnError: false,
    }),
  ],
});
