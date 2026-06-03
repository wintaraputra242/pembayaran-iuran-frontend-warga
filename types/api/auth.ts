export interface AuthUser {
  id: number
  name: string
  username: string
  role: string
  warga: AuthWarga | null
}

export interface AuthWarga {
  nik: string
  nama_warga: string
  alamat: string
  no_hp: string
  status_keaktifan: string
}

export interface LoginResponse {
  data: {
    user: AuthUser
    access_token: string
    token_type: 'Bearer'
  }
  message: string
}

export interface CheckNikResponse {
  data: {
    has_password: boolean
  }
  message: string
}

export interface MeResponse {
  data: AuthUser
  message: string
}
