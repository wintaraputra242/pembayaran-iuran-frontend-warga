<script setup lang="ts">
import { useTheme } from 'vuetify'

import authV1MaskDark from '@images/pages/auth-v1-mask-dark.png'
import authV1MaskLight from '@images/pages/auth-v1-mask-light.png'

const router = useRouter()

const form = ref({
  nik: '',
  password: '',
  c_password: '',
  // remember: false,
})

const vuetifyTheme = useTheme()

const authThemeMask = computed(() => {
  return vuetifyTheme.global.name.value === 'light'
    ? authV1MaskLight
    : authV1MaskDark
})

const isPasswordVisible = ref(false)

const rules = {
  required: (v: any) => !!v || "Field wajib diisi",

  nik: (v: string) => {
    if (!v) return "NIK wajib diisi"
    if (v.length > 16) return "NIK harus 16 digit"
    return true
  },
  
  passwordLogin: (v: string) => {
    if (!v) return "Kata Sandi wajib diisi"
    return true
  },
}

const handleNIK = (value: string) => {
  form.value.nik = value
    .replace(/\D/g, '') // hanya angka
    .slice(0, 16)       // max 16 digit
}

const tab = ref('nik_input')

const confirmOptions = {
  title: '',
  message: '',
  confirmText: '',  
  cancelText: '',
  confirmColor: '',
  confirmIcon: '',
  loading: false,
  action: () => {},
}

const showConfirmation = ref(false)
const isLoadingConfirm = ref(false)

const handleCreatePassword = () => {
  confirmOptions.title = 'Konfrimasi'
  confirmOptions.message = `Pastikan Anda telah mengingat kata sandi dengan benar sebelum menekan tombol “Sudah Ingat?”. Setelah tombol tersebut ditekan, Anda akan langsung diarahkan ke halaman utama dan berhasil masuk (login). Oleh karena itu, mohon periksa kembali sebelum melanjutkan.`
  confirmOptions.confirmText = 'Sudah Ingat?'
  confirmOptions.cancelText = 'Cek Kembali'
  confirmOptions.confirmColor = 'primary'
  confirmOptions.confirmIcon = 'ri-check-line'
  confirmOptions.action = () => {
    showConfirmation.value = false

    router.push('/')
  }

  showConfirmation.value = true
}

definePageMeta({ layout: 'blank' })
</script>

