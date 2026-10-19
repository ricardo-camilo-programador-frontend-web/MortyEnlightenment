<script setup lang="ts">
const config = useRuntimeConfig()

useHead({
  title: config.public.siteName,
  titleTemplate: (titleChunk) => {
    return titleChunk && titleChunk !== config.public.siteName
      ? `${titleChunk} - ${config.public.siteName}`
      : config.public.siteName
  },
  htmlAttrs: {
    lang: config.public.language || 'pt-BR'
  }
})

useSeoMeta({
  title: config.public.siteName,
  description: config.public.siteDescription,
  ogTitle: config.public.siteName,
  ogDescription: config.public.siteDescription
})
</script>

<template>
  <div>
    <NuxtPage />
  </div>
</template>
