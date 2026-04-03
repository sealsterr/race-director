import type { SpeedUnit } from './measurementUnits'

export interface GlobalUiSettingsPayload {
  darkMode: boolean
  accent: string
  logoPrimary: string
  logoSecondary: string
  reduceMotion: boolean
  speedUnit: SpeedUnit
}
