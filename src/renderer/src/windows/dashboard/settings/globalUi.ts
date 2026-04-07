import type { GlobalUiSettingsPayload } from '../../../../../shared/globalUi'
import { applyMeasurementUnits } from '../../../units/measurementUnitStore'
import { resolvePaletteColors } from './defaults'
import type { DashboardSettings } from './types'

export const toGlobalUiPayload = (settings: DashboardSettings): GlobalUiSettingsPayload => {
  const palette = resolvePaletteColors(settings.general)
  return {
    darkMode: settings.general.darkMode,
    accent: palette.accent,
    logoPrimary: palette.logoPrimary,
    logoSecondary: palette.logoSecondary,
    reduceMotion: settings.advanced.reduceMotion,
    measurementUnits: {
      speedUnit: settings.general.speedUnit,
      temperatureUnit: settings.general.temperatureUnit,
      distanceUnit: settings.general.distanceUnit,
      pressureUnit: settings.general.pressureUnit
    }
  }
}

export const applyGlobalUiPayload = (payload: GlobalUiSettingsPayload): void => {
  const root = document.documentElement
  root.setAttribute('data-rd-theme', payload.darkMode ? 'dark' : 'light')
  root.style.setProperty('--color-rd-accent', payload.accent)
  root.style.setProperty('--color-rd-logo-primary', payload.logoPrimary)
  root.style.setProperty('--color-rd-logo-secondary', payload.logoSecondary)
  root.style.setProperty('--rd-reduce-motion', payload.reduceMotion ? '1' : '0')
  root.setAttribute('data-rd-speed-unit', payload.measurementUnits.speedUnit)
  root.setAttribute('data-rd-temperature-unit', payload.measurementUnits.temperatureUnit)
  root.setAttribute('data-rd-distance-unit', payload.measurementUnits.distanceUnit)
  root.setAttribute('data-rd-pressure-unit', payload.measurementUnits.pressureUnit)
  applyMeasurementUnits(payload.measurementUnits)
}
