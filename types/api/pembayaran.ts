// types/client-pembayaran.ts

import type { PaginatedResponse } from "../common"

export interface RiwayatPembayaran {
  id: number
  transaction_id: string
  judul_iuran: string
  jenis_iuran: 'bulanan' | 'kematian'
  jumlah_iuran_snapshot: number
  total_bayar: number
  bulan: number[] | null
  tanggal_bayar: string
  metode_bayar: string
  status_bayar: string
  note: string | null
  created_at: string
}

export interface PaymentPayload {
  id_informasi_iuran: number
  bulan?: number[]
  note?: string
}

export interface PaymentResponse {
  code: number
  success: boolean
  message: string
  data: {
    pembayaran: RiwayatPembayaran
    snap_token: string
  }
}

export interface GetRiwayatPembayaranResponse {
  code: number
  success: boolean
  message: string
  data: PaginatedResponse<RiwayatPembayaran>
}

export interface GetPaidMonthsResponse {
  code: number
  success: boolean
  message: string
  data: any
}
