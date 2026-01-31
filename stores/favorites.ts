import { defineStore, acceptHMRUpdate } from 'pinia'
import { ICharacter } from '~/models/Character'

export const useFavoritesStore = defineStore('favoritesStore', {
  state: () => ({
    favorites: [] as ICharacter[],
    isLoading: false,
    error: null as string | null
  }),

  getters: {
    getFavoritesFromStore(): ICharacter[] {
      return this.favorites
    },
    
    getFavoriteCount(): number {
      return this.favorites.length
    },
    
    isFavorite(): ((characterId: number) => boolean) {
      return (characterId: number) => {
        return this.favorites.some(fav => fav.id === characterId)
      }
    },
    
    getFavoritesByStatus(): Record<string, ICharacter[]> {
      return this.favorites.reduce((acc, fav) => {
        const status = fav.status.toLowerCase()
        if (!acc[status]) {
          acc[status] = []
        }
        acc[status].push(fav)
        return acc
      }, {} as Record<string, ICharacter[]>)
    }
  },

  actions: {
    // Load favorites from localStorage
    loadFavorites() {
      try {
        const stored = localStorage.getItem('morty_favorites')
        if (stored) {
          this.favorites = JSON.parse(stored)
        }
      } catch (error) {
        console.error('Failed to load favorites:', error)
        this.error = 'Failed to load favorites'
      }
    },

    // Save favorites to localStorage
    saveFavorites() {
      try {
        localStorage.setItem('morty_favorites', JSON.stringify(this.favorites))
        this.error = null
      } catch (error) {
        console.error('Failed to save favorites:', error)
        this.error = 'Failed to save favorites'
      }
    },

    // Add character to favorites
    addFavorite(character: ICharacter) {
      this.isLoading = true
      
      try {
        // Check if already exists
        const exists = this.favorites.some(fav => fav.id === character.id)
        
        if (!exists) {
          this.favorites.push(character)
          this.saveFavorites()
          
          // Track favorite action
          if (useNuxtApp().$trackFavoriteToggle) {
            useNuxtApp().$trackFavoriteToggle(character.id, character.name, true)
          }
        }
      } catch (error) {
        console.error('Failed to add favorite:', error)
        this.error = 'Failed to add favorite'
      } finally {
        this.isLoading = false
      }
    },

    // Remove character from favorites
    removeFavorite(characterId: number) {
      this.isLoading = true
      
      try {
        const index = this.favorites.findIndex(fav => fav.id === characterId)
        
        if (index > -1) {
          const character = this.favorites[index]
          this.favorites.splice(index, 1)
          this.saveFavorites()
          
          // Track favorite action
          if (useNuxtApp().$trackFavoriteToggle) {
            useNuxtApp().$trackFavoriteToggle(characterId, character.name, false)
          }
        }
      } catch (error) {
        console.error('Failed to remove favorite:', error)
        this.error = 'Failed to remove favorite'
      } finally {
        this.isLoading = false
      }
    },

    // Toggle favorite status
    toggleFavorite(character: ICharacter) {
      if (this.isFavorite(character.id)) {
        this.removeFavorite(character.id)
      } else {
        this.addFavorite(character)
      }
    },

    // Check if character is favorite
    checkFavorite(characterId: number): boolean {
      return this.isFavorite(characterId)
    },

    // Clear all favorites
    clearFavorites() {
      try {
        this.favorites = []
        this.saveFavorites()
        
        // Track clear action
        if (useNuxtApp().$trackEvent) {
          useNuxtApp().$trackEvent('favorites_cleared', {
            count: 0
          })
        }
      } catch (error) {
        console.error('Failed to clear favorites:', error)
        this.error = 'Failed to clear favorites'
      }
    },

    // Get character statistics
    getCharacterStats() {
      const stats = {
        total: this.favorites.length,
        byStatus: this.getFavoritesByStatus,
        bySpecies: {} as Record<string, number>,
        byGender: {} as Record<string, number>,
        byOrigin: {} as Record<string, number>
      }

      // Count by species
      this.favorites.forEach(fav => {
        stats.bySpecies[fav.species] = (stats.bySpecies[fav.species] || 0) + 1
      })

      // Count by gender
      this.favorites.forEach(fav => {
        stats.byGender[fav.gender] = (stats.byGender[fav.gender] || 0) + 1
      })

      // Count by origin
      this.favorites.forEach(fav => {
        stats.byOrigin[fav.origin.name] = (stats.byOrigin[fav.origin.name] || 0) + 1
      })

      return stats
    },

    // Export favorites as JSON
    exportFavorites(): string {
      try {
        return JSON.stringify(this.favorites, null, 2)
      } catch (error) {
        console.error('Failed to export favorites:', error)
        this.error = 'Failed to export favorites'
        return '[]'
      }
    },

    // Import favorites from JSON
    importFavorites(jsonData: string) {
      try {
        const imported = JSON.parse(jsonData)
        
        if (Array.isArray(imported)) {
          // Validate imported data
          const isValid = imported.every(item => 
            item && 
            typeof item.id === 'number' &&
            typeof item.name === 'string' &&
            typeof item.status === 'string' &&
            typeof item.species === 'string' &&
            typeof item.gender === 'string' &&
            item.origin &&
            item.location &&
            typeof item.image === 'string'
          )

          if (isValid) {
            this.favorites = imported
            this.saveFavorites()
            
            if (useNuxtApp().$trackEvent) {
              useNuxtApp().$trackEvent('favorites_imported', {
                count: imported.length
              })
            }
          } else {
            throw new Error('Invalid favorites data format')
          }
        } else {
          throw new Error('Invalid favorites data format')
        }
      } catch (error) {
        console.error('Failed to import favorites:', error)
        this.error = 'Failed to import favorites'
      }
    }
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useFavoritesStore, import.meta.hot))
}