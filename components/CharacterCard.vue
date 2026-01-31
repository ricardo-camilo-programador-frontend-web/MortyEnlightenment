<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ICharacter } from '~/models/Character'
import { useI18n } from '#imports'
import { trackCharacterView, trackFavoriteToggle } from '#analytics'
import { motion } from 'framer-motion'

interface Props {
  character: ICharacter
  class?: string
  index?: number
}

const props = defineProps<Props>()
const i18n = useI18n()

const isHovered = ref(false)
const isFavorite = ref(false)
const isAnimating = ref(false)
const lastScrollPosition = ref(0)

// Computed properties for better performance
const characterImage = computed(() => props.character.image)
const characterStatus = computed(() => props.character.status.toLowerCase())
const characterSpecies = computed(() => props.character.species)
const characterType = computed(() => props.character.type || 'Unknown')

// Status colors mapping
const statusColors = computed(() => ({
  alive: 'text-green-400',
  dead: 'text-red-400',
  unknown: 'text-gray-400'
}))

// Species colors mapping
const speciesColors = computed(() => ({
  human: 'text-blue-400',
  alien: 'text-purple-400',
  robot: 'text-orange-400',
  mythologicalcreature: 'text-pink-400',
  poopybutthole: 'text-yellow-400',
  cronenberg: 'text-indigo-400',
  animal: 'text-emerald-400'
}))

// Animation variants
const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  },
  hover: {
    y: -8,
    scale: 1.02,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
}

const imageVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.6,
      delay: 0.2,
      ease: "easeOut"
    }
  }
}

const textVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.4,
      delay: 0.4,
      ease: "easeOut"
    }
  }
}

// Lifecycle hooks
onMounted(() => {
  lastScrollPosition.value = window.scrollY
  checkScrollPosition()
  
  // Check if character is in favorites
  const favorites = JSON.parse(localStorage.getItem('morty_favorites') || '[]')
  isFavorite.value = favorites.some((fav: ICharacter) => fav.id === props.character.id)
  
  // Track character view
  trackCharacterView(props.character.id, props.character.name)
})

onUnmounted(() => {
  window.removeEventListener('scroll', checkScrollPosition)
})

// Scroll-based animations
const checkScrollPosition = () => {
  const currentScrollPosition = window.scrollY
  const isScrollingDown = currentScrollPosition > lastScrollPosition.value
  
  if (isScrollingDown && !isAnimating.value) {
    isAnimating.value = true
    setTimeout(() => {
      isAnimating.value = false
    }, 300)
  }
  
  lastScrollPosition.value = currentScrollPosition
}

// Toggle favorite
const toggleFavorite = () => {
  const favorites = JSON.parse(localStorage.getItem('morty_favorites') || '[]')
  const characterIndex = favorites.findIndex((fav: ICharacter) => fav.id === props.character.id)
  
  if (characterIndex > -1) {
    favorites.splice(characterIndex, 1)
    isFavorite.value = false
  } else {
    favorites.push(props.character)
    isFavorite.value = true
  }
  
  localStorage.setItem('morty_favorites', JSON.stringify(favorites))
  trackFavoriteToggle(props.character.id, props.character.name, isFavorite.value)
}

// Character status display
const getStatusDisplay = (status: string) => {
  const statusMap: Record<string, string> = {
    alive: i18n.t('characters.alive'),
    dead: i18n.t('characters.dead'),
    unknown: i18n.t('characters.unknownStatus')
  }
  return statusMap[status] || status
}

// Get species display
const getSpeciesDisplay = (species: string) => {
  const speciesMap: Record<string, string> = {
    human: i18n.t('characters.human'),
    alien: i18n.t('characters.alien'),
    robot: i18n.t('characters.robot'),
    'mythological creature': i18n.t('characters.mythologicalCreature'),
    poopybutthole: i18n.t('characters.poopybutthole'),
    cronenberg: i18n.t('characters.cronenberg'),
    animal: i18n.t('characters.animal')
  }
  return speciesMap[species.toLowerCase()] || species
}

// Get gender display
const getGenderDisplay = (gender: string) => {
  const genderMap: Record<string, string> = {
    female: i18n.t('characters.female'),
    male: i18n.t('characters.male'),
    genderless: i18n.t('characters.genderless'),
    'unknown': i18n.t('characters.notSpecified')
  }
  return genderMap[gender.toLowerCase()] || gender
}

// Truncate text for better display
const truncateText = (text: string, maxLength: number = 50) => {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}
</script>

