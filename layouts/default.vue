<script lang="ts">
import { useI18n } from '#imports'
import { useHead } from '#head'
import UserProfile from '~/components/UserProfile.vue'

export default {
  setup() {
    const { t } = useI18n()
    
    useHead({
      title: t('seo.title'),
      meta: [
        { name: 'description', content: t('seo.description') },
        { name: 'keywords', content: t('seo.keywords') },
        { name: 'author', content: 'Morty Enlightenment Team' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no' },
        { name: 'theme-color', content: '#d97706' },
        { name: 'msapplication-TileColor', content: '#d97706' },
        { property: 'og:title', content: t('seo.title') },
        { property: 'og:description', content: t('seo.description') },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: useRuntimeConfig().public.siteUrl },
        { property: 'og:image', content: '/og-image.png' },
        { property: 'og:site_name', content: 'Morty Enlightenment' },
        { property: 'og:locale', content: useI18n().locale.value },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: t('seo.title') },
        { name: 'twitter:description', content: t('seo.description') },
        { name: 'twitter:image', content: '/twitter-image.png' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/manifest.json' }
      ]
    })
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
    <!-- Header Navigation -->
    <header class="sticky top-0 z-50 bg-gradient-to-r from-rick-900/95 to-morty-900/95 backdrop-blur-sm border-b border-rick-800/50">
      <nav class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <!-- Logo -->
          <NuxtLink to="/" class="flex items-center space-x-3 group">
            <div class="w-10 h-10 bg-gradient-to-br from-rick-400 to-morty-400 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-all duration-200">
              <span class="text-white font-bold text-lg">ME</span>
            </div>
            <span class="text-white text-xl font-bold tracking-wide">Morty Enlightenment</span>
          </NuxtLink>

          <!-- Desktop Navigation -->
          <div class="hidden lg:flex items-center space-x-8">
            <NuxtLink 
              v-for="item in navigationItems" 
              :key="item.key"
              :to="item.to"
              class="text-gray-300 hover:text-white transition-colors duration-200 font-medium"
            >
              {{ t(item.label) }}
            </NuxtLink>
            
            <!-- User Profile -->
            <UserProfile v-if="i18n.locale.value === 'en'" />
            
            <!-- Language Switcher -->
            <div class="flex items-center space-x-2 border-l border-gray-600 pl-6">
              <button 
                v-for="lang in ['en', 'es', 'pt']" 
                :key="lang"
                @click="switchLanguage(lang)"
                class="w-8 h-8 rounded-full border-2 transition-all duration-200 flex items-center justify-center text-sm font-medium"
                :class="i18n.locale.value === lang ? 'border-white text-white' : 'border-gray-600 text-gray-400 hover:border-gray-400'"
              >
                {{ lang.toUpperCase() }}
              </button>
            </div>
          </div>

          <!-- Mobile Menu Button -->
          <button 
            @click="toggleMobileMenu"
            class="lg:hidden p-2 rounded-lg hover:bg-gray-800 transition-colors duration-200"
          >
            <div class="w-6 h-0.5 bg-white mb-1.5"></div>
            <div class="w-6 h-0.5 bg-white mb-1.5"></div>
            <div class="w-6 h-0.5 bg-white"></div>
          </button>
        </div>

        <!-- Mobile Navigation -->
        <div 
          v-if="showMobileMenu" 
          class="lg:hidden mt-4 pb-4 border-t border-gray-700"
        >
          <div class="flex flex-col space-y-3 pt-4">
            <NuxtLink 
              v-for="item in navigationItems" 
              :key="item.key"
              :to="item.to"
              @click="showMobileMenu = false"
              class="text-gray-300 hover:text-white transition-colors duration-200 font-medium py-2"
            >
              {{ t(item.label) }}
            </NuxtLink>
            
            <!-- Mobile User Profile -->
            <div class="pt-2 border-t border-gray-700 mt-2">
              <UserProfile v-if="i18n.locale.value === 'en'" @close="showMobileMenu = false" />
            </div>
            
            <!-- Mobile Language Switcher -->
            <div class="flex items-center justify-center space-x-2 pt-2 border-t border-gray-700 mt-3">
              <button 
                v-for="lang in ['en', 'es', 'pt']" 
                :key="lang"
                @click="switchLanguage(lang)"
                class="w-8 h-8 rounded-full border-2 transition-all duration-200 flex items-center justify-center text-sm font-medium"
                :class="i18n.locale.value === lang ? 'border-white text-white' : 'border-gray-600 text-gray-400 hover:border-gray-400'"
              >
                {{ lang.toUpperCase() }}
              </button>
            </div>
          </div>
        </div>
      </nav>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8">
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-rick-400"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-20">
        <div class="text-6xl mb-4">🚫</div>
        <h2 class="text-2xl font-bold text-white mb-4">{{ t('errors.general') }}</h2>
        <p class="text-gray-400 mb-6">{{ error }}</p>
        <button 
          @click="retry"
          class="px-6 py-3 bg-rick-600 hover:bg-rick-500 text-white rounded-lg transition-colors duration-200"
        >
          {{ t('common.retry') }}
        </button>
      </div>

      <!-- Content -->
      <slot v-else />
    </main>

    <!-- Footer -->
    <footer class="border-t border-gray-800 bg-gray-900/50 mt-20">
      <div class="container mx-auto px-4 py-8">
        <div class="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div class="text-gray-400 text-sm">
            © 2026 Morty Enlightenment. All rights reserved.
          </div>
          <div class="flex items-center space-x-6">
            <a 
              href="#" 
              class="text-gray-400 hover:text-white transition-colors duration-200"
              @click="trackEvent('footer_click', { section: 'social' })"
            >
              Twitter
            </a>
            <a 
              href="#" 
              class="text-gray-400 hover:text-white transition-colors duration-200"
              @click="trackEvent('footer_click', { section: 'social' })"
            >
              Discord
            </a>
            <a 
              href="#" 
              class="text-gray-400 hover:text-white transition-colors duration-200"
              @click="trackEvent('footer_click', { section: 'social' })"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from '#imports'
import { trackEvent } from '#analytics'

const i18n = useI18n()
const loading = ref(false)
const error = ref<string | null>(null)
const showMobileMenu = ref(false)

const navigationItems = computed(() => [
  { key: 'home', label: 'navigation.home', to: '/' },
  { key: 'characters', label: 'navigation.characters', to: '/characters' },
  { key: 'episodes', label: 'navigation.episodes', to: '/episodes' },
  { key: 'locations', label: 'navigation.locations', to: '/locations' },
  { key: 'quiz', label: 'navigation.quiz', to: '/quiz' },
  { key: 'favorites', label: 'navigation.favorites', to: '/favorites' }
])

const switchLanguage = async (lang: string) => {
  await i18n.setLocale(lang)
  trackEvent('language_switch', { language: lang })
}

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

const retry = () => {
  loading.value = true
  error.value = null
  // Implement retry logic here
}
</script>
