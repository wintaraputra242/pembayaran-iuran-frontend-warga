<script setup lang="ts">
import PwaPrompt from './layouts/components/PwaPrompt.vue';

// const { isMobile } = useDevice()
// if (isMobile)
// configStore.appContentLayoutNav = 'vertical'
</script>

<template>

  <Head>
    <Meta name="theme-color" content="#ffffff" />
    <Meta name="mobile-web-app-capable" content="yes" />
    <Meta name="apple-mobile-web-app-capable" content="yes" />
    <Meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <Meta name="apple-mobile-web-app-title" content="Iuran Trijata" />
    <Link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
  </Head>

  <VApp>
    <NuxtLayout>
      <NuxtPage />
      <PwaPrompt />
    </NuxtLayout>
  </VApp>
</template>
