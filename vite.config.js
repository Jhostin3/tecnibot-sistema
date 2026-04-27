import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/tecnibot-sistema/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      base: '/tecnibot-sistema/',
      scope: '/tecnibot-sistema/',
      manifest: {
        name: 'TecniBot',
        short_name: 'TecniBot',
        start_url: '/tecnibot-sistema/',
        scope: '/tecnibot-sistema/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#0f172a',
        icons: [
          {
            src: '/tecnibot-sistema/pwa-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/tecnibot-sistema/pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        navigateFallback: '/tecnibot-sistema/index.html',
        navigateFallbackDenylist: [/^\/api/],
      },
    }),
  ],
})
