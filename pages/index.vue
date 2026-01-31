<script setup lang="ts">
import { storeToRefs, ref, onMounted, onUnmounted, computed } from 'vue'
import { useCharactersStore } from '~/stores/characters'
import { useI18n } from '#imports'
import { trackEvent, trackSearch } from '#analytics'

const charactersStore = useCharactersStore()
const { getCharacters, characters } = storeToRefs(charactersStore)
const { getCharacters: fetchCharacters } = useCharactersStore()

const i18n = useI18n()

// State management
const loading = ref(false)
const error = ref<string | null>(null)
const searchQuery = ref('')
const selectedFilter = ref('all')
const sortBy = ref('name')
const currentPage = ref(1)
const charactersPerView = ref(20)
const scrollPosition = ref(0)
const isNearBottom = ref(false)

// Computed properties
const filteredCharacters = computed(() => {
  let result = characters.value || []
  
  // Search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(char => 
      char.name.toLowerCase().includes(query) ||
      char.species.toLowerCase().includes(query) ||
      char.type.toLowerCase().includes(query) ||
      char.origin.name.toLowerCase().includes(query) ||
      char.location.name.toLowerCase().includes(query)
    )
  }
  
  // Status filter
  if (selectedFilter.value !== 'all') {
    result = result.filter(char => 
      char.status.toLowerCase() === selectedFilter.value
    )
  }
  
  // Sorting
  result.sort((a, b) => {
    switch (sortBy.value) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'status':
        return a.status.localeCompare(b.status)
      case 'species':
        return a.species.localeCompare(b.species)
      case 'episodes':
        return b.episode.length - a.episode.length
      case 'id':
        return a.id - b.id
      default:
        return a.name.localeCompare(b.name)
    }
  })
  
  return result
})

const visibleCharacters = computed(() => {
  const start = 0
  const end = currentPage.value * charactersPerView.value
  return filteredCharacters.value.slice(start, end)
})

// Load characters on mount
onMounted(async () => {
  try {
    loading.value = true
    await fetchCharacters()
    
    // Track page load
    trackEvent('page_view', { 
      page: 'home',
      characters_count: characters.value?.length || 0 
    })
  } catch (err) {
    error.value = i18n.t('errors.network')
    console.error('Failed to load characters:', err)
  } finally {
    loading.value = false
  }
})

// Infinite scroll handler
const handleScroll = () => {
  const scrollTop = window.scrollY
  const windowHeight = window.innerHeight
  const documentHeight = document.documentElement.scrollHeight
  
  scrollPosition.value = scrollTop
  
  // Check if near bottom
  isNearBottom.value = scrollTop + windowHeight >= documentHeight - 200
  
  // Load more characters if near bottom
  if (isNearBottom.value && visibleCharacters.value.length < filteredCharacters.value.length) {
    loadMoreCharacters()
  }
}

const loadMoreCharacters = () => {
  if (currentPage.value * charactersPerView.value < filteredCharacters.value.length) {
    currentPage.value++
  }
}

// Search handler
const handleSearch = () => {
  currentPage.value = 1
  trackSearch(searchQuery.value, filteredCharacters.value.length)
}

// Filter change handler
const handleFilterChange = () => {
  currentPage.value = 1
}

// Sort change handler
const handleSortChange = () => {
  currentPage.value = 1
}

// Reset filters
const resetFilters = () => {
  searchQuery.value = ''
  selectedFilter.value = 'all'
  sortBy.value = 'name'
  currentPage.value = 1
}

// Get status statistics
const getStatusStats = () => {
  const stats = {
    alive: 0,
    dead: 0,
    unknown: 0
  }
  
  ;(characters.value || []).forEach(char => {
    switch (char.status.toLowerCase()) {
      case 'alive':
        stats.alive++
        break
      case 'dead':
        stats.dead++
        break
      default:
        stats.unknown++
        break
    }
  })
  
  return stats
}

const statusStats = computed(getStatusStats)

