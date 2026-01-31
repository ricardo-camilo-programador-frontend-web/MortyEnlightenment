<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from '#imports'
import { motion, AnimatePresence } from 'framer-motion'

const i18n = useI18n()

// State
const activeTab = ref('dashboard')
const stats = ref({
  totalUsers: 1240,
  totalViews: 45230,
  totalRevenue: 234.50,
  activeTests: 3,
  uptime: '99.9%'
})

const quickStats = [
  { label: 'Today', views: 1240, users: 340, revenue: 12.40 },
  { label: 'Yesterday', views: 1180, users: 315, revenue: 11.80 },
  { label: 'This Week', views: 8450, users: 1250, revenue: 89.50 },
  { label: 'This Month', views: 32450, users: 890, revenue: 189.20 }
]

const recentActivity = [
  { action: 'New user registration', user: 'john_doe', time: '2 minutes ago' },
  { action: 'Character viewed', character: 'Rick Sanchez', time: '5 minutes ago' },
  { action: 'Quiz completed', score: '85%', user: 'jane_smith', time: '12 minutes ago' },
  { action: 'Episode shared', episode: 'S03E01', user: 'mike_wilson', time: '25 minutes ago' },
  { action: 'Ad click occurred', ad_format: 'Leaderboard', revenue: '$0.45', time: '32 minutes ago' }
]

const topPages = [
  { path: '/', views: 8450, bounceRate: 25.3 },
  { path: '/characters', views: 6230, bounceRate: 32.1 },
  { path: '/episodes', views: 2890, bounceRate: 28.7 },
  { path: '/quiz', views: 1560, bounceRate: 35.2 },
  { path: '/locations', views: 1230, bounceRate: 41.8 }
]

// Navigation items
const adminNav = [
  { key: 'dashboard', label: 'admin.dashboard', icon: '📊' },
  { key: 'analytics', label: 'admin.analytics', icon: '📈' },
  { key: 'ab-testing', label: 'admin.abTesting', icon: '🧪' },
  { key: 'cache', label: 'admin.cache', icon: '💾' },
  { key: 'users', label: 'admin.users', icon: '👥' },
  { key: 'revenue', label: 'admin.revenue', icon: '💰' }
]