<template>
  <motion.div
    :initial="cardVariants.hidden"
    :animate="cardVariants.visible"
    :whileHover="cardVariants.hover"
    :variants="cardVariants"
    :transition="{ delay: (index || 0) * 0.1 }"
    class="group relative flex flex-col lg:flex-row bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl basis-auto w-[17rem] h-auto border border-gray-700 hover:border-rick-500 transition-all duration-300 shadow-xl hover:shadow-2xl overflow-hidden"
    :class="props.class"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <!-- Background decoration -->
    <div class="absolute inset-0 bg-gradient-to-br from-rick-900/10 to-morty-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    
    <!-- Character image section -->
    <div class="flex w-full h-56 lg:h-48 lg:w-32 rounded-xl flex-col justify-between items-center text-center lg:justify-center p-1 mb-4 lg:mb-0 lg:mr-4 relative overflow-hidden">
      <!-- Animated background -->
      <div class="absolute inset-0 bg-gradient-to-br from-rick-400/20 to-morty-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <!-- Character image with animation -->
      <motion.div
        :initial="imageVariants.hidden"
        :animate="imageVariants.visible"
        class="relative z-10"
      >
        <img
          :src="characterImage"
          :alt="character.name"
          class="w-28 lg:w-20 h-28 lg:h-20 rounded-full mx-auto object-cover border-4 border-gray-700 group-hover:border-rick-400 transition-all duration-300 shadow-lg"
          loading="lazy"
        />
        
        <!-- Status indicator -->
        <div class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-gray-900 flex items-center justify-center z-20"
          :class="[
            characterStatus === 'alive' ? 'bg-green-400' : 
            characterStatus === 'dead' ? 'bg-red-400' : 'bg-gray-400'
          ]">
          <div class="w-2 h-2 rounded-full bg-white"></div>
        </div>
      </motion.div>
      
      <!-- Character name -->
      <motion.h3
        :initial="textVariants.hidden"
        :animate="textVariants.visible"
        class="relative z-10 mt-4 text-xl lg:text-lg font-bold text-white text-center"
      >
        {{ truncateText(character.name, 25) }}
      </motion.h3>
    </div>
    
    <!-- Character details section -->
    <div class="flex flex-col lg:flex-1 lg:ml-4 space-y-3">
      <!-- Status -->
      <div class="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors duration-200">
        <div class="flex items-center space-x-2">
          <div class="w-2 h-2 rounded-full"
            :class="[
              characterStatus === 'alive' ? 'bg-green-400' : 
              characterStatus === 'dead' ? 'bg-red-400' : 'bg-gray-400'
            ]"></div>
          <span class="text-gray-400 text-sm font-medium">{{ i18n.t('characters.status') }}:</span>
        </div>
        <span :class="statusColors[characterStatus]" class="text-sm font-medium">
          {{ getStatusDisplay(characterStatus) }}
        </span>
      </div>
      
      <!-- Species -->
      <div class="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors duration-200">
        <div class="flex items-center space-x-2">
          <div class="w-2 h-2 rounded-full bg-purple-400"></div>
          <span class="text-gray-400 text-sm font-medium">{{ i18n.t('characters.species') }}:</span>
        </div>
        <span :class="speciesColors[characterSpecies.toLowerCase()]" class="text-sm font-medium">
          {{ getSpeciesDisplay(characterSpecies) }}
        </span>
      </div>
      
      <!-- Gender -->
      <div class="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors duration-200">
        <div class="flex items-center space-x-2">
          <div class="w-2 h-2 rounded-full bg-blue-400"></div>
          <span class="text-gray-400 text-sm font-medium">{{ i18n.t('characters.gender') }}:</span>
        </div>
        <span class="text-blue-400 text-sm font-medium">
          {{ getGenderDisplay(character.gender) }}
        </span>
      </div>
      
      <!-- Origin -->
      <div class="p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors duration-200">
        <div class="flex items-center space-x-2 mb-1">
          <div class="w-2 h-2 rounded-full bg-yellow-400"></div>
          <span class="text-gray-400 text-sm font-medium">{{ i18n.t('characters.origin') }}:</span>
        </div>
        <span class="text-yellow-400 text-sm font-medium truncate">
          {{ truncateText(character.origin.name, 30) }}
        </span>
      </div>
      
      <!-- Location -->
      <div class="p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors duration-200">
        <div class="flex items-center space-x-2 mb-1">
          <div class="w-2 h-2 rounded-full bg-pink-400"></div>
          <span class="text-gray-400 text-sm font-medium">{{ i18n.t('characters.location') }}:</span>
        </div>
        <span class="text-pink-400 text-sm font-medium truncate">
          {{ truncateText(character.location.name, 30) }}
        </span>
      </div>
      
      <!-- Episode count -->
      <div class="flex items-center justify-between p-3 bg-gradient-to-r from-rick-800/30 to-morty-800/30 rounded-lg">
        <div class="flex items-center space-x-2">
          <div class="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></div>
          <span class="text-gray-400 text-sm font-medium">{{ i18n.t('characters.episodes') }}:</span>
        </div>
        <span class="text-orange-400 text-sm font-bold">
          {{ character.episode.length }}
        </span>
      </div>
    </div>
    
    <!-- Favorite button -->
    <button
      @click="toggleFavorite"
      class="absolute top-4 right-4 p-2 rounded-full bg-gray-800/80 hover:bg-gray-700/80 transition-all duration-200 z-20 group"
      :class="[
        isFavorite ? 'bg-red-500/20 hover:bg-red-500/40 border border-red-500/50' : 'hover:bg-rick-500/20 hover:border-rick-500/50'
      ]"
    >
      <svg 
        class="w-5 h-5 transition-all duration-200"
        :class="[
          isFavorite ? 'text-red-400' : 'text-gray-400 group-hover:text-rick-400'
        ]"
        fill="currentColor" 
        viewBox="0 0 20 20"
      >
        <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
      </svg>
    </button>
    
    <!-- Hover overlay -->
    <div 
      v-if="isHovered"
      class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
    ></div>
  </motion.div>
</template>