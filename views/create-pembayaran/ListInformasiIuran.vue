<script lang="ts" setup>
import type { InformasiIuran } from '@/types/api/informasi-iuran';
import { useDisplay } from 'vuetify';

const emit = defineEmits<{
  (e: 'reload'): void
  (e: 'showFormData'): void
  (e: 'loadMore'): void
}>()

const props = defineProps<{
  items: InformasiIuran[] | null
  loading: boolean
  hasMore?: boolean
  keyword?: string // ← tambah prop keyword
}>()

const router = useRouter()
const display = useDisplay()

// ── Mobile Sentinel ───────────────────────────────────────────────
const mobileSentinel = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

const setupObserver = async () => {
  if (!display.smAndDown.value) return
  if (!props.hasMore || props.loading) return

  await nextTick()
  if (!mobileSentinel.value) return

  observer?.disconnect()
  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && !props.loading) emit('loadMore')
    },
    { rootMargin: '100px' }
  )
  observer.observe(mobileSentinel.value)
}

watch(mobileSentinel, (el) => {
  if (el) setupObserver()
})

// onMounted(setupObserver)
onBeforeUnmount(() => observer?.disconnect())
watch(() => props.items?.length, () => setupObserver())
watch(() => display.smAndDown.value, () => setupObserver())

// ── Status helpers ────────────────────────────────────────────────
const statusBayarColor = (status: string) => {
  const map: Record<string, string> = {
    sudah_bayar: 'success',
    approved: 'success',
    sebagian_bayar: 'warning',
    belum_bayar: 'error',
    pending: 'info',
    rejected: 'error',
  }
  return map[status] ?? 'secondary'
}

const statusBayarLabel = (status: string) => {
  const map: Record<string, string> = {
    sudah_bayar: 'Lunas',
    approved: 'Diterima',
    sebagian_bayar: 'Sebagian Bayar',
    belum_bayar: 'Belum Bayar',
    pending: 'Menunggu Validasi',
    rejected: 'Ditolak',
  }
  return map[status] ?? status
}

// Chip status untuk breakdown bulanan pending
const hasPendingBulan = (item: InformasiIuran) =>
  (item.total_bulan_pending ?? 0) > 0

const hasRejectedBulan = (item: InformasiIuran) =>
  (item.bulan_rejected?.length ?? 0) > 0

