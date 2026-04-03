import type { GapSettings, DriverSettings } from '../../../store/overlayStore'
import {
  DRIVER_DEFAULT_SETTINGS,
  formatLapTime,
  getClassAccent,
  getClassLabel
} from '../driver/driverCardUtils'
import type { GapTrend } from './gapTypes'
import type { TyreCompound } from '../../../types/lmu'

export const GAP_DEFAULT_SETTINGS: GapSettings = {
  triggerThresholdSeconds: 1,
  showCarClass: true
}

export function formatGapTime(value: number): string {
  return value.toFixed(3)
}

export function formatSignedSeconds(value: number): string {
  const prefix = value > 0 ? '+' : ''
  return `${prefix}${value.toFixed(3)}s`
}

export function formatFuel(value: number): string {
  return `${Math.round(value)}%`
}

export function getTyreAccent(compound: TyreCompound): string {
  switch (compound) {
    case 'SOFT':
      return '#ef4444'
    case 'MEDIUM':
      return '#facc15'
    case 'HARD':
      return '#e5e7eb'
    case 'WET':
      return '#38bdf8'
    default:
      return '#94a3b8'
  }
}

export function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, value))
}

export function withAlpha(color: string, alpha: string): string {
  return /^#[\da-f]{6}$/i.test(color) ? `${color}${alpha}` : color
}

export function getDriverAccent(carClass: Parameters<typeof getClassAccent>[0]): string {
  return getClassAccent(carClass)
}

export function getDriverClassLabel(carClass: Parameters<typeof getClassLabel>[0]): string {
  return getClassLabel(carClass)
}

export function getTrendPalette(
  trend: GapTrend,
  driverSettings?: Partial<DriverSettings>
): { primary: string; soft: string; label: string; motionLabel: string } {
  const { closing, growing } = getTrendColors(driverSettings)
  const primary = trend === 'closing' ? closing : growing

  return {
    primary,
    soft: withAlpha(primary, '33'),
    label: trend === 'closing' ? 'Closing' : 'Stretching',
    motionLabel: trend === 'closing' ? 'Gap shrinking' : 'Gap increasing'
  }
}

export function getTrendColors(driverSettings?: Partial<DriverSettings>): {
  closing: string
  growing: string
} {
  const palette = { ...DRIVER_DEFAULT_SETTINGS, ...driverSettings }

  return {
    closing: palette.colorPersonalBest,
    growing: palette.colorCompleted
  }
}

export { formatLapTime }
