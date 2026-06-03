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
  manual: { color: 'success', label: 'Berhasil' },
  pending: { color: 'warning', label: 'Pending' },
  waiting_payment: { color: 'info', label: 'Menunggu Bayar' },
  failed: { color: 'error', label: 'Gagal' },
  expired: { color: 'secondary', label: 'Kedaluwarsa' },
}

const metodeBayarConfig: Record<string, { icon: string; label: string }> = {
  transfer: { icon: 'ri-bank-line', label: 'Transfer' },
  tunai: { icon: 'ri-cash-line', label: 'Tunai' },
  qris: { icon: 'ri-qr-code-line', label: 'QRIS' },
}

onMounted(() => {
  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && props.hasMore && !props.loading) {
      emit('loadMore')
    }
  })
  if (sentinel.value) observer.observe(sentinel.value)
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

        </VCardItem>

        <!-- Bukti bayar -->
        <template v-if="['paid', 'manual'].includes(item.status_bayar) && item.bukti_bayar">
          <VCardActions class="px-4 pb-3 pt-0">
            <VBtn variant="tonal" size="small" color="secondary" block prepend-icon="ri-image-line"
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
