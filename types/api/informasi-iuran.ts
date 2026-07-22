// types/client-informasi-iuran.ts

import type { PaginatedResponse } from "../common"

// types/api/informasi-iuran.ts

export interface InformasiIuran {
  id: number
  judul_iuran: string
  jenis_iuran: 'kematian' | 'bulanan'
  jumlah_iuran: number
  periode?: string
  nama_warga_meninggal?: string
  keterangan?: string
  status_aktif: number
  created_at: string
  penanggung_jawab?: {
    nik: string
    nama_warga: string
  }
  status_bayar: 'sudah_bayar' | 'sebagian_bayar' | 'belum_bayar' | 'approved' | 'pending' | 'rejected'
  tanggal_bayar?: string
  id_pembayaran?: number
  rejection_reason?: string
  bulan_approved?: number[]
  bulan_pending?: number[]
  bulan_rejected?: number[]
  total_bulan_approved?: number
  total_bulan_pending?: number
  total_bulan_terhitung?: number
}

export interface GetInformasiIuranResponse {
  code: number
  success: boolean
  message: string
  data: PaginatedResponse<InformasiIuran>
}

export interface GetInformasiIuranDetailResponse {
  code: number
  success: boolean
  message: string
  data: InformasiIuran
}