<template>
  <!-- eslint-disable vue/no-v-html -->

  <div class="auth-wrapper d-flex align-center justify-center pa-4">
    <div style="max-width: 448px; width: 100%">
      <div class="d-flex align-center flex-column gap-3 mb-4">
        <!-- <div
          class="d-flex"
          v-html="logo"
        /> -->
        <VImg src="/logo.png" width="3rem" />
        <h2 class="font-weight-medium text-xl text-uppercase text-center">
          Pembayaran Iuran Banjar Trijata
        </h2>
      </div>
      <VCard
        class="auth-card pa-2 pa-md-4"
        max-width="448"
        width="100%"
      >
        <VCardItem class="justify-center">
          <VTabsWindow v-model="tab" direction="vertical">
            <VTabsWindowItem value="nik_input">
              <div>
                <h2 class="font-weight-medium text-xl mb-1">
                  Masukkan NIK
                </h2>
                <p class="mb-5">Silakan masukkan NIK Anda terlebih dahulu</p>
  
                <VForm @submit.prevent="() => {}">
                  <VRow>
                    <!-- email -->
                    <VCol cols="12">
                      <VTextField
                        :id="useId()"
                        v-model="form.nik"
                        label="NIK"
                        type="text"
                        :rules="[rules.nik]"
                        @update:model-value="handleNIK"
                      />
                    </VCol>
        
                    <VCol cols="12">
                      <VBtn
                        block
                        type="submit"
                        @click="tab = 'password_input'"
                      >
                        <!-- @click="tab = 'create_password'" -->
                        Kirim
                      </VBtn>
                    </VCol>
                  </VRow>
                </VForm>
              </div>
            </VTabsWindowItem>
            <VTabsWindowItem value="password_input">
              <div>
                <h2 class="font-weight-medium text-xl mb-1">
                  Masukkan Kata Sandi
                </h2>
                <p class="mb-5">Silakan masukkan kata sandi yang telah Anda buat sebelumnya.</p>
  
                <VForm @submit.prevent="() => {}">
                  <VRow>
                    <!-- password -->
                    <VCol cols="12">
                      <VTextField
                        :id="useId()"
                        v-model="form.password"
                        label="Kata Sandi"
                        placeholder="············"
                        :type="isPasswordVisible ? 'text' : 'password'"
                        autocomplete="password"
                        :rules="[rules.passwordLogin]"
                        :append-inner-icon="isPasswordVisible ? 'ri-eye-off-line' : 'ri-eye-line'"
                        @click:append-inner="isPasswordVisible = !isPasswordVisible"
                      />
  
                    </VCol>
        
                    <VCol cols="12">
                      <VBtn
                        block
                        type="submit"
                        class="mb-2"
                        to="/"
                      >
                        Login
                      </VBtn>
                      <VBtn
                        block
                        color="secondary"
                        type="submit"
                        @click="tab = 'nik_input'"
                      >
                        Batal
                      </VBtn>
  
                      <VBtn variant="text" class="ma-0 mt-5 text-primary pa-0">Lupa kata sandi?</VBtn>
                    </VCol>
                  </VRow>
                </VForm>
              </div>
            </VTabsWindowItem>
            <VTabsWindowItem value="create_password">
              <div>
                <h2 class="font-weight-medium text-xl mb-1">
                  Buat Kata Sandi
                </h2>
                <p class="mb-5">Karena Anda belum memiliki kata sandi, silakan buat kata sandi terlebih dahulu. Hal ini diperlukan untuk menjaga keamanan akun Anda.</p>
  
                <VForm @submit.prevent="() => {}">
                  <VRow>
                    <!-- password -->
                    <VCol cols="12">
                      <VTextField
                        :id="useId()"
                        v-model="form.password"
                        label="Kata Sandi"
                        placeholder="············"
                        :type="isPasswordVisible ? 'text' : 'password'"
                        autocomplete="password"
                        :append-inner-icon="isPasswordVisible ? 'ri-eye-off-line' : 'ri-eye-line'"
                        @click:append-inner="isPasswordVisible = !isPasswordVisible"
                      />
                    </VCol>
  
                    <VCol cols="12">
                      <VTextField
                        :id="useId()"
                        v-model="form.c_password"
                        label="Konfirmasi Kata Sandi"
                        placeholder="············"
                        :type="isPasswordVisible ? 'text' : 'password'"
                        autocomplete="password"
                        :append-inner-icon="isPasswordVisible ? 'ri-eye-off-line' : 'ri-eye-line'"
                        @click:append-inner="isPasswordVisible = !isPasswordVisible"
                      />
                    </VCol>
        
                    <VCol cols="12">
                      <VBtn
                        block
                        type="submit"
                        class="mb-2"
                        @click="handleCreatePassword"
                      >
                        Buat Kata Sandi
                      </VBtn>
                      <VBtn
                        block
                        color="secondary"
                        type="submit"
                        @click="tab = 'nik_input'"
                      >
                        Batal
                      </VBtn>
                    </VCol>
                  </VRow>
                </VForm>
              </div>
            </VTabsWindowItem>
          </VTabsWindow>
        </VCardItem>
      </VCard>
    </div>

    <ConfirmDialog
      v-model="showConfirmation"
      :title="confirmOptions.title"
      :message="confirmOptions.message"
      :confirm-text="confirmOptions.confirmText"
      :cancel-text="confirmOptions.cancelText"
      :confirm-color="confirmOptions.confirmColor"
      :confirm-icon="confirmOptions.confirmIcon"
      :loading="confirmOptions.loading"
      @confirm="confirmOptions.action"
    />
  </div>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth";
</style>
