<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from '#imports'
import { trackEvent } from '#analytics'
import { motion, AnimatePresence } from 'framer-motion'

const i18n = useI18n()

// State
const locations = ref([])
const loading = ref(false)
const error = ref(null)
const selectedLocation = ref(null)
const showLocationModal = ref(false)
const searchQuery = ref('')
const selectedType = ref('all')
const selectedDimension = ref('all')
const sortBy = ref('name')
const currentPage = ref(1)
const locationsPerPage = ref(12)

// Computed properties
const filteredLocations = computed(() => {
  let result = locations.value || []
  
  // Search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(location => 
      location.name.toLowerCase().includes(query) ||
      location.type.toLowerCase().includes(query) ||
      location.dimension.toLowerCase().includes(query)
    )
  }
  
  // Type filter
  if (selectedType.value !== 'all') {
    result = result.filter(location => 
      location.type.toLowerCase() === selectedType.value
    )
  }
  
  // Dimension filter
  if (selectedDimension.value !== 'all') {
    result = result.filter(location => 
      location.dimension.toLowerCase() === selectedDimension.value
    )
  }
  
  // Sorting
  result.sort((a, b) => {
    switch (sortBy.value) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'type':
        return a.type.localeCompare(b.type)
      case 'dimension':
        return a.dimension.localeCompare(b.dimension)
      case 'residents':
        return (b.residents || []).length - (a.residents || []).length
      default:
        return a.name.localeCompare(b.name)
    }
  })
  
  return result
})

const visibleLocations = computed(() => {
  const start = 0
  const end = currentPage.value * locationsPerPage.value
  return filteredLocations.value.slice(start, end)
})

const typeOptions = computed(() => {
  const types = new Set()
  locations.value.forEach(location => {
    types.add(location.type.toLowerCase())
  })
  return Array.from(types).sort()
})

const dimensionOptions = computed(() => {
  const dimensions = new Set()
  locations.value.forEach(location => {
    dimensions.add(location.dimension.toLowerCase())
  })
  return Array.from(dimensions).sort()
})

// Animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1 },
  hover: { y: -8, scale: 1.02 }
}

// Load locations data
const loadLocations = async () => {
  try {
    loading.value = true
    error.value = null
    
    // Mock locations data
    const mockLocations = [
      {
        id: 1,
        name: "Earth (C-137)",
        type: "Planet",
        dimension: "Dimension C-137",
        residents: [
          { id: 1, name: "Rick Sanchez", image: "https://rickandmortyapi.com/api/character/avatar/1.jpeg" },
          { id: 2, name: "Morty Smith", image: "https://rickandmortyapi.com/api/character/avatar/2.jpeg" },
          { id: 3, name: "Beth Smith", image: "https://rickandmortyapi.com/api/character/avatar/3.jpeg" },
          { id: 4, name: "Jerry Smith", image: "https://rickandmortyapi.com/api/character/avatar/4.jpeg" },
          { id: 5, name: "Summer Smith", image: "https://rickandmortyapi.com/api/character/avatar/5.jpeg" }
        ],
        description: "The original Earth dimension where Rick and his family reside."
      },
      {
        id: 2,
        name: "Earth (Replacement Dimension)",
        type: "Planet",
        dimension: "Replacement Dimension",
        residents: [
          { id: 6, name: "Rick Sanchez", image: "https://rickandmortyapi.com/api/character/avatar/6.jpeg" },
          { id: 7, name: "Morty Smith", image: "https://rickandmortyapi.com/api/character/avatar/7.jpeg" }
        ],
        description: "A duplicate Earth created by Rick after destroying his original universe."
      },
      {
        id: 3,
        name: "Anatomy Park",
        type: "Microverse",
        dimension: "Anatomy Park",
        residents: [
          { id: 8, name: "Dr. Xenon Bloom", image: "https://rickandmortyapi.com/api/character/avatar/8.jpeg" }
        ],
        description: "A miniature theme park inside a homeless man's body."
      },
      {
        id: 4,
        name: "Gazorpazorp",
        type: "Planet",
        dimension: "Gazorpazorp",
        residents: [
          { id: 9, name: "Gazorpfield", image: "https://rickandmortyapi.com/api/character/avatar/9.jpeg" }
        ],
        description: "A planet where males are born from a mantis-like species and females from humans."
      },
      {
        id: 5,
        name: "Purge Planet",
        type: "Planet",
        dimension: "Purge Planet",
        residents: [],
        description: "A planet where crime is legal for one day a year."
      },
      {
        id: 6,
        name: "Blips & Chitz",
        type: "Arcade",
        dimension: "Earth",
        residents: [],
        description: "An arcade where Morty and Summer got stuck in a simulation."
      }
    ]
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    locations.value = mockLocations
    
    // Track page load
    trackEvent('page_view', { 
      page: 'locations',
      locations_count: locations.value.length 
    })
  } catch (err) {
    error.value = i18n.t('errors.network')
    console.error('Failed to load locations:', err)
  } finally {
    loading.value = false
  }
}

