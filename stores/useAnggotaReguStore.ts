import { useAnggotaRegu } from '@/composables/api/useAnggotaRegu'
import type { ReguDetail } from '@/types/api/anggota-regu'
import { defineStore } from 'pinia'

export const useAnggotaReguStore = defineStore('anggota-regu', {
  state: () => ({
    regu: null as ReguDetail | null,
    loading: false,
  }),

  getters: {
    hasData: (state) => !!state.regu,
    anggotaList: (state) => state.regu?.anggota ?? [],
    totalAnggota: (state) => state.regu?.total_anggota ?? 0,
  },

  actions: {
    async fetchAnggotaRegu() {
      const composable = useAnggotaRegu()
      this.loading = true

      try {
        const res = await composable.getAnggotaRegu()
        this.regu = res.data.regu
      } finally {
        this.loading = false
      }
    },
  },
})

