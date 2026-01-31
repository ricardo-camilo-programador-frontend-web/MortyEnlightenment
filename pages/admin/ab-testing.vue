<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from '#imports'
import { trackEvent } from '#analytics'

const i18n = useI18n()

// State
const tests = ref([])
const selectedTest = ref(null)
const showCreateModal = ref(false)
const loading = ref(false)
const error = ref(null)

// Test configuration
const mockTests = [
  {
    id: 1,
    name: 'Button Color Test',
    description: 'Testing red vs green CTA buttons',
    status: 'running',
    variant_a: {
      name: 'Red Button',
      config: { color: 'red', text: 'Get Started' },
      traffic_percentage: 50,
      conversions: 234,
      visitors: 1200,
      conversion_rate: 0.195
    },
    variant_b: {
      name: 'Green Button',
      config: { color: 'green', text: 'Start Now' },
      traffic_percentage: 50,
      conversions: 298,
      visitors: 1250,
      conversion_rate: 0.238
    },
    goal: 'button_click',
    created_at: '2024-01-01',
    duration_days: 30,
    significance_level: 0.95
  },
  {
    id: 2,
    name: 'Headline Test',
    description: 'Testing different headline variations',
    status: 'completed',
    variant_a: {
      name: 'Original Headline',
      config: { headline: 'Rick & Morty Database' },
      traffic_percentage: 50,
      conversions: 156,
      visitors: 980,
      conversion_rate: 0.159
    },
    variant_b: {
      name: 'New Headline',
      config: { headline: 'Explore the Multiverse' },
      traffic_percentage: 50,
      conversions: 203,
      visitors: 1020,
      conversion_rate: 0.199
    },
    goal: 'page_view',
    created_at: '2023-12-15',
    duration_days: 14,
    significance_level: 0.95,
    winner: 'variant_b'
  },
  {
    id: 3,
    name: 'Layout Test',
    description: 'Testing grid vs list layout for characters',
    status: 'draft',
    variant_a: null,
    variant_b: null,
    goal: 'character_click',
    created_at: null,
    duration_days: 0,
    significance_level: 0.95
  }
]

// Form state for creating new test
const newTest = ref({
  name: '',
  description: '',
  goal: 'click',
  variants: [
    {
      name: 'Variant A',
      config: { text: 'Default' },
      traffic_percentage: 50
    },
    {
      name: 'Variant B',
      config: { text: 'Alternative' },
      traffic_percentage: 50
    }
  ]
})

// Computed properties
const activeTests = computed(() => tests.value.filter(test => test.status === 'running'))
const completedTests = computed(() => tests.value.filter(test => test.status === 'completed'))
const draftTests = computed(() => tests.value.filter(test => test.status === 'draft'))

// Test statistics calculations
const calculateStats = (test: any) => {
  if (!test.variant_a || !test.variant_b) return null
  
  const a = test.variant_a
  const b = test.variant_b
  
  // Calculate standard error
  const se_a = Math.sqrt((a.conversion_rate * (1 - a.conversion_rate)) / a.visitors)
  const se_b = Math.sqrt((b.conversion_rate * (1 - b.conversion_rate)) / b.visitors)
  
  // Calculate z-score
  const z_score = (b.conversion_rate - a.conversion_rate) / Math.sqrt(se_a * se_a + se_b * se_b)
  
  // Calculate p-value (simplified)
  const p_value = 2 * (1 - normalCDF(Math.abs(z_score)))
  
  // Calculate improvement
  const improvement = ((b.conversion_rate - a.conversion_rate) / a.conversion_rate) * 100
  
  // Determine if statistically significant
  const is_significant = p_value < (1 - test.significance_level)
  
  // Calculate confidence interval
  const margin_of_error = 1.96 * Math.sqrt(se_a * se_a + se_b * se_b)
  const ci_lower = (b.conversion_rate - a.conversion_rate) - margin_of_error
  const ci_upper = (b.conversion_rate - a.conversion_rate) + margin_of_error
  
  return {
    z_score,
    p_value,
    improvement,
    is_significant,
    ci_lower,
    ci_upper,
    confidence: (1 - p_value) * 100
  }
}

