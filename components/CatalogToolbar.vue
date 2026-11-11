<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core'
import { GENDER_OPTIONS, SPECIES_SUGGESTIONS, STATUS_OPTIONS, type GenderFilter, type StatusFilter } from '~/lib/catalog/query'

interface Props {
  name: string
  species: string
  status: StatusFilter
  gender: GenderFilter
  canClear: boolean
}

const emit = defineEmits<{
  'update:name': [value: string]
  'update:species': [value: string]
  'update:status': [value: StatusFilter]
  'update:gender': [value: GenderFilter]
  search: []
  clear: []
}>()

defineProps<Props>()
const wide = useMediaQuery('(min-width: 768px)')
const filtersOpen = ref(false)
const detailsOpen = computed(() => wide.value || filtersOpen.value)

function readValue (event: Event): string {
  return (event.target as HTMLInputElement).value
}

function onToggle (event: Event) {
  if (wide.value) { return }
  filtersOpen.value = (event.target as HTMLDetailsElement).open
}
</script>

<template>
  <form
    id="filtros"
    role="search"
    class="scroll-mt-6 rounded-2xl border border-line bg-surface p-4 shadow-card"
    aria-labelledby="filtros-titulo"
    @submit.prevent="emit('search')"
  >
    <div class="flex flex-wrap items-end justify-between gap-3">
      <h2 id="filtros-titulo" class="text-xl font-semibold text-ink">
        Buscar no multiverso
      </h2>
      <div class="flex flex-wrap gap-2">
        <button type="submit" class="inline-flex min-h-11 items-center rounded-full bg-portal px-5 text-sm font-bold text-portal-ink">
          Buscar
        </button>
        <button
          type="button"
          class="inline-flex min-h-11 items-center rounded-full border border-line bg-input px-5 text-sm font-semibold text-ink disabled:cursor-not-allowed disabled:text-placeholder"
          :disabled="!canClear"
          @click="emit('clear')"
        >
          Limpar filtros
        </button>
      </div>
    </div>
    <div class="mt-3 grid gap-3 lg:grid-cols-2">
      <div class="min-w-0">
        <label for="character-name" class="text-sm font-semibold text-ink">Nome</label>
        <input
          id="character-name"
          :value="name"
          type="search"
          name="name"
          autocomplete="off"
          placeholder="Rick, Morty, Summer"
          class="mt-1 min-h-11 w-full rounded-xl border border-line bg-input px-3 text-base text-ink"
          @input="emit('update:name', readValue($event))"
        >
      </div>
      <div class="min-w-0">
        <label for="character-species" class="text-sm font-semibold text-ink">Espécie</label>
        <input
          id="character-species"
          :value="species"
          type="text"
          name="species"
          list="species-suggestions"
          autocomplete="off"
          placeholder="Human, Alien, Robot"
          class="mt-1 min-h-11 w-full rounded-xl border border-line bg-input px-3 text-base text-ink"
          @input="emit('update:species', readValue($event))"
        >
        <datalist id="species-suggestions">
          <option v-for="suggestion in SPECIES_SUGGESTIONS" :key="suggestion" :value="suggestion" />
        </datalist>
      </div>
    </div>
    <details class="filters mt-3" :open="detailsOpen" @toggle="onToggle">
      <summary class="inline-flex min-h-11 cursor-pointer list-none items-center rounded-full border border-line bg-input px-4 text-sm font-semibold text-ink md:hidden">
        {{ status || gender ? 'Filtros ativos' : 'Situação e gênero' }}
      </summary>
      <div class="filters-panel mt-3 gap-3 md:mt-0 md:grid md:grid-cols-2">
        <fieldset class="min-w-0 border-0 p-0">
          <legend class="text-sm font-semibold text-ink">
            Situação
          </legend>
          <div class="mt-2 flex flex-wrap gap-2" role="group" aria-label="Filtrar por situação">
            <button
              v-for="option in STATUS_OPTIONS"
              :key="`status-${option.label}`"
              type="button"
              class="inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-semibold"
              :class="status === option.value ? 'border-portal bg-portal text-portal-ink' : 'border-line bg-input text-ink'"
              :aria-pressed="status === option.value"
              @click="emit('update:status', option.value)"
            >
              {{ option.label }}
            </button>
          </div>
        </fieldset>
        <fieldset class="min-w-0 border-0 p-0">
          <legend class="text-sm font-semibold text-ink">
            Gênero
          </legend>
          <div class="mt-2 flex flex-wrap gap-2" role="group" aria-label="Filtrar por gênero">
            <button
              v-for="option in GENDER_OPTIONS"
              :key="`gender-${option.label}`"
              type="button"
              class="inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-semibold"
              :class="gender === option.value ? 'border-portal bg-portal text-portal-ink' : 'border-line bg-input text-ink'"
              :aria-pressed="gender === option.value"
              @click="emit('update:gender', option.value)"
            >
              {{ option.label }}
            </button>
          </div>
        </fieldset>
      </div>
    </details>
  </form>
</template>
