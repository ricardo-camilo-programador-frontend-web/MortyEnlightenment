// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
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
