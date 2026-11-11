<script setup lang="ts">
interface Props {
  title: string
  description: string
}

defineProps<Props>()
</script>

<template>
  <div class="rounded-2xl border border-line bg-surface px-4 py-10 text-center shadow-card" role="status">
    <h3 class="text-xl font-semibold text-ink">
      {{ title }}
    </h3>
    <p class="mx-auto mt-2 max-w-md text-base text-muted">
      {{ description }}
    </p>
    <div class="mt-6 flex justify-center">
      <slot />
    </div>
  </div>
</template>
