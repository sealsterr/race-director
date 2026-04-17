import type { AccentPreset, PaletteColors, ThemeColors } from './types'

interface RgbColor {
  r: number
  g: number
  b: number
}

interface ThemeSpec {
  id: string
  label: string
  background: string
  accent: string
}

const hexToRgb = (hex: string): RgbColor => ({
  r: Number.parseInt(hex.slice(1, 3), 16),
  g: Number.parseInt(hex.slice(3, 5), 16),
  b: Number.parseInt(hex.slice(5, 7), 16)
})

const rgbToHex = ({ r, g, b }: RgbColor): string =>
  `#${[r, g, b].map((channel) => Math.round(channel).toString(16).padStart(2, '0')).join('')}`

const mixColor = (from: string, to: string, amount: number): string => {
  const start = hexToRgb(from)
  const end = hexToRgb(to)
  return rgbToHex({
    r: start.r + (end.r - start.r) * amount,
    g: start.g + (end.g - start.g) * amount,
    b: start.b + (end.b - start.b) * amount
  })
}

const channelToLinear = (channel: number): number => {
  const value = channel / 255
  return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
}

const relativeLuminance = (hex: string): number => {
  const { r, g, b } = hexToRgb(hex)
  return 0.2126 * channelToLinear(r) + 0.7152 * channelToLinear(g) + 0.0722 * channelToLinear(b)
}

