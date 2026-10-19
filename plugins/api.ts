import axios from 'axios'
import { useStorage } from '@vueuse/core'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const baseURL = typeof config.BASE_URL === 'string' && config.BASE_URL.length > 0
    ? config.BASE_URL
    : 'https://rickandmortyapi.com/api'
  const defaultTokenName = 'app_default_token_name'

  const tokenRef = useStorage<string | null>(defaultTokenName, null)
  const token = tokenRef.value
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const apiClient = axios.create({
    baseURL,
    headers
  })

  nuxtApp.apiClient = apiClient
  nuxtApp.provide('apiClient', apiClient)
})
