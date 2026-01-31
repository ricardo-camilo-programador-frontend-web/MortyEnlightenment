<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from '#imports'

const i18n = useI18n()

// State
const cacheStats = ref({
  totalItems: 0,
  memoryUsage: 0,
  hitRate: 0,
  cacheSize: '0 MB',
  topCachedItems: [],
  performanceMetrics: {
    avgResponseTime: 0,
    cacheHits: 0,
    cacheMisses: 0,
    compressionRatio: 0
  },
  cacheKeys: [],
  loading: false,
  error: null
})

// Mock cache data
const mockCacheData = {
  characters: [
    {
      id: 1,
      name: "Rick Sanchez",
      status: "Alive",
      species: "Human",
      type: "",
      gender: "Male",
      origin: { name: "Earth (C-137)", url: "" },
      location: { name: "Earth (Replacement Dimension)", url: "" },
      image: "https://rickandmortyapi.com/api/character/avatar/1.jpeg",
      episode: ["https://rickandmortyapi.com/api/episode/1"],
      url: "",
      created: "2017-11-04T18:48:46.250Z",
      lastAccessed: Date.now(),
      accessCount: 154,
      cachedSize: '2.4 KB'
    },
    {
      id: 2,
      name: "Morty Smith",
      status: "Alive",
      species: "Human",
      type: "",
      gender: "Male",
      origin: { name: "Earth (C-137)", url: "" },
      location: { name: "Earth (Replacement Dimension)", url: "" },
      image: "https://rickandmortyapi.com/api/character/avatar/2.jpeg",
      episode: ["https://rickandmortyapi.com/api/episode/1"],
      url: "",
      created: "2017-11-04T18:50:28.461Z",
      lastAccessed: Date.now() - 3600000,
      accessCount: 89,
      cachedSize: '2.1 KB'
    }
  ],
  episodes: [
    {
      id: 1,
      name: "Pilot",
      episode: "S01E01",
      air_date: "2013-12-02",
      characters: ["https://rickandmortyapi.com/api/character/1", "https://rickandmortyapi.com/api/character/2"],
      url: "",
      created: "2017-11-10T12:49:19.223Z",
      lastAccessed: Date.now() - 7200000,
      accessCount: 45,
      cachedSize: '1.8 KB'
    }
  ]
}

// Cache management
const cache = new Map()
const memoryLimit = 50 * 1024 * 1024 // 50MB limit

// Cache item interface
interface CacheItem {
  key: string
  value: any
  timestamp: number
  accessCount: number
  size: number
  ttl?: number
}

// Initialize cache
const initializeCache = () => {
  // Load mock data into cache
  Object.entries(mockCacheData).forEach(([category, items]) => {
    items.forEach((item, index) => {
      const key = `${category}:${item.id}`
      const cacheItem: CacheItem = {
        key,
        value: item,
        timestamp: Date.now() - Math.random() * 86400000, // Random timestamp in last 24h
        accessCount: item.accessCount,
        size: Math.random() * 5000 + 1000, // Random size between 1KB-6KB
        ttl: category === 'characters' ? 3600000 : 1800000 // 1 hour for chars, 30 min for episodes
      }
      cache.set(key, cacheItem)
    })
  })
  
  updateCacheStats()
}

// Get cache size
const getCacheSize = (): number => {
  let totalSize = 0
  cache.forEach(item => {
    totalSize += item.size
  })
  return totalSize
}

// Clean up expired items
const cleanupExpired = () => {
  const now = Date.now()
  const expiredKeys: string[] = []
  
  cache.forEach((item, key) => {
    if (item.ttl && now - item.timestamp > item.ttl) {
      expiredKeys.push(key)
    }
  })
  
  expiredKeys.forEach(key => cache.delete(key))
  return expiredKeys.length
}

// Clean up LRU (Least Recently Used)
const cleanupLRU = () => {
  if (getCacheSize() < memoryLimit) return 0
  
  const items = Array.from(cache.entries()).map(([key, item]) => ({
    key,
    ...item,
    recency: Date.now() - item.timestamp
  }))
  
  // Sort by access count (least first) then by recency (oldest first)
  items.sort((a, b) => {
    if (a.accessCount !== b.accessCount) return a.accessCount - b.accessCount
    return a.recency - b.recency
  })
  
  // Remove oldest items until under limit
  let removed = 0
  while (getCacheSize() > memoryLimit * 0.9 && items.length > removed) {
    const item = items[removed]
    cache.delete(item.key)
    removed++
  }
  
  return removed
}

