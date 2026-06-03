import { usePembayaran } from '@/composables/api/usePembayaran'
import type { RiwayatPembayaran } from '@/types/api/pembayaran'
import type { PaginationMeta } from '@/types/common'
import { defineStore } from 'pinia'

export const usePembayaranStore = defineStore('pembayaran', {
  state: () => ({
    riwayatList: [] as RiwayatPembayaran[],
    monthsList: null as any,
    meta: null as PaginationMeta | null,
    loading: false,
    reload: false,
    page: 0,

    filters: {
      keyword: '',
      status_bayar: '',
      jenis_iuran: '',
      tanggal: [] as string[],
    },

  }),

  getters: {
    hasData: (state) => state.riwayatList.length > 0,
    hasMore: (state) => state.meta ? state.riwayatList.length < state.meta.total : false,
    hasFilter: (state) =>
      !!state.filters.keyword ||
      !!state.filters.status_bayar ||
      !!state.filters.jenis_iuran,
    paidMonthsForIuran: (state) => (idInformasiIuran: number): number[] => {
      const iuran = state.monthsList?.find(
        (item: any) => item.id_informasi_iuran === idInformasiIuran
      )
      return iuran?.bulan_sudah_bayar ?? []
    }

  },

  actions: {
    async fetchRiwayat(params?: {
      page?: number
      per_page?: number
    }) {
      if (this.reload) {
        this.riwayatList = []
        this.reload = false
      }

      const composable = usePembayaran()
      this.loading = true

      try {
        const newFilter: Record<string, any> = {}

        Object.entries(this.filters).forEach(([key, value]) => {
          if (key === 'tanggal') return // skip, handle manual
          if (value) newFilter[key] = value
        })

        if (this.filters.tanggal?.length === 2) {
          newFilter.start_date = new Date(this.filters.tanggal[0]).toISOString().split('T')[0]
          newFilter.end_date = new Date(this.filters.tanggal[1]).toISOString().split('T')[0]
        }

        console.log(this.filters)

        const res = await composable.getRiwayat({
          page: params?.page,
          per_page: params?.per_page,
          ...newFilter,
        })

        this.riwayatList = [...this.riwayatList, ...res.data.data]

        const { data, ...meta } = res.data
        this.meta = meta

        this.page = params?.page as number
      } finally {
        this.loading = false
      }
    },

    async fetchPayment(body: {
      id_informasi_iuran: number
      bulan?: number[]
      note?: string
    }) {
      const composable = usePembayaran()
      this.loading = true

      try {
        const res = await composable.payment(body)
        return res
      } finally {
        this.loading = false
      }
    },

    async fetchPaidMonths() {
      const composable = usePembayaran()
      this.loading = true

      try {
        const res = await composable.getPaidMonths()
        this.monthsList = res?.data
      } finally {
        this.loading = false
      }
    },

    setFilter(key: keyof typeof this.filters, value: string | any) {
      this.filters[key] = value
    },

    resetFilter() {
      this.filters = {
        keyword: '',
        status_bayar: '',
        jenis_iuran: '',
        tanggal: [] as string[],
      }
    },
  },
})


