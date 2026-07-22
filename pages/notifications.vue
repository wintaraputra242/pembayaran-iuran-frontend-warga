<script setup lang="ts">
import { useNotificationStore } from '@/stores/useNotificationStore'

const notificationStore = useNotificationStore()
const router = useRouter()

const page = ref(1)
const sentinel = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

const loadNotifications = async (reset = false) => {
  if (reset) {
    notificationStore.reload = true
    page.value = 1
  }

  await notificationStore.fetchNotifications({
    page: page.value,
    per_page: 10,
  })
}

const loadMore = async () => {
  if (!notificationStore.hasMore || notificationStore.loading) return
  page.value++
  await loadNotifications()
}

// Fix bug sentinel — setup observer setelah data ada
const setupObserver = () => {
  if (!sentinel.value) return

  observer?.disconnect()

  observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !notificationStore.loading) loadMore()
  }, { rootMargin: '100px' })

  observer.observe(sentinel.value)
}

watch(sentinel, (el) => {
  if (el) setupObserver()
})

watch(() => notificationStore.hasMore, () => {
  setupObserver()
})

onMounted(async () => {
  notificationStore.resetState()
  page.value = 1

  await loadNotifications(true)
  await notificationStore.markAllAsRead()
})

onUnmounted(() => {
  observer?.disconnect()
})

// Config notifikasi — disesuaikan untuk 2 jenis utama
const notifTypeConfig: Record<string, {
  color: string
  icon: string
  label: string
  action?: { label: string; icon: string; route?: string }
}> = {
  // Iuran baru
  iuran_baru: {
    color: 'info',
    icon: 'ri-file-add-line',
    label: 'Iuran Baru',
    action: { label: 'Lihat Iuran', icon: 'ri-eye-line', route: '/iuran' },
  },
  // Iuran terlambat / pengingat
  pengingat_iuran: {
    color: 'warning',
    icon: 'ri-alarm-line',
    label: 'Pengingat Iuran',
    action: { label: 'Bayar Sekarang', icon: 'ri-cash-line', route: '/create-pembayaran' },
  },
  // Fallback untuk type lama
  pengingat: {
    color: 'warning',
    icon: 'ri-alarm-line',
    label: 'Pengingat',
    action: { label: 'Bayar Sekarang', icon: 'ri-cash-line', route: '/create-pembayaran' },
  },
  reminder: {
    color: 'warning',
    icon: 'ri-alarm-line',
    label: 'Pengingat',
    action: { label: 'Bayar Sekarang', icon: 'ri-cash-line', route: '/create-pembayaran' },
  },
  approved: {
    color: 'success',
    icon: 'ri-checkbox-circle-line',
    label: 'Diterima',
  },
  rejected: {
    color: 'error',
    icon: 'ri-close-circle-line',
    label: 'Ditolak',
  },
  payment: {
    color: 'success',
    icon: 'ri-cash-line',
    label: 'Pembayaran',
  },
}

const getNotifConfig = (type: string) =>
  notifTypeConfig[type] ?? { color: 'secondary', icon: 'ri-notification-line', label: type }

const formatMessage = (message: string) => {
  if (!message) return ''

  return message
    // Bold: *teks* → <strong>teks</strong>
    .replace(/\*(.+?)\*/g, '<strong>$1</strong>')
    // Italic: _teks_ → <em>teks</em>
    .replace(/_(.+?)_/g, '<em>$1</em>')
    // Newline
    .replace(/\r\n/g, '<br>')
    .replace(/\n/g, '<br>')
}

const handleAction = (notif: any) => {
  if (notif.data?.id_informasi_iuran) {
    // Langsung ke halaman create pembayaran dengan id iuran
    router.push(`/create-pembayaran/${notif.data.id_informasi_iuran}`)
    return
  }
  const config = getNotifConfig(notif.type)
  if (config.action?.route) router.push(config.action.route)
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-4">
      <h2>Notifikasi</h2>
      <span class="text-body-2 text-medium-emphasis">
        Informasi dan pemberitahuan penting terkait iuran banjar.
      </span>
    </div>

    <!-- Loading awal -->
    <div v-if="notificationStore.loading && !notificationStore.hasData" class="d-flex justify-center py-6">
      <VProgressCircular size="26" indeterminate />
    </div>

    <!-- Empty -->
    <VAlert v-else-if="!notificationStore.hasData && !notificationStore.loading" type="info" variant="tonal"
      rounded="lg">
      Tidak ada notifikasi
    </VAlert>

    <!-- List -->
    <VRow v-if="notificationStore.hasData">
      <VCol v-for="notif in notificationStore.notifications" :key="notif.id" cols="12" sm="6">
        <VCard rounded="lg" border="sm" height="100%"
          :style="!notif.is_read ? 'border-left: 3px solid rgb(var(--v-theme-primary)) !important;' : ''"
          class="position-relative">
          <VCardItem class="pa-4">
            <div class="d-flex align-start gap-3">
              <!-- Icon -->
              <VAvatar :color="getNotifConfig(notif.type).color" variant="tonal" size="40" class="flex-shrink-0">
                <VIcon size="20">{{ getNotifConfig(notif.type).icon }}</VIcon>
              </VAvatar>

              <div class="flex-grow-1 min-width-0">
                <!-- Type chip & badge baru -->
                <div class="d-flex align-center justify-space-between mb-1 flex-wrap gap-1">
                  <VChip :color="getNotifConfig(notif.type).color" size="x-small" variant="tonal">
                    {{ getNotifConfig(notif.type).label }}
                  </VChip>
                  <VChip v-if="!notif.is_read" color="primary" size="x-small" variant="flat">
                    Baru
                  </VChip>
                </div>

                <!-- Title -->
                <p class="font-weight-semibold text-body-2 mb-1 mt-1">
                  {{ notif.title }}
                </p>

                <!-- Message -->
                <p class="text-caption text-medium-emphasis ma-0" style="line-height: 1.6;"
                  v-html="formatMessage(notif.message)" />

                <!-- Tanggal -->
                <p class="text-caption text-medium-emphasis ma-0 mt-2">
                  <VIcon size="12" class="me-1">ri-time-line</VIcon>
                  {{ formatDateID(notif.created_at) }}
                </p>
              </div>
            </div>
          </VCardItem>

          <!-- Action button -->
          <VCardActions v-if="getNotifConfig(notif.type).action || notif.data?.id_informasi_iuran"
            class="px-4 pb-3 pt-0">
            <VBtn :color="getNotifConfig(notif.type).color" variant="tonal" size="small" block
              :prepend-icon="notif.data?.id_informasi_iuran ? 'ri-cash-line' : getNotifConfig(notif.type).action?.icon"
              @click="handleAction(notif)">
              {{ notif.data?.id_informasi_iuran ? 'Bayar Sekarang' : getNotifConfig(notif.type).action?.label }}
            </VBtn>
          </VCardActions>
        </VCard>
      </VCol>
    </VRow>

    <!-- Sentinel -->
    <div ref="sentinel" style="height: 1px;" />

    <!-- Load more loading -->
    <div v-if="notificationStore.hasMore && notificationStore.loading" class="d-flex justify-center py-4">
      <VProgressCircular indeterminate size="26" />
    </div>
  </div>
</template>
