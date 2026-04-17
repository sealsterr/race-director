import type {
  AccentPreset,
  BuiltInAccentPresetId,
  DashboardSettings,
  PaletteColors,
  ThemeColors
} from './types'
import { coerceAppLanguage, DEFAULT_APP_LANGUAGE } from '../../../../../shared/language'
import { DEFAULT_MEASUREMENT_UNITS } from '../../../../../shared/measurementUnits'
import { createCustomThemeColors, DEFAULT_THEME_COLORS, THEME_PRESETS } from './themePresets'

export const DASHBOARD_SETTINGS_STORAGE_KEY = 'race-director.dashboard.settings.v1'
export const CUSTOM_ACCENT_PRESET_ID = 'custom' as const

export const ACCENT_PRESETS: AccentPreset[] = THEME_PRESETS

export const DEFAULT_CUSTOM_PALETTE: PaletteColors = {
  accent: DEFAULT_THEME_COLORS.accent,
  logoPrimary: DEFAULT_THEME_COLORS.logoPrimary,
  logoSecondary: DEFAULT_THEME_COLORS.logoSecondary
}

export const DEFAULT_DASHBOARD_SETTINGS: DashboardSettings = {
  general: {
    uiScale: 1,
    darkMode: true,
    language: DEFAULT_APP_LANGUAGE,
    speedUnit: DEFAULT_MEASUREMENT_UNITS.speedUnit,
    temperatureUnit: DEFAULT_MEASUREMENT_UNITS.temperatureUnit,
    distanceUnit: DEFAULT_MEASUREMENT_UNITS.distanceUnit,
    pressureUnit: DEFAULT_MEASUREMENT_UNITS.pressureUnit,
    accentPreset: 'dark',
    customPalette: { ...DEFAULT_CUSTOM_PALETTE },
    activityLogLimit: 400
  },
  network: {
    apiUrl: 'http://localhost:6397',
    pollRateMs: 200,
    autoConnectOnLaunch: false,
    autoReconnectOnDrop: true,
    reconnectDelayMs: 1500
  },
  overlay: {
    startupOverlayDashboard: false,
    startupInfoWindow: false,
    closeOverlaysWhenControlCloses: true,
    animateOverlayHighlights: true,
    flashFightRows: true
  },
  advanced: {
    reduceMotion: false,
    compactTelemetryRows: false,
    verboseLogs: false
  }
}

export const getAccentPreset = (id: BuiltInAccentPresetId): AccentPreset => {
  return (
    ACCENT_PRESETS.find((preset) => preset.id === id) ?? {
      id: 'dark',
      label: 'Dark',
      ...DEFAULT_THEME_COLORS
    }
  )
}

const normalizeHexColor = (value: string, fallback: string): string => {
  return /^#[0-9a-fA-F]{6}$/.test(value) ? value.toLowerCase() : fallback
}

export const normalizePaletteColors = (palette: PaletteColors): PaletteColors => ({
  accent: normalizeHexColor(palette.accent, DEFAULT_CUSTOM_PALETTE.accent),
  logoPrimary: normalizeHexColor(palette.logoPrimary, DEFAULT_CUSTOM_PALETTE.logoPrimary),
  logoSecondary: normalizeHexColor(palette.logoSecondary, DEFAULT_CUSTOM_PALETTE.logoSecondary)
})

export const resolveThemeColors = (general: DashboardSettings['general']): ThemeColors => {
  if (general.accentPreset === CUSTOM_ACCENT_PRESET_ID) {
    return createCustomThemeColors(general.darkMode, normalizePaletteColors(general.customPalette))
  }
  return getAccentPreset(general.accentPreset)
}

export const resolvePaletteColors = (general: DashboardSettings['general']): PaletteColors =>
  resolveThemeColors(general)

export const mergeDashboardSettings = (stored: Partial<DashboardSettings>): DashboardSettings => {
  return {
    ...DEFAULT_DASHBOARD_SETTINGS,
    ...stored,
    general: { ...DEFAULT_DASHBOARD_SETTINGS.general, ...stored.general },
    network: { ...DEFAULT_DASHBOARD_SETTINGS.network, ...stored.network },
    overlay: { ...DEFAULT_DASHBOARD_SETTINGS.overlay, ...stored.overlay },
    advanced: { ...DEFAULT_DASHBOARD_SETTINGS.advanced, ...stored.advanced }
  }
}

export const loadDashboardSettingsFromStorage = (storage: Storage): DashboardSettings => {
  try {
    const raw = storage.getItem(DASHBOARD_SETTINGS_STORAGE_KEY)
    if (!raw) return DEFAULT_DASHBOARD_SETTINGS
    const parsed = JSON.parse(raw) as Partial<DashboardSettings>
    return clampSettings(mergeDashboardSettings(parsed))
  } catch (error) {
    console.warn('Failed to load dashboard settings from storage; using defaults:', error)
    return DEFAULT_DASHBOARD_SETTINGS
  }
}

export const persistDashboardSettingsToStorage = (
  storage: Storage,
  next: DashboardSettings
): void => {
  storage.setItem(DASHBOARD_SETTINGS_STORAGE_KEY, JSON.stringify(next))
}

export const clampSettings = (candidate: DashboardSettings): DashboardSettings => ({
  ...candidate,
  general: {
    ...candidate.general,
    language: coerceAppLanguage(candidate.general.language),
    uiScale: 1,
    accentPreset:
      candidate.general.accentPreset === CUSTOM_ACCENT_PRESET_ID
        ? CUSTOM_ACCENT_PRESET_ID
        : getAccentPreset(candidate.general.accentPreset).id,
    customPalette: normalizePaletteColors(candidate.general.customPalette),
    activityLogLimit: Math.min(2000, Math.max(100, Math.round(candidate.general.activityLogLimit)))
  },
  network: {
    ...candidate.network,
    pollRateMs: Math.min(2000, Math.max(50, Math.round(candidate.network.pollRateMs))),
    reconnectDelayMs: Math.min(10000, Math.max(300, Math.round(candidate.network.reconnectDelayMs)))
  }
})
