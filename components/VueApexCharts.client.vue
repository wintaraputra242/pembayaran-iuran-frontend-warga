<script setup lang="ts">
// eslint-disable-next-line no-restricted-imports
// @ts-expect-error - vue3-apexcharts ships typings but its package.json "exports" field hides them from TS resolution
import VueApexCharts from 'vue3-apexcharts'

defineOptions({
  inheritAttrs: false,
})
</script>

<template>
  <VueApexCharts v-bind="$attrs" />
</template>
