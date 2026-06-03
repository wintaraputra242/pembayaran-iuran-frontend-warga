<script setup lang="ts">
const emit = defineEmits<{
  (e: 'showHistoryPayment', item: object): void
  (e: 'showBuktiBayar'): void
}>()

const authStore = useAuthStore()

const defaultParams = {
  nik: (authStore.user as any)?.warga?.nik,
  nama_warga: (authStore.user as any)?.warga?.nama_warga,
  alamat: (authStore.user as any)?.warga?.alamat,
  no_hp: (authStore.user as any)?.warga?.no_hp,
  password: '',
  password_confirmation: '',
}
const params = reactive({ ...defaultParams })

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
const form = ref()

const handleSubmit = async () => {
  const { valid } = await form.value.validate()
  if (!valid) return

  const body: Record<string, any> = {
    nama_warga: params.nama_warga,
    alamat: params.alamat,
    no_hp: params.no_hp,
  }

  if (params.password) {
    body.password = params.password
    body.password_confirmation = params.password_confirmation
  }

  const res = await authStore.updateProfile(body)
  if (res) isEditProfile.value = false
}


const handleCancel = () => {
  Object.assign(params, defaultParams)
  form.value?.resetValidation()
  isEditProfile.value = false
}
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
              <h3 class="mb-1">{{ params.nama_warga }}</h3>
              <p class="ma-0 text-caption text-medium-emphasis">{{ params.nik }}</p>
              <p class="ma-0 text-caption text-medium-emphasis">{{ params.no_hp }}</p>
            </div>
            <VChip color="success" size="small" variant="tonal" prepend-icon="ri-checkbox-circle-line">
              Aktif
            </VChip>
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
            <h4 class="ma-0">Regu A</h4>
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
            <h4 class="ma-0 text-success">Aktif</h4>
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

        <VCardItem class="pa-4">
          <VForm ref="form" @submit.prevent="handleSubmit">
            <VRow>
              <VCol cols="12">
                <!-- NIK tidak bisa diubah -->
                <VTextField v-model="params.nik" label="NIK" prepend-inner-icon="ri-id-card-line" variant="outlined"
                  density="comfortable" readonly disabled hint="NIK tidak dapat diubah" persistent-hint />
              </VCol>

              <VCol cols="12">
                <VTextField v-model="params.nama_warga" label="Nama Lengkap" placeholder="Masukkan nama warga"
                  :rules="[rules.nama]" :readonly="!isEditProfile" prepend-inner-icon="ri-user-line" variant="outlined"
                  density="comfortable" />
              </VCol>

              <VCol cols="12">
                <VTextField v-model="params.no_hp" label="No. Handphone" placeholder="Masukkan no. handphone"
                  :rules="[rules.phone]" :readonly="!isEditProfile" prepend-inner-icon="ri-phone-line"
                  variant="outlined" density="comfortable" />
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
                    variant="outlined" density="comfortable" :rules="params.password ? [rules.passwordConfirm] : []" />
                </VCol>
              </template>

              <!-- Tombol aksi saat edit -->
              <VCol v-if="isEditProfile" cols="12">
                <div class="d-flex justify-end gap-2">
                  <VBtn variant="flat" color="secondary" prepend-icon="ri-close-line" @click="handleCancel">
                    Batal
                  </VBtn>
                  <VBtn variant="flat" color="info" prepend-icon="ri-save-line" type="submit">
                    Simpan
                  </VBtn>
                </div>
              </VCol>
            </VRow>
          </VForm>
        </VCardItem>
      </VCard>
    </VCol>
  </VRow>
</template>

<style scoped>
.profile-header-card {
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, rgba(var(--v-theme-primary), 0.8) 100%);
}

.profile-header-card :deep(.v-card-item) {
  color: white;
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
</style>
