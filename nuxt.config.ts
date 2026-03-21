// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/eslint-module',
    '@pinia/nuxt',
    '@vueuse/nuxt'
  ],
  plugins: [
    '~/plugins/api.ts'
  ],
  pinia: {
    autoImports: ['defineStore', 'acceptHMRUpdate']
  },
  devtools: {
    enabled: true,
    vscode: {}
  },
  runtimeConfig: {
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://github.com/ricardo564',
      siteName: 'Awesome basic configuration Site',
      siteDescription: 'Description base of the site.',
      language: 'en'
    }
  }
})
