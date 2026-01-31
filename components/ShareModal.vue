<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '~/stores/user'
import { useFavoritesStore } from '~/stores/favorites'
import { useI18n } from '#imports'
import { trackEvent } from '#analytics'

const userStore = useUserStore()
const favoritesStore = useFavoritesStore()
const i18n = useI18n()

// State
const showShareModal = ref(false)
const shareLink = ref('')
const shareTitle = ref('')
const shareDescription = ref('')
const shareableItems = ref([
  { type: 'character', name: 'Character Profile', icon: '👤' },
  { type: 'episode', name: 'Episode Details', icon: '📺' },
  { type: 'location', name: 'Location Info', icon: '🌍' },
  { type: 'quiz_result', name: 'Quiz Result', icon: '🎯' },
  { type: 'collection', name: 'My Collection', icon: '📦' }
])

// Computed properties
const userFavorites = computed(() => favoritesStore.getFavoritesFromStore)
const userStats = computed(() => ({
  level: userStore.getUserLevel,
  points: userStore.getUserPoints,
  streak: userStore.getUserStreak,
  badges: userStore.getUserBadges
}))

// Share functions
const shareContent = async (platform: string, content: any) => {
  try {
    const url = shareLink.value
    const title = shareTitle.value
    const description = shareDescription.value
    
    switch (platform) {
      case 'twitter':
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`
        window.open(twitterUrl, '_blank', 'width=600,height=400')
        break
        
      case 'facebook':
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(description)}`
        window.open(facebookUrl, '_blank', 'width=600,height=400')
        break
        
      case 'reddit':
        const redditUrl = `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`
        window.open(redditUrl, '_blank', 'width=600,height=400')
        break
        
      case 'whatsapp':
        const whatsappText = `${title}\n${description}\n${url}`
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`
        window.open(whatsappUrl, '_blank')
        break
        
      case 'copy':
        await navigator.clipboard.writeText(`${title}\n\n${description}\n\n${url}`)
        // Show feedback
        showCopyFeedback()
        break
    }
    
    // Track share action
    trackEvent('share_action', {
      platform,
      content_type: content.type,
      content_id: content.id
    })
  } catch (error) {
    console.error('Failed to share:', error)
    showShareError()
  }
}

// Generate shareable content
const generateShareContent = (type: string, content: any = {}) => {
  const baseUrl = window.location.origin
  let url = ''
  let title = ''
  let description = ''
  
  switch (type) {
    case 'character':
      url = `${baseUrl}/characters/${content.id}`
      title = `Check out ${content.name} from Rick & Morty!`
      description = `I discovered ${content.name} (${content.species}) on Morty Enlightenment. Join me in exploring the multiverse!`
      break
      
    case 'episode':
      url = `${baseUrl}/episodes/${content.id}`
      title = `Episode ${content.episode}: ${content.name}`
      description = `Just watched "${content.name}" from Rick & Morty Season ${content.episode.split('E')[0].substring(1)}!`
      break
      
    case 'location':
      url = `${baseUrl}/locations/${content.id}`
      title = `Explore ${content.name} in the Rick & Morty multiverse!`
      description = `Discover ${content.type} in ${content.dimension} - ${content.residents?.length || 0} residents!`
      break
      
    case 'quiz_result':
      url = `${baseUrl}/quiz`
      title = `I just scored ${content.score} points on the Rick & Morty Trivia Quiz!`
      description = `Can you beat my score of ${content.score} on the Rick & Morty quiz on Morty Enlightenment?`
      break
      
    case 'collection':
      url = `${baseUrl}/favorites`
      title = `Check out my Rick & Morty collection!`
      description = `I've collected ${userFavorites.value.length} characters so far on Morty Enlightenment. Join my adventure!`
      break
  }
  
  shareLink.value = url
  shareTitle.value = title
  shareDescription.value = description
}

// Copy feedback
const copyFeedback = ref(false)
const showCopyFeedback = () => {
  copyFeedback.value = true
  setTimeout(() => {
    copyFeedback.value = false
  }, 2000)
}

// Error feedback
const shareError = ref(false)
const showShareError = () => {
  shareError.value = true
  setTimeout(() => {
    shareError.value = false
  }, 2000)
}

// Share user profile
const shareUserProfile = () => {
  generateShareContent('collection')
  showShareModal.value = true
}

// Add to user collection
const addToCollection = (item: any) => {
  if (!userStore.isAuthenticated) {
    showLoginPrompt()
    return
  }
  
  // Logic to add to collection
  trackEvent('collection_add', {
    item_type: item.type,
    item_id: item.id,
    user_level: userStats.value.level
  })
}

// Show login prompt
const showLoginPrompt = () => {
  // Could integrate with auth system
  alert('Please login to add to your collection!')
}

// Initialize share links
const initializeShareLinks = () => {
  // Add meta tags for social sharing
  if (process.client) {
    const meta = document.createElement('meta')
    meta.property = 'og:title'
    meta.content = 'Morty Enlightenment - Rick & Morty Fandom Hub'
    document.head.appendChild(meta)
    
    const meta2 = document.createElement('meta')
    meta2.property = 'og:description'
    meta2.content = 'Explore characters, episodes, and locations from Rick & Morty. Test your knowledge with our trivia quiz!'
    document.head.appendChild(meta2)
    
    const meta3 = document.createElement('meta')
    meta3.property = 'og:url'
    meta3.content = window.location.origin
    document.head.appendChild(meta3)
  }
}

// Initialize on mount
onMounted(() => {
  initializeShareLinks()
})
</script>

<template>
  <!-- Share Modal -->
  <div v-if="showShareModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div class="bg-gray-900 rounded-2xl max-w-lg w-full border border-gray-700 shadow-2xl">
      <!-- Modal Header -->
      <div class="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 flex items-center justify-between">
        <h2 class="text-2xl font-bold text-white">Share Content</h2>
        <button 
          @click="showShareModal = false"
          class="p-2 rounded-lg hover:bg-gray-800 transition-colors duration-200"
        >
          <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      
      <!-- Modal Content -->
      <div class="p-6">
        <!-- Content Preview -->
        <div class="bg-gradient-to-br from-rick-800/30 to-morty-800/30 rounded-xl p-4 mb-6">
          <h3 class="text-lg font-bold text-white mb-2">{{ shareTitle }}</h3>
          <p class="text-gray-400 text-sm">{{ shareDescription }}</p>
          <div class="mt-3 text-portal-400 text-xs font-mono break-all">
            {{ shareLink }}
          </div>
        </div>
        
        <!-- Share Options -->
        <div class="grid grid-cols-2 gap-4">
          <button 
            @click="shareContent('twitter', { type: 'collection' })"
            class="flex items-center justify-center space-x-2 p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors duration-200"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"></path>
            </svg>
            <span class="font-medium">Twitter</span>
          </button>
          
          <button 
            @click="shareContent('facebook', { type: 'collection' })"
            class="flex items-center justify-center space-x-2 p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors duration-200"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path>
            </svg>
            <span class="font-medium">Facebook</span>
          </button>
          
          <button 
            @click="shareContent('reddit', { type: 'collection' })"
            class="flex items-center justify-center space-x-2 p-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-colors duration-200"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12.073c0-6.627-5.373-12-12-12z"></path>
            </svg>
            <span class="font-medium">Reddit</span>
          </button>
          
          <button 
            @click="shareContent('whatsapp', { type: 'collection' })"
            class="flex items-center justify-center space-x-2 p-4 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors duration-200"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"></path>
            </svg>
            <span class="font-medium">WhatsApp</span>
          </button>
        </div>
        
        <!-- Copy Link Option -->
        <div class="mt-4">
          <button 
            @click="shareContent('copy', { type: 'collection' })"
            class="w-full flex items-center justify-center space-x-2 p-4 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-colors duration-200"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
            <span class="font-medium">Copy Link</span>
          </button>
        </div>
        
        <!-- Feedback Messages -->
        <div 
          v-if="copyFeedback"
          class="mt-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 text-center"
        >
          Link copied to clipboard!
        </div>
        
        <div 
          v-if="shareError"
          class="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-center"
        >
          Failed to share. Please try again.
        </div>
      </div>
    </div>
  </div>
  
  <!-- User Profile Share Button (this would be in the UserProfile component) -->
  <button
    v-if="userStore.isAuthenticated"
    @click="shareUserProfile"
    class="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-rick-600 to-morty-600 hover:from-rick-500 hover:to-morty-500 text-white rounded-lg transition-all duration-300"
  >
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 010-5.688m-9.032 5.688a9.001 9.001 0 01-5.687-9.032m5.688 5.688a3 3 0 100-2.684"></path>
    </svg>
    <span>Share Profile</span>
  </button>
</template>