const highlight = (text: string | null | undefined): string => {
  if (!text) return '-'
  if (!props.keyword?.trim()) return text

  const escaped = props.keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escaped})`, 'gi')

  return text.replace(
    regex,
    '<mark style="background: rgba(var(--v-theme-warning), 0.35); color: inherit; border-radius: 2px; padding: 0 2px;">$1</mark>'
  )
}
</script>

<template>
  <VRow>

    <!-- Loading awal -->
    <template v-if="props.items?.length === 0 && loading">
      <div class="d-flex justify-center w-100 mt-4">
        <VProgressCircular indeterminate size="26" />
      </div>
    </template>

    <!-- Kosong -->
    <template v-else-if="props.items?.length === 0 && !loading">
      <div class="d-flex justify-center w-100 mt-4">
        Tidak ada data
      </div>
    </template>

    <!-- List -->
    <template v-else>
      <VCol v-for="item in props.items" :key="item.id" cols="12" sm="6">
        <VCard class="mb-0 d-flex flex-column" rounded="lg" border="sm" variant="elevated" position="relative"
          height="100%">
          <VCardTitle>
            <div class="d-flex justify-space-between gap-1">
              <div class="w-100">
                <h5 class="clamp-2" style="text-wrap: wrap;" v-html="highlight(item.judul_iuran)" />
                <p class="text-caption ma-0">{{ formatDateID(item.created_at) }}</p>
              </div>

              <div class="d-flex flex-column align-end gap-1">
                <!-- Jenis Iuran -->
                <VChip size="x-small" :color="item.jenis_iuran === 'kematian' ? 'error' : 'info'">
                  {{ item.jenis_iuran === 'kematian' ? 'Kematian' : 'Bulanan' }}
                </VChip>

                <!-- Status Bayar -->
                <VChip size="x-small" :color="statusBayarColor(item.status_bayar)">
                  {{ statusBayarLabel(item.status_bayar) }}
                </VChip>
              </div>
            </div>
          </VCardTitle>

          <VCardText class="px-4">
            <div class="mb-3">
              <!-- Periode (bulanan) -->
              <p v-if="item.jenis_iuran === 'bulanan'" class="text-caption ma-0">
                Periode: <span v-html="highlight(String(item.periode))" />
              </p>

              <!-- Nama almarhum (kematian) -->
              <p v-if="item.jenis_iuran === 'kematian'" class="text-body-2 ma-0">
                Alm: <strong v-html="highlight(item.nama_warga_meninggal || '-')" />
              </p>

              <!-- Penanggung jawab (kematian) -->
              <p v-if="item.jenis_iuran === 'kematian'" class="text-body-2 ma-0">
                PJ: <strong v-html="highlight(item.penanggung_jawab?.nama_warga || '-')" />
              </p>
            </div>

            <p class="pa-0 ma-0 text-caption">{{ item.keterangan }}</p>

            <!-- Rejection reason — non-bulanan -->
            <VAlert v-if="item.jenis_iuran !== 'bulanan' && item.status_bayar === 'rejected' && item.rejection_reason"
              type="error" variant="tonal" density="compact" class="mt-2">
              <p class="text-caption ma-0">
                <strong>Alasan penolakan:</strong> {{ item.rejection_reason }}
              </p>
            </VAlert>

          </VCardText>

          <!-- Bottom section -->
          <VCardActions class="px-4 pb-3 pt-0" style="min-height: 80px;">
            <div class="position-absolute" style="bottom: 12px; right: 12px; left: 12px;">
              <p class="pa-0 ma-0 mb-2 text-end font-weight-bold">
                Rp. {{ Number(item.jumlah_iuran).toLocaleString('id-ID') }}
              </p>

              <div class="d-flex justify-end">

                <!-- NON-BULANAN -->
                <template v-if="item.jenis_iuran !== 'bulanan'">
                  <template v-if="item.status_bayar === 'approved' || item.status_bayar === 'sudah_bayar'">
                    <p class="text-caption text-success ma-0 d-flex align-center">
                      <VIcon icon="ri-checkbox-circle-line" size="14" class="me-1" />
                      Diterima {{ formatDateID(item.tanggal_bayar as string) }}
                    </p>
                  </template>

                  <template v-else-if="item.status_bayar === 'pending'">
                    <p class="text-caption text-info ma-0 d-flex align-center">
                      <VIcon icon="ri-time-line" size="14" class="me-1" />
                      Menunggu validasi pengurus
                    </p>
                  </template>

                  <template v-else-if="item.status_bayar === 'rejected'">
                    <VBtn variant="flat" size="small" color="error"
                      @click="router.push('/create-pembayaran/' + item.id)">
                      <VIcon icon="ri-refresh-line" class="me-2" />
                      Submit Ulang
                    </VBtn>
                  </template>

                  <template v-else>
                    <VBtn variant="flat" size="small" color="primary"
                      @click="router.push('/create-pembayaran/' + item.id)">
                      <VIcon icon="ri-bank-card-line" class="me-2" />
                      Bayar Sekarang
                    </VBtn>
                  </template>
                </template>

                <!-- BULANAN -->
                <template v-else>
                  <template v-if="item.status_bayar === 'sudah_bayar'">
                    <p class="text-caption text-success ma-0 d-flex align-center">
                      <VIcon icon="ri-checkbox-circle-line" size="14" class="me-1" />
                      Lunas {{ item.total_bulan_approved }}/{{ item.total_bulan_wajib ?? 12 }} bulan
                    </p>
                  </template>

                  <template v-else-if="item.status_bayar === 'sebagian_bayar'">
                    <div class="d-flex flex-column align-end gap-1">
                      <div class="d-flex gap-1 flex-wrap justify-end">
                        <VChip size="x-small" color="success" variant="tonal">
                          <VIcon icon="ri-checkbox-circle-line" size="12" class="me-1" />
                          {{ item.total_bulan_approved }} bulan diterima
                        </VChip>
                        <VChip v-if="hasPendingBulan(item)" size="x-small" color="info" variant="tonal">
                          <VIcon icon="ri-time-line" size="12" class="me-1" />
                          {{ item.total_bulan_pending }} bulan menunggu
                        </VChip>
                        <VChip v-if="hasRejectedBulan(item)" size="x-small" color="error" variant="tonal">
                          <VIcon icon="ri-close-circle-line" size="12" class="me-1" />
                          {{ item.bulan_rejected?.length }} bulan ditolak
                        </VChip>
                      </div>
                      <VBtn variant="flat" size="small" color="warning"
                        @click="router.push('/create-pembayaran/' + item.id)">
                        <VIcon icon="ri-bank-card-line" class="me-2" />
                        Lanjut Bayar
                      </VBtn>
                    </div>
                  </template>

                  <template v-else-if="item.status_bayar === 'belum_bayar' && hasPendingBulan(item)">
                    <p class="text-caption text-info ma-0 d-flex align-center">
                      <VIcon icon="ri-time-line" size="14" class="me-1" />
                      Menunggu validasi pengurus
                    </p>
                  </template>

                  <template v-else>
                    <VBtn variant="flat" size="small" color="primary"
                      @click="router.push('/create-pembayaran/' + item.id)">
                      <VIcon icon="ri-bank-card-line" class="me-2" />
                      Bayar Sekarang
                    </VBtn>
                  </template>
                </template>

              </div>
            </div>
          </VCardActions>
        </VCard>
      </VCol>
    </template>

  </VRow>

  <div v-if="(props.items as []).length > 0 && hasMore" ref="mobileSentinel" style="height: 1px" />

  <div v-if="(props.items as []).length > 0 && loading" class="text-center py-4">
    <VProgressCircular indeterminate size="26" />
  </div>
</template>
