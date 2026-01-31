export const useUserStore = defineStore('userStore', {
  state: () => ({
    user: null as null | {
      id: string
      username: string
      email?: string
      avatar?: string
      level: number
      experience: number
      points: number
      streak: number
      joinDate: Date
      preferences: {
        theme: 'dark'
        language: 'en'
        notifications: true
        animations: true
      }
    },
    isLoading: false,
    error: null as string | null
  }),

  getters: {
    isAuthenticated: (state) => state.user !== null,
    
    getUserLevel: (state) => state.user?.level || 1,
    
    getUserPoints: (state) => state.user?.points || 0,
    
    getUserStreak: (state) => state.user?.streak || 0,
    
    getUserProgress: (state) => {
      if (!state.user) return 0
      const expNeeded = getExperienceForLevel(state.user.level + 1)
      const currentExp = state.user.experience - getExperienceForLevel(state.user.level)
      return Math.round((currentExp / expNeeded) * 100)
    },
    
    getUserBadges: (state) => {
      if (!state.user) return []
      return calculateBadges(state.user)
    },
    
    getLevelColor: (state) => {
      const level = state.user?.level || 1
      if (level >= 50) return 'text-purple-400'
      if (level >= 30) return 'text-pink-400'
      if (level >= 20) return 'text-red-400'
      if (level >= 10) return 'text-orange-400'
      if (level >= 5) return 'text-yellow-400'
      return 'text-green-400'
    }
  },

  actions: {
    // Initialize user from localStorage
    async initializeUser() {
      try {
        const stored = localStorage.getItem('morty_user')
        if (stored) {
          const userData = JSON.parse(stored)
          // Convert joinDate back to Date object
          if (userData.joinDate) {
            userData.joinDate = new Date(userData.joinDate)
          }
          this.user = userData
        } else {
          // Create new guest user
          await this.createGuestUser()
        }
        
        // Check for streak update
        this.updateStreak()
      } catch (error) {
        console.error('Failed to initialize user:', error)
        this.error = 'Failed to initialize user'
      }
    },

    // Create new guest user
    async createGuestUser() {
      try {
        this.isLoading = true
        
        const guestUser = {
          id: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          username: `Guest_${Math.floor(Math.random() * 1000)}`,
          level: 1,
          experience: 0,
          points: 100, // Starting points
          streak: 0,
          joinDate: new Date(),
          preferences: {
            theme: 'dark',
            language: 'en',
            notifications: true,
            animations: true
          }
        }
        
        this.user = guestUser
        await this.saveUser()
        
        // Track new user
        if (useNuxtApp().$trackEvent) {
          useNuxtApp().$trackEvent('user_created', {
            user_type: 'guest',
            points: guestUser.points
          })
        }
      } catch (error) {
        console.error('Failed to create guest user:', error)
        this.error = 'Failed to create guest user'
      } finally {
        this.isLoading = false
      }
    },

    // Update user profile
    async updateUserProfile(updates: Partial<typeof this.user>) {
      if (!this.user) return
      
      try {
        this.isLoading = true
        
        this.user = {
          ...this.user,
          ...updates
        }
        
        await this.saveUser()
        
        // Track profile update
        if (useNuxtApp().$trackEvent) {
          useNuxtApp().$trackEvent('profile_updated', {
            update_fields: Object.keys(updates)
          })
        }
      } catch (error) {
        console.error('Failed to update user profile:', error)
        this.error = 'Failed to update user profile'
      } finally {
        this.isLoading = false
      }
    },

    // Add experience points
    async addExperience(amount: number, source: string) {
      if (!this.user) return
      
      try {
        const oldLevel = this.user.level
        this.user.experience += amount
        
        // Check for level up
        const newLevel = getLevelFromExperience(this.user.experience)
        if (newLevel > oldLevel) {
          this.user.level = newLevel
          this.user.points += newLevel * 50 // Bonus points for level up
          
          // Track level up
          if (useNuxtApp().$trackEvent) {
            useNuxtApp().$trackEvent('level_up', {
              old_level: oldLevel,
              new_level: newLevel,
              points_earned: amount
            })
          }
          
          // Show notification
          if (this.user.preferences.notifications) {
            showNotification(`Level Up! You reached level ${newLevel}!`, {
              icon: '/icon-192x192.png'
            })
          }
        }
        
        await this.saveUser()
        
        // Track experience gain
        if (useNuxtApp().$trackEvent) {
          useNuxtApp().$trackEvent('experience_gained', {
            amount,
            source,
            new_level: this.user.level
          })
        }
      } catch (error) {
        console.error('Failed to add experience:', error)
        this.error = 'Failed to add experience'
      }
    },

    // Add points
    async addPoints(amount: number, source: string) {
      if (!this.user) return
      
      try {
        this.user.points += amount
        await this.saveUser()
        
        // Track points gain
        if (useNuxtApp().$trackEvent) {
          useNuxtApp().$trackEvent('points_gained', {
            amount,
            source,
            total_points: this.user.points
          })
        }
      } catch (error) {
        console.error('Failed to add points:', error)
        this.error = 'Failed to add points'
      }
    },

    // Update streak
    updateStreak() {
      if (!this.user) return
      
      try {
        const lastVisit = localStorage.getItem('morty_last_visit')
        const today = new Date().toDateString()
        
        if (!lastVisit || lastVisit !== today) {
          // First visit today
          const lastVisitDate = lastVisit ? new Date(lastVisit) : new Date()
          const daysSinceLastVisit = Math.floor((new Date().getTime() - lastVisitDate.getTime()) / (1000 * 60 * 60 * 24))
          
          if (daysSinceLastVisit === 1) {
            // Consecutive day
            this.user.streak += 1
            this.user.points += 10 // Daily streak bonus
            showNotification(`Streak bonus! +10 points. Current streak: ${this.user.streak} days`, {
              icon: '/icon-192x192.png'
            })
          } else if (daysSinceLastVisit > 1) {
            // Streak broken
            this.user.streak = 1
            this.user.points += 5 // Reset bonus
          }
          
          localStorage.setItem('morty_last_visit', today)
        }
        
        this.saveUser()
      } catch (error) {
        console.error('Failed to update streak:', error)
        this.error = 'Failed to update streak'
      }
    },

    // Add achievement
    async addAchievement(achievement: string) {
      if (!this.user) return
      
      try {
        const achievementsKey = 'morty_achievements'
        const achievements = JSON.parse(localStorage.getItem(achievementsKey) || '[]')
        
        if (!achievements.includes(achievement)) {
          achievements.push(achievement)
          localStorage.setItem(achievementsKey, JSON.stringify(achievements))
          
          // Bonus points for achievement
          await this.addPoints(50, `achievement_${achievement}`)
          
          // Track achievement
          if (useNuxtApp().$trackEvent) {
            useNuxtApp().$trackEvent('achievement_unlocked', {
              achievement,
              streak: this.user.streak,
              level: this.user.level
            })
          }
          
          showNotification(`Achievement Unlocked: ${achievement}! +50 points`, {
            icon: '/icon-192x192.png'
          })
        }
      } catch (error) {
        console.error('Failed to add achievement:', error)
        this.error = 'Failed to add achievement'
      }
    },

    // Save user to localStorage
    async saveUser() {
      try {
        if (this.user) {
          localStorage.setItem('morty_user', JSON.stringify(this.user))
        }
        this.error = null
      } catch (error) {
        console.error('Failed to save user:', error)
        this.error = 'Failed to save user'
      }
    },

    // Reset user data
    async resetUser() {
      try {
        this.user = null
        localStorage.removeItem('morty_user')
        localStorage.removeItem('morty_achievements')
        localStorage.removeItem('morty_last_visit')
        
        await this.createGuestUser()
        
        // Track reset
        if (useNuxtApp().$trackEvent) {
          useNuxtApp().$trackEvent('user_reset', {})
        }
      } catch (error) {
        console.error('Failed to reset user:', error)
        this.error = 'Failed to reset user'
      }
    }
  }
})

