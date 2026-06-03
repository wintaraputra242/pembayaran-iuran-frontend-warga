import type { CheckNikResponse, LoginResponse, MeResponse } from "@/types/api/auth"
import { useApi } from "./useApi"

export const useAuth = () => {
  const { api } = useApi()
  const authStore = useAuthStore()
  const uiStore = useUiStore()
  const router = useRouter()

  const checkNik = async (payload: { nik: string }): Promise<CheckNikResponse> => {
    const res = await api<CheckNikResponse>('/auth/check-nik', {
      method: 'POST',
      body: payload,
    })
    return res
  }

  const login = async (payload: { nik: string; password: string; fcm_token?: string, platform?: string }): Promise<LoginResponse> => {
    const res = await api<LoginResponse>('/auth/login', {
      method: 'POST',
      body: payload,
    })

    authStore.setToken(res.data.access_token)
    authStore.setUser(res.data.user)

    return res
  }

  const fetchUser = async () => {
    uiStore.startLoading()

    try {
      const res: MeResponse = await api('/auth/profile')
      authStore.setUser((res.data as any)?.user)
      uiStore.endLoading()
      return true
    } catch {
      authStore.logout()
      uiStore.endLoading()
      return false
    }
  }

  const logout = async () => {
    try {
      await api('/auth/logout', { method: 'POST' })
    } finally {
      authStore.logout()
      router.push('/login')
    }
  }

  const updateProfile = async (body: {
    nama_warga?: string
    alamat?: string
    no_hp?: string
    password?: string
    password_confirmation?: string
  }): Promise<any> => {
    const res = await api('/auth/update-profile', {
      method: 'PUT',
      body,
    })
    return res
  }


  return { checkNik, login, logout, fetchUser, updateProfile }
}