// Animation variants
const tabVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
    <!-- Header Section -->
    <section class="py-16 bg-gradient-to-r from-rick-900/30 via-portal-900/30 to-morty-900/30 border-b border-gray-800">
      <div class="container mx-auto px-4">
        <div class="flex justify-between items-center">
          <motion.div 
            :initial="{ opacity: 0, y: 30 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ duration: 0.8, ease: "easeOut" }"
          >
            <h1 class="text-4xl lg:text-5xl font-bold text-white mb-2">
              Admin Dashboard
            </h1>
            <p class="text-xl text-gray-400">
              Monitor and manage your Rick & Morty fan site
            </p>
          </motion.div>
          
          <div class="flex items-center space-x-4">
            <div class="bg-gray-800/50 rounded-lg px-4 py-2 border border-gray-700">
              <span class="text-green-400 font-medium">●</span>
              <span class="text-gray-300 ml-2">System Uptime: {{ stats.uptime }}</span>
            </div>
            <button class="px-4 py-2 bg-gradient-to-r from-rick-600 to-morty-600 hover:from-rick-500 hover:to-morty-500 text-white rounded-lg transition-all duration-300">
              View Public Site
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <section class="py-12">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <!-- Sidebar Navigation -->
          <div class="lg:col-span-1">
            <nav class="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
              <div class="space-y-2">
                <button 
                  v-for="item in adminNav" 
                  :key="item.key"
                  @click="activeTab = item.key"
                  :class="[
                    activeTab === item.key ? 'bg-gradient-to-r from-rick-600 to-morty-600 text-white' : 'text-gray-400 hover:text-gray-300',
                    'w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-left'
                  ]"
                >
                  <span class="text-lg">{{ item.icon }}</span>
                  <span class="font-medium">{{ i18n.t(item.label) }}</span>
                </button>
              </div>
              
              <div class="mt-8 pt-8 border-t border-gray-700">
                <h3 class="text-gray-400 text-sm font-medium mb-3">Quick Actions</h3>
                <div class="space-y-2">
                  <button class="w-full text-left px-3 py-2 text-gray-400 hover:text-gray-300 hover:bg-gray-700/30 rounded-lg transition-all duration-200 text-sm">
                    📊 Generate Report
                  </button>
                  <button class="w-full text-left px-3 py-2 text-gray-400 hover:text-gray-300 hover:bg-gray-700/30 rounded-lg transition-all duration-200 text-sm">
                    ⚙️ Settings
                  </button>
                  <button class="w-full text-left px-3 py-2 text-gray-400 hover:text-gray-300 hover:bg-gray-700/30 rounded-lg transition-all duration-200 text-sm">
                    📧 Send Newsletter
                  </button>
                </div>
              </div>
            </nav>
          </div>

          <!-- Main Content Area -->
          <div class="lg:col-span-3 space-y-8">
            <!-- Dashboard Overview -->
            <AnimatePresence mode="wait">
              <motion.div
                v-if="activeTab === 'dashboard'"
                :initial="tabVariants.hidden"
                :animate="tabVariants.visible"
                :exit="tabVariants.hidden"
                :variants="tabVariants"
                class="space-y-6"
              >
                <!-- Key Metrics -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <motion.div
                    :initial="cardVariants.hidden"
                    :animate="cardVariants.visible"
                    :transition="{ delay: 0.1 }"
                    class="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl border border-gray-700 shadow-xl"
                  >
                    <div class="flex items-center justify-between mb-4">
                      <div class="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <span class="text-2xl">👥</span>
                      </div>
                      <span class="text-green-400 text-sm font-medium">+12.5%</span>
                    </div>
                    <div class="text-2xl font-bold text-white mb-1">{{ stats.totalUsers.toLocaleString() }}</div>
                    <div class="text-blue-400 text-sm">Total Users</div>
                  </motion.div>
                  
                  <motion.div
                    :initial="cardVariants.hidden"
                    :animate="cardVariants.visible"
                    :transition="{ delay: 0.2 }"
                    class="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl border border-gray-700 shadow-xl"
                  >
                    <div class="flex items-center justify-between mb-4">
                      <div class="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                        <span class="text-2xl">👁️</span>
                      </div>
                      <span class="text-green-400 text-sm font-medium">+8.3%</span>
                    </div>
                    <div class="text-2xl font-bold text-white mb-1">{{ stats.totalViews.toLocaleString() }}</div>
                    <div class="text-purple-400 text-sm">Total Views</div>
                  </motion.div>
                  
                  <motion.div
                    :initial="cardVariants.hidden"
                    :animate="cardVariants.visible"
                    :transition="{ delay: 0.3 }"
                    class="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl border border-gray-700 shadow-xl"
                  >
                    <div class="flex items-center justify-between mb-4">
                      <div class="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                        <span class="text-2xl">💰</span>
                      </div>
                      <span class="text-green-400 text-sm font-medium">+15.7%</span>
                    </div>
                    <div class="text-2xl font-bold text-white mb-1">${{ stats.totalRevenue.toFixed(2) }}</div>
                    <div class="text-green-400 text-sm">Total Revenue</div>
                  </motion.div>
                  
                  <motion.div
                    :initial="cardVariants.hidden"
                    :animate="cardVariants.visible"
                    :transition="{ delay: 0.4 }"
                    class="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl border border-gray-700 shadow-xl"
                  >
                    <div class="flex items-center justify-between mb-4">
                      <div class="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                        <span class="text-2xl">🧪</span>
                      </div>
                      <span class="text-yellow-400 text-sm font-medium">Active</span>
                    </div>
                    <div class="text-2xl font-bold text-white mb-1">{{ stats.activeTests }}</div>
                    <div class="text-orange-400 text-sm">A/B Tests</div>
                  </motion.div>
                </div>

                <!-- Quick Stats -->
                <div class="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
                  <h3 class="text-xl font-bold text-white mb-6">Quick Stats</h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div v-for="stat in quickStats" :key="stat.label" class="text-center">
                      <div class="text-gray-400 text-sm mb-2">{{ stat.label }}</div>
                      <div class="text-2xl font-bold text-white mb-1">{{ stat.views }}</div>
                      <div class="text-gray-500 text-xs">{{ stat.users }} users</div>
                    </div>
                  </div>
                </div>

                <!-- Recent Activity -->
                <div class="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
                  <h3 class="text-xl font-bold text-white mb-6">Recent Activity</h3>
                  <div class="space-y-4">
                    <div 
                      v-for="activity in recentActivity" 
                      :key="activity.time"
                      class="flex items-center space-x-4 p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors duration-200"
                    >
                      <div class="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                        <span class="text-sm">{{ activity.action.charAt(0) }}</span>
                      </div>
                      <div class="flex-1">
                        <p class="text-white text-sm font-medium">{{ activity.action }}</p>
                        <div v-if="activity.character" class="text-gray-400 text-xs">Character: {{ activity.character }}</div>
                        <div v-else-if="activity.score" class="text-gray-400 text-xs">Score: {{ activity.score }}</div>
                        <div v-else-if="activity.episode" class="text-gray-400 text-xs">Episode: {{ activity.episode }}</div>
                        <div v-else-if="activity.ad_format" class="text-gray-400 text-xs">{{ activity.ad_format }} - {{ activity.revenue }}</div>
                      </div>
                      <span class="text-gray-500 text-xs">{{ activity.time }}</span>
                    </div>
                  </div>
                </div>

                <!-- Top Pages -->
                <div class="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
                  <h3 class="text-xl font-bold text-white mb-6">Top Pages</h3>
                  <div class="space-y-3">
                    <div 
                      v-for="page in topPages" 
                      :key="page.path"
                      class="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors duration-200"
                    >
                      <div class="flex items-center space-x-3">
                        <span class="text-gray-400 text-sm">{{ page.path }}</span>
                      </div>
                      <div class="flex items-center space-x-6">
                        <span class="text-gray-400 text-sm">{{ page.views }} views</span>
                        <span class="text-red-400 text-sm">{{ page.bounceRate }}% bounce</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <!-- Analytics Tab -->
            <AnimatePresence mode="wait">
              <motion.div
                v-if="activeTab === 'analytics'"
                :initial="tabVariants.hidden"
                :animate="tabVariants.visible"
                :exit="tabVariants.hidden"
                :variants="tabVariants"
              >
                <NuxtLink to="/admin/analytics" class="block">
                  <div class="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
                    <h3 class="text-xl font-bold text-white mb-2">📊 Analytics Dashboard</h3>
                    <p class="text-gray-400 mb-4">Comprehensive analytics, performance metrics, and user behavior analysis</p>
                    <button class="px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg transition-all duration-300">
                      View Analytics →
                    </button>
                  </div>
                </NuxtLink>
              </motion.div>
            </AnimatePresence>

            <!-- A/B Testing Tab -->
            <AnimatePresence mode="wait">
              <motion.div
                v-if="activeTab === 'ab-testing'"
                :initial="tabVariants.hidden"
                :animate="tabVariants.visible"
                :exit="tabVariants.hidden"
                :variants="tabVariants"
              >
                <NuxtLink to="/admin/ab-testing" class="block">
                  <div class="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
                    <h3 class="text-xl font-bold text-white mb-2">🧪 A/B Testing</h3>
                    <p class="text-gray-400 mb-4">Run and manage conversion optimization experiments</p>
                    <button class="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg transition-all duration-300">
                      Manage Tests →
                    </button>
                  </div>
                </NuxtLink>
              </motion.div>
            </AnimatePresence>

            <!-- Cache Management Tab -->
            <AnimatePresence mode="wait">
              <motion.div
                v-if="activeTab === 'cache'"
                :initial="tabVariants.hidden"
                :animate="tabVariants.visible"
                :exit="tabVariants.hidden"
                :variants="tabVariants"
              >
                <NuxtLink to="/admin/cache" class="block">
                  <div class="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
                    <h3 class="text-xl font-bold text-white mb-2">💾 Cache Management</h3>
                    <p class="text-gray-400 mb-4">Monitor and optimize database cache performance</p>
                    <button class="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-lg transition-all duration-300">
                      Manage Cache →
                    </button>
                  </div>
                </NuxtLink>
              </motion.div>
            </AnimatePresence>

            <!-- Other tabs (placeholder content) -->
            <AnimatePresence mode="wait">
              <motion.div
                v-else-if="['users', 'revenue'].includes(activeTab)"
                :initial="tabVariants.hidden"
                :animate="tabVariants.visible"
                :exit="tabVariants.hidden"
                :variants="tabVariants"
              >
                <div class="bg-gray-800/50 rounded-2xl p-12 border border-gray-700 text-center">
                  <div class="text-6xl mb-4">🚧</div>
                  <h3 class="text-2xl font-bold text-white mb-4">Coming Soon</h3>
                  <p class="text-gray-400">
                    {{ activeTab === 'users' ? 'User management features' : 'Revenue tracking and reporting' }} are under development.
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>