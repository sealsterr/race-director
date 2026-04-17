import type { GlobalUiSettingsPayload } from '../../../../../shared/globalUi'
import { applyMeasurementUnits } from '../../../units/measurementUnitStore'
import { resolveThemeColors } from './defaults'
import type { DashboardSettings } from './types'

export const toGlobalUiPayload = (settings: DashboardSettings): GlobalUiSettingsPayload => {
  const theme = resolveThemeColors(settings.general)
  return {
    darkMode: theme.appearance === 'dark',
    accent: theme.accent,
    logoPrimary: theme.logoPrimary,
    logoSecondary: theme.logoSecondary,
    background: theme.background,
    surface: theme.surface,
    elevated: theme.elevated,
    border: theme.border,
    text: theme.text,
    muted: theme.muted,
    subtle: theme.subtle,
    titlebarSurface: theme.titlebarSurface,
    titlebarSymbol: theme.titlebarSymbol,
    windowBackground: theme.windowBackground,
    modalBackdrop: theme.modalBackdrop,
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
  root.style.setProperty('--color-rd-bg', payload.background)
  root.style.setProperty('--color-rd-surface', payload.surface)
  root.style.setProperty('--color-rd-elevated', payload.elevated)
  root.style.setProperty('--color-rd-border', payload.border)
  root.style.setProperty('--color-rd-text', payload.text)
  root.style.setProperty('--color-rd-muted', payload.muted)
  root.style.setProperty('--color-rd-subtle', payload.subtle)
  root.style.setProperty('--rd-titlebar-controls-surface', payload.titlebarSurface)
  root.style.setProperty('--rd-reduce-motion', payload.reduceMotion ? '1' : '0')
  root.setAttribute('data-rd-speed-unit', payload.measurementUnits.speedUnit)
  root.setAttribute('data-rd-temperature-unit', payload.measurementUnits.temperatureUnit)
  root.setAttribute('data-rd-distance-unit', payload.measurementUnits.distanceUnit)
  root.setAttribute('data-rd-pressure-unit', payload.measurementUnits.pressureUnit)
  applyMeasurementUnits(payload.measurementUnits)
}
