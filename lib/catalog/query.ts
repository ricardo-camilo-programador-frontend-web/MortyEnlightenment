export type StatusFilter = '' | 'alive' | 'dead' | 'unknown'
export type GenderFilter = '' | 'female' | 'male' | 'genderless' | 'unknown'

export interface CharacterQuery {
  name: string
  status: StatusFilter
  gender: GenderFilter
  species: string
  page: number
}

export interface FilterOption<T extends string> {
  value: T
  label: string
}

export const STATUS_OPTIONS: FilterOption<StatusFilter>[] = [
  { value: '', label: 'Todas' },
  { value: 'alive', label: 'Vivo' },
  { value: 'dead', label: 'Morto' },
  { value: 'unknown', label: 'Desconhecido' }
]

export const GENDER_OPTIONS: FilterOption<GenderFilter>[] = [
  { value: '', label: 'Todos' },
  { value: 'female', label: 'Feminino' },
  { value: 'male', label: 'Masculino' },
  { value: 'genderless', label: 'Sem gênero' },
  { value: 'unknown', label: 'Desconhecido' }
]

export const SPECIES_SUGGESTIONS = [
  'Human',
  'Alien',
  'Humanoid',
  'Robot',
  'Cronenberg',
  'Animal',
  'Mythological Creature',
  'Disease',
  'Poopybutthole',
  'unknown'
]

export function defaultQuery (): CharacterQuery {
  return {
    name: '',
    status: '',
    gender: '',
    species: '',
    page: 1
  }
}

export function buildCharacterParams (query: CharacterQuery): Record<string, string | number> {
  const params: Record<string, string | number> = {}
  const name = query.name.trim()
  const species = query.species.trim()
  if (name) { params.name = name }
  if (species) { params.species = species }
  if (query.status) { params.status = query.status }
  if (query.gender) { params.gender = query.gender }
  if (query.page > 1) { params.page = query.page }
  return params
}

export function hasActiveFilters (query: CharacterQuery): boolean {
  return query.name.trim() !== '' ||
    query.species.trim() !== '' ||
    query.status !== '' ||
    query.gender !== ''
}
