import { defineStore, acceptHMRUpdate } from 'pinia'
import type { ICharacter, IInfo } from '~/models/Character'

export const useCharactersStore = defineStore('charactersStore', {
  state: () => ({
    characters: [] as ICharacter[],
    info: {} as IInfo
  }),
  getters: {
    getCharactersFromStore (): ICharacter[] {
      return this.characters
    }
  },
  actions: {
    async getCharacters () {
      const nuxtApp = useNuxtApp() as any
      const apiClient = nuxtApp.$apiClient ?? nuxtApp.apiClient
      const response = await apiClient.get('/character')
      const { results, info } = response.data

      this.characters = results
      this.info = info
    }
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCharactersStore, import.meta.hot))
}
