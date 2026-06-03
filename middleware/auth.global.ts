import { useAuth } from "@/composables/api/useAuth"

export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()

  const ignoredPaths = [
    /^\/\.well-known/,
    /^\/_nuxt/,
    /^\/dev-sw\.js$/,
    /^\/.*\.(json|js|css|map|ico|png|jpg|svg)$/,
  ]

  if (ignoredPaths.some((pattern) => pattern.test(to.path))) return

  if (import.meta.client && !authStore.token) {
    const token = localStorage.getItem('auth_token')
    if (token) authStore.setToken(token)
  }

  const isLoggedIn = !!authStore.token

  if (isLoggedIn && !authStore.fetched) {
    const { fetchUser } = useAuth()
    await fetchUser()
  }

  if (to.meta.guest) {
    if (!isLoggedIn) return
    if (to.path === '/') return
    return navigateTo('/')
  }

  if (!isLoggedIn) {
    if (to.path === '/login') return
    if (import.meta.client) {
      localStorage.setItem('redirect_after_login', to.path)
    }
    return navigateTo('/login')
  }
})