// Update cache statistics
const updateCacheStats = () => {
  const totalSize = getCacheSize()
  const hitRate = 85.3 // Mock hit rate
  const cacheKeys = Array.from(cache.keys())
  
  // Get top cached items by access count
  const topItems = Array.from(cache.entries())
    .map(([key, item]) => ({ key, ...item }))
    .sort((a, b) => b.accessCount - a.accessCount)
    .slice(0, 5)
  
  cacheStats.value = {
    totalItems: cache.size,
    memoryUsage: totalSize,
    hitRate,
    cacheSize: formatBytes(totalSize),
    topCachedItems: topItems,
    performanceMetrics: {
      avgResponseTime: 12.5,
      cacheHits: Math.round(totalSize * hitRate / 100),
      cacheMisses: Math.round(totalSize * (100 - hitRate) / 100),
      compressionRatio: 2.3
    },
    cacheKeys,
    loading: false,
    error: null
  }
}

// Format bytes to human readable
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Format time ago
const formatTimeAgo = (timestamp: number): string => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  
  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

// Load cache data
const loadCacheData = async () => {
  try {
    cacheStats.value.loading = true
    cacheStats.value.error = null
    
    // Initialize cache if empty
    if (cache.size === 0) {
      initializeCache()
    }
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    updateCacheStats()
    
  } catch (err) {
    cacheStats.value.error = i18n.t('errors.network')
    console.error('Failed to load cache data:', err)
  } finally {
    cacheStats.value.loading = false
  }
}

// Clear cache
const clearCache = async () => {
  try {
    cache.clear()
    await loadCacheData()
    
    // Track cache clear action
    if (useNuxtApp().$trackEvent) {
      useNuxtApp().$trackEvent('cache_cleared', {
        cleared_items: cacheStats.value.totalItems
      })
    }
    
  } catch (err) {
    console.error('Failed to clear cache:', err)
  }
}

// Remove specific item
const removeCacheItem = (key: string) => {
  cache.delete(key)
  updateCacheStats()
}

// Refresh all cache
const refreshCache = async () => {
  try {
    const expiredRemoved = cleanupExpired()
    const lruRemoved = cleanupLRU()
    
    await loadCacheData()
    
    // Track cache refresh
    if (useNuxtApp().$trackEvent) {
      useNuxtApp().$trackEvent('cache_refreshed', {
        expired_removed: expiredRemoved,
        lru_removed: lruRemoved
      })
    }
    
  } catch (err) {
    console.error('Failed to refresh cache:', err)
  }
}

// Get cache status color
const getCacheStatusColor = (size: number, limit: number): string => {
  const percentage = (size / limit) * 100
  if (percentage < 70) return 'text-green-400'
  if (percentage < 90) return 'text-yellow-400'
  return 'text-red-400'
}

