import { useApi } from './useApi'
import type { GetAnggotaReguResponse } from '@/types/api/anggota-regu'

export const useAnggotaRegu = () => {
  const { api } = useApi()

  const getAnggotaRegu = async (): Promise<GetAnggotaReguResponse> => {
    return await api('/anggota-regu', {
      method: 'GET',
    })
  }

  return {
    getAnggotaRegu,
  }
}
