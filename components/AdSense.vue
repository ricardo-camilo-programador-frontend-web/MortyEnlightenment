<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from '#imports'

const i18n = useI18n()

// Props
interface Props {
  format?: 'banner' | 'medium' | 'large' | 'leaderboard' | 'mobile' | 'rectangle' | 'auto'
  placement?: 'top' | 'middle' | 'bottom' | 'sidebar' | 'infeed'
  responsive?: boolean
  lazyLoad?: boolean
  refreshInterval?: number
  testMode?: boolean
  className?: string
}

const props = withDefaults(defineProps<Props>(), {
  format: 'auto',
  placement: 'bottom',
  responsive: true,
  lazyLoad: true,
  refreshInterval: 60000,
  testMode: false,
  className: ''
})

// State
const adLoaded = ref(false)
const adError = ref(false)
const adVisible = ref(false)
const refreshTimer = ref<NodeJS.Timeout | null>(null)

// Ad configuration
const adConfig = computed(() => {
  const configs = {
    banner: { width: 728, height: 90 },
    medium: { width: 300, height: 250 },
    large: { width: 336, height: 280 },
    leaderboard: { width: 970, height: 90 },
    mobile: { width: 320, height: 50 },
    rectangle: { width: 250, height: 250 },
    auto: { width: 0, height: 0 }
  }
  
  return configs[props.format]
})

// Ad slot ID
const adSlotId = computed(() => {
  return `ad-${props.format}-${props.placement}-${Math.random().toString(36).substr(2, 9)}`
})

// CSS classes based on placement
const placementClasses = computed(() => {
  const classes = {
    top: 'mb-8',
    middle: 'my-8',
    bottom: 'mt-8',
    sidebar: 'sticky top-24',
    infeed: 'my-6'
  }
  
  return classes[props.placement]
})

// Load ad
const loadAd = () => {
  if (!adVisible.value) return
  
  // Check if adsbygoogle is available
  if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
    try {
      // Clear any existing ad content
      const adElement = document.querySelector(`#${adSlotId.value}`)
      if (adElement) {
        adElement.innerHTML = ''
      }
      
      // Create ad element
      const adScript = document.createElement('script')
      adScript.async = true
      adScript.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js'
      adScript.crossOrigin = 'anonymous'
      
      adElement?.appendChild(adScript)
      
      // Create ins element
      const adIns = document.createElement('ins')
      adIns.className = 'adsbygoogle'
      adIns.id = adSlotId.value
      adIns.style.display = 'block'
      adIns.setAttribute('data-ad-client', props.testMode ? 'ca-pub-0000000000000000' : useRuntimeConfig().public.adsenseClientId)
      adIns.setAttribute('data-ad-slot', adSlotId.value)
      adIns.setAttribute('data-ad-format', 'auto')
      adIns.setAttribute('data-full-width-responsive', props.responsive.toString())
      adIns.setAttribute('data-ad-status', 'loading')
      
      if (!props.lazyLoad) {
        adIns.setAttribute('data-load-on-render', 'true')
      }
      
      adElement?.appendChild(adIns)
      
      // Push to AdSense
      ;(window as any).adsbygoogle = (window as any).adsbygoogle || []
      ;(window as any).adsbygoogle.push({})
      
      // Track ad load attempt
      if (useNuxtApp().$trackEvent) {
        useNuxtApp().$trackEvent('ad_load_attempt', {
          format: props.format,
          placement: props.placement,
          test_mode: props.testMode
        })
      }
    } catch (error) {
      console.error('Failed to load ad:', error)
      adError.value = true
    }
  } else {
    // Retry after a delay
    setTimeout(loadAd, 1000)
  }
}

// Refresh ad
const refreshAd = () => {
  if (refreshTimer.value) {
    clearTimeout(refreshTimer.value)
  }
  
  adLoaded.value = false
  adError.value = false
  
  loadAd()
  
  // Set up next refresh
  if (props.refreshInterval > 0) {
    refreshTimer.value = setTimeout(refreshAd, props.refreshInterval)
  }
}

