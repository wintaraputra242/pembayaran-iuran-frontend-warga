<script setup lang="ts">
import { useAnggotaReguStore } from '@/stores/useAnggotaReguStore'
import DataTableTeam from '@/views/team/ListData.vue'
import eCommerce2 from '@images/eCommerce/2.png'

const router = useRouter()
const anggotaReguStore = useAnggotaReguStore()

const showPaymentProof = ref(false)

const handleShowBuktiBayar = () => {
  showPaymentProof.value = true
}

onMounted(async () => {
  await anggotaReguStore.fetchAnggotaRegu()
})
</script>

<template>
  <div>
    <div class="mb-4">
      <h2>Anggota</h2>
      <span>Menampilkan daftar anggota dalam regu yang diikuti oleh warga.</span>
    </div>

    <template v-if="anggotaReguStore.loading">
      <div class="d-flex justify-center mt-4">
        <VProgressCircular indeterminate size="26" />
      </div>
    </template>

    <template v-else-if="anggotaReguStore.regu">
      <div class="d-flex gap-2 align-center mb-5">
        <VDivider />
        <h3 class="w-100 text-center">{{ anggotaReguStore.regu.nama_regu }}</h3>
        <VDivider />
      </div>

      <DataTableTeam :items="anggotaReguStore.regu.anggota" @show-bukti-bayar="handleShowBuktiBayar" />
    </template>

    <template v-else>
      <div class="d-flex justify-center mt-4">
        <span class="text-medium-emphasis">Anda saat ini belum memiliki regu.</span>
      </div>
    </template>

    <PaymentProofImageDialog v-model="showPaymentProof" :src="eCommerce2" />
  </div>
</template>
