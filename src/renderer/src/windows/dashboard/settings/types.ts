import type {
  DistanceUnit,
  PressureUnit,
  SpeedUnit,
  TemperatureUnit
} from '../../../../../shared/measurementUnits'
import type { AppLanguage } from '../../../../../shared/language'

export type SettingsTabId = 'general' | 'network' | 'overlay' | 'advanced'

export type AccentPresetId =
  | 'ember-red'
  | 'signal-orange'
  | 'pit-blue'
  | 'stint-teal'
  | 'royal-violet'
  | 'flag-yellow'
  | 'custom'

export type BuiltInAccentPresetId = Exclude<AccentPresetId, 'custom'>

export interface PaletteColors {
  accent: string
  logoPrimary: string
  logoSecondary: string
}

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

export interface AccentPreset extends PaletteColors {
  id: BuiltInAccentPresetId
  label: string
}
