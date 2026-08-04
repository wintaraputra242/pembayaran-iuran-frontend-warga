<script setup lang="ts">
const props = defineProps<{
  items: any[]
  loading: boolean
  hasMore: boolean
}>()

const emit = defineEmits<{
  (e: 'showBuktiBayar', src: string): void
  (e: 'loadMore'): void
}>()

const sentinel = ref<HTMLElement | null>(null)

const monthNames = [
  '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

const formatBulan = (bulan: number[]) => {
  return bulan.map(b => monthNames[b]).join(', ')
}

const statusConfig: Record<string, { color: string; label: string }> = {
  paid: { color: 'success', label: 'Berhasil' },
  approved: { color: 'success', label: 'Diterima' },
  manual: { color: 'success', label: 'Berhasil' },
  pending: { color: 'warning', label: 'Menunggu Validasi' },
  waiting_payment: { color: 'info', label: 'Menunggu Bayar' },
  failed: { color: 'error', label: 'Gagal' },
  expired: { color: 'secondary', label: 'Kedaluwarsa' },
  rejected: { color: 'error', label: 'Ditolak' },
  cancelled: { color: 'secondary', label: 'Dibatalkan' }, // ← tambah
}

const metodeBayarConfig: Record<string, { icon: string; label: string }> = {
  transfer: { icon: 'ri-bank-line', label: 'Transfer' },
  tunai: { icon: 'ri-cash-line', label: 'Tunai' },
  qris: { icon: 'ri-qr-code-line', label: 'QRIS' },
}

let observer: IntersectionObserver | null = null

const setupObserver = () => {
  if (!sentinel.value) return

  observer?.disconnect()

  observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && props.hasMore && !props.loading) {
      emit('loadMore')
    }
  }, { rootMargin: '100px' })

  observer.observe(sentinel.value)
}

watch(sentinel, (el) => {
  if (el) setupObserver()
})

watch(() => props.hasMore, () => {
  setupObserver()
})

onUnmounted(() => {
  observer?.disconnect()
})

</script>

<template>
  <VRow>
    <!-- Empty state -->
    <template v-if="items.length === 0 && !loading">
      <VCol cols="12">
        <div class="d-flex justify-center mt-4 text-medium-emphasis">
          Tidak ada riwayat pembayaran.
        </div>
      </VCol>
    </template>

    <!-- List -->
    <VCol v-for="item in items" :key="item.id" cols="12" sm="6">
      <VCard rounded="lg" border="sm" variant="elevated" height="100%">
        <VCardItem class="pa-4">

          <!-- Header -->
          <div class="d-flex justify-space-between align-center mb-3">
            <VChip :color="item.jenis_iuran === 'kematian' ? 'error' : 'info'" size="x-small" variant="tonal">
              {{ item.jenis_iuran === 'kematian' ? 'Kematian' : 'Bulanan' }}
            </VChip>

            <VChip :color="statusConfig[item.status_bayar]?.color ?? 'secondary'" size="x-small" variant="tonal">
              {{ statusConfig[item.status_bayar]?.label ?? item.status_bayar }}
            </VChip>
          </div>

          <!-- Judul -->
          <h5 class="mb-1 clamp-2" style="text-wrap: wrap; line-height: 1.4;">
            {{ item.judul_iuran }}
          </h5>

          <!-- Bulan -->
          <p v-if="item.jenis_iuran === 'bulanan' && item.bulan?.length"
            class="text-caption text-medium-emphasis ma-0 mt-1">
            {{ formatBulan(item.bulan) }}
          </p>

          <VDivider class="my-3" />

          <!-- Footer: total & metode -->
          <div class="d-flex justify-space-between align-center">
            <div>
              <p class="text-caption text-medium-emphasis ma-0">Total Bayar</p>
              <h4 class="ma-0">{{ formatRupiah(item.total_bayar) }}</h4>
              <p v-if="item.jenis_iuran === 'bulanan' && item.bulan?.length > 1"
                class="text-caption text-medium-emphasis ma-0">
                {{ item.bulan.length }} bln × {{ formatRupiah(item.jumlah_iuran_snapshot) }}
              </p>
            </div>

            <div class="text-end">
              <div class="d-flex align-center justify-end gap-1 text-caption text-medium-emphasis">
                <VIcon size="13">{{ metodeBayarConfig[item.metode_bayar]?.icon ?? 'ri-money-dollar-circle-line' }}
                </VIcon>
                <span>{{ metodeBayarConfig[item.metode_bayar]?.label ?? item.metode_bayar }}</span>
              </div>
              <p class="text-caption text-medium-emphasis ma-0 mt-1">
                <VIcon size="13" class="me-1">ri-time-line</VIcon>
                {{ formatDateID(item.created_at) }}
              </p>
              <!-- Diinput oleh -->
              <p v-if="item.diinput_oleh" class="text-caption text-medium-emphasis ma-0 mt-1">
                <VIcon size="13" class="me-1">ri-user-line</VIcon>
                {{ item.diinput_oleh }}
              </p>
            </div>
          </div>

          <!-- Note -->
          <template v-if="item.note">
            <VDivider class="my-3" />
            <p class="text-caption text-medium-emphasis ma-0">
              <VIcon size="13" class="me-1">ri-sticky-note-line</VIcon>
              {{ item.note }}
            </p>
          </template>

          <!-- Rejection reason -->
          <template v-if="item.status_bayar === 'rejected' && item.rejection_reason">
            <VDivider class="my-3" />
            <VAlert type="error" variant="tonal" density="compact">
              <p class="text-caption ma-0">
                <strong>Alasan penolakan:</strong> {{ item.rejection_reason }}
              </p>
            </VAlert>
          </template>

          <!-- Cancellation reason — tambah ini -->
          <template v-if="item.status_bayar === 'cancelled' && item.rejection_reason">
            <VDivider class="my-3" />
            <VAlert type="warning" variant="tonal" density="compact">
              <p class="text-caption ma-0">
                <strong>Alasan pembatalan:</strong> {{ item.rejection_reason }}
              </p>
            </VAlert>
          </template>

        </VCardItem>

        <!-- Bukti bayar -->
        <template
          v-if="['approved', 'pending', 'rejected', 'cancelled'].includes(item.status_bayar) && item.bukti_bayar">
          <VCardActions class="px-4 pb-3 pt-0">
            <VBtn variant="flat" size="small" color="secondary" block prepend-icon="ri-image-line"
              @click="emit('showBuktiBayar', item.bukti_bayar)">
              Bukti Pembayaran
            </VBtn>
          </VCardActions>
        </template>
      </VCard>
    </VCol>

    <!-- Sentinel -->
    <div ref="sentinel" style="height: 1px;" />

    <!-- Loading -->
    <VCol v-if="loading" cols="12">
      <div class="d-flex justify-center py-4">
        <VProgressCircular indeterminate size="26" />
      </div>
    </VCol>
  </VRow>
</template>
