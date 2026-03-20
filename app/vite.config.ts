import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  build: {
    // Species data is bundled intentionally — suppress warning
    chunkSizeWarningLimit: 700,
  },
  plugins: [
    preact(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Oceandex',
        short_name: 'Oceandex',
        description: 'Guía de especies marinas para buzos en Chile central',
        theme_color: '#0f766e',
        background_color: '#f0fdfa',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        categories: ['education', 'lifestyle'],
        lang: 'es',
        dir: 'ltr',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/static\.inaturalist\.org\/photos\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'species-photos',
              expiration: { maxEntries: 500, maxAgeSeconds: 30 * 24 * 3600 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern:
              /^https:\/\/inaturalist-open-data\.s3\.amazonaws\.com\/photos\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'species-photos-s3',
              expiration: { maxEntries: 500, maxAgeSeconds: 30 * 24 * 3600 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
})
