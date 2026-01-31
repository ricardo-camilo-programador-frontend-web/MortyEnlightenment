export default defineNuxtPlugin(async (nuxtApp) => {
  const i18n = useI18n()
  
  // Set locale based on browser preference or stored preference
  const storedLocale = useCookie('i18n_locale')
  const browserLocale = navigator.language.split('-')[0]
  
  let locale = 'en' // default
  
  if (storedLocale.value) {
    locale = storedLocale.value
  } else if (['en', 'es', 'pt'].includes(browserLocale)) {
    locale = browserLocale
  }
  
  await i18n.setLocale(locale)
  
  // Store locale preference
  watch(() => i18n.locale.value, (newLocale) => {
    storedLocale.value = newLocale
  }, { immediate: true })
  
  // Provide i18n globally
  nuxtApp.provide('i18n', i18n)
  
  // Add SEO meta tags for different languages
  useHead({
    htmlAttrs: {
      lang: i18n.locale.value
    }
  })
})