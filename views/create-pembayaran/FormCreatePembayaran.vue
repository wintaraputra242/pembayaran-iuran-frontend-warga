<script lang="ts" setup>
import { useApi } from '@/composables/api/useApi';

const emit = defineEmits<{
  (e: 'success'): void
  (e: 'close'): void
}>()

const props = defineProps<{
  item: {
    id: number
    judul_iuran: string
    jenis_iuran: string
    jumlah_iuran: number
  } | null
}>()

const pembayaranStore = usePembayaranStore()
const form = ref(null)
const showQrisDialog = ref(false)
const buktiPembayaran = ref<File | null>(null)
const isErrorSubmit = ref(false)

const defaultParams = {
  bulan: [] as number[],
  note: '',
  metode_bayar: '' as 'transfer' | 'qris' | '',
}
const params = reactive({ ...defaultParams })

const months = [
  { label: 'Januari', value: 1 },
  { label: 'Februari', value: 2 },
  { label: 'Maret', value: 3 },
  { label: 'April', value: 4 },
  { label: 'Mei', value: 5 },
  { label: 'Juni', value: 6 },
  { label: 'Juli', value: 7 },
  { label: 'Agustus', value: 8 },
  { label: 'September', value: 9 },
  { label: 'Oktober', value: 10 },
  { label: 'November', value: 11 },
  { label: 'Desember', value: 12 },
]

const paidMonths = computed<number[]>(() => {
  const item = props.item
  console.log(item)

  if (!item) return []

  const approved = item.bulan_approved ?? []
  const pending = item.bulan_pending ?? []

  // Approved + pending = disable
  return [...new Set([...approved, ...pending])]
})

watch(paidMonths, (paid) => {
  // Reset bulan ke hanya paid months, user pilih sendiri bulan lainnya
  params.bulan = [...paid]
}, { immediate: true })


const isBulanan = computed(() => props.item?.jenis_iuran === 'bulanan')

const bulanBelumBayar = computed(() =>
  params.bulan.filter(b => {
    const month = monthsWithStatus.value.find(m => m.value === b)
    return month && !month.isDisabled
  })
)

const total = computed(() => {
  if (!isBulanan.value) return props.item?.jumlah_iuran ?? 0
  return bulanBelumBayar.value.length * (props.item?.jumlah_iuran ?? 0)
})

const rules = {
  bulan: (v: number[]) => {
    if (isBulanan.value && (!v || v.length === 0)) return 'Bulan wajib dipilih'
    return true
  },
  metode_bayar: (v: string) => !!v || 'Metode pembayaran wajib dipilih',
}

// Ketika pilih QRIS/Transfer, fetch data terkait
const handleMetodeChange = async (val: string | null) => {
  if (val === 'qris') {
    await pembayaranStore.fetchQris()
  } else if (val === 'transfer') {
    await pembayaranStore.fetchQris()
  }
}

const handleSubmit = async () => {
  isErrorSubmit.value = true
  const { valid } = await (form.value as any).validate()
  if (!valid || !buktiPembayaran.value) return

  const formData = new FormData()
  formData.append('id_informasi_iuran', String(props.item!.id))
  formData.append('metode_bayar', params.metode_bayar)
  formData.append('bukti_pembayaran', buktiPembayaran.value)

  if (params.note) {
    formData.append('note', params.note)
  }

  if (isBulanan.value) {
    bulanBelumBayar.value.forEach(b => formData.append('bulan[]', String(b)))
  }

  const res = await pembayaranStore.fetchPayment(formData)

  if (res) {
    emit('success')
  }
}

const downloadingQris = ref(false)

