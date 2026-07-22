<script setup lang="ts">
import ListInformasiIuranCreatePembayaran from '@/views/create-pembayaran/ListInformasiIuran.vue'

const route = useRoute()
const iuranStore = useInformasiIuranStore()

const tab = ref<'kematian' | 'bulanan'>('kematian')
const page = ref(1)

const kematianItems = computed(() =>
  iuranStore.iuranList.filter(i => i.jenis_iuran === 'kematian')
)

const bulananItems = computed(() =>
  iuranStore.iuranList.filter(i => i.jenis_iuran === 'bulanan')
)

const loadData = async (type: 'kematian' | 'bulanan') => {
  iuranStore.reload = true
  iuranStore.setFilter('jenis_iuran', type)
  page.value = 1

  await iuranStore.fetchIuranWithStatus({
    page: page.value,
    per_page: 10,
    jenis_iuran: type,
  })
}

watch(tab, (val) => loadData(val), { immediate: true })

// Debounce keyword search
let debounceTimer: any
watch(() => iuranStore.filters.keyword, () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => loadData(tab.value), 500)
})

// Filter status_bayar
watch(() => iuranStore.filters.status_bayar, () => loadData(tab.value))

watch(() => route.query.jenis_iuran, (newVal) => {
  tab.value = (newVal as 'kematian' | 'bulanan') ?? 'kematian'
}, { immediate: true })

const handleLoadMore = async () => {
  page.value += 1
  await iuranStore.fetchIuranWithStatus({
    page: page.value,
    per_page: 10,
    jenis_iuran: tab.value,
  })
}

// onMounted(() => loadData('kematian'))
</script>

<template>
  <div>
    <div class="mb-4">
      <h2>Informasi Iuran</h2>
      <span>Pilih informasi iuran terlebih dahulu sebelum menambahkan pembayaran</span>
    </div>

    <!-- TABS -->
    <VTabs v-model="tab" color="primary">
      <VTab value="kematian">Kematian</VTab>
      <VTab value="bulanan">Bulanan</VTab>
    </VTabs>

    <VDivider />

    <!-- CONTENT -->
    <VTabsWindow v-model="tab">

      <!-- KEMATIAN -->
      <VTabsWindowItem class="py-5" value="kematian">
        <VRow class="mb-3">
          <VCol cols="12" sm="8">
            <VTextField :model-value="iuranStore.filters.keyword"
              placeholder="Cari judul, nama almarhum, atau penanggung jawab" prepend-inner-icon="ri-search-2-line"
              hide-details @update:model-value="iuranStore.setFilter('keyword', $event)" />
          </VCol>
          <VCol cols="12" sm="4">
            <VSelect :model-value="iuranStore.filters.status_bayar" placeholder="Semua Status" clearable hide-details
              :items="[
                { title: 'Sudah Bayar', value: 'sudah_bayar' },
                { title: 'Belum Bayar', value: 'belum_bayar' },
              ]" item-title="title" item-value="value"
              @update:model-value="iuranStore.setFilter('status_bayar', $event ?? null)" />
          </VCol>
        </VRow>

        <ListInformasiIuranCreatePembayaran :items="kematianItems" :loading="iuranStore.loading"
          :has-more="iuranStore.hasMore" :keyword="iuranStore.filters.keyword" @load-more="handleLoadMore" />
      </VTabsWindowItem>

      <!-- BULANAN -->
      <VTabsWindowItem class="py-5" value="bulanan">
        <VRow class="mb-3">
          <VCol cols="12" sm="8">
            <VTextField :model-value="iuranStore.filters.keyword" placeholder="Cari judul atau periode iuran"
              prepend-inner-icon="ri-search-2-line" hide-details
              @update:model-value="iuranStore.setFilter('keyword', $event)" />
          </VCol>
          <VCol cols="12" sm="4">
            <VSelect :model-value="iuranStore.filters.status_bayar" placeholder="Semua Status" clearable hide-details
              :items="[
                { title: 'Sudah Bayar', value: 'sudah_bayar' },
                { title: 'Sebagian Bayar', value: 'sebagian_bayar' },
                { title: 'Belum Bayar', value: 'belum_bayar' },
              ]" item-title="title" item-value="value"
              @update:model-value="iuranStore.setFilter('status_bayar', $event ?? null)" />
          </VCol>
        </VRow>

        <ListInformasiIuranCreatePembayaran :items="bulananItems" :loading="iuranStore.loading"
          :has-more="iuranStore.hasMore" :keyword="iuranStore.filters.keyword" @load-more="handleLoadMore" />
      </VTabsWindowItem>

    </VTabsWindow>
  </div>
</template>
