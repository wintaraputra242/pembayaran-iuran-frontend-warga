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

watch(tab, (val) => {
  loadData(val)
})

let debounceTimer: any

watch(() => iuranStore.filters.keyword, () => {
  if (debounceTimer) clearTimeout(debounceTimer)

  debounceTimer = setTimeout(() => {
    loadData(tab.value)
  }, 500)
})

watch(() => route.query.jenis_iuran, (newVal) => {
  if (newVal) {
    tab.value = newVal as 'kematian' | 'bulanan'
  }
}, { immediate: true })

const handleLoadMore = async () => {
  page.value += 1

  await iuranStore.fetchIuranWithStatus({
    page: page.value,
    per_page: 10,
    jenis_iuran: tab.value,
  })
}

onMounted(() => {
  loadData('kematian')
})
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
        <div class="mb-3">
          <VTextField :model-value="iuranStore.filters.keyword" placeholder="Cari informasi iuran kematian"
            prepend-inner-icon="ri-search-2-line" @update:model-value="iuranStore.setFilter('keyword', $event)" />
        </div>

        <ListInformasiIuranCreatePembayaran :items="kematianItems" :loading="iuranStore.loading"
          :has-more="iuranStore.hasMore" @load-more="handleLoadMore" />
      </VTabsWindowItem>

      <!-- BULANAN -->
      <VTabsWindowItem class="py-5" value="bulanan">
        <div class="mb-3">
          <VTextField :model-value="iuranStore.filters.keyword" placeholder="Cari informasi iuran bulanan"
            prepend-inner-icon="ri-search-2-line" @update:model-value="iuranStore.setFilter('keyword', $event)" />
        </div>

        <ListInformasiIuranCreatePembayaran :items="bulananItems" :loading="iuranStore.loading"
          :has-more="iuranStore.hasMore" @load-more="handleLoadMore" />
      </VTabsWindowItem>

    </VTabsWindow>
  </div>
</template>