// View location details
const viewLocation = (location: any) => {
  selectedLocation.value = location
  showLocationModal.value = true
  
  // Track location view
  trackEvent('location_view', {
    location_id: location.id,
    location_name: location.name,
    dimension: location.dimension
  })
}

// Close modal
const closeModal = () => {
  showLocationModal.value = false
  selectedLocation.value = null
}

// Load more locations
const loadMoreLocations = () => {
  if (currentPage.value * locationsPerPage.value < filteredLocations.value.length) {
    currentPage.value++
  }
}

// Get type icon
const getTypeIcon = (type: string) => {
  const icons: Record<string, string> = {
    planet: '🌍',
    microverse: '🔬',
    'tv': '📺',
    arcade: '🎮',
    'resort planet': '🏖️',
    'fantasy town': '🏘️',
    'dream': '💭',
    'mythical city': '🏰',
    'space station': '🚀',
    'miniverse': '🌟',
    'death crystal dimension': '💎',
    'demon dimension': '👿',
    'giant's planet': '🗻',
    'game': '🎲'
  }
  
  return icons[type.toLowerCase()] || '📍'
}

// Get dimension display
const getDimensionDisplay = (dimension: string) => {
  if (dimension.toLowerCase() === 'earth') {
    return 'Original Earth'
  }
  return dimension
}