// Helper functions
function getExperienceForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1))
}

function getLevelFromExperience(experience: number): number {
  let level = 1
  while (experience >= getExperienceForLevel(level + 1)) {
    level++
  }
  return level
}

function calculateBadges(user: NonNullable<typeof useUserStore.$state.user>) {
  const badges = []
  
  // Level badges
  if (user.level >= 5) badges.push('Beginner Explorer')
  if (user.level >= 10) badges.push('Character Master')
  if (user.level >= 20) badges.push('Episode Expert')
  if (user.level >= 30) badges.push('Location Hunter')
  if (user.level >= 50) badges.push('Rick & Morty Legend')
  
  // Streak badges
  if (user.streak >= 7) badges.push('Week Warrior')
  if (user.streak >= 30) badges.push('Month Master')
  if (user.streak >= 100) badges.push('Year Champion')
  
  // Activity badges
  const totalViews = parseInt(localStorage.getItem('morty_views') || '0')
  if (totalViews >= 50) badges.push('Viewing Enthusiast')
  if (totalViews >= 200) badges.push('Character Collector')
  
  const totalSearches = parseInt(localStorage.getItem('morty_searches') || '0')
  if (totalSearches >= 25) badges.push('Search Specialist')
  
  const totalFavorites = parseInt(localStorage.getItem('morty_favorites') || '0')
  if (totalFavorites >= 10) badges.push('Favorite Fan')
  if (totalFavorites >= 25) badges.push('Character Curator')
  
  return badges
}