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

const defaultParams = {
  nik: '3101123123123123',
  nama_warga: 'Gusti Putu Wintara Putra',
  alamat: 'Jl. Raya Mambal - Ubud',
  no_hp: '081123123123',
}
const params = reactive({...defaultParams})

const rules = {
  required: (v: any) => !!v || "Field wajib diisi",

  nik: (v: string) => {
    if (!v) return "NIK wajib diisi"
    if (v.length !== 16) return "NIK harus 16 digit"
    return true
  },

  nama: (v: string) => {
    if (!v) return "Nama wajib diisi"
    if (v.length < 3) return "Nama minimal 3 karakter"
    if (!/^[A-Za-z\s'.-]+$/.test(v))
      return "Nama hanya boleh huruf, spasi, titik, dan tanda petik"
    return true
  },

  alamat: (v: string) => {
    if (!v) return "Alamat wajib diisi"
    if (v.length < 5) return "Alamat terlalu pendek"
    return true
  },

  phone: (v: string) => {
    if (!v) return "No. HP wajib diisi"

    // format nomor telepon Indonesia
    const cleaned = v.replace(/\D/g, "") // hapus semua non-digit

    if (!/^08\d{8,11}$/.test(cleaned))
      return "No. HP harus format Indonesia (contoh: 081234567890)"

    return true
  },
}

const handleNIK = (value: string) => {
  params.nik = value
    .replace(/\D/g, '') 
    .slice(0, 16)       
}

const isEditProfile = ref(false)

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
    <VCol cols="6">
      <VCard class="pa-0">
        <VCardItem class="pa-4 pt-5">
          <div class="text-center">
            <VIcon size="40">ri-team-line</VIcon>
            <div class="mt-1">
              <h3>Regu</h3>
              <p class="ma-0 text-body-2">Regu A</p>
            </div>
          </div>
        </VCardItem>
      </VCard>
    </VCol>
    <VCol cols="6">
      <VCard class="pa-0">
        <VCardItem class="pa-4 pt-5">
          <div class="text-center">
            <VIcon size="40">ri-user-follow-line</VIcon>
            <div class="mt-1">
              <h3>Status</h3>
              <p class="ma-0 text-body-2 text-success">Aktif</p>
            </div>
          </div>
        </VCardItem>
      </VCard>
    </VCol>
    <VCol cols="12">
      <VCard class="pa-0 position-relative overflow-visible">
        <VCardItem class="pa-4 pt-5">
          <VForm @submit="isEditProfile = false">
            <VRow>
              <VCol cols="12">
                <VTextField
                  v-model="params.nik"
                  label="NIK"
                  placeholder="Masukkan nik warga"
                  :rules="[rules.nik]"
                  maxlength="16"
                  :readonly="!isEditProfile"
                  :disabled="isEditProfile"
                  @update:model-value="handleNIK"
                />
              </VCol>
              <VCol cols="12">
                <VTextField
                  v-model="params.nama_warga"
                  label="Nama"
                  :readonly="!isEditProfile"
                  placeholder="Masukkan nama warga"
                  :rules="[rules.nama]"
                />
              </VCol>
              <VCol cols="12">
                <VTextarea
                  v-model="params.alamat"
                  label="Alamat"
                  :readonly="!isEditProfile"
                  placeholder="Masukkan alamat warga"
                  :rules="[rules.alamat]"
                  auto-grow
                />
              </VCol>
              <VCol cols="12">
                <VTextField
                  v-model="params.no_hp"
                  label="No. Handphone"
                  :readonly="!isEditProfile"
                  placeholder="Masukkan no. handphone warga"
                  :rules="[rules.phone]"
                />
              </VCol>
              <VCol cols="12">
                <div>
                  <VBtn v-if="!isEditProfile" variant="flat" block color="info" @click="isEditProfile = true">
                    Ubah Profil
                  </VBtn>
                  <template v-else>
                    <div class="d-flex gap-2">
                      <div class="w-50">
                        <VBtn block variant="flat" color="secondary" @click="isEditProfile = false">
                          Batal
                        </VBtn>
                      </div>
                      <div class="w-50">
                        <VBtn block variant="flat" :color="'info'" type="submit">
                          Simpan
                        </VBtn>
                      </div>
                    </div>
                  </template>
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
.table-scroll-wrapper {
  max-height: 400px;   /* tinggi container */
  overflow-y: auto;
  overflow-x: hidden;
  height: 100%;
}
</style>