const handleDownloadQris = async () => {
  downloadingQris.value = true
  try {
    const { api } = useApi()
    const blob = await api<Blob>(`/qris/download/${(pembayaranStore.qrisData as any).id}`, {
      responseType: 'blob', // sesuaikan dengan cara useApi kamu handle responseType
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'qris.png'
    a.click()
    URL.revokeObjectURL(url)
  } finally {
    downloadingQris.value = false
  }
}

// Salin nomor rekening ke clipboard
const copied = ref(false)

const copyNomorRekening = async () => {
  if (!pembayaranStore.qrisData?.nomor_rekening) return

  try {
    await navigator.clipboard.writeText(pembayaranStore.qrisData.nomor_rekening)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch (e) {
    console.error('Gagal menyalin nomor rekening', e)
  }
}

const bulanMulaiBayar = computed(() => props.item?.bulan_mulai_bayar ?? 1)
const bulanMaksimalBayar = computed(() => props.item?.bulan_maksimal_bayar ?? 12)

const monthsWithStatus = computed(() =>
  months.map(month => {
    const approved = props.item?.bulan_approved ?? []
    const pending = props.item?.bulan_pending ?? []
    const rejected = props.item?.bulan_rejected ?? []
    const cancelled = props.item?.bulan_cancelled ?? []

    const isApproved = approved.includes(month.value)
    const isPending = pending.includes(month.value)
    const isRejected = rejected.includes(month.value)
    const isCancelled = cancelled.includes(month.value)
    const isPaid = isApproved || isPending
    const isSebelumBergabung = month.value < bulanMulaiBayar.value
    const isSesudahNonaktif = month.value > bulanMaksimalBayar.value

    return {
      ...month,
      isPaid,
      isApproved,
      isPending,
      isRejected,
      isCancelled,
      isSebelumBergabung,
      isSesudahNonaktif,
      isDisabled: isPaid || isSebelumBergabung || isSesudahNonaktif,
    }
  })
)

const canSubmit = computed(() => {
  if (!params.metode_bayar) return false
  if (isBulanan.value && bulanBelumBayar.value.length === 0) return false
  return true
})

const availableMonths = computed(() =>
  monthsWithStatus.value.filter(m => !m.isDisabled)
)
</script>

<template>
  <VCard>
    <VCardItem>
      <VCardTitle class="mb-3">
        {{ item?.judul_iuran }}
      </VCardTitle>

      <VForm ref="form" @submit.prevent="handleSubmit">
        <VRow>

          <!-- Pilih Bulan -->
          <VCol v-if="isBulanan" cols="12">
            <VSelect v-model="params.bulan" label="Pilih Bulan" placeholder="Pilih bulan yang ingin dibayar"
              :items="monthsWithStatus" item-title="label" item-value="value" multiple chips closable-chips
              :rules="[rules.bulan]">
              <template #item="{ props, item }">
                <VListItem v-bind="props" :disabled="item.raw.isDisabled" :title="item.raw.label">
                  <template #prepend="{ isSelected }">
                    <VCheckboxBtn :model-value="isSelected || item.raw.isPaid" :disabled="item.raw.isDisabled"
                      :color="item.raw.isApproved ? 'success' : item.raw.isPending ? 'info' : 'primary'" />
                  </template>
                  <template #append>
                    <VChip v-if="item.raw.isApproved" color="success" size="x-small" label>
                      Lunas
                    </VChip>
                    <VChip v-else-if="item.raw.isPending" color="info" size="x-small" label>
                      Menunggu Validasi
                    </VChip>
                    <VChip v-else-if="item.raw.isRejected" color="error" size="x-small" label>
                      Ditolak — Bisa Bayar Ulang
                    </VChip>
                    <VChip v-else-if="item.raw.isCancelled" color="warning" size="x-small" label>
                      Dibatalkan — Bisa Bayar Ulang
                    </VChip>
                    <VChip v-else-if="item.raw.isSebelumBergabung" color="secondary" size="x-small" label>
                      Sebelum Bergabung
                    </VChip>
                    <VChip v-else-if="item.raw.isSesudahNonaktif" color="secondary" size="x-small" label>
                      Sudah Tidak Aktif
                    </VChip>
                  </template>
                </VListItem>
              </template>

              <template #chip="{ item, props }">
                <VChip v-bind="props" :color="item.raw.isApproved ? 'success' : item.raw.isPending ? 'info' : 'primary'"
                  :closable="!item.raw.isDisabled">
                  {{ item.raw.label }}
                </VChip>
              </template>
            </VSelect>
          </VCol>

          <VCol v-if="isBulanan && availableMonths.length === 0 && paidMonths.length > 0" cols="12">
            <VAlert type="success" variant="tonal" density="compact">
              Semua bulan yang tersedia sudah dibayar atau sedang menunggu validasi.
            </VAlert>
          </VCol>

          <!-- Metode Bayar -->
          <VCol cols="12">
            <p class="text-body-2 font-weight-medium mb-2">Metode Pembayaran</p>
            <VRow>
              <VCol cols="6">
                <VCard :variant="params.metode_bayar === 'transfer' ? 'tonal' : 'outlined'"
                  :color="params.metode_bayar === 'transfer' ? 'primary' : undefined"
                  class="cursor-pointer pa-3 d-flex flex-column align-center"
                  @click="() => { params.metode_bayar = 'transfer'; handleMetodeChange('transfer') }">
                  <VIcon size="28" class="mb-1">ri-bank-line</VIcon>
                  <span class="text-body-2 font-weight-medium">Transfer</span>
                </VCard>
              </VCol>
              <VCol cols="6">
                <VCard :variant="params.metode_bayar === 'qris' ? 'tonal' : 'outlined'"
                  :color="params.metode_bayar === 'qris' ? 'primary' : undefined"
                  class="cursor-pointer pa-3 d-flex flex-column align-center"
                  @click="() => { params.metode_bayar = 'qris'; handleMetodeChange('qris') }">
                  <VIcon size="28" class="mb-1">ri-qr-code-line</VIcon>
                  <span class="text-body-2 font-weight-medium">QRIS</span>
                </VCard>
              </VCol>
            </VRow>
            <p v-if="isErrorSubmit && !params.metode_bayar" class="text-error text-caption mt-1 ms-1">
              Metode pembayaran wajib dipilih
            </p>

            <!-- Info Rekening Transfer -->
            <div v-if="params.metode_bayar === 'transfer'" class="mt-3">
              <VCard variant="tonal" color="primary" rounded="lg">
                <VCardText class="pa-4">
                  <template v-if="pembayaranStore.loadingQris">
                    <div class="d-flex justify-center align-center py-4">
                      <VProgressCircular indeterminate color="primary" size="24" />
                    </div>
                  </template>

                  <template v-else-if="pembayaranStore.qrisData">
                    <div class="d-flex align-center gap-2 mb-2">
                      <VIcon icon="ri-bank-line" size="20" color="primary" />
                      <span class="text-caption text-medium-emphasis">Transfer ke rekening berikut</span>
                    </div>

                    <p class="text-body-2 mb-1">
                      <span class="text-medium-emphasis">Atas Nama:</span>
                      <span class="font-weight-medium ms-1">{{ pembayaranStore.qrisData.nama_rekening }}</span>
                    </p>

                    <div class="d-flex align-center justify-space-between mt-2 pa-2 rounded-lg"
                      style="background: rgba(var(--v-theme-surface), 0.6);">
                      <span class="text-h6 font-weight-bold">{{ pembayaranStore.qrisData.nomor_rekening }}</span>
                      <IconBtn size="small" color="primary" @click="copyNomorRekening">
                        <VIcon :icon="copied ? 'ri-check-line' : 'ri-file-copy-line'" size="18" />
                      </IconBtn>
                    </div>
                    <p v-if="copied" class="text-caption text-success mt-1 mb-0">Nomor rekening disalin</p>
                  </template>
                </VCardText>
              </VCard>
            </div>

            <div v-if="params.metode_bayar === 'qris'" class="d-flex justify-end">
              <VBtn variant="flat" color="primary" size="small" class="mt-3" prepend-icon="ri-qr-code-line"
                :loading="pembayaranStore.loadingQris" @click="showQrisDialog = true">
                Lihat QRIS
              </VBtn>
            </div>
          </VCol>

          <!-- Upload Bukti -->
          <VCol v-if="params.metode_bayar" cols="12">
            <p class="text-body-2 font-weight-medium mb-1">Bukti Pembayaran</p>

            <VAlert type="info" variant="tonal" density="compact" class="mb-3">
              <p class="text-caption ma-0">
                <template v-if="params.metode_bayar === 'transfer'">
                  Silakan upload screenshot atau foto bukti transfer (mutasi rekening/struk ATM) yang menunjukkan
                  nominal dan waktu transaksi dengan jelas.
                </template>
                <template v-else-if="params.metode_bayar === 'qris'">
                  Silakan upload screenshot bukti pembayaran QRIS dari aplikasi e-wallet/m-banking Anda yang menunjukkan
                  status "Berhasil" beserta nominalnya.
                </template>
              </p>
            </VAlert>

            <CameraUpload v-model="buktiPembayaran" :is-error-submit="isErrorSubmit"
              :rules="[v => !!v || 'Bukti pembayaran wajib diupload']" />
          </VCol>

          <!-- Catatan -->
          <VCol v-if="params.metode_bayar" cols="12">
            <VTextarea v-model="params.note" label="Catatan" placeholder="Tambahkan catatan jika perlu" rows="3"
              auto-grow />
          </VCol>

          <!-- Ringkasan -->
          <VCol cols="12">
            <VDivider class="mb-3" />
            <div class="text-end">
              <p v-if="isBulanan && bulanBelumBayar.length > 0" class="ma-0 text-body-2 text-medium-emphasis">
                {{ bulanBelumBayar.length }} bulan × {{ formatRupiah(item?.jumlah_iuran ?? 0) }}
              </p>
              <h3 class="ma-0 mt-1">Total : {{ formatRupiah(total) }}</h3>
            </div>
            <VDivider class="mt-3" />
          </VCol>

          <!-- Tombol Submit -->
          <VCol cols="12">
            <VBtn variant="flat" block color="primary" type="submit" :loading="pembayaranStore.loading"
              :disabled="!canSubmit">
              <VIcon icon="ri-send-plane-line" class="me-2" />
              Kirim Bukti Pembayaran
            </VBtn>
          </VCol>

        </VRow>
      </VForm>
    </VCardItem>
  </VCard>

  <!-- Dialog QRIS -->
  <VDialog v-model="showQrisDialog" max-width="400">
    <VCard>
      <VCardItem>
        <VCardTitle class="mb-2">Scan QRIS</VCardTitle>

        <template v-if="pembayaranStore.qrisData">
          <p v-if="pembayaranStore.qrisData.nama_rekening" class="text-body-2 mb-1">
            <span class="font-weight-medium">Nama:</span> {{ pembayaranStore.qrisData.nama_rekening }}
          </p>
          <p v-if="pembayaranStore.qrisData.keterangan" class="text-body-2 text-medium-emphasis mb-3">
            {{ pembayaranStore.qrisData.keterangan }}
          </p>

          <VImg :src="pembayaranStore.qrisData.image" alt="QRIS" class="rounded-lg mb-3" cover />

          <VBtn variant="flat" block color="primary" class="mb-2" :loading="downloadingQris"
            @click="handleDownloadQris">
            <VIcon class="me-2">ri-download-line</VIcon>
            Download QRIS
          </VBtn>
        </template>

        <template v-else>
          <div class="d-flex justify-center align-center py-8">
            <VProgressCircular indeterminate color="primary" />
          </div>
        </template>

        <VBtn variant="text" block class="mt-1" @click="showQrisDialog = false">
          Tutup & Upload Bukti
        </VBtn>
      </VCardItem>
    </VCard>
  </VDialog>
</template>
