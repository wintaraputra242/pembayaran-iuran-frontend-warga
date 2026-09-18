<script setup lang="ts">
import FormFilterDashboard from '@/views/dashboard-new/FormFilter.vue';
import NotifcationTableDashboard from '@/views/dashboard-new/NotifcationTable.vue';

</script>

<template>
  <div>
    <h2 class="mb-3">Dashboard</h2>
    <VRow class="match-height">
      <VCol
        cols="12"
      >
        <FormFilterDashboard />
      </VCol>
  
      <VCol
        cols="12"
        md="4"
      >
        <NotifcationTableDashboard />
      </VCol>
    </VRow>
  </div>
</template>