const rgbaFromHex = (hex: string, alpha: number): string => {
  const { r, g, b } = hexToRgb(hex)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const buildThemeColors = (
  background: string,
  accent: string,
  logoPrimary = accent,
  logoSecondary = background
): ThemeColors => {
  const isDark = relativeLuminance(background) < 0.24
  const text = isDark ? '#f8fafc' : '#111827'
  const backdropSeed = isDark
    ? mixColor(background, '#000000', 0.35)
    : mixColor(background, '#64748b', 0.18)

  return {
    appearance: isDark ? 'dark' : 'light',
    accent,
    logoPrimary,
    logoSecondary,
    background,
    surface: isDark ? mixColor(background, '#ffffff', 0.07) : mixColor(background, '#ffffff', 0.62),
    elevated: isDark
      ? mixColor(background, '#ffffff', 0.13)
      : mixColor(background, '#ffffff', 0.82),
    border: isDark ? mixColor(background, '#ffffff', 0.24) : mixColor(background, '#000000', 0.18),
    text,
    muted: isDark ? mixColor(text, background, 0.42) : mixColor(text, background, 0.52),
    subtle: isDark ? mixColor(text, background, 0.66) : mixColor(text, background, 0.7),
    titlebarSurface: isDark
      ? mixColor(background, '#ffffff', 0.07)
      : mixColor(background, '#ffffff', 0.7),
    titlebarSymbol: text,
    windowBackground: background,
    modalBackdrop: rgbaFromHex(backdropSeed, isDark ? 0.74 : 0.34)
  }
}

const createPreset = ({ id, label, background, accent }: ThemeSpec): AccentPreset => ({
  id,
  label,
  ...buildThemeColors(background, accent)
})

export const DEFAULT_THEME_COLORS: ThemeColors = {
  appearance: 'dark',
  accent: '#dc2626',
  logoPrimary: '#eb7b27',
  logoSecondary: '#14537e',
  background: '#08090c',
  surface: '#0f1117',
  elevated: '#161820',
  border: '#1e2030',
  text: '#f1f5f9',
  muted: '#94a3b8',
  subtle: '#475569',
  titlebarSurface: '#0f1117',
  titlebarSymbol: '#f1f5f9',
  windowBackground: '#08090c',
  modalBackdrop: 'rgba(6, 10, 16, 0.74)'
}

export const LIGHT_THEME_COLORS: ThemeColors = {
  appearance: 'light',
  accent: '#2563eb',
  logoPrimary: '#2563eb',
  logoSecondary: '#64748b',
  background: '#dbe4ef',
  surface: '#f6f8fc',
  elevated: '#ffffff',
  border: '#ced8e6',
  text: '#0f172a',
  muted: '#475569',
  subtle: '#64748b',
  titlebarSurface: '#e9edf3',
  titlebarSymbol: '#0f172a',
  windowBackground: '#dbe4ef',
  modalBackdrop: 'rgba(148, 163, 184, 0.34)'
}

export const DARK_THEME_COLORS: ThemeColors = {
  ...DEFAULT_THEME_COLORS
}

export const BASE_THEME_PRESETS: AccentPreset[] = [
  {
    id: 'light',
    label: 'Light',
    ...LIGHT_THEME_COLORS
  },
  {
    id: 'dark',
    label: 'Dark',
    ...DARK_THEME_COLORS
  }
]

const THEME_SPECS: ThemeSpec[] = [
  { id: 'smoked-mirage', label: 'Smoked Mirage', background: '#f2e0d0', accent: '#6e88b0' },
  { id: 'parchment-gold', label: 'Parchment Gold', background: '#faefd9', accent: '#e8a736' },
  { id: 'matcha-coal', label: 'Matcha Coal', background: '#c2d8c4', accent: '#222222' },
  { id: 'moss-milk', label: 'Moss Milk', background: '#385144', accent: '#f8f5f2' },
  { id: 'tyrian-cream', label: 'Tyrian Cream', background: '#700143', accent: '#f8edad' },
  { id: 'volt-forest', label: 'Volt Forest', background: '#0f2d0f', accent: '#9bff00' },
  { id: 'coral-midnight', label: 'Coral Midnight', background: '#111827', accent: '#ff6b5b' },
  {
    id: 'strawberry-obsidian',
    label: 'Strawberry Obsidian',
    background: '#f0cdd2',
    accent: '#3c1950'
  },
  { id: 'maroon-lavender', label: 'Maroon Lavender', background: '#750e1e', accent: '#c2a3ef' },
  { id: 'robin-olive', label: 'Robin Olive', background: '#50c9ce', accent: '#2e382e' },
  { id: 'lavender-magic', label: 'Lavender Magic', background: '#f492f0', accent: '#5e429c' },
  { id: 'burgundy-sun', label: 'Burgundy Sun', background: '#780116', accent: '#f7b538' },
  { id: 'crimson-nights', label: 'Crimson Nights', background: '#02182b', accent: '#d7263d' },
  { id: 'noir-rose', label: 'Noir Rose', background: '#1a0a0a', accent: '#e8729a' },
  { id: 'abyss-frost', label: 'Abyss Frost', background: '#0a0f1e', accent: '#e4f0f6' },
  { id: 'cyan-navy', label: 'Cyan Navy', background: '#0d1b2a', accent: '#00ffff' },
  { id: 'storm-butter', label: 'Storm Butter', background: '#3a4a5c', accent: '#f5e6a3' },
  { id: 'lavender-dusk', label: 'Lavender Dusk', background: '#2e2a4a', accent: '#c8c0e8' },
  { id: 'burgundy-fog', label: 'Burgundy Fog', background: '#4a1528', accent: '#e8e0d8' },
  { id: 'magenta-pitch', label: 'Magenta Pitch', background: '#080808', accent: '#ff006e' },
  { id: 'ink-blush', label: 'Ink Blush', background: '#1a1f3a', accent: '#f0c8c0' },
  { id: 'onyx-champagne', label: 'Onyx Champagne', background: '#1c1c1e', accent: '#f0e6c8' },
  { id: 'sauber-toxic', label: 'Sauber Toxic', background: '#000000', accent: '#00ff89' },
  { id: 'audi-silverline', label: 'Audi Silverline', background: '#bb0a30', accent: '#c0c0c0' },
  { id: 'aston-green', label: 'Aston Green', background: '#010101', accent: '#006f62' },
  { id: 'alpine-pulse', label: 'Alpine Pulse', background: '#0090ff', accent: '#ff4db8' },
  { id: 'mclaren-papaya', label: 'McLaren Papaya', background: '#010101', accent: '#ff8000' },
  { id: 'mercedes-stealth', label: 'Mercedes Stealth', background: '#0a0a0a', accent: '#00d2be' },
  { id: 'ferrari-modena', label: 'Ferrari Modena', background: '#dc0000', accent: '#fff200' },
  { id: 'red-bull-deep', label: 'Red Bull Deep', background: '#0600ef', accent: '#dc1e35' },
  { id: 'violet-mind', label: 'Violet Mind', background: '#23194f', accent: '#ddfef8' },
  { id: 'electric-night', label: 'Electric Night', background: '#00120b', accent: '#c200fb' },
  { id: 'brick-ivory', label: 'Brick Ivory', background: '#eff1f3', accent: '#c9452e' }
]

export const THEME_PRESETS: AccentPreset[] = [
  ...BASE_THEME_PRESETS,
  ...THEME_SPECS.map(createPreset)
]

export const createCustomThemeColors = (
  darkMode: boolean,
  palette: PaletteColors
): ThemeColors => ({
  ...(darkMode ? DEFAULT_THEME_COLORS : LIGHT_THEME_COLORS),
  ...palette
})
