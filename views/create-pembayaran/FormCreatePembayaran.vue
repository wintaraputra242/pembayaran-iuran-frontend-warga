<script lang="ts" setup>
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

const defaultParams = {
  bulan: [] as number[],
  note: '',
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
  if (!props.item?.id) return []
  return pembayaranStore.paidMonthsForIuran(props.item?.id)
})

const monthsWithStatus = computed(() =>
  months.map(month => ({
    ...month,
    isPaid: paidMonths.value.includes(month.value),
  }))
)

watch(paidMonths, (paid) => {
  if (!paid.length) return

  const current = params.bulan ?? []
  params.bulan = [...new Set([...current, ...paid])]
}, { immediate: true })


const isBulanan = computed(() => props.item?.jenis_iuran === 'bulanan')

const bulanBelumBayar = computed(() =>
  params.bulan.filter(b => !paidMonths.value.includes(b))
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
}

const handleSubmit = async () => {
  const { valid } = await (form.value as any).validate()
  if (!valid) return

  const body: { id_informasi_iuran: number; bulan?: number[]; note?: string } = {
    id_informasi_iuran: props.item!.id,
    note: params.note || undefined,
  }

  if (isBulanan.value) {
    body.bulan = params.bulan.filter(b => !paidMonths.value.includes(b))
  }

  const res = await pembayaranStore.fetchPayment(body)

  if (res?.data?.snap_token) {
    window.snap.pay(res.data.snap_token, {
      onSuccess: () => emit('success'),
      onPending: () => emit('success'),
      onError: () => { },
      onClose: () => { },
    })
  }
}
</script>

<template>
  <VCard>
    <VCardItem>
      <VCardTitle class="mb-3">
        {{ item?.judul_iuran }}
      </VCardTitle>

      <VForm ref="form" @submit.prevent="handleSubmit">
        <VRow>
          <!-- Pilih Bulan (hanya untuk iuran bulanan) -->
          <VCol v-if="isBulanan" cols="12">
            <VSelect v-model="params.bulan" label="Pilih Bulan" placeholder="Pilih bulan yang ingin dibayar"
              :items="monthsWithStatus" item-title="label" item-value="value" multiple chips closable-chips
              :rules="[rules.bulan]">
              <template #item="{ props, item }">
                <VListItem v-bind="props" :disabled="item.raw.isPaid" :title="item.raw.label">
                  <template #prepend="{ isSelected }">
                    <VCheckboxBtn :model-value="isSelected || item.raw.isPaid" :disabled="item.raw.isPaid"
                      :color="item.raw.isPaid ? 'success' : 'primary'" />
                  </template>

                  <template #append>
                    <VChip v-if="item.raw.isPaid" color="success" size="x-small" label>
                      Sudah Dibayar
                    </VChip>
                  </template>
                </VListItem>
              </template>

              <!-- Tampilan chip yang sudah terpilih -->
              <template #chip="{ item, props }">
                <VChip v-bind="props" :color="item.raw.isPaid ? 'success' : 'primary'" :closable="!item.raw.isPaid">
                  {{ item.raw.label }}
                </VChip>
              </template>
            </VSelect>
          </VCol>

          <!-- Catatan -->
          <VCol cols="12">
            <VTextarea v-model="params.note" label="Catatan" placeholder="Tambahkan catatan jika perlu" rows="3"
              auto-grow :rules="[v => !!v || 'Catatan wajib diisi']" />
          </VCol>

          <!-- Ringkasan -->
          <VCol cols="12">
            <VDivider class="mb-3" />
            <div class="text-end">
              <p v-if="isBulanan && params.bulan.length > 0" class="ma-0 text-body-2 text-medium-emphasis">
                {{ params.bulan.length }} bulan × {{ formatRupiah(item?.jumlah_iuran ?? 0) }}
              </p>
              <h3 class="ma-0 mt-1">Total : {{ formatRupiah(total) }}</h3>
            </div>
            <VDivider class="mt-3" />
          </VCol>

          <!-- Tombol -->
          <VCol cols="12">
            <VBtn variant="flat" block color="primary" type="submit" :loading="pembayaranStore.loading">
              <VIcon icon="ri-bank-card-line" class="me-2" />
              Bayar Sekarang
            </VBtn>
          </VCol>
        </VRow>
      </VForm>
    </VCardItem>
  </VCard>
</template>
