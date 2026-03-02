import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: {
      '@my-react': '/src/MyReact', 
    },
  },
  plugins: [
  ],
});
