<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from '#imports'
import { trackEvent } from '#analytics'
import { motion, AnimatePresence } from 'framer-motion'

const i18n = useI18n()

// State
const episodes = ref([])
const loading = ref(false)
const error = ref(null)
const selectedEpisode = ref(null)
const showEpisodeModal = ref(false)
const searchQuery = ref('')
const selectedSeason = ref('all')
const sortBy = ref('air_date')
const currentPage = ref(1)
const episodesPerPage = ref(12)

// Computed properties
const filteredEpisodes = computed(() => {
  let result = episodes.value || []
  
  // Search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(episode => 
      episode.name.toLowerCase().includes(query) ||
      episode.episode.toLowerCase().includes(query) ||
      (episode.characters || []).some((char: any) => char.name.toLowerCase().includes(query))
    )
  }
  
  // Season filter
  if (selectedSeason.value !== 'all') {
    const seasonNum = parseInt(selectedSeason.value)
    result = result.filter(episode => {
      const episodeNum = parseInt(episode.episode.split('E')[0].substring(1))
      return episodeNum === seasonNum
    })
  }
  
  // Sorting
  result.sort((a, b) => {
    switch (sortBy.value) {
      case 'air_date':
        return new Date(a.air_date) - new Date(b.air_date)
      case 'episode':
        return a.episode.localeCompare(b.episode)
      case 'name':
        return a.name.localeCompare(b.name)
      case 'characters':
        return (b.characters || []).length - (a.characters || []).length
      default:
        return a.episode.localeCompare(b.episode)
    }
  })
  
  return result
})

const visibleEpisodes = computed(() => {
  const start = 0
  const end = currentPage.value * episodesPerPage.value
  return filteredEpisodes.value.slice(start, end)
})

const seasonOptions = computed(() => {
  const seasons = new Set()
  episodes.value.forEach(episode => {
    const seasonNum = parseInt(episode.episode.split('E')[0].substring(1))
    seasons.add(seasonNum)
  })
  return Array.from(seasons).sort((a, b) => b - a)
})

// Animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1 },
  hover: { y: -8, scale: 1.02 }
}

const imageVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 }
}

// Load episodes data
const loadEpisodes = async () => {
  try {
    loading.value = true
    error.value = null
    
    // Mock episodes data (would be API call in real implementation)
    const mockEpisodes = [
      {
        id: 1,
        name: "Pilot",
        episode: "S01E01",
        air_date: "2013-12-02",
        created: "2017-11-10T12:49:19.223Z",
        characters: [
          { id: 1, name: "Rick Sanchez", image: "https://rickandmortyapi.com/api/character/avatar/1.jpeg" },
          { id: 2, name: "Morty Smith", image: "https://rickandmortyapi.com/api/character/avatar/2.jpeg" },
          { id: 3, name: "Beth Smith", image: "https://rickandmortyapi.com/api/character/avatar/3.jpeg" },
          { id: 4, name: "Jerry Smith", image: "https://rickandmortyapi.com/api/character/avatar/4.jpeg" },
          { id: 5, name: "Summer Smith", image: "https://rickandmortyapi.com/api/character/avatar/5.jpeg" }
        ],
        rating: 8.5
      },
      {
        id: 2,
        name: "Lawnmower Dog",
        episode: "S01E02",
        air_date: "2013-12-09",
        created: "2017-11-10T12:49:19.229Z",
        characters: [
          { id: 1, name: "Rick Sanchez", image: "https://rickandmortyapi.com/api/character/avatar/1.jpeg" },
          { id: 2, name: "Morty Smith", image: "https://rickandmortyapi.com/api/character/avatar/2.jpeg" },
          { id: 6, name: "Scary Terry", image: "https://rickandmortyapi.com/api/character/avatar/6.jpeg" }
        ],
        rating: 8.2
      },
      {
        id: 3,
        name: "Anatomy Park",
        episode: "S01E03",
        air_date: "2013-12-16",
        created: "2017-11-10T12:49:19.234Z",
        characters: [
          { id: 1, name: "Rick Sanchez", image: "https://rickandmortyapi.com/api/character/avatar/1.jpeg" },
          { id: 2, name: "Morty Smith", image: "https://rickandmortyapi.com/api/character/avatar/2.jpeg" },
          { id: 7, name: "Dr. Xenon Bloom", image: "https://rickandmortyapi.com/api/character/avatar/7.jpeg" }
        ],
        rating: 8.7
      }
    ]
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    episodes.value = mockEpisodes
    
    // Track page load
    trackEvent('page_view', { 
      page: 'episodes',
      episodes_count: episodes.value.length 
    })
  } catch (err) {
    error.value = i18n.t('errors.network')
    console.error('Failed to load episodes:', err)
  } finally {
    loading.value = false
  }
}

