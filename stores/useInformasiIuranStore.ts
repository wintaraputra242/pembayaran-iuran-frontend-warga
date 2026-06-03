import { useInformasiIuran } from '@/composables/api/useInformasiIuran'
import type { InformasiIuran } from '@/types/api/informasi-iuran'
import type { PaginationMeta } from '@/types/common'
import { defineStore } from 'pinia'

export const useInformasiIuranStore = defineStore('informasi-iuran', {
  state: () => ({
    iuranList: [] as any[],
    meta: null as PaginationMeta | null,
    loading: false,
    reload: false,
    page: 0,
    iuranItem: null as InformasiIuran | null,

    filters: {
      keyword: '',
      jenis_iuran: '',
      status_bayar: '' as 'sudah_bayar' | 'belum_bayar' | '',
    },
  }),

  getters: {
    hasData: (state) => state.iuranList.length > 0,
    hasMore: (state) => state.meta?.total !== state.iuranList.length,
    hasFilter: (state) =>
      !!state.filters.keyword ||
      !!state.filters.jenis_iuran ||
      !!state.filters.status_bayar,
  },

  actions: {
    async fetchIuranWithStatus(params?: {
      page?: number
      per_page?: number
      jenis_iuran?: string
    }) {
      if (this.reload) {
        this.iuranList = []
        this.reload = false
      }

      const api = useInformasiIuran()
      this.loading = true

      try {
        const newFilter: Record<string, string> = {}

        Object.entries(this.filters).forEach(([key, value]) => {
          if (value) {
            newFilter[key] = value
          }
        })

        const res = await api.getIuranWithStatus({
          page: params?.page,
          per_page: params?.per_page,
          jenis_iuran: params?.jenis_iuran,
          ...newFilter,
        })

        this.iuranList = [...this.iuranList, ...res.data.data]

        const { data, ...meta } = res.data
        this.meta = meta

        this.page = params?.page as number
      } finally {
        this.loading = false
      }
    },

    async fetchDetail(id: string | number) {

      const api = useInformasiIuran()
      this.loading = true

      try {
        const res = await api.getDetail(id)

        this.iuranItem = res.data
      } finally {
        this.loading = false
      }
    },

    setFilter(key: keyof typeof this.filters, value: string) {
      this.filters[key] = value as any
    },

    resetFilter() {
      this.filters = {
        keyword: '',
        jenis_iuran: '',
        status_bayar: '',
      }
    },
  },
})
