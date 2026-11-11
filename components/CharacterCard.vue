<script setup lang="ts">
import type { ICharacter } from '~/models/Character'
import { labelGender, labelOrDash, labelStatus, statusTone } from '~/lib/catalog/labels'

interface Props {
  character: ICharacter
  priority?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  priority: false
})

defineEmits<{
  open: []
}>()

const toneClass: Record<string, string> = {
  alive: 'bg-alive-bg text-alive-fg',
  dead: 'bg-dead-bg text-dead-fg',
  unknown: 'bg-unknown-bg text-unknown-fg'
}
</script>

<template>
  <article class="flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
    <img
      :src="props.character.image"
      alt=""
      width="300"
      height="300"
      :loading="props.priority ? 'eager' : 'lazy'"
      :fetchpriority="props.priority ? 'high' : 'low'"
      decoding="async"
      class="h-44 w-full bg-input object-cover sm:h-52"
    >
    <div class="flex min-w-0 flex-1 flex-col gap-3 p-4">
      <h3 class="break-words text-xl font-semibold leading-tight text-ink">
        {{ props.character.name }}
      </h3>
      <p>
        <span class="sr-only">Situação: </span>
        <span
          class="inline-flex min-h-6 items-center rounded-full px-2.5 text-sm font-semibold"
          :class="toneClass[statusTone(props.character.status)]"
        >{{ labelStatus(props.character.status) }}</span>
      </p>
      <dl class="grid min-w-0 gap-2 text-sm">
        <div class="min-w-0">
          <dt class="text-muted">
            Espécie
          </dt>
          <dd class="break-words text-ink">
            {{ labelOrDash(props.character.species) }}
          </dd>
        </div>
        <div class="min-w-0">
          <dt class="text-muted">
            Origem
          </dt>
          <dd class="break-words text-ink">
            {{ labelOrDash(props.character.origin.name) }}
          </dd>
        </div>
      </dl>
      <button
        type="button"
        class="mt-auto inline-flex min-h-11 items-center justify-center rounded-full border border-line bg-input px-4 text-sm font-semibold text-ink"
        :aria-label="`Ver ficha de ${props.character.name}`"
        @click="$emit('open')"
      >
        Ver ficha
      </button>
      <p class="sr-only">
        Gênero {{ labelGender(props.character.gender) }}
      </p>
    </div>
  </article>
</template>
