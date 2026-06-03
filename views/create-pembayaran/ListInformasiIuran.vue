<script lang="ts" setup>
import type { InformasiIuran } from '@/types/api/informasi-iuran';
import { useDisplay } from 'vuetify';

const emit = defineEmits<{
  (e: 'reload'): void;
  (e: 'showFormData'): void;
  (e: 'loadMore'): void
}>();

const props = defineProps<{
  items: InformasiIuran[] | null
  loading: boolean
  hasMore?: boolean
}>()

const router = useRouter()

const display = useDisplay()

// 🔥 MOBILE SENTINEL
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
      if (entry.isIntersecting && !props.loading) {
        emit('loadMore')
      }
    },
    {
      rootMargin: '100px',
    }
  )

  observer.observe(mobileSentinel.value)
}

onMounted(setupObserver)

onBeforeUnmount(() => {
  observer?.disconnect()
})

// 🔁 PASANG ULANG JIKA DATA BERUBAH
watch(
  () => props.items?.length,
  () => setupObserver()
)

watch(
  () => display.smAndDown.value,
  () => setupObserver()
)

const statusBayarColor = (status: string) => {
  switch (status) {
    case 'sudah_bayar': return 'success'
    case 'sebagian_bayar': return 'warning'
    default: return 'error'
  }
}

const statusBayarLabel = (status: string) => {
  switch (status) {
    case 'sudah_bayar': return 'Sudah Bayar'
    case 'sebagian_bayar': return 'Sebagian Bayar'
    default: return 'Belum Bayar'
  }
}
</script>

<template>
  <VRow>
    <template v-if="props.items?.length === 0 && loading">
      <div class="d-flex justify-center w-100 mt-4">
        <VProgressCircular indeterminate size="26" />
      </div>
    </template>

    <template v-if="props.items?.length === 0 && !loading">
      <div class="d-flex justify-center w-100 mt-4">
        Tidak ada data
      </div>
    </template>

    <template v-else>
      <VCol v-for="item in props.items" :key="item.id" cols="12" sm="6">
        <VCard class="mb-0" rounded="lg" border="sm" variant="elevated" position="relative" height="100%"
          style="padding-bottom: 65px;">
          <VCardTitle>
            <div class="d-flex justify-space-between gap-1">
              <div class="w-100">
                <h5 class="clamp-2" style="text-wrap: wrap;">{{ item.judul_iuran }}</h5>
                <p class="text-caption ma-0">
                  {{ formatDateID(item.created_at) }}
                </p>
              </div>

              <div class="d-flex flex-column align-end gap-1">
                <VChip size="x-small" :color="item.jenis_iuran === 'kematian' ? 'error' : 'info'">
                  {{ item.jenis_iuran === 'kematian' ? 'Kematian' : 'Bulanan' }}
                </VChip>

                <!-- Status bayar -->
                <VChip size="x-small" :color="statusBayarColor(item.status_bayar)">
                  {{ statusBayarLabel(item.status_bayar) }}
                </VChip>
              </div>
            </div>
          </VCardTitle>

          <VCardText class="px-4">
            <div class="mb-3">
              <p v-if="item.jenis_iuran === 'bulanan'" class="text-caption ma-0">
                Periode: {{ item.periode }}
              </p>

              <p v-if="item.jenis_iuran === 'kematian'" class="text-body-2 ma-0">
                Alm: <strong>{{ item.nama_warga_meninggal || '-' }}</strong>
              </p>

              <p v-if="item.jenis_iuran === 'kematian'" class="text-body-2 ma-0">
                PJ: <strong>{{ item.penanggung_jawab?.nama_warga || '-' }}</strong>
              </p>
            </div>

            <p class="pa-0 ma-0 text-caption">
              {{ item.keterangan }}
            </p>

            <div class="position-absolute" style="bottom: 12px; right: 12px;">
              <p class="pa-0 ma-0 mb-2 text-end font-weight-bold">
                Rp. {{ Number(item.jumlah_iuran).toLocaleString('id-ID') }}
              </p>

              <div class="d-flex justify-end">
                <template v-if="item.status_bayar === 'sudah_bayar'">
                  <p class="text-caption text-success ma-0">
                    <VIcon icon="ri-checkbox-circle-line" size="14" class="me-1" />
                    Dibayar {{ formatDateID(item.tanggal_bayar as string) }}
                  </p>
                </template>

                <template v-else-if="item.status_bayar === 'sebagian_bayar'">
                  <div class="d-flex flex-column align-end gap-1">
                    <p class="text-caption text-warning ma-0">
                      <VIcon icon="ri-time-line" size="14" class="me-1" />
                      {{ item.total_bulan_bayar }}/12 bulan terbayar
                    </p>
                    <VBtn variant="flat" size="small" color="warning"
                      @click="router.push('/create-pembayaran/' + item.id)">
                      <VIcon icon="ri-bank-card-line" class="me-2" />
                      Lanjut Bayar
                    </VBtn>
                  </div>
                </template>

                <!-- Belum bayar -->
                <template v-else>
                  <VBtn variant="flat" size="small" color="primary"
                    @click="router.push('/create-pembayaran/' + item.id)">
                    <VIcon icon="ri-bank-card-line" class="me-2" />
                    Bayar Sekarang
                  </VBtn>
                </template>
              </div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </template>
  </VRow>

  <div v-if="(props.items as []).length > 0 && hasMore" ref="mobileSentinel" style="height: 1px" />

  <div v-if="(props.items as []).length > 0 && loading" class="text-center py-4">
    <VProgressCircular indeterminate size="26" />
  </div>
</template>
