<script setup lang="ts">
import { onMounted, ref } from 'vue';
// import qris from '@images/pages/qris.png'

const emit = defineEmits<{
  (e: 'showHistoryPayment', item: object): void;
  (e: 'showBuktiBayar'): void;
}>();

// Dummy data simulasi API
const allDummyData = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  nama: `Warga #${i + 1}`,
  info: i % 2 === 0 ? 'Notifikasi belum dibaca' : 'Pembayaran berhasil',
  created_at: `2025-01-${String((i % 28) + 1).padStart(2, '0')}`,
}))

// State
const items = ref<any[]>([])
const page = ref(1)
const perPage = 20
const isLoading = ref(false)
const hasMore = ref(true)

const loadData = async () => {
  if (isLoading.value || !hasMore.value) return

  isLoading.value = true
  await new Promise(resolve => setTimeout(resolve, 500))

  const start = (page.value - 1) * perPage
  const end = page.value * perPage
  const newData = allDummyData.slice(start, end)

  items.value.push(...newData)
  page.value++

  if (end >= allDummyData.length) {
    hasMore.value = false
  }

  isLoading.value = false
}

const statusChipsColor = {
  'pending': 'info',
  'success': 'success',
  'failed': 'error',
  'expired': 'secondary',
  'cancelled': 'secondary',
}

let observer: IntersectionObserver

onMounted(() => {
  const sentinelWarga = document.getElementById('sentinelWarga')
  observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      loadData()
    }
  })

  if (sentinelWarga) observer.observe(sentinelWarga)

  // Initial load
  loadData()
})
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard class="pa-0">
        <VCardItem class="pa-4">
          <div class="d-flex justify-space-between align-center">
            <span class="d-flex align-center gap-1" style="font-size: 12px;"> <VIcon>ri-time-line</VIcon> 12 Juni 2024 </span>
            <VChip color="info" size="small">Bulanan</VChip>
          </div>
          <div class="mt-3">
            <h4>Pembayaran Iuran Bulan Desember</h4>
            <p class="text-caption ma-0 mb-2">Periode Tahun 2025</p>
            <p class="ma-0 text-caption text-grey-600">Saat ini telah memasuki bulan Desember 2025. Jangan lupa untuk segera melakukan pembayaran iuran bulan ini.</p>
          </div>
        </VCardItem>
        <VCardActions class="px-4 pb-4">
          <div class="d-flex justify-end w-100">
            <VBtn variant="flat" size="small" color="primary"><VIcon class="me-1">ri-cash-line</VIcon> Bayar Sekarang</VBtn>
          </div>
        </VCardActions>
      </VCard>
    </VCol>
    <VCol cols="12">
      <VCard class="pa-0">
        <VCardItem class="pa-4">
          <div class="d-flex justify-space-between align-center">
            <span class="d-flex align-center gap-1" style="font-size: 12px;"> <VIcon>ri-time-line</VIcon> 12 Juni 2024 </span>
            <VChip color="error" size="small">Kematian</VChip>
          </div>
          <div class="mt-3">
            <h4 class="mb-1">Iuran Kematian untuk Nyoman Gudeg</h4>
            <p class="ma-0 text-caption text-grey-600">Telah terjadi musibah duka di lingkungan kita. Mohon partisipasi warga untuk melakukan pembayaran iuran kematian sebagai bentuk kepedulian dan kebersamaan.</p>
          </div>
        </VCardItem>
        <VCardActions class="px-4 pb-4">
          <div class="d-flex justify-end w-100">
            <VBtn variant="flat" size="small" color="primary"><VIcon class="me-1">ri-cash-line</VIcon> Bayar Sekarang</VBtn>
          </div>
        </VCardActions>
      </VCard>
    </VCol>
    <VCol cols="12">
      <VCard class="pa-0">
        <VCardItem class="pa-4">
          <div class="d-flex justify-space-between align-center">
            <div>
              <span class="d-flex align-center gap-1 mb-1" style="font-size: 12px;"> <VIcon>ri-time-line</VIcon> 12 Juni 2024 </span>
              <span class="d-flex align-center gap-1" style="font-size: 12px;"> <VIcon>ri-send-plane-fill</VIcon> Ketua Regu A</span>
            </div>
            <VChip color="info" size="small">Bulanan</VChip>
          </div>
          <div class="mt-3">
            <h4>Pembayaran Iuran Bulan Desember</h4>
            <p class="text-caption ma-0 mb-2">Periode Tahun 2025</p>
            <p class="ma-0 text-caption text-grey-600">Mohon segera melakukan pembayaran iuran bulan Desember 2025. Anda tercatat belum melakukan pembayaran pada periode tersebut.</p>
          </div>
          <div class="mt-3 text-caption">
            <p class="ma-0 text-grey-900 font-weight-bold">Catatan dari Ketua Regu A:</p>
            <p class="ma-0 text-grey-600">Segera lakukan pembayarannya ya</p>
          </div>
        </VCardItem>
        <VCardActions class="px-4 pb-4">
          <div class="d-flex justify-end w-100">
            <VBtn variant="flat" size="small" color="primary"><VIcon class="me-1">ri-cash-line</VIcon> Bayar Sekarang</VBtn>
          </div>
        </VCardActions>
      </VCard>
    </VCol>
    <VCol cols="12">
      <VCard class="pa-0">
        <VCardItem class="pa-4">
          <div class="d-flex justify-space-between align-center">
            <div>
              <span class="d-flex align-center gap-1 mb-1" style="font-size: 12px;"> <VIcon>ri-time-line</VIcon> 12 Juni 2024 </span>
              <span class="d-flex align-center gap-1" style="font-size: 12px;"> <VIcon>ri-send-plane-fill</VIcon> Pengurus</span>
            </div>
            <VChip color="error" size="small">Kematian</VChip>
          </div>
          <div class="mt-3">
            <h4 class="mb-1">Iuran Kematian untuk Nyoman Gudeg</h4>
            <p class="ma-0 text-caption text-grey-600">Telah terjadi musibah duka di lingkungan kita. Mohon partisipasi warga untuk melakukan pembayaran iuran kematian sebagai bentuk kepedulian dan kebersamaan.</p>
          </div>
          <div class="mt-3 text-caption">
            <p class="ma-0 text-grey-900 font-weight-bold">Catatan dari Ketua Regu A:</p>
            <p class="ma-0 text-grey-600">Tolong lakukan pembayarann ya.</p>
          </div>
        </VCardItem>
        <VCardActions class="px-4 pb-4">
          <div class="d-flex justify-end w-100">
            <VBtn variant="flat" size="small" color="primary"><VIcon class="me-1">ri-cash-line</VIcon> Bayar Sekarang</VBtn>
          </div>
        </VCardActions>
      </VCard>
    </VCol>
  </VRow>
</template>

<style scoped>
.table-scroll-wrapper {
  max-height: 400px;   /* tinggi container */
  overflow-y: auto;
  overflow-x: hidden;
  height: 100%;
}
</style>
