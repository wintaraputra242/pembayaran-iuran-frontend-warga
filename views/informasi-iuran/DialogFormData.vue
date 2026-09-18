<script lang="ts" setup>
import type { InformasiIuran } from '@/types/api/informasi-iuran';

const emit = defineEmits<{
  (e: 'reload'): void;
  (e: 'close'): void;
}>();

const props = withDefaults(defineProps<{
  isShow: boolean
  isEdit: boolean
  item?: InformasiIuran | null
}>(), {
  isShow: false,
  isEdit: false,
})

const form = ref(null)

const defaultParams = {
  judul: '' as string | undefined,
  jenis_iuran: null as string | null | undefined,
  periode: null as string | null | undefined,
  keterangan: '' as string | undefined,
  status_aktif: '',
}
const params = reactive({...defaultParams})

const rules = {
  required: (v: any) => !!v || "Field wajib diisi",

  judul: (v: string) => {
    if (!v) return "Judul wajib diisi"
    if (v.length > 100) return "Judul maksimal 100 karakter"
    return true
  },

  jenis_iuran: (v: string) => {
    if (!v) return "Jenis iuran wajib dipilih"
    if (!['bulanan', 'kematian'].includes(v)) return "Jenis iuran tidak valid"
    return true
  },

  periode: (v: string) => {
    if (!v) return "Periode wajib diisi"
    if (!/^\d{4}$/.test(v)) return "Periode harus berupa tahun, 4 digit"
    if (Number(v) < 2000) return "Periode minimal tahun 2000"
    return true
  },

  keterangan: (v: string) => {
    if (!v) return "Keterangan wajib diisi"
    if (v.length > 255) return "Keterangan maksimal 255 karakter"
    return true
  },
}

const handleClose = () => {
  (form.value as any)?.reset()

  emit('close')
}

watch(
  () => props.isEdit,
  newVal => {
    if (!newVal) return

    params.judul = props.item?.judul_iuran
    params.jenis_iuran = props.item?.jenis_iuran
    params.periode = props.item?.periode
    params.keterangan = props.item?.keterangan
  }
)

const currentYear = new Date().getFullYear()

const years = Array.from({ length: 31 }, (_, i) => (currentYear + i).toString())
</script>

<template>
  <VDialog v-model="props.isShow">
    <VCard>
      <VCardTitle class="pt-3">
        <div class="d-flex align-center justify-space-between">
          <h3>{{ props.isEdit ? 'Edit' : 'Tambah' }}</h3>
          <IconBtn variant="text" color="secondary" size="small" @click="handleClose">
            <VIcon icon="ri-close-line" />
          </IconBtn>
        </div>
      </VCardTitle>
      <VCardItem>
        <VForm ref="form" @submit.prevent="() => {}">
          <VRow align="center" class="pt-1">
            <VCol cols="12">
              <VTextField
                v-model="params.judul"
                label="Judul"
                placeholder="Masukkan judul iuran"
                :rules="[rules.judul]"
              />
            </VCol>
            <VCol cols="12">
              <VSelect
                v-model="params.jenis_iuran"
                label="Jenis Iuran"
                placeholder="Masukkan jenis iuran"
                :items="['Bulanan', 'Kematian']"
                :rules="[rules.jenis_iuran]"
              />
            </VCol>
            <VCol cols="12">
              <VSelect
                v-model="params.periode"
                label="Periode"
                placeholder="Masukkan periode iuran"
                :items="years"
                :rules="[rules.periode]"
              />
            </VCol>
            <VCol cols="12">
              <VTextarea
                v-model="params.keterangan"
                label="Keterangan"
                placeholder="Masukkan keterangan iuran"
                :rules="[rules.keterangan]"
              />
            </VCol>
            <VCol cols="12">
              <div class="d-flex justify-end flex-wrap gap-2">
                <VBtn variant="text" color="secondary" size="small" @click="handleClose">
                  <VIcon icon="ri-close-line" class="me-1" />
                  Batal
                </VBtn>
                <VBtn variant="flat" :color="props.isEdit ? 'info' : 'success'" size="small" type="submit">
                  <VIcon :icon="props.isEdit ? 'ri-save-2-line' : 'ri-add-line'" class="me-1" />
                  {{ props.isEdit ? 'Simpan' : 'Tambah'}}
                </VBtn>
              </div>
            </VCol>
          </VRow>
        </VForm>
      </VCardItem>
    </VCard>
  </VDialog>
</template>

<style>
.dropzone {
  width: 100%;
  padding: 30px;
  border: 2px dashed #888;
  border-radius: 10px;
  text-align: center;
}
</style>
