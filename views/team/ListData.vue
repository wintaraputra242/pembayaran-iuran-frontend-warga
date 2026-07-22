<script setup lang="ts">
const props = defineProps<{
  items: any[]
}>()

const emit = defineEmits<{
  (e: 'showHistoryPayment', item: object): void
  (e: 'showBuktiBayar'): void
}>()

const authStore = useAuthStore() // sesuaikan dengan store auth yang dipakai

// Sort: user login → ketua regu → anggota biasa
const sortedItems = computed(() => {
  if (!props.items?.length) return []

  return [...props.items].sort((a, b) => {
    const rank = (item: any) => {
      if (item.nik === (authStore.user as any)?.warga?.nik) return 0       // user login
      if (item.is_leader) return 1                          // ketua regu
      return 2                                             // anggota biasa
    }
    return rank(a) - rank(b)
  })
})

const isCurrentUser = (item: any) => item.nik === (authStore.user as any)?.warga?.nik
</script>

<template>
  <VRow>
    <template v-if="!items?.length">
      <VCol cols="12">
        <div class="d-flex justify-center mt-4">
          <span class="text-medium-emphasis">Tidak ada anggota.</span>
        </div>
      </VCol>
    </template>

    <template v-else>
      <VCol v-for="item in sortedItems" :key="item.id" cols="12" sm="6">
        <VCard class="pa-0 position-relative overflow-visible">
          <VCardItem :class="['pa-4', isCurrentUser(item) ? 'pt-5' : '']">
            <div class="d-flex gap-2">
              <VAvatar color="grey-300" icon="ri-user-line" />
              <div>
                <h4>{{ item.nama_warga }}</h4>
                <a v-if="item?.no_hp" :href="`https://wa.me/${item.no_hp.replace(/\D/g, '').replace(/^0/, '62')}`"
                  target="_blank" rel="noopener noreferrer"
                  class="text-decoration-none d-inline-flex align-center gap-1 px-2 py-1 rounded-lg"
                  style="background: rgba(37, 211, 102, 0.1); border: 1px solid rgba(37, 211, 102, 0.3);">
                  <VIcon icon="ri-whatsapp-line" size="13" color="success" />
                  <p class="ma-0 text-caption font-weight-medium" style="color: #25d366;">{{ item.no_hp }}</p>
                  <VIcon icon="ri-external-link-line" size="11" style="color: #25d366; opacity: 0.7;" />
                </a>
                <p v-else class="ma-0 text-caption text-medium-emphasis">-</p>
              </div>
            </div>
          </VCardItem>

          <!-- Badge pojok kanan atas -->
          <div v-if="isCurrentUser(item) || item.is_leader" class="position-absolute" style="top: -10px; right: 10px;">
            <VChip v-if="isCurrentUser(item)" color="secondary" variant="flat" size="small" class="font-weight-bold">
              Anda
            </VChip>

            <VChip v-if="item.is_leader" color="info" variant="flat" prepend-icon="ri-vip-crown-line" size="small"
              :class="['font-weight-bold', isCurrentUser(item) ? 'ms-2' : '']">
              Ketua Regu
            </VChip>
          </div>
        </VCard>
      </VCol>
    </template>
  </VRow>
</template>