// Normal CDF approximation
function normalCDF(z: number): number {
  return 0.5 * (1 + erf(z / Math.sqrt(2)))
}

// Error function approximation
function erf(x: number): number {
  const a1 = 0.254829592
  const a2 = -0.284496736
  const a3 = 1.421413741
  const a4 = -1.453152027
  const a5 = 1.061405429
  const p = 0.3275911
  
  const sign = x >= 0 ? 1 : -1
  x = Math.abs(x)
  
  const t = 1.0 / (1.0 + p * x)
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x)
  
  return sign * y
}

// Test functions
const loadTests = async () => {
  try {
    loading.value = true
    error.value = null
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    tests.value = mockTests
    
    // Track analytics page view
    trackEvent('ab_tests_view', {
      total_tests: tests.value.length,
      active_tests: activeTests.value.length,
      completed_tests: completedTests.value.length
    })
  } catch (err) {
    error.value = i18n.t('errors.network')
    console.error('Failed to load tests:', err)
  } finally {
    loading.value = false
  }
}

const createTest = async () => {
  try {
    loading.value = true
    error.value = null
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const newTestObj = {
      id: tests.value.length + 1,
      name: newTest.value.name,
      description: newTest.value.description,
      status: 'draft',
      ...newTest.value,
      created_at: new Date().toISOString()
    }
    
    tests.value.push(newTestObj)
    showCreateModal.value = false
    
    // Reset form
    newTest.value = {
      name: '',
      description: '',
      goal: 'click',
      variants: [
        {
          name: 'Variant A',
          config: { text: 'Default' },
          traffic_percentage: 50
        },
        {
          name: 'Variant B',
          config: { text: 'Alternative' },
          traffic_percentage: 50
        }
      ]
    }
    
    trackEvent('ab_test_created', {
      test_name: newTestObj.name,
      goal: newTestObj.goal,
      variants: newTestObj.variants.length
    })
    
  } catch (err) {
    error.value = i18n.t('errors.general')
    console.error('Failed to create test:', err)
  } finally {
    loading.value = false
  }
}

const startTest = (testId: number) => {
  const test = tests.value.find(t => t.id === testId)
  if (test) {
    test.status = 'running'
    test.created_at = new Date().toISOString()
    
    trackEvent('ab_test_started', {
      test_id: testId,
      test_name: test.name
    })
  }
}

const stopTest = (testId: number) => {
  const test = tests.value.find(t => t.id === testId)
  if (test) {
    test.status = 'completed'
    
    trackEvent('ab_test_stopped', {
      test_id: testId,
      test_name: test.name
    })
  }
}

const deleteTest = (testId: number) => {
  const index = tests.value.findIndex(t => t.id === testId)
  if (index > -1) {
    const test = tests.value[index]
    tests.value.splice(index, 1)
    
    trackEvent('ab_test_deleted', {
      test_id: testId,
      test_name: test.name
    })
  }
}

// Get status badge
const getStatusBadge = (status: string) => {
  const badges = {
    running: { color: 'bg-green-500/20 text-green-400', text: 'Running' },
    completed: { color: 'bg-blue-500/20 text-blue-400', text: 'Completed' },
    draft: { color: 'bg-gray-500/20 text-gray-400', text: 'Draft' },
    paused: { color: 'bg-yellow-500/20 text-yellow-400', text: 'Paused' }
  }
  
  return badges[status] || badges.draft
}

// Get statistical significance color
const getSignificanceColor = (significant: boolean, confidence: number) => {
  if (!significant) return 'text-gray-400'
  if (confidence > 95) return 'text-green-400'
  if (confidence > 90) return 'text-yellow-400'
  return 'text-orange-400'
}

// Initialize on mount
onMounted(() => {
  loadTests()
})

