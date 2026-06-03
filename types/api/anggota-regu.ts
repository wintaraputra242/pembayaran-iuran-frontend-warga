// types/client-anggota-regu.ts

export interface AnggotaRegu {
  nik: string
  nama_warga: string
  no_hp: string
  is_leader: boolean
  status_keaktifan: string
}

export interface ReguKetua {
  id: number
  name: string
}

export interface ReguDetail {
  id: number
  nama_regu: string
  status_keaktifan: string
  ketua: ReguKetua | null
  anggota: AnggotaRegu[]
  total_anggota: number
}

export interface GetAnggotaReguResponse {
  code: number
  success: boolean
  message: string
  data: {
    regu: ReguDetail
  }
}
