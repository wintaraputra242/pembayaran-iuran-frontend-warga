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

const handleReload = async () => {
  await anggotaReguStore.fetchAnggotaRegu()
}

onMounted(async () => {
  // Hanya fetch kalau belum ada data
  if (!anggotaReguStore.regu) {
    await anggotaReguStore.fetchAnggotaRegu()
  }
})
</script>

<template>
  <div>
    <div class="mb-4 d-flex align-end justify-space-between gap-5">
      <div>
        <h2>Anggota</h2>
        <span>Menampilkan daftar anggota dalam regu yang diikuti oleh warga.</span>
      </div>

      <!-- Tombol reload -->
      <VBtn icon variant="tonal" color="primary" size="small" :loading="anggotaReguStore.loading" @click="handleReload">
        <VIcon icon="ri-refresh-line" size="18" />
        <VTooltip activator="parent" location="left">Refresh Data</VTooltip>
      </VBtn>
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
