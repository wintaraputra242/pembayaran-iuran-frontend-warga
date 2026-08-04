<script setup lang="ts">
import { useAuth } from '@/composables/api/useAuth'
import { useFirebaseMessaging } from '@/composables/useFirebaseMessaging'
import authV1MaskDark from '@images/pages/auth-v1-mask-dark.png'
import authV1MaskLight from '@images/pages/auth-v1-mask-light.png'
import { useTheme } from 'vuetify'

definePageMeta({ layout: 'blank', guest: true })

const { checkNik, login } = useAuth()
const { requestPermissionAndGetToken } = useFirebaseMessaging()
const router = useRouter()
const vuetifyTheme = useTheme()
const uiStore = useUiStore()


const form = ref({
  nik: '',
  password: '',
  c_password: '',
})

const authThemeMask = computed(() => {
  return vuetifyTheme.global.name.value === 'light'
    ? authV1MaskLight
    : authV1MaskDark
})

const isPasswordVisible = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const tab = ref('nik_input')

const rules = {
  nik: (v: string) => {
    if (!v) return 'NIK / No. Handphone wajib diisi'
    return true
  },

  password: (v: string, strict = false) => {
    if (!v) return 'Kata sandi wajib diisi'
    if (!strict) return true
    if (v.length < 6) return 'Kata sandi minimal 6 karakter'
    if (!/[a-zA-Z]/.test(v)) return 'Kata sandi harus mengandung huruf'
    if (!/[0-9]/.test(v)) return 'Kata sandi harus mengandung angka'
    if (/[^a-zA-Z0-9]/.test(v)) return 'Kata sandi tidak boleh mengandung simbol'
    return true
  },


  confirmPassword: (v: string) => {
    if (!v) return 'Konfirmasi kata sandi wajib diisi'
    if (v !== form.value.password) return 'Konfirmasi kata sandi tidak cocok'
    return true
  },
}

const handleNIK = (value: string) => {
  // Hapus filter digit only dan slice 16
  // karena no HP format Indonesia dimulai 08xxx
  form.value.nik = value
}

const handleCheckNik = async () => {
  // Hapus validasi length 16 — karena sekarang bisa NIK atau no HP
  if (!form.value.nik) return

  isLoading.value = true
  errorMessage.value = ''
  uiStore.closeError()

  try {
    const res = await checkNik({ nik: form.value.nik })

    uiStore.closeError()

    if (res.data.has_password) {
      tab.value = 'password_input'
    } else {
      tab.value = 'create_password'
    }
  } catch (e: any) {
    console.log(e);

    errorMessage.value = e?.raw?._data?.message ?? 'Terjadi kesalahan, coba lagi.'
  } finally {
    isLoading.value = false
  }
}

const handleLogin = async () => {
  if (!form.value.password) return

  isLoading.value = true
  errorMessage.value = ''
  uiStore.closeError()

  try {
    const fcmToken = await requestPermissionAndGetToken().catch(() => null)

    await login({
      nik: form.value.nik,
      password: form.value.password,
      fcm_token: fcmToken ?? undefined,
      platform: 'web',
    })

    const redirect = import.meta.client
      ? localStorage.getItem('redirect_after_login')
      : null

    uiStore.closeError()

    if (redirect) {
      localStorage.removeItem('redirect_after_login')
      router.push(redirect)
    } else {
      router.push('/')
    }
  } catch (e: any) {
    errorMessage.value = e?.raw?._data?.message ?? 'Login gagal, coba lagi.'
  } finally {
    isLoading.value = false
  }
}

const handleCreatePassword = async () => {
  if (!form.value.password || !form.value.c_password) return
  if (form.value.password !== form.value.c_password) return

  isLoading.value = true
  errorMessage.value = ''
  uiStore.closeError()

  try {
    const fcmToken = await requestPermissionAndGetToken().catch(() => null)

    await login({
      nik: form.value.nik,
      password: form.value.password,
      fcm_token: fcmToken ?? undefined,
      platform: 'web',
    })

    const redirect = import.meta.client
      ? localStorage.getItem('redirect_after_login')
      : null

    uiStore.closeError()

    if (redirect) {
      localStorage.removeItem('redirect_after_login')
      router.push(redirect)
    } else {
      router.push('/')
    }
  } catch (e: any) {
    errorMessage.value = e?.data?.message ?? 'Gagal membuat kata sandi, coba lagi.'
  } finally {
    isLoading.value = false
  }
}

const handleBack = () => {
  tab.value = 'nik_input'
  form.value.password = ''
  errorMessage.value = ''
}

const adminPhone = useRuntimeConfig().public.adminPhone
</script>

