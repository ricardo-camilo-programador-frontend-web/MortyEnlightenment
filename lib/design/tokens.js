// Direction: Cidadela do Portal — dark dossier catalog for a fan explorer.
// References:
// - https://rickandmortyapi.com/documentation (filters, 300px avatars, pages of 20)
// - https://github.com/gabriel-pipia/Rick-and-Morty-with-Angular (Rick green, portal cyan, chips)
// - https://github.com/MarkoEv/rickmorty-explorer (dark grid, search, pagination)
// - https://github.com/osmarpetry/citadel-character-atlas (debounce, live region, empty/error)
// - https://hash.design/foundations/accessibility (WCAG 2.2 AA contrast, 24px targets, focus)

const colors = {
  void: '#07140f',
  surface: '#12261c',
  input: '#0c1c15',
  line: '#6ea384',
  ink: '#f3faf4',
  muted: '#c9dccf',
  portal: '#d5ff5c',
  'portal-ink': '#10210c',
  cyan: '#9be7ff',
  focus: '#eaff7a',
  placeholder: '#a9c2b2',
  glow: '#283a1b',
  alive: { bg: '#123c24', fg: '#d8ffd0' },
  dead: { bg: '#4a1c24', fg: '#ffd5d5' },
  unknown: { bg: '#3d3114', fg: '#ffe8bf' }
}

const textPairs = [
  [colors.ink, colors.void],
  [colors.muted, colors.void],
  [colors.ink, colors.surface],
  [colors.muted, colors.surface],
  [colors.ink, colors.input],
  [colors['portal-ink'], colors.portal],
  [colors.portal, colors.void],
  [colors.cyan, colors.void],
  [colors.cyan, colors.surface],
  [colors.placeholder, colors.input],
  [colors.alive.fg, colors.alive.bg],
  [colors.dead.fg, colors.dead.bg],
  [colors.unknown.fg, colors.unknown.bg],
  [colors.ink, colors.glow],
  [colors.muted, colors.glow],
  [colors.portal, colors.glow]
]

const uiPairs = [
  [colors.line, colors.void],
  [colors.line, colors.surface],
  [colors.line, colors.input],
  [colors.focus, colors.void],
  [colors.portal, colors.input]
]

function channel (value) {
  const normalized = value / 255
  return normalized <= 0.04045
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4
}

function luminance (hex) {
  const raw = hex.replace('#', '')
  const red = parseInt(raw.slice(0, 2), 16)
  const green = parseInt(raw.slice(2, 4), 16)
  const blue = parseInt(raw.slice(4, 6), 16)
  return (0.2126 * channel(red)) + (0.7152 * channel(green)) + (0.0722 * channel(blue))
}

function contrastRatio (foreground, background) {
  const lighter = Math.max(luminance(foreground), luminance(background))
  const darker = Math.min(luminance(foreground), luminance(background))
  return (lighter + 0.05) / (darker + 0.05)
}

module.exports = {
  colors,
  textPairs,
  uiPairs,
  contrastRatio
}
