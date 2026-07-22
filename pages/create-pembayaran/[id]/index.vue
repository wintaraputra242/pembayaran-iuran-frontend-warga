<script setup lang="ts">
import FormCreatePembayaran from '@/views/create-pembayaran/FormCreatePembayaran.vue';

const route = useRoute()
const router = useRouter()
const iuranStore = useInformasiIuranStore()
const pembayaranStore = usePembayaranStore()

const item = ref<import('@/types/api/informasi-iuran').InformasiIuran | null>(null)

onMounted(async () => {
  const id = (route.params as any)?.id

  const fromList = iuranStore.iuranList?.find((i: any) => i.id == id)

  if (fromList) {
    item.value = fromList
  } else {
    await iuranStore.fetchDetail(id)
    item.value = iuranStore.iuranItem
  }

  // Fetch paidMonths setelah item sudah pasti terisi
  if (item.value?.jenis_iuran === 'bulanan') {
    await pembayaranStore.fetchPaidMonths()
  }
})

// watch(() => item.value, async (val) => {
//   if (val && val?.jenis_iuran === 'bulanan') {
//     await pembayaranStore.fetchPaidMonths()
//   }
// }, { immediate: true })

const showTakeFoto = ref(false)
const showSuccessConfirm = ref(false)
const showConfirmation = ref(false)
const isLoadingConfirm = ref(false)

const confirmOptions = reactive({
  title: '',
  message: '',
  confirmText: '',
  cancelText: '',
  confirmColor: '',
  confirmIcon: '',
})

const handleSuccess = () => {
  showSuccessConfirm.value = true
}

const handleCloseSuccessDialog = () => {
  showSuccessConfirm.value = false

  router.push('/create-pembayaran')

  // confirmOptions.title = 'Ingin Menambah Pembayaran?'
  // confirmOptions.message = 'Apakah Anda ingin menambahkan pembayaran baru lagi di iuran ini?'
  // confirmOptions.confirmText = 'Ya'
  // confirmOptions.cancelText = 'Tidak'
  // confirmOptions.confirmColor = 'primary'
  // confirmOptions.confirmIcon = 'ri-check-line'

  // showConfirmation.value = true
}

const handleConfirm = () => {
  showConfirmation.value = false
}
</script>

<template>
  <div class="mt-n1">
    <div class="mb-4">
      <div class="mb-3">
        <VBtn class="px-0 py-1" variant="text" size="large" to="/create-pembayaran">
          <VIcon icon="ri-arrow-left-s-line" class="me-2" />
          Keluar
        </VBtn>
      </div>

      <template v-if="item">
        <VChip size="small" color="info" class="mb-1">
          {{ item.jenis_iuran === 'bulanan' ? 'Bulanan' : 'Kematian' }}
        </VChip>
        <h2 class="mb-1">{{ item.judul_iuran }}</h2>
        <p>Isi form berikut dan upload bukti pembayaran.</p>
      </template>

      <template v-else>
        <VSkeleton type="chip" class="mb-1" />
        <VSkeleton type="heading" class="mb-1" />
        <VSkeleton type="text" />
      </template>
    </div>

    <FormCreatePembayaran v-if="item" :item="item" @success="handleSuccess"
      @close="router.push('/create-pembayaran')" />

    <SuccessDialog v-model="showSuccessConfirm" title="Bukti Pembayaran Terkirim"
      :message="`Bukti pembayaran ${item?.judul_iuran} berhasil dikirim. Menunggu validasi pengurus.`"
      @close="handleCloseSuccessDialog" />

    <ConfirmDialog v-model="showConfirmation" :title="confirmOptions.title" :message="confirmOptions.message"
      :confirm-text="confirmOptions.confirmText" :cancel-text="confirmOptions.cancelText"
      :confirm-color="confirmOptions.confirmColor" :confirm-icon="confirmOptions.confirmIcon"
      :loading="isLoadingConfirm" @confirm="handleConfirm" />
  </div>
</template>
