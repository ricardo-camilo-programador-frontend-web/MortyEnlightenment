// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      meta: [{ name: 'theme-color', content: '#07140f' }],
      link: [
        { rel: 'preconnect', href: 'https://rickandmortyapi.com' },
        { rel: 'dns-prefetch', href: 'https://rickandmortyapi.com' }
      ],
      script: [{ src: '/rc-study-modal.js', defer: true }]
    }
  },
  spaLoadingTemplate: './app/spa-loading-template.html',
  ssr: false,
  nitro: {
    preset: 'static'
  },
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/eslint-module',
    '@pinia/nuxt',
    '@vite-pwa/nuxt',
    '@vueuse/nuxt'
  ],
  plugins: [
    '~/plugins/api.ts',
    '~/plugins/analytics.client.ts'
  ],
  tailwindcss: {
    cssPath: '~/assets/css/main.css',
    configPath: 'tailwind.config.js'
  },
  devtools: {
    enabled: true,
    vscode: {}
  },
  runtimeConfig: {
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://morty-enlightenment.netlify.app',
      siteName: 'Morty Enlightenment',
      siteDescription: 'Catalogo interativo e explorador de personagens do multiverso de Rick and Morty.',
      language: 'pt-BR',
      clarityId: '',
      ga4Id: '',
      gtmId: '',
      gtmEnabled: '',
      gtmGa4Id: '',
      counterId: '',
      counterUtcOffset: '',
      analyticsEnabled: '',
      gaMeasurementId: '',
      counterDevId: ''
    }
  }
})
