import { useAuth } from "@/composables/api/useAuth"
import type { AuthUser } from "@/types/api/auth"
import { defineStore } from "pinia"

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as AuthUser | null,
    fetched: false,
    token: import.meta.client ? (localStorage.getItem('auth_token') ?? '') : '',
    loading: false,
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
  },

  actions: {
    setUser(user: AuthUser) {
      this.user = user
      this.fetched = true
    },

    setToken(token: string) {
      this.token = token
      if (import.meta.client) {
        localStorage.setItem('auth_token', token)
      }
    },

    async logout() {
      if (this.loading) return // ← guard, hindari double call
      this.loading = true

      const composable = useAuth()

      try {
        await composable.logout()
      } finally {
        this.loading = false
        this.user = null
        this.token = ''
        this.fetched = false
        if (import.meta.client) {
          localStorage.removeItem('auth_token')
        }
      }
    },


    async updateProfile(body: any) {
      const composable = useAuth()
      this.loading = true

      try {
        const res = await composable.updateProfile(body)
        if (res?.data?.user) {
          this.user = res.data.user
        }
        return res
      } finally {
        this.loading = false
      }
    }
  },
})