// Cleanup
onUnmounted(() => {
  // Cleanup any timers or event listeners
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
    <!-- Header Section -->
    <section class="py-16 bg-gradient-to-r from-rick-900/30 via-test-900/30 to-morty-900/30 border-b border-gray-800">
      <div class="container mx-auto px-4">
        <motion.div 
          :initial="{ opacity: 0, y: 30 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.8, ease: "easeOut" }"
          class="flex justify-between items-center"
        >
          <div>
            <h1 class="text-4xl lg:text-5xl font-bold text-white mb-4">
              A/B Testing
            </h1>
            <p class="text-xl text-gray-400">
              Optimize your website with controlled experiments
            </p>
          </div>
          
          <button 
            @click="showCreateModal = true"
            class="px-6 py-3 bg-gradient-to-r from-rick-600 to-morty-600 hover:from-rick-500 hover:to-morty-500 text-white font-medium rounded-lg transition-all duration-300 flex items-center space-x-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            <span>Create Test</span>
          </button>
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
          <h2 class="text-2xl font-bold text-white mb-4">Failed to load tests</h2>
          <p class="text-gray-400 mb-6">{{ error }}</p>
          <button 
            @click="loadTests"
            class="px-6 py-3 bg-rick-600 hover:bg-rick-500 text-white rounded-lg transition-colors duration-200"
          >
            Retry
          </button>
        </div>

        <!-- Tests Content -->
        <div v-else class="space-y-8">
          <!-- Summary Cards -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl border border-gray-700">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-gray-400">Active Tests</h3>
                <div class="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                  <svg class="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd"></path>
                  </svg>
                </div>
              </div>
              <div class="text-3xl font-bold text-green-400">{{ activeTests.length }}</div>
              <div class="text-gray-400 text-sm mt-1">Currently running</div>
            </div>
            
            <div class="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl border border-gray-700">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-gray-400">Completed Tests</h3>
                <div class="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <svg class="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                </div>
              </div>
              <div class="text-3xl font-bold text-blue-400">{{ completedTests.length }}</div>
              <div class="text-gray-400 text-sm mt-1">Historical data</div>
            </div>
            
            <div class="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl border border-gray-700">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-gray-400">Draft Tests</h3>
                <div class="w-10 h-10 bg-gray-500/20 rounded-full flex items-center justify-center">
                  <svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                  </svg>
                </div>
              </div>
              <div class="text-3xl font-bold text-gray-400">{{ draftTests.length }}</div>
              <div class="text-gray-400 text-sm mt-1">Ready to launch</div>
            </div>
          </div>

          <!-- Active Tests -->
          <div v-if="activeTests.length > 0" class="space-y-6">
            <h2 class="text-2xl font-bold text-white">Active Tests</h2>
            
            <div v-for="test in activeTests" :key="test.id" class="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
              <div class="flex justify-between items-start mb-6">
                <div>
                  <div class="flex items-center space-x-3 mb-2">
                    <h3 class="text-xl font-bold text-white">{{ test.name }}</h3>
                    <span :class="getStatusBadge(test.status).color" 
                          class="px-3 py-1 rounded-full text-xs font-medium">
                      {{ getStatusBadge(test.status).text }}
                    </span>
                  </div>
                  <p class="text-gray-400">{{ test.description }}</p>
                </div>
                
                <div class="flex space-x-2">
                  <button 
                    @click="stopTest(test.id)"
                    class="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    Stop Test
                  </button>
                </div>
              </div>
              
              <!-- Test Results -->
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Variant A -->
                <div class="bg-gray-700/30 rounded-xl p-4 border border-gray-600">
                  <h4 class="font-bold text-white mb-3">{{ test.variant_a.name }}</h4>
                  <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span class="text-gray-400">Visitors:</span>
                      <span class="text-white ml-2 font-medium">{{ test.variant_a.visitors.toLocaleString() }}</span>
                    </div>
                    <div>
                      <span class="text-gray-400">Conversions:</span>
                      <span class="text-white ml-2 font-medium">{{ test.variant_a.conversions }}</span>
                    </div>
                    <div class="col-span-2">
                      <span class="text-gray-400">Conversion Rate:</span>
                      <span class="text-green-400 ml-2 font-medium">{{ (test.variant_a.conversion_rate * 100).toFixed(2) }}%</span>
                    </div>
                  </div>
                </div>
                
                <!-- Variant B -->
                <div class="bg-gray-700/30 rounded-xl p-4 border border-gray-600">
                  <h4 class="font-bold text-white mb-3">{{ test.variant_b.name }}</h4>
                  <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span class="text-gray-400">Visitors:</span>
                      <span class="text-white ml-2 font-medium">{{ test.variant_b.visitors.toLocaleString() }}</span>
                    </div>
                    <div>
                      <span class="text-gray-400">Conversions:</span>
                      <span class="text-white ml-2 font-medium">{{ test.variant_b.conversions }}</span>
                    </div>
                    <div class="col-span-2">
                      <span class="text-gray-400">Conversion Rate:</span>
                      <span class="text-green-400 ml-2 font-medium">{{ (test.variant_b.conversion_rate * 100).toFixed(2) }}%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Statistics -->
              <div v-if="test.variant_a && test.variant_b" class="mt-6 p-4 bg-gray-700/20 rounded-xl">
                <h4 class="font-bold text-white mb-3">Statistical Analysis</h4>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span class="text-gray-400">Improvement:</span>
                    <span :class="getSignificanceColor(stats.is_significant, stats.confidence)" 
                          class="ml-2 font-medium">
                      {{ stats.improvement > 0 ? '+' : '' }}{{ stats.improvement.toFixed(1) }}%
                    </span>
                  </div>
                  <div>
                    <span class="text-gray-400">Confidence:</span>
                    <span :class="getSignificanceColor(stats.is_significant, stats.confidence)" 
                          class="ml-2 font-medium">
                      {{ stats.confidence.toFixed(1) }}%
                    </span>
                  </div>
                  <div>
                    <span class="text-gray-400">P-Value:</span>
                    <span class="ml-2 font-medium">{{ stats.p_value.toFixed(4) }}</span>
                  </div>
                  <div>
                    <span class="text-gray-400">Significant:</span>
                    <span :class="getSignificanceColor(stats.is_significant, stats.confidence)" 
                          class="ml-2 font-medium">
                      {{ stats.is_significant ? 'Yes' : 'No' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Completed Tests -->
          <div v-if="completedTests.length > 0" class="space-y-6">
            <h2 class="text-2xl font-bold text-white">Completed Tests</h2>
            
            <div v-for="test in completedTests" :key="test.id" class="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
              <div class="flex justify-between items-start mb-6">
                <div>
                  <div class="flex items-center space-x-3 mb-2">
                    <h3 class="text-xl font-bold text-white">{{ test.name }}</h3>
                    <span :class="getStatusBadge(test.status).color" 
                          class="px-3 py-1 rounded-full text-xs font-medium">
                      {{ getStatusBadge(test.status).text }}
                    </span>
                    <span v-if="test.winner" class="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
                      Winner: {{ test.winner === 'variant_a' ? test.variant_a.name : test.variant_b.name }}
                    </span>
                  </div>
                  <p class="text-gray-400">{{ test.description }}</p>
                </div>
                
                <div class="flex space-x-2">
                  <button 
                    @click="deleteTest(test.id)"
                    class="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              <!-- Show simplified results for completed tests -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="bg-gray-700/30 rounded-xl p-4 border border-gray-600">
                  <h4 class="font-bold text-white mb-2">{{ test.variant_a.name }}</h4>
                  <div class="text-sm text-gray-400">
                    <div>Visitors: {{ test.variant_a.visitors.toLocaleString() }}</div>
                    <div>Conversion Rate: {{ (test.variant_a.conversion_rate * 100).toFixed(2) }}%</div>
                  </div>
                </div>
                
                <div class="bg-gray-700/30 rounded-xl p-4 border border-gray-600">
                  <h4 class="font-bold text-white mb-2">{{ test.variant_b.name }}</h4>
                  <div class="text-sm text-gray-400">
                    <div>Visitors: {{ test.variant_b.visitors.toLocaleString() }}</div>
                    <div>Conversion Rate: {{ (test.variant_b.conversion_rate * 100).toFixed(2) }}%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Draft Tests -->
          <div v-if="draftTests.length > 0" class="space-y-6">
            <h2 class="text-2xl font-bold text-white">Draft Tests</h2>
            
            <div v-for="test in draftTests" :key="test.id" class="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
              <div class="flex justify-between items-start mb-6">
                <div>
                  <div class="flex items-center space-x-3 mb-2">
                    <h3 class="text-xl font-bold text-white">{{ test.name }}</h3>
                    <span :class="getStatusBadge(test.status).color" 
                          class="px-3 py-1 rounded-full text-xs font-medium">
                      {{ getStatusBadge(test.status).text }}
                    </span>
                  </div>
                  <p class="text-gray-400">{{ test.description }}</p>
                </div>
                
                <div class="flex space-x-2">
                  <button 
                    @click="startTest(test.id)"
                    class="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    Start Test
                  </button>
                  <button 
                    @click="deleteTest(test.id)"
                    class="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- No Tests Message -->
          <div v-if="tests.length === 0" class="text-center py-20">
            <div class="text-6xl mb-4">🧪</div>
            <h2 class="text-2xl font-bold text-white mb-4">No A/B Tests Created</h2>
            <p class="text-gray-400 mb-6">
              Start optimizing your website by creating your first A/B test.
            </p>
            <button 
              @click="showCreateModal = true"
              class="px-6 py-3 bg-gradient-to-r from-rick-600 to-morty-600 hover:from-rick-500 hover:to-morty-500 text-white font-medium rounded-lg transition-all duration-300"
            >
              Create Your First Test
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Create Test Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl">
        <!-- Modal Header -->
        <div class="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 flex items-center justify-between">
          <h2 class="text-2xl font-bold text-white">Create A/B Test</h2>
          <button 
            @click="showCreateModal = false"
            class="p-2 rounded-lg hover:bg-gray-800 transition-colors duration-200"
          >
            <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <!-- Modal Content -->
        <div class="p-6">
          <div class="space-y-6">
            <!-- Basic Info -->
            <div>
              <label class="block text-gray-400 text-sm font-medium mb-2">Test Name</label>
              <input 
                v-model="newTest.name"
                type="text" 
                class="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-rick-500 focus:bg-gray-800/50 transition-colors duration-200"
                placeholder="Enter test name"
              />
            </div>
            
            <div>
              <label class="block text-gray-400 text-sm font-medium mb-2">Description</label>
              <textarea 
                v-model="newTest.description"
                rows="3"
                class="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-rick-500 focus:bg-gray-800/50 transition-colors duration-200"
                placeholder="Describe what you're testing"
              ></textarea>
            </div>
            
            <div>
              <label class="block text-gray-400 text-sm font-medium mb-2">Goal</label>
              <select 
                v-model="newTest.goal"
                class="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-rick-500 focus:bg-gray-800/50 transition-colors duration-200"
              >
                <option value="click">Button Click</option>
                <option value="view">Page View</option>
                <option value="conversion">Form Submission</option>
                <option value="time">Time on Page</option>
              </select>
            </div>
            
            <!-- Variants -->
            <div>
              <h3 class="text-lg font-bold text-white mb-4">Test Variants</h3>
              <div class="space-y-4">
                <div v-for="(variant, index) in newTest.variants" :key="index" class="bg-gray-800/30 rounded-lg p-4">
                  <div class="flex items-center justify-between mb-3">
                    <h4 class="font-medium text-white">{{ variant.name }}</h4>
                    <div class="flex items-center space-x-2">
                      <span class="text-gray-400 text-sm">Traffic:</span>
                      <input 
                        v-model="variant.traffic_percentage"
                        type="number" 
                        min="1" 
                        max="100"
                        class="w-16 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                      />
                      <span class="text-gray-400 text-sm">%</span>
                    </div>
                  </div>
                  <div>
                    <label class="block text-gray-400 text-xs mb-1">Test Content</label>
                    <input 
                      v-model="variant.config.text"
                      type="text" 
                      class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-rick-500 transition-colors duration-200"
                      :placeholder="`Enter ${variant.name.toLowerCase()} content`"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Actions -->
            <div class="flex justify-end space-x-3 pt-6 border-t border-gray-700">
              <button 
                @click="showCreateModal = false"
                class="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors duration-200"
              >
                Cancel
              </button>
              <button 
                @click="createTest"
                class="px-6 py-3 bg-gradient-to-r from-rick-600 to-morty-600 hover:from-rick-500 hover:to-morty-500 text-white rounded-lg font-medium transition-all duration-300"
              >
                Create Test
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>