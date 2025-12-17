<script lang="ts" setup>
import BottomNav from './components/BottomNav.vue';

</script>

<template>
  <!-- <DefaultLayoutWithVerticalNav>
    <slot />
  </DefaultLayoutWithVerticalNav> -->
  <!-- <div> -->
    <VMain>
      <div class="pa-5">
        <slot />
      </div>

      
    </VMain>
    
    <BottomNav />
  <!-- </div> -->
</template>

<style lang="scss">
// As we are using `layouts` plugin we need its styles to be imported
@use "@layouts/styles/default-layout";
</style>
