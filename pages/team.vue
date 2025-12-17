<script setup lang="ts">
import DataTableTeam from '@/views/team/ListData.vue';
import eCommerce2 from '@images/eCommerce/2.png';

const router = useRouter()

const showFormData = ref(false)
const isEdit = ref(false)

const handleCloseFormData = () => {
  if (isEdit.value) isEdit.value = false

  showFormData.value = false
}

const itemSelected = ref<object | null>(null)

const handleEditData = (item: object) => {
  showFormData.value = true 
  isEdit.value = true
  itemSelected.value = item
}

const showConfirmation = ref(false)
const isLoadingConfirm = ref(false)

async function deleteItem() {
  isLoadingConfirm.value = true

  // contoh request
  await new Promise(res => setTimeout(res, 1000))

  isLoadingConfirm.value = false
  showConfirmation.value = false

  showSuccessConfirm.value = true
}

const confirmOptions = {
  title: '',
  message: '',
  confirmText: '',  
  cancelText: '',
  confirmColor: '',
  confirmIcon: '',
}

const handleExportExcel = () => {
  confirmOptions.title = 'Export Data?'
  confirmOptions.message = 'Apakah Anda yakin ingin mengeksport data dari tanggal 12 juni 2025 sampai 19 februari 2026 dengan regu A?'
  confirmOptions.confirmText = 'Export'
  confirmOptions.cancelText = 'Batal'
  confirmOptions.confirmColor = 'success'
  confirmOptions.confirmIcon = 'ri-export-line'

  showConfirmation.value = true 
  itemSelected.value = item
}

const showPaymentProof = ref(false)
const showSuccessConfirm = ref(false)

const filters = reactive({
  date: []
})

const handleShowBuktiBayar = () => {
  showPaymentProof.value = true
}
</script>

<template>
  <div>
    <div class="mb-4">
      <h2>Anggota</h2>
      <span>Menampilkan daftar anggota dalam regu yang diikuti oleh warga.</span>
    </div>
    <div class="d-flex gap-2 align-center mb-5">
      <VDivider />
      <h3 class="w-100 text-center">Regu A</h3>
      <VDivider />
    </div>
    <DataTableTeam @show-bukti-bayar="handleShowBuktiBayar" />

    <PaymentProofImageDialog v-model="showPaymentProof" :src="eCommerce2" />
  </div>
</template>
