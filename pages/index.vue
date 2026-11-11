<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useCharactersStore } from '~/stores/characters'
import type { ICharacter } from '~/models/Character'
import { hasActiveFilters, type GenderFilter, type StatusFilter } from '~/lib/catalog/query'
import { formatResultCount } from '~/lib/catalog/labels'

const charactersStore = useCharactersStore()
const { characters, info, loading, error, query } = storeToRefs(charactersStore)
const { getCharacters } = charactersStore

const name = ref('')
const species = ref('')
const dossierId = ref<number | null>(null)
let textTimer: ReturnType<typeof setTimeout> | null = null

function scheduleTextFilters () {
  if (textTimer) { clearTimeout(textTimer) }
  textTimer = setTimeout(() => {
    textTimer = null
    getCharacters({ name: name.value, species: species.value, page: 1 })
  }, 300)
}

function cancelTextFilters () {
  if (!textTimer) { return }
  clearTimeout(textTimer)
  textTimer = null
}

const canClear = computed(() => hasActiveFilters({
  name: name.value,
  species: species.value,
  status: query.value.status,
  gender: query.value.gender,
  page: query.value.page
}))

const selected = computed(() => {
  return characters.value.find(character => character.id === dossierId.value) ?? null
})

const announcement = computed(() => {
  if (loading.value) { return 'Carregando personagens.' }
  if (error.value) { return error.value }
  return `${formatResultCount(info.value?.count ?? 0)} no catálogo.`
})

function onName (value: string) {
  name.value = value
  scheduleTextFilters()
}

function onSpecies (value: string) {
  species.value = value
  scheduleTextFilters()
}

function onStatus (status: StatusFilter) {
  getCharacters({ status, page: 1 })
}

function onGender (gender: GenderFilter) {
  getCharacters({ gender, page: 1 })
}

function searchNow () {
  cancelTextFilters()
  getCharacters({ name: name.value, species: species.value, page: 1 })
}

function clearFilters () {
  cancelTextFilters()
  name.value = ''
  species.value = ''
  getCharacters({ name: '', species: '', status: '', gender: '', page: 1 })
}

async function goToPage (page: number) {
  const pages = info.value?.pages ?? 1
  const nextPage = Math.min(Math.max(page, 1), Math.max(pages, 1))
  await getCharacters({ page: nextPage })
  document.getElementById('catalogo-titulo')?.focus()
}

onBeforeUnmount(() => {
  cancelTextFilters()
})

watch(characters, (list: ICharacter[]) => {
  if (dossierId.value !== null && !list.some((character: ICharacter) => character.id === dossierId.value)) {
    dossierId.value = null
  }
})

getCharacters()
</script>

<template>
  <NuxtLayout name="default">
    <AppHeader />
    <main class="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6">
      <CatalogToolbar
        :name="name"
        :species="species"
        :status="query.status"
        :gender="query.gender"
        :can-clear="canClear"
        @update:name="onName"
        @update:species="onSpecies"
        @update:status="onStatus"
        @update:gender="onGender"
        @search="searchNow"
        @clear="clearFilters"
      />

      <section
        id="catalogo"
        class="scroll-mt-6 mt-8 min-w-0"
        aria-labelledby="catalogo-titulo"
        :aria-busy="loading ? 'true' : 'false'"
      >
        <div class="mb-4 flex flex-wrap items-end justify-between gap-3">
          <h2 id="catalogo-titulo" tabindex="-1" class="text-2xl font-bold text-ink">
            Personagens
          </h2>
          <p class="text-sm font-semibold text-muted" aria-live="polite">
            {{ announcement }}
          </p>
        </div>

        <CharacterSkeleton v-if="loading" />

        <CatalogState
          v-else-if="error"
          title="O portal falhou"
          :description="error"
        >
          <button
            type="button"
            class="inline-flex min-h-11 items-center rounded-full bg-portal px-5 text-sm font-bold text-portal-ink"
            @click="getCharacters()"
          >
            Tentar de novo
          </button>
        </CatalogState>

        <CatalogState
          v-else-if="characters.length === 0"
          title="Nenhum personagem encontrado"
          description="Nada corresponde a essa busca. Limpe os filtros ou tente outro nome."
        >
          <button
            v-if="canClear"
            type="button"
            class="inline-flex min-h-11 items-center rounded-full bg-portal px-5 text-sm font-bold text-portal-ink"
            @click="clearFilters"
          >
            Limpar filtros
          </button>
        </CatalogState>

        <ul
          v-else
          class="grid grid-cols-1 gap-4 motion-safe:animate-rise sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          <li v-for="(character, index) in characters" :key="character.id" class="min-w-0">
            <CharacterCard
              :character="character"
              :priority="index === 0"
              @open="dossierId = character.id"
            />
          </li>
        </ul>

        <nav
          v-if="(info?.pages ?? 0) > 1"
          class="mt-6 flex flex-wrap items-center justify-between gap-3"
          aria-label="Paginação do catálogo"
        >
          <button
            type="button"
            class="inline-flex min-h-11 items-center rounded-full border border-line bg-input px-4 text-sm font-semibold text-ink disabled:cursor-not-allowed disabled:text-placeholder"
            :disabled="loading || query.page <= 1"
            @click="goToPage(query.page - 1)"
          >
            Anterior
          </button>
          <p class="text-sm font-semibold text-ink">
            Página {{ query.page }} de {{ info?.pages }}
          </p>
          <button
            type="button"
            class="inline-flex min-h-11 items-center rounded-full border border-line bg-input px-4 text-sm font-semibold text-ink disabled:cursor-not-allowed disabled:text-placeholder"
            :disabled="loading || query.page >= (info?.pages ?? 1)"
            @click="goToPage(query.page + 1)"
          >
            Próxima
          </button>
        </nav>
      </section>

      <footer id="sobre" class="scroll-mt-6 mt-12 border-t border-line pb-28 pt-6 text-sm text-muted">
        <p class="max-w-2xl break-words">
          Morty Enlightenment é o catálogo pessoal de Camillus Bloodfallen.
          Os dados e retratos vêm da
          <a
            href="https://rickandmortyapi.com/"
            class="inline-flex min-h-6 items-center font-semibold text-cyan underline"
            target="_blank"
            rel="noopener noreferrer"
          >Rick and Morty API</a>.
        </p>
      </footer>
    </main>
    <CharacterDossier :character="selected" @close="dossierId = null" />
  </NuxtLayout>
</template>
