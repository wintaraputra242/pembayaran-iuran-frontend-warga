<script setup lang="ts">
import { onMounted, ref } from 'vue';

const emit = defineEmits<{
  (e: 'showHistoryPayment', item: object): void;
  (e: 'showBuktiBayar'): void;
}>();

// Dummy data simulasi API
const allDummyData = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  nama: `Warga #${i + 1}`,
  info: i % 2 === 0 ? 'Notifikasi belum dibaca' : 'Pembayaran berhasil',
  created_at: `2025-01-${String((i % 28) + 1).padStart(2, '0')}`,
}))

// State
const items = ref<any[]>([])
const page = ref(1)
const perPage = 20
const isLoading = ref(false)
const hasMore = ref(true)

const loadData = async () => {
  if (isLoading.value || !hasMore.value) return

  isLoading.value = true
  await new Promise(resolve => setTimeout(resolve, 500))

  const start = (page.value - 1) * perPage
  const end = page.value * perPage
  const newData = allDummyData.slice(start, end)

  items.value.push(...newData)
  page.value++

  if (end >= allDummyData.length) {
    hasMore.value = false
  }

  isLoading.value = false
}

const statusChipsColor = {
  'pending': 'info',
  'success': 'success',
  'failed': 'error',
  'expired': 'secondary',
  'cancelled': 'secondary',
}

let observer: IntersectionObserver

onMounted(() => {
  const sentinelWarga = document.getElementById('sentinelWarga')
  observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      loadData()
    }
  })

  if (sentinelWarga) observer.observe(sentinelWarga)

  // Initial load
  loadData()
})
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard class="pa-0 position-relative overflow-visible">
        <VCardItem class="pa-4 pt-5">
          <div class="d-flex gap-2">
            <VAvatar color="grey-300" icon="ri-user-line" />
            <div>
              <h4>Gusti Putu Wintara Putra</h4>
              <p class="ma-0 text-caption">081123123123</p>
            </div>
          </div>
        </VCardItem>
        <div class="position-absolute" style="top: -10px; right: 10px;">
          <VChip color="secondary" size="small" class="font-weight-bold">Anda</VChip>
          <!-- <VChip color="info" prepend-icon="ri-vip-crown-line" size="small" class="font-weight-bold ms-2">Ketua Regu</VChip> -->
        </div>
      </VCard>
    </VCol>
    <VCol cols="12">
      <VCard class="pa-0 position-relative overflow-visible">
        <VCardItem class="pa-4 pt-5">
          <div class="d-flex gap-2">
            <VAvatar color="grey-300" icon="ri-user-line" />
            <div>
              <h4>Gusti Putu Wintara Putra</h4>
              <p class="ma-0 text-caption">081123123123</p>
            </div>
          </div>
        </VCardItem>
        <div class="position-absolute" style="top: -10px; right: 10px;">
          <!-- <VChip color="secondary" size="small" class="font-weight-bold">Anda</VChip> -->
          <VChip color="info" prepend-icon="ri-vip-crown-line" size="small" class="font-weight-bold ms-2">Ketua Regu</VChip>
        </div>
      </VCard>
    </VCol>
    <VCol cols="12">
      <VCard class="pa-0 position-relative overflow-visible">
        <VCardItem class="pa-4">
          <div class="d-flex gap-2">
            <VAvatar color="grey-300" icon="ri-user-line" />
            <div>
              <h4>Gusti Putu Wintara Putra</h4>
              <p class="ma-0 text-caption">081123123123</p>
            </div>
          </div>
        </VCardItem>
      </VCard>
    </VCol>
    <VCol cols="12">
      <VCard class="pa-0 position-relative overflow-visible">
        <VCardItem class="pa-4">
          <div class="d-flex gap-2">
            <VAvatar color="grey-300" icon="ri-user-line" />
            <div>
              <h4>Gusti Putu Wintara Putra</h4>
              <p class="ma-0 text-caption">081123123123</p>
            </div>
          </div>
        </VCardItem>
      </VCard>
    </VCol>
    <VCol cols="12">
      <VCard class="pa-0 position-relative overflow-visible">
        <VCardItem class="pa-4">
          <div class="d-flex gap-2">
            <VAvatar color="grey-300" icon="ri-user-line" />
            <div>
              <h4>Gusti Putu Wintara Putra</h4>
              <p class="ma-0 text-caption">081123123123</p>
            </div>
          </div>
        </VCardItem>
      </VCard>
    </VCol>
    <VCol cols="12">
      <VCard class="pa-0 position-relative overflow-visible">
        <VCardItem class="pa-4">
          <div class="d-flex gap-2">
            <VAvatar color="grey-300" icon="ri-user-line" />
            <div>
              <h4>Gusti Putu Wintara Putra</h4>
              <p class="ma-0 text-caption">081123123123</p>
            </div>
          </div>
        </VCardItem>
      </VCard>
    </VCol>
    <VCol cols="12">
      <VCard class="pa-0 position-relative overflow-visible">
        <VCardItem class="pa-4">
          <div class="d-flex gap-2">
            <VAvatar color="grey-300" icon="ri-user-line" />
            <div>
              <h4>Gusti Putu Wintara Putra</h4>
              <p class="ma-0 text-caption">081123123123</p>
            </div>
          </div>
        </VCardItem>
      </VCard>
    </VCol>
    <VCol cols="12">
      <VCard class="pa-0 position-relative overflow-visible">
        <VCardItem class="pa-4">
          <div class="d-flex gap-2">
            <VAvatar color="grey-300" icon="ri-user-line" />
            <div>
              <h4>Gusti Putu Wintara Putra</h4>
              <p class="ma-0 text-caption">081123123123</p>
            </div>
          </div>
        </VCardItem>
      </VCard>
    </VCol>
  </VRow>
</template>

<style scoped>
.table-scroll-wrapper {
  max-height: 400px;   /* tinggi container */
  overflow-y: auto;
  overflow-x: hidden;
  height: 100%;
}
</style>
