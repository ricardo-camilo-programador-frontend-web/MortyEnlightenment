import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { buildCharacterParams, defaultQuery, hasActiveFilters } from '~/lib/catalog/query'
import { formatEpisodeCount, formatResultCount, labelGender, labelOrDash, labelStatus } from '~/lib/catalog/labels'

const require = createRequire(import.meta.url)
const tokens = require('../lib/design/tokens.js') as {
  textPairs: [string, string][]
  uiPairs: [string, string][]
  contrastRatio: (foreground: string, background: string) => number
}

describe('catalog query', () => {
  it('omits empty filters and the first page', () => {
    expect(buildCharacterParams(defaultQuery())).toEqual({})
  })

  it('sends trimmed filters and later pages', () => {
    expect(buildCharacterParams({
      name: ' rick ',
      status: 'alive',
      gender: 'male',
      species: ' Human ',
      page: 2
    })).toEqual({
      name: 'rick',
      status: 'alive',
      gender: 'male',
      species: 'Human',
      page: 2
    })
  })

  it('detects active filters for 0 and N cases', () => {
    expect(hasActiveFilters(defaultQuery())).toBe(false)
    expect(hasActiveFilters({ ...defaultQuery(), name: 'a' })).toBe(true)
  })
})

describe('catalog labels', () => {
  it('translates status and gender and fills empty type', () => {
    expect(labelStatus('Alive')).toBe('Vivo')
    expect(labelStatus('Dead')).toBe('Morto')
    expect(labelGender('Female')).toBe('Feminino')
    expect(labelGender('Genderless')).toBe('Sem gênero')
    expect(labelOrDash('')).toBe('Não informado')
    expect(labelOrDash('   ')).toBe('Não informado')
    expect(labelOrDash('unknown')).toBe('Desconhecido')
    expect(labelOrDash('Alien')).toBe('Alien')
  })

  it('pluralizes 0, 1 and N results', () => {
    expect(formatResultCount(0)).toBe('0 personagens')
    expect(formatResultCount(1)).toBe('1 personagem')
    expect(formatResultCount(826)).toBe('826 personagens')
    expect(formatEpisodeCount(1)).toBe('1 episódio')
    expect(formatEpisodeCount(51)).toBe('51 episódios')
  })
})

describe('design tokens', () => {
  it('keeps text contrast at 4.5:1 or better', () => {
    for (const [foreground, background] of tokens.textPairs) {
      expect(tokens.contrastRatio(foreground, background)).toBeGreaterThanOrEqual(4.5)
    }
  })

  it('keeps control boundaries at 3:1 or better', () => {
    for (const [foreground, background] of tokens.uiPairs) {
      expect(tokens.contrastRatio(foreground, background)).toBeGreaterThanOrEqual(3)
    }
  })
})

describe('security headers', () => {
  it('keeps analytics sources and self-hosted fonts in the CSP', () => {
    const toml = readFileSync(new URL('../netlify.toml', import.meta.url), 'utf8')
    expect(toml).toContain('https://www.googletagmanager.com')
    expect(toml).toContain('https://www.clarity.ms')
    expect(toml).toContain('https://cdn.counter.dev')
    expect(toml).toContain("font-src 'self' data:")
    expect(toml).toContain('https://rickandmortyapi.com')
  })
})
