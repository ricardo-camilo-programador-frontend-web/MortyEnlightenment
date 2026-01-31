export default defineNuxtPlugin((nuxtApp) => {
  const { public: { analyticsId } } = useRuntimeConfig()
  
  if (!analyticsId) {
    console.warn('Analytics ID not configured. Skipping Google Analytics integration.')
    return
  }
  
  // Load Google Analytics 4
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${analyticsId}`
  document.head.appendChild(script)
  
  // Initialize GA4
  window.dataLayer = window.dataLayer || []
  function gtag() {
    window.dataLayer.push(arguments)
  }
  gtag('js', new Date())
  gtag('config', analyticsId, {
    page_path: window.location.pathname,
    cookie_domain: 'auto',
    cookie_flags: 'SameSite=None;Secure',
    allow_google_signals: true,
    allow_ad_personalization_signals: true
  })
  
  // Track page views on route changes
  const router = useRouter()
  router.beforeEach((to) => {
    gtag('config', analyticsId, {
      page_title: to.meta.title as string || to.name as string || 'Unknown',
      page_path: to.path
    })
  })
  
  // Track user interactions
  const trackEvent = (event: string, params: Record<string, any> = {}) => {
    gtag('event', event, params)
  }
  
  // Provide globally
  nuxtApp.provide('trackEvent', trackEvent)
  
  // Custom events for Morty Enlightenment
  const trackCharacterView = (characterId: number, characterName: string) => {
    trackEvent('character_view', {
      character_id: characterId,
      character_name: characterName,
      event_category: 'engagement',
      event_label: 'character_interaction'
    })
  }
  
  const trackSearch = (query: string, resultsCount: number) => {
    trackEvent('search', {
      search_query: query,
      results_count: resultsCount,
      event_category: 'engagement',
      event_label: 'search_interaction'
    })
  }
  
  const trackFavoriteToggle = (characterId: number, characterName: string, isFavorite: boolean) => {
    trackEvent('favorite_toggle', {
      character_id: characterId,
      character_name: characterName,
      action: isFavorite ? 'added' : 'removed',
      event_category: 'engagement',
      event_label: 'favorite_interaction'
    })
  }
  
  // Provide custom tracking functions
  nuxtApp.provide('trackCharacterView', trackCharacterView)
  nuxtApp.provide('trackSearch', trackSearch)
  nuxtApp.provide('trackFavoriteToggle', trackFavoriteToggle)
  
  // Track initial page view
  if (process.client) {
    setTimeout(() => {
      gtag('config', analyticsId, {
        page_title: document.title,
        page_path: window.location.pathname
      })
    }, 1000)
  }
})