// Intersection Observer for lazy loading
const setupIntersectionObserver = () => {
  if (!props.lazyLoad) return
  
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          adVisible.value = true
          observer.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.1 }
  )
  
  const adElement = document.querySelector(`#${adSlotId.value}`)
  if (adElement) {
    observer.observe(adElement)
  }
}

// Track ad events
const trackAdEvent = (eventName: string, eventData: any = {}) => {
  if (useNuxtApp().$trackEvent) {
    useNuxtApp().$trackEvent(`ad_${eventName}`, {
      format: props.format,
      placement: props.placement,
      ...eventData
    })
  }
}

// Cleanup
const cleanup = () => {
  if (refreshTimer.value) {
    clearTimeout(refreshTimer.value)
    refreshTimer.value = null
  }
}

// Lifecycle hooks
onMounted(() => {
  setupIntersectionObserver()
  
  // Set up ad refresh
  if (props.refreshInterval > 0) {
    refreshTimer.value = setTimeout(refreshAd, props.refreshInterval)
  }
})

// Cleanup on unmount
onUnmounted(cleanup)

// Handle ad load
onMounted(() => {
  const checkAdLoad = () => {
    const adElement = document.querySelector(`#${adSlotId.value}`)
    if (adElement) {
      const adStatus = adElement.getAttribute('data-ad-status')
      if (adStatus === 'filled') {
        adLoaded.value = true
        adError.value = false
        trackAdEvent('ad_loaded', {
          format: props.format,
          placement: props.placement
        })
      } else if (adStatus === 'unfilled') {
        adLoaded.value = false
        adError.value = true
        trackAdEvent('ad_unfilled', {
          format: props.format,
          placement: props.placement
        })
      }
    }
  }
  
  // Check for ad load status
  setTimeout(checkAdLoad, 2000)
  
  // Set up periodic checks
  const interval = setInterval(checkAdLoad, 5000)
  
  // Clean up interval
  onUnmounted(() => {
    clearInterval(interval)
    cleanup()
  })
})
</script>

<template>
  <div 
    :id="adSlotId"
    class="ad-container w-full flex justify-center"
    :class="[placementClasses, className]"
  >
    <!-- Loading state -->
    <div v-if="!adLoaded && !adError" class="ad-loading">
      <div class="text-gray-400 text-sm">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-rick-400 mx-auto mb-2"></div>
        {{ i18n.t('common.loading') }} Ad...
      </div>
    </div>
    
    <!-- Error state -->
    <div v-else-if="adError" class="ad-error">
      <div class="text-center">
        <svg class="w-8 h-8 mx-auto mb-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <p class="text-gray-400 text-sm">Ad unavailable</p>
        <p class="text-gray-500 text-xs mt-1">Please try again later</p>
      </div>
    </div>
    
    <!-- Ad content (will be replaced by AdSense) -->
    <ins
      v-else
      class="adsbygoogle"
      :style="{
        display: 'block',
        width: responsive ? '100%' : `${adConfig.width}px`,
        height: responsive ? 'auto' : `${adConfig.height}px`,
        minHeight: '50px'
      }"
      :data-ad-client="testMode ? 'ca-pub-0000000000000000' : useRuntimeConfig().public.adsenseClientId"
      :data-ad-slot="adSlotId"
      :data-ad-format="format"
      :data-full-width-responsive="responsive.toString()"
      :data-ad-status="'loading'"
    ></ins>
    
    <!-- Fallback content -->
    <div 
      v-if="!adLoaded && !adError" 
      class="fallback-ad bg-gray-800 border border-gray-700 rounded-lg p-6 text-center"
      :style="{ minWidth: responsive ? '100%' : `${adConfig.width}px`, minHeight: `${adConfig.height}px || '100px'` }"
    >
      <div class="text-gray-500">
        <svg class="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
        </svg>
        <p class="text-sm font-medium mb-2">Advertisement</p>
        <p class="text-xs opacity-75">
          Supporting Morty Enlightenment through ads
        </p>
      </div>
    </div>
  </div>
</template>