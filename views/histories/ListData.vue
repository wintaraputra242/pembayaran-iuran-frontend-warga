<script setup lang="ts">
import qris from '@images/pages/qris.png';
import { onMounted, ref } from 'vue';

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
            <VChip color="success" size="small">Berhasil</VChip>
          </div>
          <div class="mt-3">
            <VChip color="info" size="small" class="mb-1">Bulanan</VChip>
            <h4>Pembayaran Iuran Bulan Desember</h4>
            <p class="text-caption ma-0 mb-2">Periode Tahun 2025</p>
            <div>
              <h3 class="ma-0">Rp. 5.000</h3>
              <div class="ma-0 text-caption text-grey-600 d-flex align-center gap-1">
                <span>Desember,</span>
                <div>
                  <VIcon>ri-cash-line </VIcon>
                </div>
                <span>Tunai</span>
              </div>
            </div>
          </div>
        </VCardItem>
        <VCardActions class="px-4 pb-4">
          <div class="d-flex justify-end w-100">
            <VBtn variant="flat" size="small" color="secondary"  @click="emit('showBuktiBayar')"><VIcon class="me-1">ri-image-line</VIcon> Bukti Pembayaran</VBtn>
          </div>
        </VCardActions>
      </VCard>
    </VCol>
    <VCol cols="12">
      <VCard class="pa-0">
        <VCardItem class="pa-4">
          <div class="d-flex justify-space-between align-center">
            <span class="d-flex align-center gap-1" style="font-size: 12px;"> <VIcon>ri-time-line</VIcon> 12 Juni 2024 </span>
            <VChip color="success" size="small">Berhasil</VChip>
          </div>
          <div class="mt-3">
            <VChip color="error" size="small" class="mb-1">Kematian</VChip>
            <h4 class="mb-2">Iuran Kematian untuk Nyoman Gudeg</h4>
            <div>
              <h3 class="ma-0">Rp. 40.000</h3>
              <p class="ma-0 text-caption text-grey-600"> <VIcon>ri-exchange-line </VIcon> Tunai</p>
            </div>
          </div>
        </VCardItem>
      </VCard>
    </VCol>
    <VCol cols="12">
      <VCard class="pa-0">
        <VCardItem class="pa-4">
          <div class="d-flex justify-space-between align-center">
            <span class="d-flex align-center gap-1" style="font-size: 12px;"> <VIcon>ri-time-line</VIcon> 12 Juni 2024 </span>
            <VChip color="success" size="small">Berhasil</VChip>
          </div>
          <div class="mt-3">
            <VChip color="error" size="small" class="mb-1">Kematian</VChip>
            <h4 class="mb-2">Iuran Kematian untuk Putu Dueg</h4>
            <div>
              <h3 class="ma-0">Rp. 40.000</h3>
              <div class="ma-0 text-caption text-grey-600 d-flex align-center gap-1"> 
                <div>
                  <VImg :src="qris" width="24px" alt="qris logo" />
                </div>
                <span>QRIS</span>
              </div>
            </div>
          </div>
        </VCardItem>
      </VCard>
    </VCol>
    <VCol cols="12">
      <VCard class="pa-0">
        <VCardItem class="pa-4">
          <div class="d-flex justify-space-between align-center">
            <span class="d-flex align-center gap-1" style="font-size: 12px;"> <VIcon>ri-time-line</VIcon> 12 Juni 2024 </span>
            <VChip color="success" size="small">Berhasil</VChip>
          </div>
          <div class="mt-3">
            <VChip color="info" size="small" class="mb-1">Bulanan</VChip>
            <h4>Pembayaran Iuran Bulan Desember</h4>
            <p class="text-caption ma-0 mb-2">Periode Tahun 2025</p>
            <div>
              <h3 class="ma-0">Rp. 60.000</h3>
              <div class="ma-0 text-caption text-grey-600 d-flex align-center gap-1">
                <span>Januari - Desember,</span>
                <div>
                  <VIcon>ri-cash-line </VIcon>
                </div>
                <span>Tunai</span>
              </div>
            </div>
          </div>
        </VCardItem>
        <VCardActions class="px-4 pb-4">
          <div class="d-flex justify-end w-100">
            <VBtn variant="flat" size="small" color="secondary" @click="emit('showBuktiBayar')"><VIcon class="me-1" >ri-image-line</VIcon> Bukti Pembayaran</VBtn>
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