// Initialize on mount
onMounted(() => {
  loadLocations()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
    <!-- Header Section -->
    <section class="py-16 bg-gradient-to-r from-rick-900/30 via-portal-900/30 to-morty-900/30 border-b border-gray-800">
      <div class="container mx-auto px-4">
        <motion.div 
          :initial="{ opacity: 0, y: 30 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.8, ease: "easeOut" }"
          class="text-center"
        >
          <h1 class="text-4xl lg:text-5xl font-bold text-white mb-4">
            {{ i18n.t('locations.title') }}
          </h1>
          <p class="text-xl text-gray-400 max-w-2xl mx-auto">
            {{ i18n.t('locations.subtitle') }}
          </p>
        </motion.div>
      </div>
    </section>

    <!-- Search and Filters Section -->
    <section class="py-12 bg-gray-900/30 border-b border-gray-800">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <!-- Search -->
          <div class="lg:col-span-2">
            <div class="relative">
              <input
                v-model="searchQuery"
                type="text"
                :placeholder="i18n.t('common.search')"
                class="w-full px-6 py-4 pr-12 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-rick-500 focus:bg-gray-800/50 transition-all duration-300"
              />
              <div class="absolute right-4 top-1/2 transform -translate-y-1/2">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
            </div>
          </div>
          
          <!-- Type Filter -->
          <select 
            v-model="selectedType"
            class="w-full px-4 py-4 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-rick-500 focus:bg-gray-800/50 transition-all duration-300"
          >
            <option value="all">{{ i18n.t('common.all') }} {{ i18n.t('locations.type') }}</option>
            <option v-for="type in typeOptions" :key="type" :value="type">
              {{ type.charAt(0).toUpperCase() + type.slice(1) }}
            </option>
          </select>
          
          <!-- Dimension Filter -->
          <select 
            v-model="selectedDimension"
            class="w-full px-4 py-4 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-rick-500 focus:bg-gray-800/50 transition-all duration-300"
          >
            <option value="all">{{ i18n.t('common.all') }} Dimensions</option>
            <option v-for="dimension in dimensionOptions" :key="dimension" :value="dimension">
              {{ getDimensionDisplay(dimension) }}
            </option>
          </select>
        </div>
        
        <!-- Sort -->
        <div class="flex justify-center mt-4">
          <select 
            v-model="sortBy"
            class="px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-rick-500 focus:bg-gray-800/50 transition-all duration-300"
          >
            <option value="name">{{ i18n.t('common.sort') }}: {{ i18n.t('common.name') }}</option>
            <option value="type">{{ i18n.t('locations.type') }}</option>
            <option value="dimension">{{ i18n.t('locations.dimension') }}</option>
            <option value="residents">{{ i18n.t('locations.residents') }}</option>
          </select>
        </div>
      </div>
    </section>

    <!-- Locations Grid Section -->
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
            @click="loadLocations"
            class="px-6 py-3 bg-rick-600 hover:bg-rick-500 text-white rounded-lg transition-colors duration-200"
          >
            {{ i18n.t('common.retry') }}
          </button>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredLocations.length === 0" class="text-center py-20">
          <div class="text-6xl mb-4">🌌</div>
          <h2 class="text-2xl font-bold text-white mb-4">{{ i18n.t('errors.notFound') }}</h2>
          <p class="text-gray-400 mb-6">
            No locations found matching your criteria.
          </p>
          <button 
            @click="searchQuery = ''; selectedType = 'all'; selectedDimension = 'all'"
            class="px-6 py-3 bg-rick-600 hover:bg-rick-500 text-white rounded-lg transition-colors duration-200"
          >
            {{ i18n.t('common.clearFilters') }}
          </button>
        </div>

        <!-- Locations Grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <motion.div
            v-for="(location, index) in visibleLocations"
            :key="location.id"
            :initial="cardVariants.hidden"
            :animate="cardVariants.visible"
            :variants="cardVariants"
            :transition="{ delay: index * 0.1 }"
            :whileHover="cardVariants.hover"
            class="group relative bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl border border-gray-700 hover:border-rick-500 transition-all duration-300 shadow-xl hover:shadow-2xl overflow-hidden cursor-pointer"
            @click="viewLocation(location)"
          >
            <!-- Background decoration -->
            <div class="absolute inset-0 bg-gradient-to-br from-rick-900/10 via-portal-900/10 to-morty-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            
            <!-- Location icon badge -->
            <div class="absolute top-4 right-4 w-12 h-12 bg-gradient-to-br from-rick-600 to-portal-600 rounded-full flex items-center justify-center text-2xl">
              {{ getTypeIcon(location.type) }}
            </div>
            
            <!-- Location details -->
            <div class="space-y-4">
              <!-- Location info -->
              <div>
                <p class="text-rick-400 text-sm font-medium mb-2">
                  {{ location.type }}
                </p>
                <h3 class="text-xl font-bold text-white line-clamp-2">
                  {{ location.name }}
                </h3>
              </div>
              
              <!-- Dimension -->
              <div class="flex items-center space-x-2 text-gray-400 text-sm">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
                </svg>
                <span>{{ getDimensionDisplay(location.dimension) }}</span>
              </div>
              
              <!-- Residents count -->
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2 text-gray-400 text-sm">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                  <span>{{ location.residents?.length || 0 }} {{ i18n.t('locations.residents') }}</span>
                </div>
                <button class="text-rick-400 hover:text-rick-300 text-sm font-medium">
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
        <div v-if="visibleLocations.length < filteredLocations.length" class="flex justify-center mt-12">
          <button 
            @click="loadMoreLocations"
            class="px-8 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-medium rounded-lg transform hover:scale-105 transition-all duration-300"
          >
            {{ i18n.t('common.loadMore') }}
          </button>
        </div>

        <!-- Results Count -->
        <div class="text-center mt-12">
          <p class="text-gray-400">
            {{ i18n.t('common.showing') }} {{ visibleLocations.length }} {{ i18n.t('common.of') }} {{ filteredLocations.length }} {{ i18n.t('locations.locations') }}
          </p>
        </div>
      </div>
    </section>

    <!-- Location Detail Modal -->
    <div v-if="showLocationModal && selectedLocation" class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl">
        <!-- Modal Header -->
        <div class="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold text-white">{{ selectedLocation.name }}</h2>
            <p class="text-rick-400 font-medium">{{ selectedLocation.type }} • {{ getDimensionDisplay(selectedLocation.dimension) }}</p>
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
          <!-- Location Header -->
          <div class="relative h-64 mb-6 rounded-xl overflow-hidden bg-gradient-to-br from-rick-400/20 via-portal-400/20 to-morty-400/20 flex items-center justify-center">
            <div class="text-8xl opacity-20">{{ getTypeIcon(selectedLocation.type) }}</div>
            
            <!-- Location info badge -->
            <div class="absolute top-4 right-4 px-4 py-2 bg-black/70 rounded-xl flex items-center space-x-2">
              <div class="w-3 h-3 bg-rick-400 rounded-full animate-pulse"></div>
              <span class="text-white text-sm font-medium">{{ selectedLocation.type }}</span>
            </div>
          </div>
          
          <!-- Location Details -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div class="space-y-4">
              <div>
                <h3 class="text-gray-400 text-sm font-medium mb-2">{{ i18n.t('locations.type') }}</h3>
                <p class="text-white font-medium text-lg">{{ selectedLocation.type }}</p>
              </div>
              
              <div>
                <h3 class="text-gray-400 text-sm font-medium mb-2">{{ i18n.t('locations.dimension') }}</h3>
                <p class="text-white font-medium text-lg">{{ getDimensionDisplay(selectedLocation.dimension) }}</p>
              </div>
              
              <div>
                <h3 class="text-gray-400 text-sm font-medium mb-2">{{ i18n.t('locations.residents') }}</h3>
                <p class="text-white font-medium text-lg">{{ selectedLocation.residents?.length || 0 }} Residents</p>
              </div>
            </div>
            
            <div class="space-y-4">
              <div>
                <h3 class="text-gray-400 text-sm font-medium mb-2">Status</h3>
                <div class="flex items-center space-x-2">
                  <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span class="text-green-400 font-medium">Active</span>
                </div>
              </div>
              
              <div v-if="selectedLocation.description">
                <h3 class="text-gray-400 text-sm font-medium mb-2">Description</h3>
                <p class="text-gray-300">{{ selectedLocation.description }}</p>
              </div>
            </div>
          </div>
          
          <!-- Residents Grid -->
          <div v-if="selectedLocation.residents?.length > 0" class="mb-8">
            <h3 class="text-xl font-bold text-white mb-4">{{ i18n.t('locations.residents') }}</h3>
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div 
                v-for="resident in selectedLocation.residents"
                :key="resident.id"
                class="bg-gray-800/50 rounded-lg p-3 flex items-center space-x-3 hover:bg-gray-800/70 transition-colors duration-200"
              >
                <img
                  :src="resident.image"
                  :alt="resident.name"
                  class="w-12 h-12 rounded-full object-cover border-2 border-gray-700"
                  loading="lazy"
                />
                <span class="text-white text-sm font-medium truncate">{{ resident.name }}</span>
              </div>
            </div>
          </div>
          
          <!-- Actions -->
          <div class="flex justify-center space-x-4 pt-6 border-t border-gray-700">
            <button class="px-6 py-2 bg-gradient-to-r from-rick-600 to-morty-600 hover:from-rick-500 hover:to-morty-500 text-white font-medium rounded-lg transition-all duration-300">
              Explore Location
            </button>
            <button class="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-all duration-300">
              Add to Collection
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>