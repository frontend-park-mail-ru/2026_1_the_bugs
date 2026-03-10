import { defineConfig } from 'vite';
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
