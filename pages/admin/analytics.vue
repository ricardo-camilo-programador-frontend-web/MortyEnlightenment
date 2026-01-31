<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '~/stores/user'
import { useI18n } from '#imports'
import { motion, AnimatePresence } from 'framer-motion'

const userStore = useUserStore()
const i18n = useI18n()

// State
const loading = ref(false)
const error = ref(null)
const selectedTab = ref('overview')
const timeRange = ref('7d')
const isClient = ref(false)

// Mock analytics data
const mockAnalytics = {
  overview: {
    totalViews: 15420,
    totalUsers: 3280,
    bounceRate: 28.5,
    avgSessionDuration: 3.45,
    topPages: [
      { path: '/', views: 8420, name: 'Home' },
      { path: '/characters', views: 5210, name: 'Characters' },
      { path: '/episodes', views: 1235, name: 'Episodes' },
      { path: '/quiz', views: 555, name: 'Quiz' }
    ],
    deviceTypes: {
      desktop: 65.2,
      mobile: 29.8,
      tablet: 5.0
    },
    trafficSources: {
      direct: 45.3,
      social: 28.7,
      search: 16.2,
      referral: 9.8
    }
  },
  performance: {
    coreWebVitals: {
      lcp: 2.1,
      fid: 45,
      cls: 0.09
    },
    loadTimes: {
      firstPaint: 0.8,
      firstContentfulPaint: 1.2,
      domContentLoaded: 1.8,
      fullPageLoad: 2.5
    },
    errors: [
      { message: 'Failed to load characters', count: 12, timestamp: '2024-01-15 10:30' },
      { message: 'AdSense timeout', count: 8, timestamp: '2024-01-15 09:15' }
    ]
  },
  engagement: {
    userActions: {
      characterViews: 18540,
      episodeViews: 3210,
      quizAttempts: 890,
      socialShares: 156,
      favorites: 2340
    },
    popularCharacters: [
      { name: 'Rick Sanchez', views: 3420 },
      { name: 'Morty Smith', views: 2890 },
      { name: 'Summer Smith', views: 1250 },
      { name: 'Beth Smith', views: 980 },
      { name: 'Jerry Smith', views: 750 }
    ],
    quizPerformance: {
      averageScore: 67.5,
      completionRate: 78.2,
      bestScore: 100,
      questionsAttempted: 890
    }
  },
  revenue: {
    estimatedRPM: 1.85,
    dailyViews: 2200,
    monthlyEstimate: 124.10,
    yearlyEstimate: 1489.20,
    topPerformingAds: [
      { format: 'Leaderboard', rpm: 2.10, views: 1200 },
      { format: 'Medium Rectangle', rpm: 1.95, views: 1850 },
      { format: 'Mobile Banner', rpm: 1.65, views: 2200 }
    ]
  }
}

// Computed properties
const analyticsData = computed(() => mockAnalytics[selectedTab.value])
const overviewData = computed(() => mockAnalytics.overview)
const performanceData = computed(() => mockAnalytics.performance)
const engagementData = computed(() => mockAnalytics.engagement)
const revenueData = computed(() => mockAnalytics.revenue)

// Chart colors
const chartColors = {
  primary: '#d97706', // Rick orange
  secondary: '#a855f7', // Morty purple
  accent: '#06b6d4', // Portal cyan
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444'
}

// Animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
}

const statVariants = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: { scale: 1, opacity: 1 }
}

// Load analytics data
const loadAnalytics = async () => {
  try {
    loading.value = true
    error.value = null
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // In real implementation, this would fetch from analytics API
    console.log('Analytics loaded successfully')
    
  } catch (err) {
    error.value = i18n.t('errors.network')
    console.error('Failed to load analytics:', err)
  } finally {
    loading.value = false
  }
}

// Tab navigation
const selectTab = (tab: string) => {
  selectedTab.value = tab
  
  // Track tab change
  if (useNuxtApp().$trackEvent) {
    useNuxtApp().$trackEvent('analytics_tab_change', {
      tab,
      time_range: timeRange.value
    })
  }
}

// Time range change
const changeTimeRange = (range: string) => {
  timeRange.value = range
  loadAnalytics()
  
  // Track time range change
  if (useNuxtApp().$trackEvent) {
    useNuxtApp().$trackEvent('analytics_time_range_change', {
      range,
      tab: selectedTab.value
    })
  }
}

