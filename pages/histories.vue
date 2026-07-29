<script setup lang="ts">
import { usePembayaranStore } from '@/stores/usePembayaranStore'
import DataTableHistories from '@/views/histories/ListData.vue'

const pembayaranStore = usePembayaranStore()
const showPaymentProof = ref(false)
const selectedBuktiBayar = ref<string | null>(null)

const handleShowBuktiBayar = (src: string) => {
  selectedBuktiBayar.value = src
  showPaymentProof.value = true
}

watch(() => pembayaranStore.filters.tanggal, async (val) => {
  // Handle semua kondisi — array lengkap, kosong, null, atau undefined
  if (val?.length === 2 || !val || val?.length === 0) {
    pembayaranStore.reload = true
    pembayaranStore.riwayatList = []
    await pembayaranStore.fetchRiwayat({ page: 1 })
  }
}, { deep: true })

onMounted(async () => {
  pembayaranStore.reload = true
  await pembayaranStore.fetchRiwayat({ page: 1 })
})
</script>

<template>
  <div>
    <div class="mb-4">
      <h2>Riwayat</h2>
      <span>Menampilkan informasi riwayat pembayaran yang telah dilakukan.</span>
    </div>

    <div class="py-3">
      <DatePicker v-model="pembayaranStore.filters.tanggal" placeholder="Pilih tgl. pembayaran" :enable-time="false"
        range clearable />
    </div>

    <DataTableHistories :items="pembayaranStore.riwayatList" :loading="pembayaranStore.loading"
      :has-more="!!pembayaranStore.meta?.next_page_url" @show-bukti-bayar="handleShowBuktiBayar"
      @load-more="pembayaranStore.fetchRiwayat({ page: pembayaranStore.page + 1 })" />

    <PaymentProofImageDialog v-model="showPaymentProof" :src="selectedBuktiBayar ?? ''" />
  </div>
</template>