// View episode details
const viewEpisode = (episode: any) => {
  selectedEpisode.value = episode
  showEpisodeModal.value = true
  
  // Track episode view
  trackEvent('episode_view', {
    episode_id: episode.id,
    episode_name: episode.name,
    rating: episode.rating
  })
}

// Close modal
const closeModal = () => {
  showEpisodeModal.value = false
  selectedEpisode.value = null
}

// Load more episodes
const loadMoreEpisodes = () => {
  if (currentPage.value * episodesPerPage.value < filteredEpisodes.value.length) {
    currentPage.value++
  }
}

// Get episode display info
const getEpisodeDisplay = (episode: any) => {
  const seasonNum = episode.episode.split('E')[0].substring(1)
  const episodeNum = episode.episode.split('E')[1]
  return `Season ${seasonNum} • Episode ${episodeNum}`
}

// Format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString(i18n.locale.value, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Get star rating
const getStarRating = (rating: number) => {
  const fullStars = Math.floor(rating / 2)
  const halfStar = rating % 2 >= 1
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0)
  
  return {
    full: fullStars,
    half: halfStar,
    empty: emptyStars
  }
}

// Initialize on mount
onMounted(() => {
  loadEpisodes()
})

// Cleanup
onUnmounted(() => {
  // Cleanup any timers or event listeners
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
    <!-- Header Section -->
    <section class="py-16 bg-gradient-to-r from-morty-900/30 to-portal-900/30 border-b border-gray-800">
      <div class="container mx-auto px-4">
        <motion.div 
          :initial="{ opacity: 0, y: 30 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.8, ease: "easeOut" }"
          class="text-center"
        >
          <h1 class="text-4xl lg:text-5xl font-bold text-white mb-4">
            {{ i18n.t('episodes.title') }}
          </h1>
          <p class="text-xl text-gray-400 max-w-2xl mx-auto">
            {{ i18n.t('episodes.subtitle') }}
          </p>
        </motion.div>
      </div>
    </section>

    <!-- Search and Filters Section -->
    <section class="py-12 bg-gray-900/30 border-b border-gray-800">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Search -->
          <div class="lg:col-span-2">
            <div class="relative">
              <input
                v-model="searchQuery"
                type="text"
                :placeholder="i18n.t('common.search')"
                class="w-full px-6 py-4 pr-12 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-morty-500 focus:bg-gray-800/50 transition-all duration-300"
              />
              <div class="absolute right-4 top-1/2 transform -translate-y-1/2">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
            </div>
          </div>
          
          <!-- Filter and Sort -->
          <div class="flex gap-4">
            <select 
              v-model="selectedSeason"
              class="flex-1 px-4 py-4 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-morty-500 focus:bg-gray-800/50 transition-all duration-300"
            >
              <option value="all">{{ i18n.t('common.all') }} Seasons</option>
              <option v-for="season in seasonOptions" :key="season" :value="season">
                Season {{ season }}
              </option>
            </select>
            
            <select 
              v-model="sortBy"
              class="flex-1 px-4 py-4 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-morty-500 focus:bg-gray-800/50 transition-all duration-300"
            >
              <option value="episode">{{ i18n.t('common.sort') }}: {{ i18n.t('episodes.episode') }}</option>
              <option value="air_date">{{ i18n.t('episodes.airDate') }}</option>
              <option value="name">{{ i18n.t('common.name') }}</option>
              <option value="characters">{{ i18n.t('characters.episodes') }}</option>
            </select>
          </div>
        </div>
      </div>
    </section>

    <!-- Episodes Grid Section -->
    <section class="py-12">
      <div class="container mx-auto px-4">
        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center items-center py-20">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-morty-400"></div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="text-center py-20">
          <div class="text-6xl mb-4">🚫</div>
          <h2 class="text-2xl font-bold text-white mb-4">{{ i18n.t('errors.general') }}</h2>
          <p class="text-gray-400 mb-6">{{ error }}</p>
          <button 
            @click="loadEpisodes"
            class="px-6 py-3 bg-morty-600 hover:bg-morty-500 text-white rounded-lg transition-colors duration-200"
          >
            {{ i18n.t('common.retry') }}
          </button>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredEpisodes.length === 0" class="text-center py-20">
          <div class="text-6xl mb-4">📺</div>
          <h2 class="text-2xl font-bold text-white mb-4">{{ i18n.t('errors.notFound') }}</h2>
          <p class="text-gray-400 mb-6">
            No episodes found matching your criteria.
          </p>
          <button 
            @click="searchQuery = ''; selectedSeason = 'all'"
            class="px-6 py-3 bg-morty-600 hover:bg-morty-500 text-white rounded-lg transition-colors duration-200"
          >
            {{ i18n.t('common.clearFilters') }}
          </button>
        </div>

        <!-- Episodes Grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          <motion.div
            v-for="(episode, index) in visibleEpisodes"
            :key="episode.id"
            :initial="cardVariants.hidden"
            :animate="cardVariants.visible"
            :variants="cardVariants"
            :transition="{ delay: index * 0.1 }"
            :whileHover="cardVariants.hover"
            class="group relative bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl border border-gray-700 hover:border-morty-500 transition-all duration-300 shadow-xl hover:shadow-2xl overflow-hidden cursor-pointer"
            @click="viewEpisode(episode)"
          >
            <!-- Background decoration -->
            <div class="absolute inset-0 bg-gradient-to-br from-morty-900/10 to-portal-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            
            <!-- Episode number badge -->
            <div class="absolute top-4 left-4 px-3 py-1 bg-gradient-to-r from-morty-600 to-portal-600 text-white text-xs font-bold rounded-full">
              {{ episode.episode }}
            </div>
            
            <!-- Episode image placeholder -->
            <div class="relative h-40 mb-6 rounded-xl overflow-hidden">
              <motion.div
                :initial="imageVariants.hidden"
                :animate="imageVariants.visible"
                class="absolute inset-0 bg-gradient-to-br from-morty-400/20 to-portal-400/20 flex items-center justify-center"
              >
                <div class="text-white/60 text-4xl">📺</div>
              </motion.div>
              
              <!-- Rating badge -->
              <div class="absolute top-2 right-2 px-2 py-1 bg-black/70 rounded-full flex items-center space-x-1">
                <svg class="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                <span class="text-white text-xs font-bold">{{ episode.rating.toFixed(1) }}</span>
              </div>
            </div>
            
            <!-- Episode details -->
            <div class="space-y-4">
              <!-- Episode info -->
              <div>
                <p class="text-morty-400 text-sm font-medium mb-1">
                  {{ getEpisodeDisplay(episode) }}
                </p>
                <h3 class="text-xl font-bold text-white line-clamp-2">
                  {{ episode.name }}
                </h3>
              </div>
              
              <!-- Air date -->
              <div class="flex items-center space-x-2 text-gray-400 text-sm">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <span>{{ formatDate(episode.air_date) }}</span>
              </div>
              
              <!-- Characters count -->
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2 text-gray-400 text-sm">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                  </svg>
                  <span>{{ episode.characters?.length || 0 }} Characters</span>
                </div>
                <button class="text-morty-400 hover:text-morty-300 text-sm font-medium">
                  {{ i18n.t('common.viewDetails') }}
                </button>
              </div>
            </div>
            
            <!-- Hover overlay -->
            <div 
              v-if="isHovered"
              class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            ></div>
          </motion.div>
        </div>

        <!-- Load More Button -->
        <div v-if="visibleEpisodes.length < filteredEpisodes.length" class="flex justify-center mt-12">
          <button 
            @click="loadMoreEpisodes"
            class="px-8 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-medium rounded-lg transform hover:scale-105 transition-all duration-300"
          >
            {{ i18n.t('common.loadMore') }}
          </button>
        </div>

        <!-- Results Count -->
        <div class="text-center mt-12">
          <p class="text-gray-400">
            {{ i18n.t('common.showing') }} {{ visibleEpisodes.length }} {{ i18n.t('common.of') }} {{ filteredEpisodes.length }} {{ i18n.t('episodes.episodes') }}
          </p>
        </div>
      </div>
    </section>

    <!-- Episode Detail Modal -->
    <div v-if="showEpisodeModal && selectedEpisode" class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl">
        <!-- Modal Header -->
        <div class="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold text-white">{{ selectedEpisode.name }}</h2>
            <p class="text-morty-400 font-medium">{{ selectedEpisode.episode }}</p>
          </div>
          <button 
            @click="closeModal"
            class="p-2 rounded-lg hover:bg-gray-800 transition-colors duration-200"
          >
            <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <!-- Modal Content -->
        <div class="p-6">
          <!-- Episode Image -->
          <div class="relative h-64 mb-6 rounded-xl overflow-hidden bg-gradient-to-br from-morty-400/20 to-portal-400/20 flex items-center justify-center">
            <div class="text-white text-8xl opacity-20">📺</div>
            
            <!-- Rating badge -->
            <div class="absolute top-4 right-4 px-3 py-2 bg-black/70 rounded-xl flex items-center space-x-2">
              <div class="flex">
                <svg 
                  v-for="star in getStarRating(selectedEpisode.rating).full" 
                  :key="'full-' + star"
                  class="w-4 h-4 text-yellow-400" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                <svg 
                  v-if="getStarRating(selectedEpisode.rating).half"
                  class="w-4 h-4 text-yellow-400" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                <svg 
                  v-for="star in getStarRating(selectedEpisode.rating).empty" 
                  :key="'empty-' + star"
                  class="w-4 h-4 text-gray-600" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
              </div>
              <span class="text-white text-sm font-bold">{{ selectedEpisode.rating.toFixed(1) }}</span>
            </div>
          </div>
          
          <!-- Episode Info -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div class="space-y-4">
              <div>
                <h3 class="text-gray-400 text-sm font-medium mb-2">{{ i18n.t('episodes.episode') }}</h3>
                <p class="text-white font-medium">{{ selectedEpisode.episode }}</p>
              </div>
              
              <div>
                <h3 class="text-gray-400 text-sm font-medium mb-2">{{ i18n.t('episodes.airDate') }}</h3>
                <p class="text-white font-medium">{{ formatDate(selectedEpisode.air_date) }}</p>
              </div>
              
              <div>
                <h3 class="text-gray-400 text-sm font-medium mb-2">{{ i18n.t('episodes.created') }}</h3>
                <p class="text-white font-medium">{{ formatDate(selectedEpisode.created) }}</p>
              </div>
            </div>
            
            <div class="space-y-4">
              <div>
                <h3 class="text-gray-400 text-sm font-medium mb-2">{{ i18n.t('characters.characters') }}</h3>
                <p class="text-white font-medium">{{ selectedEpisode.characters?.length || 0 }} Characters</p>
              </div>
              
              <div>
                <h3 class="text-gray-400 text-sm font-medium mb-2">Rating</h3>
                <div class="flex items-center space-x-2">
                  <div class="flex">
                    <svg 
                      v-for="star in getStarRating(selectedEpisode.rating).full" 
                      :key="'modal-full-' + star"
                      class="w-5 h-5 text-yellow-400" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                  </div>
                  <span class="text-white text-lg font-bold">{{ selectedEpisode.rating.toFixed(1) }}/10</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Characters Grid -->
          <div v-if="selectedEpisode.characters?.length > 0" class="mb-8">
            <h3 class="text-xl font-bold text-white mb-4">{{ i18n.t('characters.characters') }}</h3>
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div 
                v-for="character in selectedEpisode.characters.slice(0, 8)"
                :key="character.id"
                class="bg-gray-800/50 rounded-lg p-3 flex items-center space-x-3 hover:bg-gray-800/70 transition-colors duration-200"
              >
                <img
                  :src="character.image"
                  :alt="character.name"
                  class="w-12 h-12 rounded-full object-cover border-2 border-gray-700"
                  loading="lazy"
                />
                <span class="text-white text-sm font-medium truncate">{{ character.name }}</span>
              </div>
            </div>
            <p v-if="selectedEpisode.characters.length > 8" class="text-gray-400 text-sm mt-2 text-center">
              + {{ selectedEpisode.characters.length - 8 }} more characters
            </p>
          </div>
          
          <!-- Actions -->
          <div class="flex justify-center space-x-4 pt-6 border-t border-gray-700">
            <button class="px-6 py-2 bg-gradient-to-r from-morty-600 to-portal-600 hover:from-morty-500 hover:to-portal-500 text-white font-medium rounded-lg transition-all duration-300">
              Watch Episode
            </button>
            <button class="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-all duration-300">
              Add to Favorites
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>