// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/eslint-module',
    '@pinia/nuxt',
    '@vite-pwa/nuxt',
    '@vueuse/nuxt',
    '@nuxt/i18n',
    '@nuxt/image',
    'nuxt-seo-kit'
  ],
  plugins: [
    '~/plugins/api.ts',
    '~/plugins/i18n.ts',
    '~/plugins/analytics.ts',
    '~/plugins/pwa.ts'
  ],
  extends: [
    'nuxt-seo-kit'
  ],
  pinia: {
    autoImports: ['defineStore', 'acceptHMRUpdate']
  },
  devtools: {
    enabled: true,
    vscode: {}
  },
  linkChecker: {
    failOn404: true
  },
  i18n: {
    locales: [
      {
        code: 'en',
        iso: 'en-US',
        name: 'English',
        file: 'en.json'
      },
      {
        code: 'es',
        iso: 'es-ES',
        name: 'Español',
        file: 'es.json'
      },
      {
        code: 'pt',
        iso: 'pt-BR',
        name: 'Português',
        file: 'pt.json'
      }
    ],
    defaultLocale: 'en',
    strategy: 'no_prefix',
    lazy: true,
    langDir: 'locales/',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root'
    }
  },
  image: {
    provider: 'ipx',
    ipx: {
      modifiers: {
        format: 'webp'
      }
    }
  },
  pwa: {
    registerType: 'autoUpdate',
    workbox: {
      globPatterns: ['**/*.{js,css,ico,png,svg,json,woff2}'],
      runtimeCaching: [
        {
          urlPattern: '^https://rickandmortyapi.com/.*',
          handler: 'CacheFirst',
          options: {
            cacheName: 'rick-morty-api-cache',
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        }
      ]
    },
    manifest: {
      name: 'Morty Enlightenment',
      short_name: 'MortyEnlightenment',
      description: 'Your ultimate Rick and Morty character experience',
      theme_color: '#000',
      background_color: '#000',
      display: 'standalone',
      start_url: '/',
      icons: [
        {
          src: '/icon.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    }
  },
  runtimeConfig: {
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://morty-enlightenment.vercel.app',
      siteName: 'Morty Enlightenment',
      siteDescription: 'Your ultimate Rick and Morty character experience with interactive features and multilingual support',
      language: 'en',
      analyticsId: process.env.NUXT_PUBLIC_ANALYTICS_ID || '',
      adsenseClientId: process.env.NUXT_PUBLIC_ADSENSE_CLIENT_ID || ''
    }
  },
  nitro: {
    prerender: {
      routes: ['/']
    }
  },
  tailwindcss: {
    config: './tailwind.config.js'
  }
})
