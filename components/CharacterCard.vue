<script setup lang="ts">
import type { ICharacter } from '~/models/Character'

interface Props {
  character: ICharacter
  class?: string
}

const props = defineProps<Props>()

const characterImage = computed(() => {
  return props.character.image
})

</script>
<template>
  <div
    class="flex flex-col md:flex-row lg:flex-col bg-gray-100 p-4 rounded-xl basis-auto w-[17rem]"
    :class="props.class"
  >
    <div class="flex w-full h-52 rounded-xl flex-col justify-between items-center text-center lg:justify-center p-1">
      <img
        :src="characterImage"
        :alt="props.character.name"
        class="w-46 lg:w-24 rounded-full mx-auto"
        loading="lazy"
      >
      <p class="text-3xl font-bold">
        {{ props.character.name }}
      </p>
    </div>
    <div class="flex flex-col mt-4 lg:w-10/12">
      <div class="flex flex-wrap items-center">
        <span class="text-sm font-bold">Status:&nbsp;</span>
        <span class="w-full">{{ props.character.status }}</span>
      </div>
      <div class="flex flex-wrap items-center">
        <span class="text-sm font-bold">Species:&nbsp;</span>
        <span class="w-full">{{ props.character.species }}</span>
      </div>
      <div class="flex flex-wrap items-center">
        <span class="text-sm font-bold">Type:&nbsp;</span>
        <span class="w-full">{{ props.character.type }}</span>
      </div>
      <div class="flex flex-wrap items-center">
        <span class="text-sm font-bold">Gender:&nbsp;</span>
        <span class="w-full">{{ props.character.gender }}</span>
      </div>
      <div class="flex flex-wrap items-center">
        <span class="text-sm font-bold">Origin:&nbsp;</span>
        <span class="w-full">{{ props.character.origin.name }}</span>
      </div>
      <div class="flex flex-wrap items-center">
        <span class="text-sm font-bold">Location:&nbsp;</span>
        <span class="w-full">{{ props.character.location.name }}</span>
      </div>
    </div>
    <!-- <div class="flex flex-col mt-4">
      <h2 class="text-xl font-bold">
        Episodes
      </h2>
      <ul class="list-unstyled">
        <li v-for="episode in props.character.episode" :key="episode">
          <a :href="episode">{{ episode }}</a>
        </li>
      </ul>
    </div> -->
  </div>
</template>
