import type { MeasurementUnits } from './measurementUnits'

export interface GlobalUiSettingsPayload {
  darkMode: boolean
  accent: string
  logoPrimary: string
  logoSecondary: string
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
  reduceMotion: boolean
  measurementUnits: MeasurementUnits
}
