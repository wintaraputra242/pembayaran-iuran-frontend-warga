// types/client-informasi-iuran.ts

import type { PaginatedResponse } from "../common"

export interface InformasiIuran {
  id: number
  judul_iuran: string
  jenis_iuran: 'bulanan' | 'kematian'
  jumlah_iuran: number
  periode: string | null
  status_aktif: number
  status_bayar: 'sudah_bayar' | 'belum_bayar' | 'sebagian_bayar'
  tanggal_bayar: string | null
  id_pembayaran: number | null
  nama_warga_meninggal: string
  created_at: string
  keterangan: string
  total_bulan_bayar: string | number
  penanggung_jawab: {
    nik: string
    nama_warga: string
  } | null
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
