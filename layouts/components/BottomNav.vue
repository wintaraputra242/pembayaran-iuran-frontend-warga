<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter()
const route = useRoute()

const go = (path: string) => {
  router.push(path)
}

const isScrolling = ref(false)
let scrollTimeout: number | null = null

const onScroll = () => {
  isScrolling.value = true

  if (scrollTimeout) clearTimeout(scrollTimeout)

  scrollTimeout = window.setTimeout(() => {
    isScrolling.value = false
  }, 180)
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <VBottomNavigation
    app
    grow
    mandatory
    height="70"
    class="app-bottom-nav"
    :class="{ hidden: isScrolling }"
    color="info"
  >
    <!-- Notifications -->
    <VBtn
      value="notifications"
      variant="plain"
      @click="go('/notifications')"
    >
      <VIcon size="20" class="mb-1">ri-notification-3-line</VIcon>
      <span :class="{ 'text-info': route.path === '/notifications', 'text-grey-900': route.path !== '/notifications' }" style="font-size: 11px;">Notifikasi</span>
    </VBtn>

    <!-- Riwayat -->
    <VBtn
      value="riwayat"
      variant="plain"
      @click="go('/histories')"
    >
      <VIcon size="20" class="mb-1">ri-history-line</VIcon>
      <span :class="{ 'text-info': route.path === '/histories', 'text-grey-900': route.path !== '/histories' }" style="font-size: 11px;">Riwayat</span>
    </VBtn>

    <!-- Bayar Iuran (CENTER FLOATING) -->
    <div class="center-action">
      <VBtn
        size="x-small"
        active-color="#fff"
        class="pay-btn bg-primary mb-2"
        icon
        @click="go('/payment')"
      >
        <VIcon size="28">ri-qr-code-line</VIcon>
      </VBtn>
      <span class="center-label" :class="{ 'text-info': route.path === '/payment', 'text-grey-900': route.path !== '/payment' }" style="color: #000; font-size: 11px">Bayar</span>
    </div>

    <!-- Anggota -->
    <VBtn
      value="anggota"
      variant="plain"
      @click="go('/team')"
    >
      <VIcon size="20" class="mb-1">ri-group-line</VIcon>
      <span :class="{ 'text-info': route.path === '/team', 'text-grey-900': route.path !== '/team' }" style="font-size: 11px;">Anggota</span>
    </VBtn>

    <!-- Profile -->
    <VBtn
      value="profile"
      variant="plain"
      @click="go('/profile')"
    >
      <VIcon size="20" class="mb-1">ri-user-3-line</VIcon>
      <span :class="{ 'text-info': route.path === '/profile', 'text-grey-900': route.path !== '/profile' }" style="font-size: 11px;">Profil</span>
    </VBtn>
  </VBottomNavigation>
</template>

<style scoped>
.app-bottom-nav {
  transform-origin: bottom center;
  transition: transform 0.45s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
  overflow: visible;
}

/* tombol tengah */
.center-action {
  position: relative;
  top: -25px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.pay-btn {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

/* .center-label {
  font-size: 12px;
  margin-top: 4px;
  color: #1f2937;
} */

/* SAAT SCROLL → HILANG KE BAWAH */
.hidden {
  transform: translateY(150%) !important;
  pointer-events: none;
}

/* SAAT IDLE → POPUP NAIK */
:not(.hidden) {
  transform: translateY(0);
}
</style>
