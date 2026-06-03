export default defineNuxtPlugin(() => {
  const authStore = useAuthStore()

  const token = localStorage.getItem('auth_token')
  if (token) {
    authStore.setToken(token)
  }
})
