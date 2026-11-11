import axios from 'axios'
import { defineStore, acceptHMRUpdate } from 'pinia'
import type { ICharacter, IInfo } from '~/models/Character'
import { buildCharacterParams, defaultQuery, type CharacterQuery } from '~/lib/catalog/query'

let requestSerial = 0

export const useCharactersStore = defineStore('charactersStore', {
  state: () => ({
    characters: [] as ICharacter[],
    info: null as IInfo | null,
    loading: true,
    error: null as string | null,
    query: defaultQuery()
  }),
  getters: {
    getCharactersFromStore (): ICharacter[] {
      return this.characters
    },
    pageCount (): number {
      return this.info?.pages ?? 0
    }
  },
  actions: {
    async getCharacters (patch?: Partial<CharacterQuery>) {
      const serial = ++requestSerial
      if (patch) {
        const filterKeys: (keyof CharacterQuery)[] = ['name', 'status', 'gender', 'species']
        const filtersChanged = filterKeys.some(key => patch[key] !== undefined && patch[key] !== this.query[key])
        this.query = {
          ...this.query,
          ...patch,
          page: patch.page ?? (filtersChanged ? 1 : this.query.page)
        }
      }
      this.loading = true
      this.error = null
      try {
        const nuxtApp = useNuxtApp() as any
        const apiClient = nuxtApp.$apiClient ?? nuxtApp.apiClient
        const response = await apiClient.get('/character', {
          params: buildCharacterParams(this.query)
        })
        if (serial !== requestSerial) { return }
        this.characters = response.data.results ?? []
        this.info = response.data.info ?? null
      } catch (error) {
        if (serial !== requestSerial) { return }
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          this.characters = []
          this.info = { count: 0, pages: 0, next: null, prev: null }
          this.error = null
        } else {
          this.characters = []
          this.info = null
          this.error = 'Não foi possível consultar o multiverso. Tente de novo.'
        }
      } finally {
        if (serial === requestSerial) {
          this.loading = false
        }
      }
    }
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCharactersStore, import.meta.hot))
}
