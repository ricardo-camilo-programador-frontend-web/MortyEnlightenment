<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '~/stores/user'
import { useI18n } from '#imports'
import { motion, AnimatePresence } from 'framer-motion'
import { trackEvent } from '#analytics'

const userStore = useUserStore()
const i18n = useI18n()

// State
const showProfile = ref(false)
const showAchievements = ref(false)
const showStreak = ref(false)
const dailyRewardClaimed = ref(false)

// Computed properties
const userStats = computed(() => ({
  level: userStore.getUserLevel,
  points: userStore.getUserPoints,
  streak: userStore.getUserStreak,
  progress: userStore.getUserProgress,
  badges: userStore.getUserBadges,
  nextLevelExp: computed(() => {
    const currentLevelExp = getExperienceForLevel(userStore.getUserLevel)
    const nextLevelExp = getExperienceForLevel(userStore.getUserLevel + 1)
    return nextLevelExp - currentLevelExp
  }),
  currentExp: computed(() => {
    const currentLevelExp = getExperienceForLevel(userStore.getUserLevel)
    return userStore.user?.experience - currentLevelExp || 0
  })
}))

// Animation variants
const modalVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 }
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  hover: { scale: 1.05 }
}

// Experience calculation
function getExperienceForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1))
}

// Level up animation
const levelUpRef = ref<HTMLDivElement | null>(null)
const triggerLevelUp = () => {
  if (levelUpRef.value) {
    levelUpRef.value.classList.add('animate-bounce-subtle')
    setTimeout(() => {
      if (levelUpRef.value) {
        levelUpRef.value.classList.remove('animate-bounce-subtle')
      }
    }, 2000)
  }
}

// Claim daily reward
const claimDailyReward = async () => {
  if (dailyRewardClaimed.value) return
  
  try {
    const reward = Math.floor(Math.random() * 50) + 20 // 20-69 points
    await userStore.addPoints(reward, 'daily_reward')
    dailyRewardClaimed.value = true
    
    // Track reward claim
    trackEvent('daily_reward_claimed', {
      amount: reward,
      level: userStats.value.level
    })
    
    // Show celebration
    showCelebration(reward)
  } catch (error) {
    console.error('Failed to claim daily reward:', error)
  }
}

// Show celebration
const showCelebration = (points: number) => {
  const celebration = document.createElement('div')
  celebration.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none'
  celebration.innerHTML = `
    <div class="bg-gradient-to-r from-rick-500 to-morty-500 text-white px-6 py-3 rounded-lg shadow-2xl animate-pulse">
      <div class="text-center">
        <div class="text-2xl font-bold mb-1">🎉</div>
        <div class="text-sm font-medium">+${points} Points!</div>
      </div>
    </div>
  `
  document.body.appendChild(celebration)
  
  setTimeout(() => {
    celebration.remove()
  }, 3000)
}

// View achievement details
const viewAchievement = (achievement: string) => {
  showAchievements.value = true
}

// Initialize on mount
onMounted(async () => {
  try {
    await userStore.initializeUser()
    
    // Update daily reward status
    const lastClaim = localStorage.getItem('morty_daily_reward')
    const today = new Date().toDateString()
    dailyRewardClaimed.value = lastClaim === today
    
    // Track profile view
    trackEvent('profile_view', {
      level: userStats.value.level,
      points: userStats.value.points,
      streak: userStats.value.streak,
      badges_count: userStats.value.badges.length
    })
  } catch (error) {
    console.error('Failed to initialize user:', error)
  }
})

// Toggle profile modal
const toggleProfile = () => {
  showProfile.value = !showProfile.value
  if (!showProfile.value && showAchievements.value) {
    showAchievements.value = false
  }
}

