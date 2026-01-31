export default defineNuxtPlugin(async (nuxtApp) => {
  const { $pwa } = useNuxtApp()
  
  // Register service worker
  if ('serviceWorker' in navigator && process.client) {
    try {
      await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })
      
      console.log('Service Worker registered successfully')
      
      // Listen for service worker updates
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('New service worker installed, refreshing page...')
        setTimeout(() => window.location.reload(), 1000)
      })
    } catch (error) {
      console.error('Service Worker registration failed:', error)
    }
  }
  
  // Handle offline/online status
  const isOnline = ref(navigator.onLine)
  
  const updateOnlineStatus = () => {
    isOnline.value = navigator.onLine
  }
  
  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)
  
  // Provide offline status globally
  nuxtApp.provide('isOnline', isOnline)
  
  // Push notification support
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications')
      return false
    }
    
    if (Notification.permission === 'granted') {
      return true
    }
    
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }
    
    return false
  }
  
  const showNotification = (title: string, options?: NotificationOptions) => {
    if (isOnline.value && Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/icon-192x192.png',
        badge: '/icon-72x72.png',
        ...options
      })
    }
  }
  
  // Provide notification functions
  nuxtApp.provide('requestNotificationPermission', requestNotificationPermission)
  nuxtApp.provide('showNotification', showNotification)
  
  // Install prompt handling
  let deferredPrompt: any = null
  
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e
    
    // Auto-show install prompt after some time
    setTimeout(() => {
      if (deferredPrompt) {
        deferredPrompt.prompt()
        deferredPrompt.userChoice.then((choiceResult: any) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the install prompt')
          } else {
            console.log('User dismissed the install prompt')
          }
          deferredPrompt = null
        })
      }
    }, 30000) // 30 seconds
  })
  
  // Handle app install
  const installApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      deferredPrompt = null
      return outcome === 'accepted'
    }
    return false
  }
  
  nuxtApp.provide('installApp', installApp)
  
  // Cache management
  const clearCache = async () => {
    if ('caches' in window) {
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      )
      console.log('All caches cleared')
    }
  }
  
  nuxtApp.provide('clearCache', clearCache)
  
  // Initialize PWA capabilities
  const { initSW } = useServiceWorker()
  if (process.client) {
    await initSW()
  }
})