import type { GetPaidMonthsResponse, GetQrisResponse, GetRiwayatPembayaranResponse, PaymentResponse } from '@/types/api/pembayaran'
import { useApi } from './useApi'

export const usePembayaran = () => {
  const { api } = useApi()

  const payment = async (body: FormData): Promise<PaymentResponse> => {
    return await api<PaymentResponse>('/pembayaran', {
      method: 'POST',
      body,
    })
  }

  const getRiwayat = async (params?: {
    page?: number
    per_page?: number
    status_bayar?: string
    jenis_iuran?: string
    keyword?: string
    start_date?: string
    end_date?: string
  }): Promise<GetRiwayatPembayaranResponse> => {
    return await api('/pembayaran/riwayat', {
      method: 'GET',
      params,
    })
  }

  const getQris = async (): Promise<GetQrisResponse> => {
    return await api('/qris', {
      method: 'GET',
    })
  }

  const getPaidMonths = async (): Promise<GetPaidMonthsResponse> => {
    return await api('/pembayaran/paid-months', {
      method: 'GET',
    })
  }

  return {
    payment,
    getQris,
    getRiwayat,
    getPaidMonths
  }
}