<template>
  <div class="auth-wrapper d-flex align-center justify-center pa-4">
    <div style="max-width: 448px; width: 100%">
      <div class="d-flex align-center flex-column gap-3 mb-4">
        <VImg src="/logo.png" width="3rem" />
        <h2 class="font-weight-medium text-xl text-uppercase text-center">
          Pembayaran Iuran Banjar Trijata
        </h2>
      </div>

      <VCard class="auth-card pa-2 pa-md-4" max-width="448" width="100%">
        <VCardItem class="justify-center">
          <VTabsWindow v-model="tab" direction="vertical">

            <!-- Step 1: Input NIK -->
            <VTabsWindowItem value="nik_input">
              <h2 class="font-weight-medium text-xl mb-1">Masukkan NIK</h2>
              <p class="mb-5">Silakan masukkan NIK Anda terlebih dahulu</p>

              <VAlert v-if="errorMessage" type="error" class="mb-4" density="compact">
                {{ errorMessage }}
              </VAlert>

              <VForm @submit.prevent="handleCheckNik">
                <VRow>
                  <VCol cols="12">
                    <VTextField :id="useId()" v-model="form.nik" label="NIK / No. Handphone" type="text"
                      :rules="[rules.nik]" :disabled="isLoading" @update:model-value="handleNIK" />
                  </VCol>

                  <VCol cols="12">
                    <VBtn block type="submit" :loading="isLoading">
                      Kirim
                    </VBtn>
                  </VCol>
                </VRow>
              </VForm>
            </VTabsWindowItem>

            <!-- Step 2: Input Password -->
            <VTabsWindowItem value="password_input">
              <h2 class="font-weight-medium text-xl mb-1">Masukkan Kata Sandi</h2>
              <p class="mb-5">Silakan masukkan kata sandi yang telah Anda buat sebelumnya.</p>

              <VAlert v-if="errorMessage" type="error" class="mb-4" density="compact">
                {{ errorMessage }}
              </VAlert>

              <VForm @submit.prevent="handleLogin">
                <VRow>
                  <VCol cols="12">
                    <VTextField :id="useId()" v-model="form.password" label="Kata Sandi" placeholder="············"
                      :type="isPasswordVisible ? 'text' : 'password'" autocomplete="password" :rules="[rules.password]"
                      :disabled="isLoading" :append-inner-icon="isPasswordVisible ? 'ri-eye-off-line' : 'ri-eye-line'"
                      @click:append-inner="isPasswordVisible = !isPasswordVisible" />

                    <!-- Lupa Password -->
                    <div class="text-end mt-1">
                      <a :href="`https://wa.me/${adminPhone}?text=${encodeURIComponent('Halo, saya lupa password akun iuran warga. Mohon bantu reset password saya.')}`"
                        target="_blank" class="text-caption text-primary" style="text-decoration: none;">
                        Lupa kata sandi?
                      </a>
                    </div>
                  </VCol>

                  <VCol cols="12">
                    <VBtn block type="submit" class="mb-2" :loading="isLoading">
                      Login
                    </VBtn>
                    <VBtn block color="secondary" :disabled="isLoading" @click="handleBack">
                      Batal
                    </VBtn>
                  </VCol>
                </VRow>
              </VForm>
            </VTabsWindowItem>

            <!-- Step 3: Buat Password -->
            <VTabsWindowItem value="create_password">
              <h2 class="font-weight-medium text-xl mb-1">Buat Kata Sandi</h2>
              <p class="mb-5">Karena Anda belum memiliki kata sandi, silakan buat kata sandi terlebih dahulu.</p>

              <VAlert v-if="errorMessage" type="error" class="mb-4" density="compact">
                {{ errorMessage }}
              </VAlert>

              <VForm @submit.prevent="handleCreatePassword">
                <VRow>
                  <VCol cols="12">
                    <VTextField :id="useId()" v-model="form.password" label="Kata Sandi" placeholder="············"
                      :type="isPasswordVisible ? 'text' : 'password'" autocomplete="password" :disabled="isLoading"
                      :rules="[(v) => rules.password(v, true)]" hint="Minimal 6 karakter, kombinasi huruf dan angka"
                      persistent-hint :append-inner-icon="isPasswordVisible ? 'ri-eye-off-line' : 'ri-eye-line'"
                      @click:append-inner="isPasswordVisible = !isPasswordVisible" />
                  </VCol>

                  <VCol cols="12">
                    <VTextField :id="useId()" v-model="form.c_password" label="Konfirmasi Kata Sandi"
                      placeholder="············" :type="isPasswordVisible ? 'text' : 'password'" autocomplete="password"
                      :disabled="isLoading" :rules="[rules.confirmPassword]"
                      :append-inner-icon="isPasswordVisible ? 'ri-eye-off-line' : 'ri-eye-line'"
                      @click:append-inner="isPasswordVisible = !isPasswordVisible" />
                  </VCol>

                  <VCol cols="12">
                    <VBtn block type="submit" class="mb-2" :loading="isLoading">
                      Buat Kata Sandi
                    </VBtn>
                    <VBtn block color="secondary" :disabled="isLoading" @click="handleBack">
                      Batal
                    </VBtn>
                  </VCol>
                </VRow>
              </VForm>
            </VTabsWindowItem>

          </VTabsWindow>
        </VCardItem>
      </VCard>
    </div>
  </div>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth";
</style>
