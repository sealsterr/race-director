import type {
  DistanceUnit,
  PressureUnit,
  SpeedUnit,
  TemperatureUnit
} from '../../../../../shared/measurementUnits'
import type { AppLanguage } from '../../../../../shared/language'

export type SettingsTabId = 'general' | 'network' | 'overlay' | 'advanced'

export type ThemeAppearance = 'dark' | 'light'
export type AccentPresetId = string
export type BuiltInAccentPresetId = string

export interface PaletteColors {
  accent: string
  logoPrimary: string
  logoSecondary: string
}

export interface ThemeSurfaceColors {
  appearance: ThemeAppearance
  background: string
  surface: string
  elevated: string
  border: string
  text: string
  muted: string
  subtle: string
  titlebarSurface: string
  titlebarSymbol: string
  windowBackground: string
  modalBackdrop: string
}

export type ThemeColors = PaletteColors & ThemeSurfaceColors

export interface DashboardSettings {
  general: {
    uiScale: number
    darkMode: boolean
    language: AppLanguage
    speedUnit: SpeedUnit
    temperatureUnit: TemperatureUnit
    distanceUnit: DistanceUnit
    pressureUnit: PressureUnit
    accentPreset: AccentPresetId
    customPalette: PaletteColors
    activityLogLimit: number
  }
  network: {
    apiUrl: string
    pollRateMs: number
    autoConnectOnLaunch: boolean
    autoReconnectOnDrop: boolean
    reconnectDelayMs: number
  }
  overlay: {
    startupOverlayDashboard: boolean
    startupInfoWindow: boolean
    closeOverlaysWhenControlCloses: boolean
    animateOverlayHighlights: boolean
    flashFightRows: boolean
  }
  advanced: {
    reduceMotion: boolean
    compactTelemetryRows: boolean
    verboseLogs: boolean
  }
}

export interface AccentPreset extends ThemeColors {
  id: BuiltInAccentPresetId
  label: string
}
