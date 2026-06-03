<script setup lang="ts">
import DetailProfile from '@/views/profile/DetailProfile.vue';

const router = useRouter()
const authStore = useAuthStore()

console.log(authStore.user);

const handleLogout = async () => {
  await authStore.logout()
  router.replace('/login')
}
</script>

<template>
  <div>
    <div class="mb-4">
      <h2>Profil</h2>
      <span>Menampilkan data diri warga.</span>
    </div>
    <DetailProfile />

    <VRow>
      <VCol cols="12">
        <VBtn color="error" variant="flat" block prepend-icon="ri-logout-box-line" class="mt-2"
          :loading="authStore.loading" @click="handleLogout">
          Keluar Akun
        </VBtn>
      </VCol>
    </VRow>
  </div>
</template>
