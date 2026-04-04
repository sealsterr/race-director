import type { MeasurementUnits } from './measurementUnits'

export interface GlobalUiSettingsPayload {
  darkMode: boolean
  accent: string
  logoPrimary: string
  logoSecondary: string
  reduceMotion: boolean
  measurementUnits: MeasurementUnits
}