// Initialize on mount
onMounted(() => {
  initializeCache()
  
  // Set up periodic cleanup
  const cleanupInterval = setInterval(() => {
    cleanupExpired()
    cleanupLRU()
  }, 300000) // Every 5 minutes
  
  // Set up stats update
  const statsInterval = setInterval(() => {
    updateCacheStats()
  }, 60000) // Every minute
  
  // Cleanup on unmount
  onUnmounted(() => {
    clearInterval(cleanupInterval)
    clearInterval(statsInterval)
  })
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
    <!-- Header Section -->
    <section class="py-16 bg-gradient-to-r from-cyan-900/30 via-blue-900/30 to-indigo-900/30 border-b border-gray-800">
      <div class="container mx-auto px-4">
        <motion.div 
          :initial="{ opacity: 0, y: 30 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.8, ease: "easeOut" }"
          class="text-center"
        >
          <h1 class="text-4xl lg:text-5xl font-bold text-white mb-4">
            Database Cache Management
          </h1>
          <p class="text-xl text-gray-400 max-w-2xl mx-auto">
            Monitor and optimize your database cache performance
          </p>
        </motion.div>
      </div>
    </section>

    <!-- Dashboard Content -->
    <section class="py-12">
      <div class="container mx-auto px-4">
        <!-- Loading State -->
        <div v-if="cacheStats.loading" class="flex justify-center items-center py-20">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
        </div>

        <!-- Error State -->
        <div v-else-if="cacheStats.error" class="text-center py-20">
          <div class="text-6xl mb-4">🚫</div>
          <h2 class="text-2xl font-bold text-white mb-4">Failed to load cache data</h2>
          <p class="text-gray-400 mb-6">{{ cacheStats.error }}</p>
          <button 
            @click="loadCacheData"
            class="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors duration-200"
          >
            Retry
          </button>
        </div>

        <!-- Cache Content -->
        <div v-else class="space-y-8">
          <!-- Overview Cards -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div class="bg-gradient-to-br from-cyan-800/20 to-blue-800/20 rounded-2xl p-6 border border-cyan-500/30">
              <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center">
                  <svg class="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                  </svg>
                </div>
                <div :class="getCacheStatusColor(cacheStats.memoryUsage, memoryLimit)" class="text-lg font-bold">
                  {{ Math.round((cacheStats.memoryUsage / memoryLimit) * 100) }}%
                </div>
              </div>
              <div class="text-2xl font-bold text-white mb-1">{{ cacheStats.totalItems }}</div>
              <div class="text-cyan-400 text-sm">Cached Items</div>
            </div>
            
            <div class="bg-gradient-to-br from-blue-800/20 to-indigo-800/20 rounded-2xl p-6 border border-blue-500/30">
              <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path>
                  </svg>
                </div>
                <span class="text-green-400 text-sm font-medium">{{ cacheStats.hitRate }}%</span>
              </div>
              <div class="text-2xl font-bold text-white mb-1">{{ cacheStats.hitRate }}%</div>
              <div class="text-blue-400 text-sm">Cache Hit Rate</div>
            </div>
            
            <div class="bg-gradient-to-br from-indigo-800/20 to-purple-800/20 rounded-2xl p-6 border border-indigo-500/30">
              <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center">
                  <svg class="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                </div>
                <span class="text-cyan-400 text-sm font-medium">{{ cacheStats.cacheSize }}</span>
              </div>
              <div class="text-2xl font-bold text-white mb-1">{{ cacheStats.cacheSize }}</div>
              <div class="text-indigo-400 text-sm">Total Cache Size</div>
            </div>
            
            <div class="bg-gradient-to-br from-purple-800/20 to-pink-800/20 rounded-2xl p-6 border border-purple-500/30">
              <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <svg class="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                </div>
                <span class="text-green-400 text-sm font-medium">{{ cacheStats.performanceMetrics.avgResponseTime }}ms</span>
              </div>
              <div class="text-2xl font-bold text-white mb-1">{{ cacheStats.performanceMetrics.avgResponseTime }}ms</div>
              <div class="text-purple-400 text-sm">Avg Response Time</div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-between items-center">
            <div class="flex space-x-3">
              <button 
                @click="refreshCache"
                class="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                <span>Refresh Cache</span>
              </button>
              
              <button 
                @click="clearCache"
                class="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
                <span>Clear Cache</span>
              </button>
            </div>
            
            <div class="text-gray-400 text-sm">
              Memory Limit: {{ formatBytes(memoryLimit) }}
            </div>
          </div>

          <!-- Performance Metrics -->
          <div class="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
            <h3 class="text-xl font-bold text-white mb-6">Performance Metrics</h3>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div class="text-center">
                <div class="text-3xl font-bold text-green-400">{{ cacheStats.performanceMetrics.cacheHits }}</div>
                <div class="text-gray-400 text-sm mt-1">Cache Hits</div>
              </div>
              
              <div class="text-center">
                <div class="text-3xl font-bold text-red-400">{{ cacheStats.performanceMetrics.cacheMisses }}</div>
                <div class="text-gray-400 text-sm mt-1">Cache Misses</div>
              </div>
              
              <div class="text-center">
                <div class="text-3xl font-bold text-blue-400">{{ cacheStats.performanceMetrics.compressionRatio }}x</div>
                <div class="text-gray-400 text-sm mt-1">Compression Ratio</div>
              </div>
              
              <div class="text-center">
                <div class="text-3xl font-bold text-purple-400">{{ Math.round(cacheStats.hitRate) }}%</div>
                <div class="text-gray-400 text-sm mt-1">Hit Rate</div>
              </div>
            </div>
          </div>

          <!-- Top Cached Items -->
          <div class="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
            <h3 class="text-xl font-bold text-white mb-6">Top Cached Items</h3>
            
            <div v-if="cacheStats.topCachedItems.length === 0" class="text-center py-8 text-gray-400">
              No cached items found.
            </div>
            
            <div v-else class="space-y-3">
              <div 
                v-for="item in cacheStats.topCachedItems" 
                :key="item.key"
                class="bg-gray-700/30 rounded-lg p-4 hover:bg-gray-700/50 transition-colors duration-200"
              >
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <div class="flex items-center space-x-3">
                      <span class="text-cyan-400 font-mono text-sm">{{ item.key }}</span>
                      <span class="text-green-400 text-xs">● Active</span>
                    </div>
                    <div class="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                      <span>{{ item.accessCount }} accesses</span>
                      <span>{{ item.size ? formatBytes(item.size) : 'Unknown size' }}</span>
                      <span>{{ formatTimeAgo(item.timestamp) }}</span>
                    </div>
                  </div>
                  
                  <div class="flex items-center space-x-2">
                    <span class="text-gray-500 text-xs">{{ formatTimeAgo(item.timestamp) }}</span>
                    <button 
                      @click="removeCacheItem(item.key)"
                      class="p-1 hover:text-red-400 transition-colors duration-200"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Cache Visualization -->
          <div class="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
            <h3 class="text-xl font-bold text-white mb-6">Cache Usage Visualization</h3>
            
            <div class="space-y-4">
              <!-- Memory Usage Bar -->
              <div>
                <div class="flex justify-between items-center mb-2">
                  <span class="text-gray-400">Memory Usage</span>
                  <span class="text-white font-medium">
                    {{ cacheStats.cacheSize }} / {{ formatBytes(memoryLimit) }}
                  </span>
                </div>
                <div class="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                  <div 
                    class="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                    :style="{ width: `${Math.min((cacheStats.memoryUsage / memoryLimit) * 100, 100)}%` }"
                  ></div>
                </div>
              </div>
              
              <!-- Category Distribution -->
              <div>
                <div class="flex justify-between items-center mb-2">
                  <span class="text-gray-400">Cache Distribution</span>
                  <span class="text-white text-sm">{{ cacheStats.totalItems }} items</span>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div class="bg-cyan-500/20 rounded-lg p-3">
                    <div class="flex items-center justify-between mb-1">
                      <span class="text-cyan-400 text-sm font-medium">Characters</span>
                      <span class="text-white text-sm font-bold">{{ cacheStats.topCachedItems.filter(i => i.key.startsWith('characters')).length }}</span>
                    </div>
                    <div class="w-full bg-cyan-500/20 rounded-full h-2">
                      <div 
                        class="h-full bg-cyan-400 rounded-full transition-all duration-500"
                        :style="{ width: `${(cacheStats.topCachedItems.filter(i => i.key.startsWith('characters')).length / cacheStats.totalItems) * 100}%` }"
                      ></div>
                    </div>
                  </div>
                  
                  <div class="bg-blue-500/20 rounded-lg p-3">
                    <div class="flex items-center justify-between mb-1">
                      <span class="text-blue-400 text-sm font-medium">Episodes</span>
                      <span class="text-white text-sm font-bold">{{ cacheStats.topCachedItems.filter(i => i.key.startsWith('episodes')).length }}</span>
                    </div>
                    <div class="w-full bg-blue-500/20 rounded-full h-2">
                      <div 
                        class="h-full bg-blue-400 rounded-full transition-all duration-500"
                        :style="{ width: `${(cacheStats.topCachedItems.filter(i => i.key.startsWith('episodes')).length / cacheStats.totalItems) * 100}%` }"
                      ></div>
                    </div>
                  </div>
                  
                  <div class="bg-purple-500/20 rounded-lg p-3">
                    <div class="flex items-center justify-between mb-1">
                      <span class="text-purple-400 text-sm font-medium">Locations</span>
                      <span class="text-white text-sm font-bold">{{ cacheStats.topCachedItems.filter(i => i.key.startsWith('locations')).length }}</span>
                    </div>
                    <div class="w-full bg-purple-500/20 rounded-full h-2">
                      <div 
                        class="h-full bg-purple-400 rounded-full transition-all duration-500"
                        :style="{ width: `${(cacheStats.topCachedItems.filter(i => i.key.startsWith('locations')).length / cacheStats.totalItems) * 100}%` }"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- All Cache Items -->
          <div class="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
            <div class="flex justify-between items-center mb-6">
              <h3 class="text-xl font-bold text-white">All Cached Items</h3>
              <span class="text-gray-400 text-sm">{{ cacheStats.cacheKeys.length }} total items</span>
            </div>
            
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="border-b border-gray-700">
                    <th class="text-left py-3 px-4 text-gray-400 text-sm font-medium">Key</th>
                    <th class="text-left py-3 px-4 text-gray-400 text-sm font-medium">Last Accessed</th>
                    <th class="text-left py-3 px-4 text-gray-400 text-sm font-medium">Access Count</th>
                    <th class="text-left py-3 px-4 text-gray-400 text-sm font-medium">Size</th>
                    <th class="text-center py-3 px-4 text-gray-400 text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr 
                    v-for="key in cacheStats.cacheKeys.slice(0, 10)" 
                    :key="key"
                    class="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors duration-200"
                  >
                    <td class="py-3 px-4 text-white font-mono text-sm">{{ key }}</td>
                    <td class="py-3 px-4 text-gray-400 text-sm">{{ formatTimeAgo(cache.get(key)?.timestamp || 0) }}</td>
                    <td class="py-3 px-4 text-gray-400 text-sm">{{ cache.get(key)?.accessCount || 0 }}</td>
                    <td class="py-3 px-4 text-gray-400 text-sm">{{ cache.get(key)?.size ? formatBytes(cache.get(key).size) : 'N/A' }}</td>
                    <td class="py-3 px-4 text-center">
                      <button 
                        @click="removeCacheItem(key)"
                        class="text-red-400 hover:text-red-300 transition-colors duration-200"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>