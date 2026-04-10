import { defineConfig } from 'vite';
// @ts-ignore (у меня ругался VS CODE)
import eslint from 'vite-plugin-eslint';
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  resolve: {
    alias: {
      '@my-react': '/src/MyReact', 
    },
  },
  plugins: [
    // eslint({
    //   failOnWarning: false,
    //   failOnError: false,
    // }),
    VitePWA({ 
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
      },
       manifest:{
        name: "ДомДели",
        short_name: "DomDeli",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#f08dcc",
        orientation: "portrait-primary",
        icons: [
          {
            src: "/svg/logo.svg",
            type: "image/svg+xml", "sizes": "192x192"
          },
          {
            src: "/svg/logo.svg",
            type: "image/svg+xml", "sizes": "512x512"
          }
        ]
        }
     })
  ],
});