// Format number with commas
const formatNumber = (num: number): string => {
  return num.toLocaleString()
}

// Format percentage
const formatPercentage = (num: number): string => {
  return `${num.toFixed(1)}%`
}

// Get performance status
const getPerformanceStatus = (value: number, type: string): string => {
  if (type === 'lcp') {
    if (value < 2.5) return 'Good'
    if (value < 4.0) return 'Needs Improvement'
    return 'Poor'
  }
  if (type === 'fid') {
    if (value < 100) return 'Good'
    if (value < 300) return 'Needs Improvement'
    return 'Poor'
  }
  if (type === 'cls') {
    if (value < 0.1) return 'Good'
    if (value < 0.25) return 'Needs Improvement'
    return 'Poor'
  }
  return 'Unknown'
}

// Get performance color
const getPerformanceColor = (status: string): string => {
  switch (status) {
    case 'Good': return 'text-green-400'
    case 'Needs Improvement': return 'text-yellow-400'
    case 'Poor': return 'text-red-400'
    default: return 'text-gray-400'
  }
}

// Initialize on mount
onMounted(() => {
  isClient.value = true
  loadAnalytics()
})

// Cleanup
onUnmounted(() => {
  // Cleanup any timers or event listeners
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
    <!-- Header Section -->
    <section class="py-16 bg-gradient-to-r from-rick-900/30 via-analytics-900/30 to-morty-900/30 border-b border-gray-800">
      <div class="container mx-auto px-4">
        <motion.div 
          :initial="{ opacity: 0, y: 30 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.8, ease: "easeOut" }"
          class="text-center"
        >
          <h1 class="text-4xl lg:text-5xl font-bold text-white mb-4">
            Analytics Dashboard
          </h1>
          <p class="text-xl text-gray-400 max-w-2xl mx-auto">
            Monitor your website performance, user engagement, and revenue metrics
          </p>
        </motion.div>
      </div>
    </section>

    <!-- Dashboard Content -->
    <section class="py-12">
      <div class="container mx-auto px-4">
        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center items-center py-20">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-rick-400"></div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="text-center py-20">
          <div class="text-6xl mb-4">🚫</div>
          <h2 class="text-2xl font-bold text-white mb-4">Failed to load analytics</h2>
          <p class="text-gray-400 mb-6">{{ error }}</p>
          <button 
            @click="loadAnalytics"
            class="px-6 py-3 bg-rick-600 hover:bg-rick-500 text-white rounded-lg transition-colors duration-200"
          >
            Retry
          </button>
        </div>

        <!-- Analytics Content -->
        <div v-else class="space-y-8">
          <!-- Time Range Selector -->
          <div class="flex justify-between items-center">
            <div class="flex space-x-2">
              <button 
                v-for="range in ['24h', '7d', '30d', '90d', '1y']" 
                :key="range"
                @click="changeTimeRange(range)"
                :class="[
                  timeRange === range ? 'bg-rick-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700',
                  'px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium'
                ]"
              >
                {{ range }}
              </button>
            </div>
            
            <div class="flex items-center space-x-4">
              <span class="text-gray-400 text-sm">Last updated: {{ new Date().toLocaleString() }}</span>
              <button 
                @click="loadAnalytics"
                class="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200 text-sm"
              >
                Refresh
              </button>
            </div>
          </div>

          <!-- Tab Navigation -->
          <div class="flex space-x-1 bg-gray-800 p-1 rounded-xl">
            <button 
              v-for="tab in ['overview', 'performance', 'engagement', 'revenue']" 
              :key="tab"
              @click="selectTab(tab)"
              :class="[
                selectedTab === tab ? 'bg-gradient-to-r from-rick-600 to-morty-600 text-white' : 'text-gray-400 hover:text-gray-300',
                'flex-1 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium'
              ]"
            >
              {{ i18n.t(`analytics.${tab}`) }}
            </button>
          </div>

          <!-- Tab Content -->
          <AnimatePresence mode="wait">
            <motion.div
              :key="selectedTab"
              :initial="cardVariants.hidden"
              :animate="cardVariants.visible"
              :exit="cardVariants.hidden"
              :variants="cardVariants"
              :transition="{ duration: 0.3 }"
              class="space-y-6"
            >
              <!-- Overview Tab -->
              <div v-if="selectedTab === 'overview'" class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                <!-- Key Metrics -->
                <motion.div
                  v-for="(metric, index) in [
                    { label: 'Total Views', value: formatNumber(overviewData.totalViews), icon: '👁️', change: '+12.5%' },
                    { label: 'Total Users', value: formatNumber(overviewData.totalUsers), icon: '👥', change: '+8.2%' },
                    { label: 'Bounce Rate', value: formatPercentage(overviewData.bounceRate), icon: '📉', change: '-2.1%' },
                    { label: 'Avg. Session', value: `${overviewData.avgSessionDuration}m`, icon: '⏱️', change: '+0.3m' }
                  ]"
                  :key="index"
                  :initial="statVariants.hidden"
                  :animate="statVariants.visible"
                  :transition="{ delay: index * 0.1 }"
                  class="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl border border-gray-700 shadow-xl"
                >
                  <div class="flex items-center justify-between mb-4">
                    <div class="text-3xl opacity-20">{{ metric.icon }}</div>
                    <span class="text-green-400 text-sm font-medium">{{ metric.change }}</span>
                  </div>
                  <div class="text-2xl font-bold text-white mb-1">{{ metric.value }}</div>
                  <div class="text-gray-400 text-sm">{{ metric.label }}</div>
                </motion.div>
              </div>

              <!-- Performance Tab -->
              <div v-else-if="selectedTab === 'performance'" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Core Web Vitals -->
                <div class="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
                  <h3 class="text-xl font-bold text-white mb-6">Core Web Vitals</h3>
                  <div class="space-y-4">
                    <div v-for="(metric, key) in performanceData.coreWebVitals" :key="key" class="space-y-2">
                      <div class="flex justify-between items-center">
                        <span class="text-gray-400 capitalize">{{ key.toUpperCase() }}</span>
                        <span :class="getPerformanceColor(getPerformanceStatus(metric, key))" class="font-medium">
                          {{ getPerformanceStatus(metric, key) }}
                        </span>
                      </div>
                      <div class="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          class="h-2 rounded-full transition-all duration-500"
                          :class="[
                            metric < 2.5 ? 'bg-green-500' : metric < 4.0 ? 'bg-yellow-500' : 'bg-red-500'
                          ]"
                          :style="{ width: `${Math.min(metric * 30, 100)}%` }"
                        ></div>
                      </div>
                      <div class="text-right text-sm text-gray-400">{{ metric }}{{ key === 'lcp' ? 's' : key === 'fid' ? 'ms' : '' }}</div>
                    </div>
                  </div>
                </div>

                <!-- Load Times -->
                <div class="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
                  <h3 class="text-xl font-bold text-white mb-6">Page Load Performance</h3>
                  <div class="space-y-4">
                    <div v-for="(time, metric) in performanceData.loadTimes" :key="metric" class="flex justify-between items-center">
                      <span class="text-gray-400">{{ metric.replace(/([A-Z])/g, ' $1').trim() }}</span>
                      <span class="text-white font-medium">{{ time }}s</span>
                    </div>
                  </div>
                </div>

                <!-- Recent Errors -->
                <div class="lg:col-span-2 bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
                  <h3 class="text-xl font-bold text-white mb-6">Recent Errors</h3>
                  <div v-if="performanceData.errors.length === 0" class="text-center py-8 text-gray-400">
                    No recent errors detected. 🎉
                  </div>
                  <div v-else class="space-y-3">
                    <div 
                      v-for="(error, index) in performanceData.errors" 
                      :key="index"
                      class="bg-red-500/10 border border-red-500/20 rounded-lg p-4"
                    >
                      <div class="flex justify-between items-start">
                        <div>
                          <p class="text-red-400 font-medium">{{ error.message }}</p>
                          <p class="text-gray-400 text-sm mt-1">{{ error.timestamp }}</p>
                        </div>
                        <span class="bg-red-500/20 text-red-400 px-2 py-1 rounded-full text-xs font-bold">
                          {{ error.count }} occurrences
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Engagement Tab -->
              <div v-else-if="selectedTab === 'engagement'" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- User Actions -->
                <div class="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
                  <h3 class="text-xl font-bold text-white mb-6">User Actions</h3>
                  <div class="grid grid-cols-2 gap-4">
                    <div v-for="(action, key) in engagementData.userActions" :key="key" class="text-center">
                      <div class="text-2xl font-bold text-portal-400 mb-1">{{ formatNumber(action) }}</div>
                      <div class="text-gray-400 text-sm">{{ key.replace(/([A-Z])/g, ' $1').trim() }}</div>
                    </div>
                  </div>
                </div>

                <!-- Popular Characters -->
                <div class="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
                  <h3 class="text-xl font-bold text-white mb-6">Popular Characters</h3>
                  <div class="space-y-3">
                    <div 
                      v-for="(character, index) in engagementData.popularCharacters" 
                      :key="index"
                      class="flex items-center justify-between"
                    >
                      <div class="flex items-center space-x-3">
                        <span class="text-gray-400 text-sm">Top {{ index + 1 }}</span>
                        <span class="text-white">{{ character.name }}</span>
                      </div>
                      <span class="text-portal-400 font-medium">{{ character.views }}</span>
                    </div>
                  </div>
                </div>

                <!-- Quiz Performance -->
                <div class="lg:col-span-2 bg-gradient-to-br from-portal-800/30 to-rick-800/30 rounded-2xl p-6 border border-portal-500/30">
                  <h3 class="text-xl font-bold text-white mb-6">Quiz Performance</h3>
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div class="text-center">
                      <div class="text-2xl font-bold text-yellow-400">{{ engagementData.quizPerformance.averageScore }}%</div>
                      <div class="text-gray-400 text-sm">Average Score</div>
                    </div>
                    <div class="text-center">
                      <div class="text-2xl font-bold text-green-400">{{ formatPercentage(engagementData.quizPerformance.completionRate) }}</div>
                      <div class="text-gray-400 text-sm">Completion Rate</div>
                    </div>
                    <div class="text-center">
                      <div class="text-2xl font-bold text-purple-400">{{ engagementData.quizPerformance.bestScore }}%</div>
                      <div class="text-gray-400 text-sm">Best Score</div>
                    </div>
                    <div class="text-center">
                      <div class="text-2xl font-bold text-blue-400">{{ engagementData.quizPerformance.questionsAttempted }}</div>
                      <div class="text-gray-400 text-sm">Attempts</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Revenue Tab -->
              <div v-else-if="selectedTab === 'revenue'" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Revenue Metrics -->
                <div class="bg-gradient-to-br from-green-800/20 to-emerald-800/20 rounded-2xl p-6 border border-green-500/30">
                  <h3 class="text-xl font-bold text-white mb-6">Revenue Metrics</h3>
                  <div class="space-y-4">
                    <div class="flex justify-between items-center">
                      <span class="text-gray-400">Estimated RPM</span>
                      <span class="text-2xl font-bold text-green-400">${{ revenueData.estimatedRPM }}</span>
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-gray-400">Daily Views</span>
                      <span class="text-xl font-bold text-white">{{ formatNumber(revenueData.dailyViews) }}</span>
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-gray-400">Monthly Estimate</span>
                      <span class="text-xl font-bold text-green-400">${{ revenueData.monthlyEstimate.toFixed(2) }}</span>
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-gray-400">Yearly Estimate</span>
                      <span class="text-xl font-bold text-green-400">${{ revenueData.yearlyEstimate.toFixed(2) }}</span>
                    </div>
                  </div>
                </div>

                <!-- Top Performing Ads -->
                <div class="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
                  <h3 class="text-xl font-bold text-white mb-6">Top Performing Ad Formats</h3>
                  <div class="space-y-4">
                    <div 
                      v-for="(ad, index) in revenueData.topPerformingAds" 
                      :key="index"
                      class="flex justify-between items-center"
                    >
                      <div>
                        <span class="text-white font-medium">{{ ad.format }}</span>
                        <div class="text-gray-400 text-sm">{{ formatNumber(ad.views) }} views</div>
                      </div>
                      <div class="text-right">
                        <span class="text-green-400 font-bold">${{ ad.rpm.toFixed(2) }}</span>
                        <div class="text-gray-400 text-sm">RPM</div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Revenue Growth Chart Placeholder -->
                <div class="lg:col-span-2 bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
                  <h3 class="text-xl font-bold text-white mb-6">Revenue Growth Trend</h3>
                  <div class="h-64 bg-gray-900/50 rounded-lg flex items-center justify-center">
                    <div class="text-center">
                      <div class="text-4xl mb-2">📈</div>
                      <p class="text-gray-400">Revenue growth chart visualization</p>
                      <p class="text-gray-500 text-sm mt-2">+23.5% growth over the last 30 days</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  </div>
</template>