<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter()
const route = useRoute()
const notificationStore = useNotificationStore()

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

const updateBottomNavPosition = () => {
  const wrapper = document.querySelector('.inner-wrapper')
  if (wrapper) {
    const rect = wrapper.getBoundingClientRect()
    document.documentElement.style.setProperty('--bottom-nav-left', `${rect.left}px`)
    document.documentElement.style.setProperty('--bottom-nav-width', `${rect.width}px`)
  }
}

onMounted(async () => {
  await notificationStore.fetchUnreadCount()
  updateBottomNavPosition()
  window.addEventListener('resize', updateBottomNavPosition)
  window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('resize', updateBottomNavPosition)
  window.removeEventListener('scroll', onScroll)
})

</script>

<template>
  <VBottomNavigation app grow mandatory height="70" class="app-bottom-nav" :class="{ hidden: isScrolling }">
    <!-- Notifikasi -->
    <VBtn value="notifications" variant="plain" @click="go('/notifications')">
      <div style="position: relative; display: inline-flex;">
        <VIcon size="20" :color="route.path === '/notifications' ? 'primary' : 'grey-darken-1'">
          ri-notification-3-line
        </VIcon>
        <span v-if="notificationStore.unreadCount > 0" class="notif-badge">
          {{ notificationStore.unreadCount > 99 ? '99+' : notificationStore.unreadCount }}
        </span>
      </div>
      <span class="nav-label" :class="{ active: route.path === '/notifications' }">Notifikasi</span>
    </VBtn>

    <!-- Riwayat -->
    <VBtn value="riwayat" variant="plain" @click="go('/histories')">
      <VIcon size="20" :color="route.path === '/histories' ? 'primary' : 'grey-darken-1'">
        ri-history-line
      </VIcon>
      <span class="nav-label" :class="{ active: route.path === '/histories' }">Riwayat</span>
    </VBtn>

    <!-- Bayar (CENTER FLOATING) -->
    <div class="center-action">
      <VBtn icon size="x-small" class="pay-btn" @click="go('/create-pembayaran')">
        <VIcon size="26">ri-qr-code-line</VIcon>
      </VBtn>
      <span class="nav-label center-label" :class="{ active: route.path.startsWith('/create-pembayaran') }">
        Bayar
      </span>
    </div>

    <!-- Anggota -->
    <VBtn value="anggota" variant="plain" @click="go('/team')">
      <VIcon size="20" :color="route.path === '/team' ? 'primary' : 'grey-darken-1'">
        ri-group-line
      </VIcon>
      <span class="nav-label" :class="{ active: route.path === '/team' }">Anggota</span>
    </VBtn>

    <!-- Profil -->
    <VBtn value="profile" variant="plain" @click="go('/profile')">
      <VIcon size="20" :color="route.path === '/profile' ? 'primary' : 'grey-darken-1'">
        ri-user-3-line
      </VIcon>
      <span class="nav-label" :class="{ active: route.path === '/profile' }">Profil</span>
    </VBtn>
  </VBottomNavigation>
</template>

<style scoped>
.app-bottom-nav {
  border-top: 0.5px solid rgba(0, 0, 0, 0.08) !important;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.06) !important;
  overflow: visible !important;

  left: var(--bottom-nav-left, 0px) !important;
  width: var(--bottom-nav-width, 100%) !important;
  max-width: 768px !important;
  transition: transform 0.3s ease;

  &.hidden {
    transform: translateY(100%) !important;
  }
}

.nav-label {
  font-size: 10px;
  color: rgb(var(--v-theme-on-surface));
  opacity: 0.5;
  margin-top: 2px;
  font-weight: 400;
  transition: color 0.15s, opacity 0.15s;

  &.active {
    color: rgb(var(--v-theme-primary));
    opacity: 1;
    font-weight: 500;
  }
}

.center-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding-bottom: 6px;
  gap: 3px;
  margin-bottom: 4px;

  .pay-btn {
    width: 52px !important;
    height: 52px !important;
    border-radius: 50% !important;
    background: rgb(var(--v-theme-primary)) !important;
    color: #fff !important;
    margin-top: -18px;
    box-shadow: 0 4px 14px rgba(var(--v-theme-primary), 0.4) !important;
    transition: transform 0.15s ease;

    &:hover {
      transform: scale(1.05);
    }
  }

  .center-label {
    opacity: 0.5;

    &.active {
      color: rgb(var(--v-theme-primary));
      opacity: 1;
    }
  }
}

.notif-dot {
  position: absolute;
  top: -2px;
  right: -4px;
  width: 8px;
  height: 8px;
  background: rgb(var(--v-theme-error));
  border-radius: 50%;
  border: 1.5px solid #fff;
}

.notif-badge {
  position: absolute;
  top: -6px;
  right: -8px;
  background-color: rgb(var(--v-theme-error));
  color: white;
  font-size: 9px;
  font-weight: 700;
  min-width: 16px;
  height: 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 3px;
  line-height: 1;
}
</style>
