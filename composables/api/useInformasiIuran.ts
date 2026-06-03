import type { GetInformasiIuranDetailResponse, GetInformasiIuranResponse } from '@/types/api/informasi-iuran'
import { useApi } from './useApi'

export const useInformasiIuran = () => {
  const { api } = useApi()

  const getIuranWithStatus = async (params?: {
    page?: number
    per_page?: number
    jenis_iuran?: string
    keyword?: string
    status_bayar?: 'sudah_bayar' | 'belum_bayar'
  }): Promise<GetInformasiIuranResponse> => {
    return await api('/informasi-iuran', {
      method: 'GET',
      params,
    })
  }

  const getDetail = async (id: string | number): Promise<GetInformasiIuranDetailResponse> => {
    return await api('/informasi-iuran/' + id, {
      method: 'GET',
    })
  }

  return {
    getIuranWithStatus,
    getDetail
  }
}
