const STATUS_LABELS: Record<string, string> = {
  Alive: 'Vivo',
  Dead: 'Morto',
  unknown: 'Desconhecido'
}

const GENDER_LABELS: Record<string, string> = {
  Female: 'Feminino',
  Male: 'Masculino',
  Genderless: 'Sem gênero',
  unknown: 'Desconhecido'
}

export function labelStatus (value: string): string {
  return STATUS_LABELS[value] ?? labelOrDash(value)
}

export function labelGender (value: string): string {
  return GENDER_LABELS[value] ?? labelOrDash(value)
}

export function labelOrDash (value: string): string {
  const trimmed = value.trim()
  if (trimmed.length === 0) { return 'Não informado' }
  if (trimmed.toLowerCase() === 'unknown') { return 'Desconhecido' }
  return trimmed
}

export function formatResultCount (count: number): string {
  if (count === 1) { return '1 personagem' }
  return `${count} personagens`
}

export function formatEpisodeCount (count: number): string {
  if (count === 1) { return '1 episódio' }
  return `${count} episódios`
}

export function statusTone (value: string): 'alive' | 'dead' | 'unknown' {
  if (value === 'Alive') { return 'alive' }
  if (value === 'Dead') { return 'dead' }
  return 'unknown'
}
