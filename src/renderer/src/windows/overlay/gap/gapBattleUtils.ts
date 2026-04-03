import type { DriverStanding, DriverStatus } from '../../../types/lmu'
import { getDriverNameParts } from '../driver/driverCardUtils'
import type { GapOverlayBattle, GapOverlayDriver } from './gapTypes'

interface GapBattleCandidate {
  readonly ahead: DriverStanding
  readonly behind: DriverStanding
  readonly gapSeconds: number
}

interface GapDriverMetrics {
  readonly speedKph: number
  readonly gear: string
}

function isEligibleStatus(status: DriverStatus): boolean {
  return status !== 'PITTING' && status !== 'FINISHED'
}

export function selectGapBattleCandidate(
  standings: DriverStanding[],
  thresholdSeconds: number
): GapBattleCandidate | null {
  let best: GapBattleCandidate | null = null

  for (let index = 1; index < standings.length; index += 1) {
    const ahead = standings[index - 1]
    const behind = standings[index]
    const interval = behind.intervalToAhead

    if (interval === null || interval > thresholdSeconds) continue
    if (ahead.carClass !== behind.carClass) continue
    if (ahead.lapsDown !== behind.lapsDown) continue
    if (!isEligibleStatus(ahead.status) || !isEligibleStatus(behind.status)) continue

    if (best === null || interval < best.gapSeconds) {
      best = { ahead, behind, gapSeconds: interval }
    }
  }

  return best
}

export function buildGapBattle(
  ahead: DriverStanding,
  behind: DriverStanding,
  aheadMetrics: GapDriverMetrics,
  behindMetrics: GapDriverMetrics
): GapOverlayBattle {
  return {
    ahead: buildGapDriver(ahead, aheadMetrics),
    behind: buildGapDriver(behind, behindMetrics)
  }
}

function buildGapDriver(
  standing: DriverStanding,
  metrics: GapDriverMetrics
): GapOverlayDriver {
  const nameParts = getDriverNameParts(standing.driverName)

  return {
    slotId: standing.slotId,
    firstName: nameParts.first,
    lastName: nameParts.last,
    carNumber: standing.carNumber,
    teamName: standing.teamName,
    tyreCompound: standing.tyreCompound,
    tyreSet: standing.tyreSet,
    speedKph: metrics.speedKph,
    gear: metrics.gear
  }
}

export function formatTelemetryGear(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return 'N'
  }

  const rounded = Math.round(value)
  if (rounded < 0) return 'R'
  if (rounded === 0) return 'N'
  return String(rounded)
}
