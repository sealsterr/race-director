import type { CarClass, DriverStanding, SectorTime } from '../../../types/lmu'
import type { DriverSettings } from '../../../store/overlayStore'
type SectorKey = 'sector1' | 'sector2' | 'sector3'

export interface NationalityMark {
  readonly code: string
  readonly colors: readonly [string, string, string]
}

const NATIONALITY_CODE_MARKS: Record<string, NationalityMark> = {
  CAN: { code: 'CAN', colors: ['#ef4444', '#ffffff', '#ef4444'] },
  ESP: { code: 'ESP', colors: ['#c81e1e', '#facc15', '#c81e1e'] },
  NLD: { code: 'NLD', colors: ['#ef4444', '#ffffff', '#2563eb'] },
  HU: { code: 'HU', colors: ['#dc2626', '#ffffff', '#16a34a'] },
  HUN: { code: 'HUN', colors: ['#dc2626', '#ffffff', '#16a34a'] },
  FR: { code: 'FR', colors: ['#2563eb', '#ffffff', '#dc2626'] },
  DE: { code: 'DE', colors: ['#111827', '#dc2626', '#facc15'] },
  IT: { code: 'IT', colors: ['#16a34a', '#ffffff', '#dc2626'] },
  JP: { code: 'JP', colors: ['#ffffff', '#ef4444', '#ffffff'] },
  UK: { code: 'UK', colors: ['#1d4ed8', '#ffffff', '#dc2626'] },
  GB: { code: 'GB', colors: ['#1d4ed8', '#ffffff', '#dc2626'] },
  USA: { code: 'USA', colors: ['#1d4ed8', '#ffffff', '#dc2626'] },
  US: { code: 'US', colors: ['#1d4ed8', '#ffffff', '#dc2626'] }
}

const NATIONALITY_MARKS: Record<string, NationalityMark> = {
  'RYAN REYNOLDS': { code: 'CAN', colors: ['#ef4444', '#ffffff', '#ef4444'] },
  'FERNANDO ALONSO': { code: 'ESP', colors: ['#c81e1e', '#facc15', '#c81e1e'] },
  'MAX VERSTAPPEN': { code: 'NLD', colors: ['#ef4444', '#ffffff', '#2563eb'] }
}

const CLASS_ACCENTS: Record<CarClass, string> = {
  HYPERCAR: '#ef4444',
  LMP2: '#3b82f6',
  LMP3: '#facc15',
  LMGT3: '#22c55e',
  GTE: '#f97316',
  UNKNOWN: '#94a3b8'
}

export const DRIVER_DEFAULT_SETTINGS: DriverSettings = {
  showPart1: true,
  showPart2: true,
  showPart3: true,
  colorSessionBest: '#7c3aed',
  colorPersonalBest: '#22c55e',
  colorCompleted: '#f59e0b',
  colorPending: '#475569'
}

export function getDriverNameParts(driverName: string): { first: string; last: string } {
  const parts = driverName.trim().split(/\s+/).filter(Boolean)
  if (parts.length <= 1) {
    return { first: parts[0] ?? 'Spectated', last: (parts[0] ?? 'Driver').toUpperCase() }
  }

  return {
    first: parts.slice(0, -1).join(' '),
    last: parts[parts.length - 1].toUpperCase()
  }
}

export function getNationalityMark(
  driverName: string,
  nationalityCode: string | null
): NationalityMark {
  const fromCode = nationalityCode ? NATIONALITY_CODE_MARKS[nationalityCode.toUpperCase()] : null
  if (fromCode) {
    return fromCode
  }

  return (
    NATIONALITY_MARKS[driverName.toUpperCase()] ?? {
      code: 'INT',
      colors: ['#334155', '#cbd5e1', '#334155']
    }
  )
}

export function getClassPosition(standings: DriverStanding[], driver: DriverStanding): number {
  const classStandings = standings.filter((standing) => standing.carClass === driver.carClass)
  const classIndex = classStandings.findIndex((standing) => standing.slotId === driver.slotId)
  return classIndex >= 0 ? classIndex + 1 : driver.position
}

export function getSessionBestSectors(standings: DriverStanding[]): SectorTime {
  const best: SectorTime = { sector1: null, sector2: null, sector3: null }

  for (const standing of standings) {
    for (const key of ['sector1', 'sector2', 'sector3'] as SectorKey[]) {
      const value = standing.bestSectors[key]
      if (value !== null && (best[key] === null || value < (best[key] as number))) {
        best[key] = value
      }
    }
  }

  return best
}

export function getClassBestLapTime(
  standings: DriverStanding[],
  driver: DriverStanding
): number | null {
  let best: number | null = null

  for (const standing of standings) {
    if (standing.carClass !== driver.carClass || standing.bestLapTime === null) {
      continue
    }

    if (best === null || standing.bestLapTime < best) {
      best = standing.bestLapTime
    }
  }

  return best
}

export function formatLapTime(seconds: number | null): string {
  if (seconds === null || seconds <= 0) {
    return '--:--.---'
  }

  const minutes = Math.floor(seconds / 60)
  const remainder = seconds % 60
  return `${minutes}:${remainder.toFixed(3).padStart(6, '0')}`
}

export function getSectorColor(
  key: SectorKey,
  currentValue: number | null,
  bestSectors: SectorTime,
  sessionBestSectors: SectorTime,
  settings: DriverSettings
): string {
  if (currentValue === null) {
    return settings.colorPending
  }

  if (sessionBestSectors[key] !== null && currentValue <= (sessionBestSectors[key] as number)) {
    return settings.colorSessionBest
  }

  if (bestSectors[key] !== null && currentValue <= (bestSectors[key] as number)) {
    return settings.colorPersonalBest
  }

  return settings.colorCompleted
}

export function getBestLapHighlightColor(
  lastLapTime: number | null,
  bestLapTime: number | null,
  classBestLapTime: number | null,
  settings: DriverSettings
): string | null {
  if (lastLapTime === null || lastLapTime <= 0) {
    return null
  }

  if (classBestLapTime !== null && lastLapTime <= classBestLapTime) {
    return settings.colorSessionBest
  }

  if (bestLapTime !== null && lastLapTime <= bestLapTime) {
    return settings.colorPersonalBest
  }

  return null
}

export function getClassLabel(carClass: CarClass): string {
  return carClass === 'UNKNOWN' ? 'OPEN' : carClass
}

export function getClassAccent(carClass: CarClass): string {
  return CLASS_ACCENTS[carClass] ?? CLASS_ACCENTS.UNKNOWN
}

export function getClassGradient(carClass: CarClass): string {
  const accent = getClassAccent(carClass)
  return `linear-gradient(115deg, ${accent}cc, rgba(43,22,29,0.66) 56%, rgba(17,19,29,0.98) 56%)`
}
