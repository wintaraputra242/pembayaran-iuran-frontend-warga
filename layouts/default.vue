<script lang="ts" setup>
import BottomNav from './components/BottomNav.vue';

const uiStore = useUiStore()
</script>

<template>
  <div class="outer-wrapper">
    <div class="inner-wrapper">
      <!-- Top Navbar -->
      <div class="top-navbar">
        <span class="app-name">Pembayaran Iuran Br. Trijata</span>
      </div>

      <VMain>
        <div class="pa-5">
          <slot />
        </div>
      </VMain>

      <BottomNav />

      <WargaChatbotWidget />

      <ErrorDialog :show="uiStore.errorDialog.show" :title="uiStore.errorDialog.title"
        :message="uiStore.errorDialog.message" @close="uiStore.closeError" />
    </div>
  </div>
</template>

<style lang="scss">
@use "@layouts/styles/default-layout";

html,
body {
  background-color: #f0f0f0; // warna luar
  min-height: 100%;
}

.outer-wrapper {
  display: flex;
  justify-content: center;
  min-height: 100dvh;
  background-color: #f0f0f0; // warna luar
}

.inner-wrapper {
  width: 100%;
  max-width: 768px;
  min-height: 100dvh;
  background-color: #ffffff; // warna dalam
  position: relative;
  padding-top: 50px;
}

.top-navbar {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 768px;
  /* sesuaikan dengan max-width inner-wrapper */
  z-index: 1000;
  background-color: rgb(var(--v-theme-primary));
  padding: 14px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.app-name {
  color: #ffffff;
  font-weight: 700;
  font-size: 15px;
  letter-spacing: 0.3px;
  text-transform: uppercase;
}

/* Tambahkan padding top di VMain agar konten tidak tertutup navbar */
:deep(.v-main) {
  padding-top: 52px !important;
}
</style>
