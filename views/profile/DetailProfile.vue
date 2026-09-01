<script setup lang="ts">
const emit = defineEmits<{
  (e: 'showHistoryPayment', item: object): void
  (e: 'showBuktiBayar'): void
}>()

const authStore = useAuthStore()
const uiStore = useUiStore() // ← tambah untuk notifikasi

// Computed dari store — selalu reactive
const wargaData = computed(() => (authStore.user as any)?.warga)

const params = reactive({
  nik: wargaData.value?.nik ?? '',
  nama_warga: wargaData.value?.nama_warga ?? '',
  alamat: wargaData.value?.alamat ?? '',
  no_hp: wargaData.value?.no_hp ?? '',
  password: '',
  password_confirmation: '',
})

// Sync params saat authStore.user berubah (setelah update berhasil)
watch(wargaData, (newVal) => {
  if (!newVal) return
  params.nik = newVal.nik ?? ''
  params.nama_warga = newVal.nama_warga ?? ''
  params.alamat = newVal.alamat ?? ''
  params.no_hp = newVal.no_hp ?? ''
}, { deep: true })

const rules = {
  required: (v: any) => !!v || 'Field wajib diisi',
  nik: (v: string) => {
    if (!v) return 'NIK wajib diisi'
    if (v.length !== 16) return 'NIK harus 16 digit'
    return true
  },
  nama: (v: string) => {
    if (!v) return 'Nama wajib diisi'
    if (v.length < 3) return 'Nama minimal 3 karakter'
    if (!/^[A-Za-z\s'.-]+$/.test(v)) return 'Nama hanya boleh huruf, spasi, titik, dan tanda petik'
    return true
  },
  alamat: (v: string) => {
    if (!v) return 'Alamat wajib diisi'
    if (v.length < 5) return 'Alamat terlalu pendek'
    return true
  },
  phone: (v: string) => {
    if (!v) return 'No. HP wajib diisi'
    const cleaned = v.replace(/\D/g, '')
    if (!/^08\d{8,11}$/.test(cleaned)) return 'No. HP harus format Indonesia (contoh: 081234567890)'
    return true
  },
  password: (v: string) => {
    if (!v) return 'Kata sandi wajib diisi'
    if (v.length < 6) return 'Kata sandi minimal 6 karakter'
    if (!/[a-zA-Z]/.test(v)) return 'Kata sandi harus mengandung huruf'
    if (!/[0-9]/.test(v)) return 'Kata sandi harus mengandung angka'
    if (/[^a-zA-Z0-9]/.test(v)) return 'Kata sandi tidak boleh mengandung simbol'
    return true
  },
  passwordConfirm: (v: string) => {
    if (!v && !params.password) return true
    if (v !== params.password) return 'Konfirmasi password tidak cocok'
    return true
  },
}

const isEditProfile = ref(false)
const showPasswordForm = ref(false)
const showConfirmPassword = ref(false)
const form = ref()

const handleSubmit = async () => {
  const { valid } = await form.value.validate()
  if (!valid) return

  const body: Record<string, any> = {
    // Konversi ke uppercase di sini saja, sekali, sebelum dikirim —
    // bukan tiap keystroke, supaya tidak mengganggu keyboard mobile.
    nama_warga: params.nama_warga.toUpperCase(),
    alamat: params.alamat,
    no_hp: params.no_hp,
  }

  if (params.password) {
    body.password = params.password
    body.password_confirmation = params.password_confirmation
  }

  // Di handleSubmit, ganti uiStore.showSuccess dengan:
  const res = await authStore.updateProfile(body)
  if (res) {
    isEditProfile.value = false
    showPasswordForm.value = false
    params.password = ''
    params.password_confirmation = ''
    triggerSuccessAlert() // ← ganti ini
  }
}

const handleCancel = () => {
  // Reset params ke data terbaru dari store
  params.nik = wargaData.value?.nik ?? ''
  params.nama_warga = wargaData.value?.nama_warga ?? ''
  params.alamat = wargaData.value?.alamat ?? ''
  params.no_hp = wargaData.value?.no_hp ?? ''
  params.password = ''
  params.password_confirmation = ''

  form.value?.resetValidation()
  isEditProfile.value = false
  showPasswordForm.value = false
  showConfirmPassword.value = false
}

const statusKeaktifan = computed(() => wargaData.value?.status_keaktifan ?? 'aktif')
const isAktif = computed(() => statusKeaktifan.value === 'aktif')
const namaRegu = computed(() => wargaData.value?.regu?.nama_regu ?? '-')

const handlePhoneInput = (e: Event) => {
  const input = e.target as HTMLInputElement
  input.value = input.value.replace(/\D/g, '')
  params.no_hp = input.value
}

const showSuccessAlert = ref(false)
let alertTimer: ReturnType<typeof setTimeout> | null = null

const triggerSuccessAlert = () => {
  showSuccessAlert.value = true
  if (alertTimer) clearTimeout(alertTimer)
  alertTimer = setTimeout(() => {
    showSuccessAlert.value = false
  }, 4000) // hilang setelah 4 detik
}

// handleNamaWargaInput (cursor-preserve approach) DIHAPUS — masih rawan
// bikin input hilang di mobile keyboard (composition/predictive text).
// Uppercase sekarang cuma visual lewat CSS (class "uppercase-input"
// di <style scoped> bawah), value asli baru dikonversi saat submit.

onUnmounted(() => {
  if (alertTimer) clearTimeout(alertTimer)
})
</script>

<template>
  <VRow>
    <!-- Header Profile -->
    <VCol cols="12">
      <VCard class="profile-header-card" rounded="lg">
        <VCardItem class="pa-5">
          <div class="d-flex align-center gap-4">
            <VAvatar size="64" color="primary" class="profile-avatar">
              <VIcon size="32" color="white">ri-user-line</VIcon>
            </VAvatar>
            <div class="flex-grow-1">
              <h3 class="mb-1 text-h6 font-weight-bold">{{ params.nama_warga }}</h3>
              <p class="ma-0 text-caption text-medium-emphasis mb-1">{{ params.nik }}</p>
              <p class="ma-0 text-caption text-medium-emphasis">{{ params.no_hp }}</p>
            </div>
            <!-- <VChip class="position-absolute" style="top: -10px; right: 0px;" :color="isAktif ? 'success' : 'error'"
              size="small" variant="flat" :prepend-icon="isAktif ? 'ri-checkbox-circle-line' : 'ri-close-circle-line'">
              {{ isAktif ? 'Aktif' : 'Tidak Aktif' }}
            </VChip> -->
          </div>
        </VCardItem>
      </VCard>
    </VCol>

    <!-- Stats Cards -->
    <VCol cols="6">
      <VCard rounded="lg" height="100%">
        <VCardItem class="pa-4">
          <div class="text-center">
            <div class="stat-icon-wrapper mb-2">
              <VIcon size="28" color="primary">ri-team-line</VIcon>
            </div>
            <p class="text-caption text-medium-emphasis ma-0 mb-1">Regu</p>
            <h4 class="ma-0">{{ namaRegu }}</h4>
          </div>
        </VCardItem>
      </VCard>
    </VCol>

    <VCol cols="6">
      <VCard rounded="lg" height="100%">
        <VCardItem class="pa-4">
          <div class="text-center">
            <div class="stat-icon-wrapper mb-2">
              <VIcon size="28" color="success">ri-user-follow-line</VIcon>
            </div>
            <p class="text-caption text-medium-emphasis ma-0 mb-1">Status</p>
            <h4 class="ma-0" :class="isAktif ? 'text-success' : 'text-error'">
              {{ isAktif ? 'Aktif' : 'Tidak Aktif' }}
            </h4>
          </div>
        </VCardItem>
      </VCard>
    </VCol>

    <!-- Form Detail -->
    <VCol cols="12">
      <VCard rounded="lg">
        <VCardItem class="pa-4 pb-0">
          <div class="d-flex align-center justify-space-between">
            <div class="d-flex align-center gap-2">
              <VIcon size="18" color="primary">ri-file-user-line</VIcon>
              <span class="font-weight-bold text-body-1">Data Diri</span>
            </div>
            <VBtn v-if="!isEditProfile" variant="flat" size="small" color="info" prepend-icon="ri-edit-line"
              @click="isEditProfile = true">
              Ubah
            </VBtn>
          </div>
          <VDivider class="mt-3" />
        </VCardItem>

        <!-- Alert sukses -->
        <Transition name="alert-slide">
          <div v-if="showSuccessAlert" style="
            margin: 0 16px;
            padding: 12px 16px;
            border-radius: 10px;
            background: rgba(var(--v-theme-success), 0.1);
            border: 1px solid rgba(var(--v-theme-success), 0.3);
            display: flex;
            align-items: center;
            gap: 10px;
          ">
            <VIcon icon="ri-checkbox-circle-line" color="success" size="20" />
            <div class="flex-grow-1">
              <p class="ma-0 font-weight-bold text-success" style="font-size: 13px;">
                Profil berhasil diperbarui!
              </p>
              <p class="ma-0 text-medium-emphasis" style="font-size: 11px;">
                Data Anda telah tersimpan.
              </p>
            </div>
            <VIcon icon="ri-close-line" size="16" color="success" class="cursor-pointer" style="opacity: 0.6;"
              @click="showSuccessAlert = false" />
          </div>
        </Transition>

        <VCardItem class="pa-4">
          <VForm ref="form" @submit.prevent="handleSubmit">
            <VRow>
              <VCol cols="12" class="pt-5">
                <!-- NIK tidak bisa diubah -->
                <VTextField v-model="params.nik" label="NIK" prepend-inner-icon="ri-id-card-line" variant="outlined"
                  density="comfortable" readonly disabled :hint="isEditProfile ? 'NIK tidak dapat diubah' : ''"
                  persistent-hint />
              </VCol>

              <VCol cols="12">
                <VTextField v-model="params.nama_warga" label="Nama Lengkap" placeholder="Masukkan nama warga"
                  :rules="[rules.nama]" :readonly="!isEditProfile" prepend-inner-icon="ri-user-line" variant="outlined"
                  density="comfortable" class="uppercase-input" />
              </VCol>

              <VCol cols="12">
                <VTextField v-model="params.no_hp" label="No. Whatsapp (WA)" placeholder="Masukkan No. Whatsapp (WA)"
                  :rules="[rules.phone]" :readonly="!isEditProfile" prepend-inner-icon="ri-phone-line"
                  variant="outlined" density="comfortable" inputmode="numeric"
                  :hint="isEditProfile ? 'Pastikan No. Whatsapp (WA) belum terdaftar di sistem. No. Whatsapp (WA) digunakan untuk login.' : ''"
                  :persistent-hint="isEditProfile" @input="handlePhoneInput" />
              </VCol>

              <VCol cols="12">
                <VTextarea v-model="params.alamat" label="Alamat" placeholder="Masukkan alamat warga"
                  :rules="[rules.alamat]" :readonly="!isEditProfile" prepend-inner-icon="ri-map-pin-line"
                  variant="outlined" density="comfortable" auto-grow rows="2" />
              </VCol>

              <!-- Field password hanya muncul saat mode edit -->
              <template v-if="isEditProfile">
                <VCol cols="12">
                  <VDivider class="mb-1" />
                </VCol>

                <!-- Tombol ubah password — muncul kalau belum klik -->
                <VCol v-if="!showPasswordForm" cols="12">
                  <VBtn color="warning" block prepend-icon="ri-lock-line" size="small"
                    @click="showConfirmPassword = true">
                    Ubah Password
                  </VBtn>
                </VCol>

                <!-- Form password — muncul setelah konfirmasi -->
                <template v-if="showPasswordForm">
                  <VCol cols="12">
                    <p class="text-caption text-medium-emphasis mb-3">
                      <VIcon size="13" class="me-1">ri-lock-line</VIcon>
                      Kosongkan jika tidak ingin mengubah password
                    </p>
                  </VCol>

                  <VCol cols="12">
                    <VTextField v-model="params.password" label="Password Baru" placeholder="Masukkan password baru"
                      type="password" prepend-inner-icon="ri-lock-line" variant="outlined" density="comfortable"
                      :rules="params.password ? [rules.password] : []" />
                  </VCol>

                  <VCol cols="12">
                    <VTextField v-model="params.password_confirmation" label="Konfirmasi Password"
                      placeholder="Ulangi password baru" type="password" prepend-inner-icon="ri-lock-2-line"
                      variant="outlined" density="comfortable"
                      :rules="params.password ? [rules.passwordConfirm] : []" />
                  </VCol>
                </template>
              </template>

              <!-- Tombol aksi saat edit -->
              <VCol v-if="isEditProfile" cols="12">
                <div class="d-flex justify-end gap-2">
                  <VBtn variant="flat" color="secondary" prepend-icon="ri-close-line" @click="handleCancel">
                    Batal
                  </VBtn>
                  <VBtn variant="flat" color="info" prepend-icon="ri-save-line" :loading="authStore.loadingUpdate"
                    type="submit">
                    Simpan
                  </VBtn>
                </div>
              </VCol>
            </VRow>
          </VForm>
        </VCardItem>
      </VCard>

      <!-- Dialog Konfirmasi Ubah Password -->
      <VDialog v-model="showConfirmPassword" max-width="360">
        <VCard rounded="lg">
          <VCardText class="pa-5 text-center">
            <VAvatar color="warning" size="52" variant="tonal" class="mb-3">
              <VIcon icon="ri-lock-line" size="26" />
            </VAvatar>
            <h3 class="mb-2">Ubah Password?</h3>
            <p class="text-body-2 text-medium-emphasis mb-0">
              Anda akan mengubah password akun ini. Pastikan Anda mengingat password baru yang akan dibuat.
            </p>
          </VCardText>
          <VDivider />
          <VCardText class="pa-4">
            <div class="d-flex gap-2 justify-end">
              <VBtn variant="tonal" color="secondary" @click="showConfirmPassword = false">
                Batal
              </VBtn>
              <VBtn variant="flat" color="warning" @click="showConfirmPassword = false; showPasswordForm = true">
                Ya, Ubah Password
              </VBtn>
            </div>
          </VCardText>
        </VCard>
      </VDialog>
    </VCol>
  </VRow>
</template>

<style scoped>
.profile-header-card {
  overflow: hidden;
  position: relative;
  background:
    linear-gradient(135deg, rgba(var(--v-theme-primary), 0.88) 0%, rgba(var(--v-theme-primary), 0.65) 100%),
    url('/banjar.jpeg') center / cover no-repeat;
}

.profile-header-card :deep(.v-card-item) {
  color: white;
  position: relative;
  z-index: 1;
}

.profile-header-card :deep(h3),
.profile-header-card :deep(p) {
  color: white !important;
}

.profile-avatar {
  border: 3px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(var(--v-theme-primary), 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.alert-slide-enter-active,
.alert-slide-leave-active {
  transition: all 0.3s ease;
}

.alert-slide-enter-from,
.alert-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.uppercase-input :deep(input) {
  text-transform: uppercase;
}
</style>
