<script setup lang="ts">
import type { ICharacter } from '~/models/Character'
import { formatEpisodeCount, labelGender, labelOrDash, labelStatus, statusTone } from '~/lib/catalog/labels'

interface Props {
  character: ICharacter | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

const dialogRef = ref<HTMLElement | null>(null)
const closeRef = ref<HTMLButtonElement | null>(null)
let returnFocus: HTMLElement | null = null

const toneClass: Record<string, string> = {
  alive: 'bg-alive-bg text-alive-fg',
  dead: 'bg-dead-bg text-dead-fg',
  unknown: 'bg-unknown-bg text-unknown-fg'
}

const facts = computed(() => {
  const character = props.character
  if (!character) { return [] }
  return [
    ['Espécie', labelOrDash(character.species)],
    ['Tipo', labelOrDash(character.type)],
    ['Gênero', labelGender(character.gender)],
    ['Origem', labelOrDash(character.origin.name)],
    ['Local', labelOrDash(character.location.name)],
    ['Episódios', formatEpisodeCount(character.episode.length)]
  ]
})

watch(() => props.character, async (character: ICharacter | null) => {
  if (character) {
    returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    document.body.style.overflow = 'hidden'
    await nextTick()
    closeRef.value?.focus()
    return
  }
  document.body.style.overflow = ''
  returnFocus?.focus()
  returnFocus = null
})

function onKeydown (event: KeyboardEvent) {
  if (!props.character || !dialogRef.value) { return }
  if (event.key === 'Escape') {
    event.preventDefault()
    emit('close')
    return
  }
  if (event.key !== 'Tab') { return }
  const focusable = Array.from(dialogRef.value.querySelectorAll('button, a[href]')) as HTMLElement[]
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (!first || !last) { return }
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="character"
      class="fixed inset-0 z-40 flex items-end justify-center overflow-hidden bg-black/75 p-3 sm:items-center sm:p-6"
      @click.self="emit('close')"
    >
      <div
        ref="dialogRef"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dossier-title"
        tabindex="-1"
        class="max-h-[90vh] min-h-0 w-full max-w-lg overflow-y-auto rounded-2xl border border-line bg-surface p-4 text-ink shadow-card sm:p-5"
      >
        <div class="flex items-start justify-between gap-3">
          <p class="text-sm font-semibold uppercase tracking-[0.14em] text-portal">
            Ficha
          </p>
          <button
            ref="closeRef"
            type="button"
            class="inline-flex min-h-11 items-center rounded-full border border-line bg-input px-4 text-sm font-semibold text-ink"
            @click="emit('close')"
          >
            Fechar
          </button>
        </div>
        <img
          :src="character.image"
          alt=""
          width="300"
          height="300"
          class="mt-3 aspect-square w-full rounded-xl bg-input object-cover"
        >
        <h2 id="dossier-title" class="mt-4 break-words text-2xl font-bold leading-tight">
          {{ character.name }}
        </h2>
        <p class="mt-2">
          <span class="sr-only">Situação: </span>
          <span
            class="inline-flex min-h-6 items-center rounded-full px-2.5 text-sm font-semibold"
            :class="toneClass[statusTone(character.status)]"
          >{{ labelStatus(character.status) }}</span>
        </p>
        <dl class="mt-4 grid gap-3">
          <div v-for="fact in facts" :key="fact[0]" class="min-w-0">
            <dt class="text-sm text-muted">
              {{ fact[0] }}
            </dt>
            <dd class="break-words text-base text-ink">
              {{ fact[1] }}
            </dd>
          </div>
        </dl>
        <p class="mt-4 text-sm text-muted">
          Registro #{{ character.id }}
        </p>
      </div>
    </div>
  </Teleport>
</template>
