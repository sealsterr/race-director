import { useCallback, useEffect, useRef, useState } from 'react'
import type { DriverSettings } from '../../../store/overlayStore'
import type { SectorTime } from '../../../types/lmu'
import { getBestLapHighlightColor, getSectorColor } from './driverCardUtils'
import {
  buildEmptyVisuals,
  buildStaticVisuals,
  clearResetTimer,
  clearTextTimers,
  DEFAULT_TEXT_COLOR,
  type DriverSectorVisualMap
} from './driverSectorHighlightUtils'

type SectorKey = 'sector1' | 'sector2' | 'sector3'

const SECTOR_KEYS = ['sector1', 'sector2', 'sector3'] as const satisfies readonly SectorKey[]
const HOLD_MS = 3000
const DEFAULT_BEST_LAP_COLOR = DEFAULT_TEXT_COLOR

interface UseDriverSectorHighlightsOptions {
  readonly currentSectors: SectorTime
  readonly bestSectors: SectorTime
  readonly sessionBestSectors: SectorTime
  readonly lastLapTime: number | null
  readonly bestLapTime: number | null
  readonly classBestLapTime: number | null
  readonly settings: DriverSettings
  readonly enabled: boolean
}

export function useDriverSectorHighlights({
  currentSectors,
  bestSectors,
  sessionBestSectors,
  lastLapTime,
  bestLapTime,
  classBestLapTime,
  settings,
  enabled
}: UseDriverSectorHighlightsOptions): {
  sectorVisuals: DriverSectorVisualMap
  bestLapColor: string
} {
  const [sectorVisuals, setSectorVisuals] = useState<DriverSectorVisualMap>(() =>
    buildEmptyVisuals(settings)
  )
  const [bestLapColor, setBestLapColor] = useState(DEFAULT_BEST_LAP_COLOR)
  const previousSectorsRef = useRef<SectorTime>({ sector1: null, sector2: null, sector3: null })
  const previousLastLapRef = useRef<number | null>(lastLapTime)
  const textTimerRefs = useRef<Partial<Record<SectorKey, ReturnType<typeof setTimeout>>>>({})
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const holdEndsAtRef = useRef(0)

  const activateSector = useCallback(
    (key: SectorKey, value: number): void => {
      const highlightColor = getSectorColor(key, value, bestSectors, sessionBestSectors, settings)

      const existingTextTimer = textTimerRefs.current[key]
      if (existingTextTimer) {
        clearTimeout(existingTextTimer)
      }

      setSectorVisuals((current) => ({
        ...current,
        [key]: {
          value,
          lineColor: highlightColor,
          textColor: highlightColor
        }
      }))

      textTimerRefs.current[key] = setTimeout(() => {
        setSectorVisuals((current) => ({
          ...current,
          [key]: {
            ...current[key],
            textColor: DEFAULT_TEXT_COLOR
          }
        }))
        delete textTimerRefs.current[key]
      }, HOLD_MS)

      if (key !== 'sector3') {
        return
      }

      clearResetTimer(resetTimerRef)
      holdEndsAtRef.current = Date.now() + HOLD_MS
      resetTimerRef.current = setTimeout(() => {
        holdEndsAtRef.current = 0
        setBestLapColor(DEFAULT_BEST_LAP_COLOR)
        setSectorVisuals(buildEmptyVisuals(settings))
        resetTimerRef.current = null
      }, HOLD_MS)
    },
    [bestSectors, sessionBestSectors, settings]
  )

  useEffect(() => {
    if (!enabled) {
      clearTextTimers(textTimerRefs.current)
      clearResetTimer(resetTimerRef)
      holdEndsAtRef.current = 0
      const resetTimer = window.setTimeout(() => {
        setBestLapColor(DEFAULT_BEST_LAP_COLOR)
        setSectorVisuals(
          buildStaticVisuals(currentSectors, bestSectors, sessionBestSectors, settings)
        )
      }, 0)
      previousSectorsRef.current = currentSectors
      previousLastLapRef.current = lastLapTime
      return () => window.clearTimeout(resetTimer)
    }

    const previous = previousSectorsRef.current
    const activationTimers: number[] = []
    for (const key of SECTOR_KEYS) {
      const nextValue = currentSectors[key]
      if (nextValue !== null && didSectorAdvance(previous[key], nextValue)) {
        activationTimers.push(
          window.setTimeout(() => {
            activateSector(key, nextValue)
          }, 0)
        )
      }
    }

    previousSectorsRef.current = currentSectors
    return () => {
      activationTimers.forEach((timer) => window.clearTimeout(timer))
    }
  }, [
    activateSector,
    bestSectors,
    currentSectors,
    enabled,
    lastLapTime,
    sessionBestSectors,
    settings
  ])

  useEffect(() => {
    if (!enabled) {
      return undefined
    }

    const previousLastLap = previousLastLapRef.current
    const isNewLapTime =
      lastLapTime !== null &&
      lastLapTime > 0 &&
      lastLapTime !== previousLastLap &&
      holdEndsAtRef.current > Date.now()

    previousLastLapRef.current = lastLapTime

    if (isNewLapTime) {
      const highlight = getBestLapHighlightColor(
        lastLapTime,
        bestLapTime,
        classBestLapTime,
        settings
      )
      if (highlight) {
        const applyTimer = window.setTimeout(() => {
          setBestLapColor(highlight)
        }, 0)
        return () => window.clearTimeout(applyTimer)
      }
    }

    return undefined
  }, [bestLapTime, classBestLapTime, enabled, lastLapTime, settings])

  useEffect(() => {
    const textTimers = textTimerRefs.current
    return () => {
      clearTextTimers(textTimers)
      clearResetTimer(resetTimerRef)
    }
  }, [])

  return { sectorVisuals, bestLapColor }
}

function didSectorAdvance(previousValue: number | null, nextValue: number): boolean {
  if (previousValue === null) {
    return true
  }

  return Math.abs(nextValue - previousValue) > 0.0005
}