// Cleanup
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

// Add scroll listener
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})
</script>

<template>
  <NuxtLayout name="default">
    <!-- Hero Section -->
    <section class="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-rick-900/20 to-morty-900/20">
      <!-- Animated background -->
      <div class="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23F59E0B" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      
      <div class="container mx-auto px-4 text-center relative z-10">
        <motion.div 
          :initial="{ opacity: 0, y: 30 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.8, ease: "easeOut" }"
          class="max-w-4xl"
        >
          <h1 class="text-5xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
            <span class="bg-gradient-to-r from-rick-400 via-morty-400 to-portal-400 bg-clip-text text-transparent">
              Morty Enlightenment
            </span>
          </h1>
          
          <p class="text-xl lg:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            {{ i18n.t('characters.subtitle') }}
          </p>
          
          <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
            <NuxtLink 
              to="/characters"
              class="px-8 py-4 bg-gradient-to-r from-rick-600 to-morty-600 hover:from-rick-500 hover:to-morty-500 text-white font-semibold rounded-full transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              {{ i18n.t('navigation.characters') }}
            </NuxtLink>
            
            <NuxtLink 
              to="/episodes"
              class="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-full transform hover:scale-105 transition-all duration-300 border border-gray-700"
            >
              {{ i18n.t('navigation.episodes') }}
            </NuxtLink>
          </div>
        </motion.div>
      </div>
      
      <!-- Floating elements -->
      <div class="absolute top-10 left-10 w-20 h-20 bg-rick-400/20 rounded-full blur-xl animate-pulse"></div>
      <div class="absolute bottom-10 right-10 w-32 h-32 bg-morty-400/20 rounded-full blur-xl animate-pulse"></div>
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
                @input="handleSearch"
                :placeholder="i18n.t('characters.searchPlaceholder')"
                class="w-full px-6 py-4 pr-12 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-rick-500 focus:bg-gray-800/50 transition-all duration-300"
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
              v-model="selectedFilter"
              @change="handleFilterChange"
              class="flex-1 px-4 py-4 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-rick-500 focus:bg-gray-800/50 transition-all duration-300"
            >
              <option value="all">{{ i18n.t('characters.filterBy') }}: {{ i18n.t('common.all') }}</option>
              <option value="alive">{{ i18n.t('characters.alive') }}</option>
              <option value="dead">{{ i18n.t('characters.dead') }}</option>
              <option value="unknown">{{ i18n.t('characters.unknown') }}</option>
            </select>
            
            <select 
              v-model="sortBy"
              @change="handleSortChange"
              class="flex-1 px-4 py-4 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-rick-500 focus:bg-gray-800/50 transition-all duration-300"
            >
              <option value="name">{{ i18n.t('common.sort') }}: {{ i18n.t('common.name') }}</option>
              <option value="status">{{ i18n.t('characters.status') }}</option>
              <option value="species">{{ i18n.t('characters.species') }}</option>
              <option value="episodes">{{ i18n.t('characters.episodes') }}</option>
              <option value="id">{{ i18n.t('common.id') }}</option>
            </select>
          </div>
        </div>
        
        <!-- Status Stats -->
        <div class="flex justify-center gap-8 mt-6">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 bg-green-400 rounded-full"></div>
            <span class="text-gray-400">{{ i18n.t('characters.alive') }}: {{ statusStats.alive }}</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 bg-red-400 rounded-full"></div>
            <span class="text-gray-400">{{ i18n.t('characters.dead') }}: {{ statusStats.dead }}</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 bg-gray-400 rounded-full"></div>
            <span class="text-gray-400">{{ i18n.t('characters.unknown') }}: {{ statusStats.unknown }}</span>
          </div>
        </div>
        
        <!-- Reset button -->
        <div class="flex justify-center mt-4">
          <button 
            @click="resetFilters"
            class="px-4 py-2 text-sm text-rick-400 hover:text-rick-300 transition-colors duration-200"
          >
            {{ i18n.t('common.reset') }}
          </button>
        </div>
      </div>
    </section>

    <!-- Characters Grid Section -->
    <section class="py-12">
      <div class="container mx-auto px-4">
        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center items-center py-20">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-rick-400"></div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="text-center py-20">
          <div class="text-6xl mb-4">🚫</div>
          <h2 class="text-2xl font-bold text-white mb-4">{{ i18n.t('errors.general') }}</h2>
          <p class="text-gray-400 mb-6">{{ error }}</p>
          <button 
            @click="fetchCharacters"
            class="px-6 py-3 bg-rick-600 hover:bg-rick-500 text-white rounded-lg transition-colors duration-200"
          >
            {{ i18n.t('common.retry') }}
          </button>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredCharacters.length === 0" class="text-center py-20">
          <div class="text-6xl mb-4">🔍</div>
          <h2 class="text-2xl font-bold text-white mb-4">{{ i18n.t('errors.notFound') }}</h2>
          <p class="text-gray-400 mb-6">
            {{ i18n.t('characters.empty') || 'No characters found matching your criteria.' }}
          </p>
          <button 
            @click="resetFilters"
            class="px-6 py-3 bg-rick-600 hover:bg-rick-500 text-white rounded-lg transition-colors duration-200"
          >
            {{ i18n.t('common.clearFilters') }}
          </button>
        </div>

        <!-- Characters Grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center">
          <CharacterCard
            v-for="(character, index) in visibleCharacters"
            :key="character.id"
            :character="character"
            :index="index"
          />
        </div>

        <!-- Load More Indicator -->
        <div v-if="isNearBottom && visibleCharacters.length < filteredCharacters.length" class="flex justify-center mt-8">
          <div class="animate-pulse">
            <div class="w-8 h-8 border-2 border-rick-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>

        <!-- AdSense Unit - Leaderboard -->
        <div v-if="filteredCharacters.length > 10" class="mt-12">
          <AdSense format="leaderboard" placement="middle" />
        </div>

        <!-- Results Count -->
        <div class="text-center mt-12">
          <p class="text-gray-400">
            {{ i18n.t('common.showing') }} {{ visibleCharacters.length }} {{ i18n.t('common.of') }} {{ filteredCharacters.length }} {{ i18n.t('characters.characters') }}
          </p>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-16 bg-gradient-to-br from-gray-900 to-rick-900/10 border-t border-gray-800">
      <div class="container mx-auto px-4">
        <div class="text-center mb-12">
          <h2 class="text-4xl font-bold text-white mb-4">Why Choose Morty Enlightenment?</h2>
          <p class="text-xl text-gray-400 max-w-2xl mx-auto">
            Experience Rick and Morty like never before with our premium features
          </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="bg-gray-800/50 p-6 rounded-xl border border-gray-700 hover:border-rick-500 transition-all duration-300">
            <div class="w-12 h-12 bg-rick-400/20 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-rick-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-white mb-2">Premium UI/UX</h3>
            <p class="text-gray-400">
              Beautiful, responsive design with smooth animations and interactions
            </p>
          </div>
          
          <div class="bg-gray-800/50 p-6 rounded-xl border border-gray-700 hover:border-morty-500 transition-all duration-300">
            <div class="w-12 h-12 bg-morty-400/20 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-morty-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-white mb-2">Multilingual Support</h3>
            <p class="text-gray-400">
              Full translation support in English, Spanish, and Portuguese
            </p>
          </div>
          
          <div class="bg-gray-800/50 p-6 rounded-xl border border-gray-700 hover:border-portal-500 transition-all duration-300">
            <div class="w-12 h-12 bg-portal-400/20 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-portal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-white mb-2">PWA Ready</h3>
            <p class="text-gray-400">
              Installable web app with offline capabilities and notifications
            </p>
          </div>
        </div>
      </div>
    </section>
  </NuxtLayout>
</template>