// Achievement descriptions
const achievementDescriptions: Record<string, string> = {
  'Beginner Explorer': 'Reach level 5 and start your journey through the multiverse',
  'Character Master': 'Reach level 10 and become a character expert',
  'Episode Expert': 'Reach level 20 and unlock episode knowledge',
  'Location Hunter': 'Reach level 30 and master all dimensions',
  'Rick & Morty Legend': 'Reach level 50 and achieve legendary status',
  'Week Warrior': 'Maintain a 7-day streak',
  'Month Master': 'Maintain a 30-day streak',
  'Year Champion': 'Maintain a 100-day streak',
  'Viewing Enthusiast': 'View 50 characters',
  'Character Collector': 'View 200 characters',
  'Search Specialist': 'Perform 25 searches',
  'Favorite Fan': 'Favorite 10 characters',
  'Character Curator': 'Favorite 25 characters'
}
</script>

<template>
  <!-- User Profile Button -->
  <div class="flex items-center space-x-4">
    <!-- Daily Reward Button -->
    <button
      v-if="!dailyRewardClaimed"
      @click="claimDailyReward"
      class="relative px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-medium rounded-full transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2"
    >
      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
      </svg>
      <span class="text-sm font-medium">Daily Reward</span>
      <div class="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
    </button>

    <!-- Streak Indicator -->
    <div 
      v-if="userStats.streak > 0"
      @click="showStreak = true"
      class="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full cursor-pointer transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
    >
      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clip-rule="evenodd"></path>
      </svg>
      <span class="text-sm font-medium">{{ userStats.streak }} 🔥</span>
    </div>

    <!-- User Profile Button -->
    <button
      @click="toggleProfile"
      class="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-rick-600 to-morty-600 text-white font-medium rounded-full transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
    >
      <div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
        <span class="text-sm font-bold" :class="userStore.getLevelColor">
          {{ userStats.level }}
        </span>
      </div>
      <div class="text-sm font-medium">
        <div class="flex items-center space-x-1">
          <span>{{ userStore.user?.username || 'Guest' }}</span>
          <svg class="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
          </svg>
        </div>
      </div>
    </button>
  </div>

  <!-- Profile Modal -->
  <AnimatePresence>
    <div 
      v-if="showProfile"
      class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      @click="showProfile = false"
    >
      <motion.div
        :initial="modalVariants.hidden"
        :animate="modalVariants.visible"
        :exit="modalVariants.exit"
        :variants="modalVariants"
        transition={{ duration: 0.3 }}
        class="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl"
        @click.stop
      >
        <!-- Header -->
        <div class="sticky top-0 bg-gray-900 border-b border-gray-700 p-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <div class="w-16 h-16 bg-gradient-to-br from-rick-400 to-morty-400 rounded-full flex items-center justify-center">
                <span class="text-2xl font-bold text-white">{{ userStats.level }}</span>
              </div>
              <div>
                <h2 class="text-2xl font-bold text-white">{{ userStore.user?.username || 'Guest' }}</h2>
                <p class="text-gray-400">{{ i18n.t('profile.subtitle') }}</p>
              </div>
            </div>
            <button
              @click="showProfile = false"
              class="p-2 rounded-lg hover:bg-gray-800 transition-colors duration-200"
            >
              <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <!-- Level Progress -->
            <div class="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-bold text-white">{{ i18n.t('profile.level') }}</h3>
                <div class="flex items-center space-x-2">
                  <span class="text-2xl font-bold" :class="userStore.getLevelColor">
                    {{ userStats.level }}
                  </span>
                  <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                </div>
              </div>
              
              <div class="space-y-2">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-400">{{ i18n.t('profile.experience') }}</span>
                  <span class="text-white">
                    {{ userStats.currentExp }} / {{ userStats.nextLevelExp }}
                  </span>
                </div>
                <div class="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    class="bg-gradient-to-r from-rick-500 to-morty-500 h-2 rounded-full transition-all duration-500"
                    :style="{ width: `${userStats.progress}%` }"
                  ></div>
                </div>
              </div>
            </div>

            <!-- Points -->
            <div class="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-bold text-white">{{ i18n.t('profile.points') }}</h3>
                <div class="flex items-center space-x-1">
                  <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"></path>
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd"></path>
                  </svg>
                  <span class="text-2xl font-bold text-yellow-400">{{ userStats.points }}</span>
                </div>
              </div>
              
              <div class="text-sm text-gray-400">
                Earn points by viewing characters, adding favorites, and daily rewards!
              </div>
            </div>

            <!-- Streak -->
            <div class="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-bold text-white">{{ i18n.t('profile.streak') }}</h3>
                <div class="flex items-center space-x-1">
                  <svg class="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clip-rule="evenodd"></path>
                  </svg>
                  <span class="text-2xl font-bold text-red-400">{{ userStats.streak }}</span>
                </div>
              </div>
              
              <div class="text-sm text-gray-400">
                Visit daily to maintain your streak and earn bonus points!
              </div>
            </div>
          </div>

          <!-- Badges Section -->
          <div class="mb-8">
            <div 
              class="flex items-center justify-between mb-6 cursor-pointer"
              @click="showAchievements = true"
            >
              <h3 class="text-xl font-bold text-white">{{ i18n.t('profile.badges') }}</h3>
              <div class="flex items-center space-x-2">
                <span class="text-rick-400 font-medium">{{ userStats.badges.length }} earned</span>
                <svg class="w-5 h-5 text-rick-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </div>
            </div>
            
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <motion.div
                v-for="badge in userStats.badges"
                :key="badge"
                :initial="cardVariants.hidden"
                :animate="cardVariants.visible"
                :variants="cardVariants"
                :transition="{ delay: Math.random() * 0.3 }"
                @click="viewAchievement(badge)"
                class="bg-gradient-to-br from-rick-800/30 to-morty-800/30 p-4 rounded-xl border border-rick-600/50 cursor-pointer hover:border-rick-400 transition-all duration-300 text-center"
              >
                <div class="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-rick-400 to-morty-400 rounded-full flex items-center justify-center">
                  <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                  </svg>
                </div>
                <p class="text-sm text-white font-medium">{{ badge }}</p>
              </motion.div>
            </div>
          </div>

          <!-- Activity Summary -->
          <div class="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h3 class="text-xl font-bold text-white mb-4">{{ i18n.t('profile.achievements') }}</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p class="text-2xl font-bold text-rick-400">{{ userStore.user?.level || 1 }}</p>
                <p class="text-sm text-gray-400">{{ i18n.t('profile.level') }}</p>
              </div>
              <div>
                <p class="text-2xl font-bold text-yellow-400">{{ userStats.points }}</p>
                <p class="text-sm text-gray-400">Points</p>
              </div>
              <div>
                <p class="text-2xl font-bold text-red-400">{{ userStats.streak }}</p>
                <p class="text-sm text-gray-400">Day Streak</p>
              </div>
              <div>
                <p class="text-2xl font-bold text-purple-400">{{ userStats.badges.length }}</p>
                <p class="text-sm text-gray-400">Badges</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  </AnimatePresence>

  <!-- Achievements Modal -->
  <AchievementModal 
    v-if="showAchievements"
    :achievements="userStats.badges"
    :descriptions="achievementDescriptions"
    @close="showAchievements = false"
  />
</template>

<script>
// Placeholder for AchievementModal component
const AchievementModal = {
  props: ['achievements', 'descriptions'],
  template: `
    <div class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-gray-700 shadow-2xl p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-white">All Achievements</h2>
          <button @click="$emit('close')" class="p-2 rounded-lg hover:bg-gray-800 transition-colors duration-200">
            <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div class="space-y-4">
          <div v-for="achievement in achievements" :key="achievement" class="bg-gray-800/50 p-4 rounded-lg">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-gradient-to-br from-rick-400 to-morty-400 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                </svg>
              </div>
              <div>
                <h3 class="font-bold text-white">{{ achievement }}</h3>
                <p class="text-sm text-gray-400">{{ descriptions[achievement] || 'Achievement unlocked!' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
}
</script>