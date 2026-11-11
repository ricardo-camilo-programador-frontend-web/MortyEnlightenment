<template>
  <header class="border-b border-line">
    <div class="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-4 sm:px-6">
      <div class="relative grid h-12 w-12 shrink-0 place-items-center" aria-hidden="true">
        <span class="absolute inset-0 rounded-full border-2 border-portal motion-safe:animate-portal-spin" />
        <span class="absolute inset-2 rounded-full border border-cyan" />
        <span class="h-3.5 w-3.5 rounded-full bg-portal" />
      </div>
      <div class="min-w-0">
        <p class="text-sm font-semibold uppercase tracking-[0.16em] text-portal">
          Catálogo do multiverso
        </p>
        <h1 class="break-words text-display font-bold text-ink">
          Morty Enlightenment
        </h1>
        <p class="mt-1 max-w-xl text-sm text-muted">
          Busque, filtre e abra a ficha de cada personagem.
        </p>
      </div>
    </div>
    <nav aria-label="Seções da página" class="mx-auto flex w-full max-w-7xl flex-wrap gap-2 px-4 pb-3 sm:px-6">
      <a
        href="#filtros"
        class="inline-flex min-h-11 items-center rounded-full border border-line px-4 text-sm font-semibold text-ink"
      >Filtros</a>
      <a
        href="#catalogo"
        class="inline-flex min-h-11 items-center rounded-full border border-line px-4 text-sm font-semibold text-ink"
      >Catálogo</a>
      <a
        href="#sobre"
        class="inline-flex min-h-11 items-center rounded-full border border-line px-4 text-sm font-semibold text-ink"
      >Sobre</a>
    </nav>
  </header>
</template>
