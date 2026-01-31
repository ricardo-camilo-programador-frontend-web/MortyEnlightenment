<script setup lang="ts">
import { storeToRefs, ref, onMounted, computed, watch } from 'vue'
import { useCharactersStore } from '~/stores/characters'
import { useI18n } from '#imports'
import { trackEvent, trackSearch } from '#analytics'
import { motion } from 'framer-motion'

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
const selectedCharacter = ref<any>(null)
const showCharacterModal = ref(false)
const charactersPerView = ref(12)
const scrollPosition = ref(0)

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

// Load characters on mount
onMounted(async () => {
  try {
    loading.value = true
    await fetchCharacters()
    
    // Track page load
    trackEvent('page_view', { 
      page: 'characters',
      characters_count: characters.value?.length || 0 
    })
  } catch (err) {
    error.value = i18n.t('errors.network')
    console.error('Failed to load characters:', err)
  } finally {
    loading.value = false
  }
})

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

// View character details
const viewCharacter = (character: any) => {
  selectedCharacter.value = character
  showCharacterModal.value = true
  
  // Track character view
  trackEvent('character_detail_view', {
    character_id: character.id,
    character_name: character.name
  })
}

// Close modal
const closeModal = () => {
  showCharacterModal.value = false
  selectedCharacter.value = null
}

// Load more characters
const loadMoreCharacters = () => {
  if (currentPage.value * charactersPerView.value < filteredCharacters.value.length) {
    currentPage.value++
  }
}

// Animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
  hover: { y: -10 }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
    <!-- Header Section -->
    <section class="py-16 bg-gradient-to-r from-rick-900/30 to-morty-900/30 border-b border-gray-800">
      <div class="container mx-auto px-4">
        <motion.div 
          :initial="{ opacity: 0, y: 30 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.8, ease: "easeOut" }"
          class="text-center"
        >
          <h1 class="text-4xl lg:text-5xl font-bold text-white mb-4">
            {{ i18n.t('characters.title') }}
          </h1>
          <p class="text-xl text-gray-400 max-w-2xl mx-auto">
            {{ i18n.t('characters.subtitle') }}
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
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          <motion.div
            v-for="(character, index) in visibleCharacters"
            :key="character.id"
            :initial="cardVariants.hidden"
            :animate="cardVariants.visible"
            :variants="cardVariants"
            :transition="{ delay: index * 0.1 }"
            :whileHover="cardVariants.hover"
            class="group relative bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl border border-gray-700 hover:border-rick-500 transition-all duration-300 shadow-xl hover:shadow-2xl overflow-hidden cursor-pointer"
            @click="viewCharacter(character)"
          >
            <!-- Background decoration -->
            <div class="absolute inset-0 bg-gradient-to-br from-rick-900/10 to-morty-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            
            <!-- Character image section -->
            <div class="flex flex-col items-center mb-6">
              <div class="relative">
                <img
                  :src="character.image"
                  :alt="character.name"
                  class="w-32 h-32 rounded-full object-cover border-4 border-gray-700 group-hover:border-rick-400 transition-all duration-300 shadow-lg"
                  loading="lazy"
                />
                
                <!-- Status indicator -->
                <div class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-gray-900 flex items-center justify-center z-10"
                  :class="[
                    character.status.toLowerCase() === 'alive' ? 'bg-green-400' : 
                    character.status.toLowerCase() === 'dead' ? 'bg-red-400' : 'bg-gray-400'
                  ]">
                  <div class="w-2 h-2 rounded-full bg-white"></div>
                </div>
              </div>
              
              <!-- Character name -->
              <h3 class="mt-4 text-xl font-bold text-white text-center">
                {{ character.name }}
              </h3>
            </div>
            
            <!-- Character details -->
            <div class="space-y-3">
              <div class="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors duration-200">
                <span class="text-gray-400 text-sm">{{ i18n.t('characters.status') }}</span>
                <span :class="[
                  character.status.toLowerCase() === 'alive' ? 'text-green-400' : 
                  character.status.toLowerCase() === 'dead' ? 'text-red-400' : 'text-gray-400'
                ]" class="text-sm font-medium">
                  {{ character.status }}
                </span>
              </div>
              
              <div class="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors duration-200">
                <span class="text-gray-400 text-sm">{{ i18n.t('characters.species') }}</span>
                <span class="text-purple-400 text-sm font-medium">
                  {{ character.species }}
                </span>
              </div>
              
              <div class="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors duration-200">
                <span class="text-gray-400 text-sm">{{ i18n.t('characters.gender') }}</span>
                <span class="text-blue-400 text-sm font-medium">
                  {{ character.gender }}
                </span>
              </div>
            </div>
            
            <!-- View Details Button -->
            <div class="mt-6 text-center">
              <button class="px-4 py-2 bg-gradient-to-r from-rick-600 to-morty-600 hover:from-rick-500 hover:to-morty-500 text-white text-sm font-medium rounded-lg transform hover:scale-105 transition-all duration-300">
                {{ i18n.t('common.viewDetails') }}
              </button>
            </div>
          </motion.div>
        </div>

        <!-- Load More Button -->
        <div v-if="visibleCharacters.length < filteredCharacters.value.length" class="flex justify-center mt-12">
          <button 
            @click="loadMoreCharacters"
            class="px-8 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-medium rounded-lg transform hover:scale-105 transition-all duration-300"
          >
            {{ i18n.t('common.loadMore') }}
          </button>
        </div>

        <!-- AdSense Unit - Medium Rectangle -->
        <div v-if="filteredCharacters.length > 15" class="mt-12">
          <AdSense format="medium" placement="bottom" />
        </div>

        <!-- Results Count -->
        <div class="text-center mt-12">
          <p class="text-gray-400">
            {{ i18n.t('common.showing') }} {{ visibleCharacters.length }} {{ i18n.t('common.of') }} {{ filteredCharacters.value.length }} {{ i18n.t('characters.characters') }}
          </p>
        </div>
      </div>
    </section>

    <!-- Character Detail Modal -->
    <div v-if="showCharacterModal && selectedCharacter" class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl">
        <!-- Modal Header -->
        <div class="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 flex items-center justify-between">
          <h2 class="text-2xl font-bold text-white">{{ selectedCharacter.name }}</h2>
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
          <!-- Character Image -->
          <div class="flex justify-center mb-6">
            <img
              :src="selectedCharacter.image"
              :alt="selectedCharacter.name"
              class="w-48 h-48 rounded-full object-cover border-4 border-gray-700 shadow-lg"
            />
          </div>
          
          <!-- Character Details -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Basic Info -->
            <div class="space-y-4">
              <div>
                <h3 class="text-gray-400 text-sm font-medium mb-2">{{ i18n.t('characters.status') }}</h3>
                <span :class="[
                  selectedCharacter.status.toLowerCase() === 'alive' ? 'text-green-400' : 
                  selectedCharacter.status.toLowerCase() === 'dead' ? 'text-red-400' : 'text-gray-400'
                ]" class="text-lg font-medium">
                  {{ selectedCharacter.status }}
                </span>
              </div>
              
              <div>
                <h3 class="text-gray-400 text-sm font-medium mb-2">{{ i18n.t('characters.species') }}</h3>
                <span class="text-purple-400 text-lg font-medium">
                  {{ selectedCharacter.species }}
                </span>
              </div>
              
              <div>
                <h3 class="text-gray-400 text-sm font-medium mb-2">{{ i18n.t('characters.gender') }}</h3>
                <span class="text-blue-400 text-lg font-medium">
                  {{ selectedCharacter.gender }}
                </span>
              </div>
              
              <div>
                <h3 class="text-gray-400 text-sm font-medium mb-2">{{ i18n.t('common.type') }}</h3>
                <span class="text-yellow-400 text-lg font-medium">
                  {{ selectedCharacter.type || i18n.t('characters.unknown') }}
                </span>
              </div>
            </div>
            
            <!-- Location Info -->
            <div class="space-y-4">
              <div>
                <h3 class="text-gray-400 text-sm font-medium mb-2">{{ i18n.t('characters.origin') }}</h3>
                <div class="bg-gray-800 rounded-lg p-4">
                  <p class="text-white font-medium">{{ selectedCharacter.origin.name }}</p>
                  <p class="text-gray-400 text-sm mt-1">{{ selectedCharacter.origin.url }}</p>
                </div>
              </div>
              
              <div>
                <h3 class="text-gray-400 text-sm font-medium mb-2">{{ i18n.t('characters.location') }}</h3>
                <div class="bg-gray-800 rounded-lg p-4">
                  <p class="text-white font-medium">{{ selectedCharacter.location.name }}</p>
                  <p class="text-gray-400 text-sm mt-1">{{ selectedCharacter.location.url }}</p>
                </div>
              </div>
              
              <div>
                <h3 class="text-gray-400 text-sm font-medium mb-2">{{ i18n.t('characters.episodes') }}</h3>
                <span class="text-orange-400 text-lg font-medium">
                  {{ selectedCharacter.episode.length }} {{ i18n.t('characters.episodes') }}
                </span>
              </div>
            </div>
          </div>
          
          <!-- Episodes List -->
          <div class="mt-8">
            <h3 class="text-xl font-bold text-white mb-4">{{ i18n.t('characters.episodes') }}</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div 
                v-for="(episode, index) in selectedCharacter.episode.slice(0, 6)"
                :key="index"
                class="bg-gray-800 rounded-lg p-3 hover:bg-gray-700 transition-colors duration-200"
              >
                <p class="text-blue-400 text-sm font-medium">{{ episode }}</p>
              </div>
            </div>
            <p v-if="selectedCharacter.episode.length > 6" class="text-gray-400 text-sm mt-2 text-center">
              + {{ selectedCharacter.episode.length - 6 }} more episodes
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>