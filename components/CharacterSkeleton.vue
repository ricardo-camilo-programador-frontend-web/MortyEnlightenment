<template>
  <ul class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-hidden="true">
    <li
      v-for="item in 4"
      :key="item"
      class="overflow-hidden rounded-2xl border border-line bg-surface"
    >
      <div class="aspect-square bg-input motion-safe:animate-pulse" />
      <div class="space-y-3 p-4">
        <div class="h-6 w-3/4 rounded bg-input" />
        <div class="h-4 w-1/3 rounded bg-input" />
        <div class="h-11 rounded-full bg-input" />
      </div>
    </li>
  </ul>
</template>
