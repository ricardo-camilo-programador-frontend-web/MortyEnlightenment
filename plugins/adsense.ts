export default defineNuxtPlugin((nuxtApp) => {
  const { public: { adsenseClientId } } = useRuntimeConfig()
  
  if (!adsenseClientId) {
    console.warn('AdSense Client ID not configured. Skipping AdSense integration.')
    return
  }

  // Load AdSense script
  const loadAdSense = () => {
    const script = document.createElement('script')
    script.async = true
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`
    script.crossOrigin = 'anonymous'
    
    script.onload = () => {
      console.log('AdSense loaded successfully')
      initializeAdUnits()
    }
    
    script.onerror = (error) => {
      console.error('Failed to load AdSense:', error)
    }
    
    document.head.appendChild(script)
  }

  // Initialize ad units
  const initializeAdUnits = () => {
    // Convert all adsbygoogle elements to ad slots
    const adElements = document.querySelectorAll('ins.adsbygoogle')
    
    adElements.forEach((element, index) => {
      // Check if ad slot already exists
      if (!element.getAttribute('data-ad-slot')) {
        const parent = element.parentElement
        const adFormat = getAdFormatFromElement(element)
        const adSlot = createAdSlot(element, adFormat, index)
        
        if (adSlot) {
          element.setAttribute('data-ad-slot', adSlot.slot)
          element.setAttribute('data-ad-format', adSlot.format)
          element.setAttribute('data-full-width-responsive', 'true')
          
          // Add responsive ad style
          addResponsiveAdStyle(element)
          
          // Push ad to AdSense
          ;(window as any).adsbygoogle = (window as any).adsbygoogle || []
          ;(window as any).adsbygoogle.push({})
        }
      }
    })
  }

  // Get ad format from element data attributes
  const getAdFormatFromElement = (element: Element) => {
    const format = element.getAttribute('data-ad-format') || 'auto'
    const width = parseInt(element.getAttribute('data-ad-width') || '0')
    const height = parseInt(element.getAttribute('data-ad-height') || '0')
    
    if (width > 0 && height > 0) {
      return `${width}x${height}`
    }
    
    // Common ad formats
    switch (format) {
      case 'banner':
        return '728x90'
      case 'medium':
        return '300x250'
      case 'large':
        return '336x280'
      case 'leaderboard':
        return '970x90'
      case 'mobile':
        return '320x50'
      case 'rectangle':
        return '250x250'
      case 'auto':
      default:
        return 'auto'
    }
  }

  // Create ad slot configuration
  const createAdSlot = (element: Element, format: string, index: number) => {
    const slotId = `morty-enlightenment-${format.replace('x', '-').toLowerCase()}-${index}`
    
    // Only create slots for visible elements
    const rect = element.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) {
      return null
    }
    
    return {
      slot: slotId,
      format,
      element
    }
  }

  // Add responsive ad styling
  const addResponsiveAdStyle = (element: Element) => {
    const style = document.createElement('style')
    style.textContent = `
      .adsbygoogle {
        display: block;
        width: 100%;
        max-width: 100%;
        height: auto;
        min-height: 50px;
      }
      
      /* Hide empty ad slots */
      .adsbygoogle[data-ad-status="unfilled"] {
        display: none;
      }
      
      /* Responsive ad container */
      .ad-container {
        position: relative;
        width: 100%;
        min-height: 50px;
        margin: 20px 0;
        overflow: hidden;
      }
      
      /* Ad loading animation */
      .ad-loading {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100px;
        background: linear-gradient(90deg, #1f2937 25%, #374151 50%, #1f2937 75%);
        background-size: 200% 100%;
        animation: ad-loading 1.5s infinite;
        border-radius: 8px;
      }
      
      @keyframes ad-loading {
        0% {
          background-position: 200% 0;
        }
        100% {
          background-position: -200% 0;
        }
      }
      
      /* Ad error state */
      .ad-error {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100px;
        background: #374151;
        color: #9ca3af;
        border-radius: 8px;
        font-size: 14px;
      }
    `
    
    if (!document.head.querySelector('#ad-styles')) {
      style.id = 'ad-styles'
      document.head.appendChild(style)
    }
  }

  // Track ad events
  const trackAdEvent = (eventName: string, adData: any) => {
    if (useNuxtApp().$trackEvent) {
      useNuxtApp().$trackEvent('ad_' + eventName, {
        ...adData,
        timestamp: new Date().toISOString()
      })
    }
  }

  // Refresh all ads
  const refreshAds = () => {
    if ((window as any).adsbygoogle) {
      const adElements = document.querySelectorAll('ins.adsbygoogle')
      adElements.forEach((element) => {
        const parent = element.parentElement
        
        // Remove the ad element
        element.remove()
        
        // Create a new ad element
        const newAd = document.createElement('ins')
        newAd.className = 'adsbygoogle'
        newAd.style.display = 'block'
        newAd.setAttribute('data-ad-client', adsenseClientId)
        newAd.setAttribute('data-ad-slot', element.getAttribute('data-ad-slot') || '')
        newAd.setAttribute('data-ad-format', element.getAttribute('data-ad-format') || 'auto')
        newAd.setAttribute('data-full-width-responsive', 'true')
        
        parent?.appendChild(newAd)
        
        // Push to AdSense
        ;(window as any).adsbygoogle.push({})
      })
    }
  }

  // Check if user has ad blocker
  const hasAdBlocker = () => {
    try {
      const testAd = document.createElement('div')
      testAd.innerHTML = '&nbsp;'
      testAd.className = 'adsbox adsbygoogle'
      testAd.style.display = 'block'
      document.body.appendChild(testAd)
      
      const hasBlocker = document.body.offsetHeight === 0
      document.body.removeChild(testAd)
      
      return hasBlocker
    } catch (error) {
      return false
    }
  }

  // Show ad blocker message
  const showAdBlockerMessage = () => {
    const message = document.createElement('div')
    message.className = 'ad-blocker-message'
    message.innerHTML = `
      <div class="bg-yellow-900/20 border border-yellow-600 rounded-lg p-4 text-center">
        <p class="text-yellow-400 text-sm">
          🙏 We need your support! Please consider disabling your ad blocker to help us keep this site free.
        </p>
        <button onclick="this.parentElement.parentElement.remove()" class="mt-2 text-yellow-300 text-xs hover:text-yellow-200">
          Dismiss
        </button>
      </div>
    `
    
    document.body.appendChild(message)
    
    // Track ad blocker detection
    trackAdEvent('adblock_detected', {
      has_ad_blocker: true
    })
  }

  // Initialize AdSense monitoring
  const initializeAdMonitoring = () => {
    // Check for ad blocker
    setTimeout(() => {
      if (hasAdBlocker()) {
        showAdBlockerMessage()
      }
    }, 3000)
    
    // Monitor ad performance
    setInterval(() => {
      const adElements = document.querySelectorAll('ins.adsbygoogle')
      adElements.forEach((element) => {
        const adStatus = element.getAttribute('data-ad-status')
        if (adStatus === 'filled') {
          trackAdEvent('ad_impression', {
            ad_slot: element.getAttribute('data-ad-slot'),
            format: element.getAttribute('data-ad-format')
          })
        }
      })
    }, 10000)
  }

  // Load AdSense when plugin initializes
  if (process.client) {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', loadAdSense)
    } else {
      loadAdSense()
    }
    
    // Initialize monitoring
    setTimeout(initializeAdMonitoring, 5000)
  }

  // Provide global functions
  nuxtApp.provide('adsense', {
    refreshAds,
    trackAdEvent,
    hasAdBlocker,
    showAdBlockerMessage
  })
})