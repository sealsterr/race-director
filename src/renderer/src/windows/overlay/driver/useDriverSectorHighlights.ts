import { useEffect, useRef, useState } from 'react'
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

const SECTOR_KEYS: SectorKey[] = ['sector1', 'sector2', 'sector3']
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

  useEffect(() => {
    if (!enabled) {
      clearTextTimers(textTimerRefs.current)
      clearResetTimer(resetTimerRef)
      holdEndsAtRef.current = 0
      setBestLapColor(DEFAULT_BEST_LAP_COLOR)
      setSectorVisuals(
        buildStaticVisuals(currentSectors, bestSectors, sessionBestSectors, settings)
      )
      previousSectorsRef.current = currentSectors
      previousLastLapRef.current = lastLapTime
      return
    }

    const previous = previousSectorsRef.current
    for (const key of SECTOR_KEYS) {
      const nextValue = currentSectors[key]
      if (didSectorAdvance(previous[key], nextValue)) {
        activateSector(key, nextValue as number)
      }
    }

    previousSectorsRef.current = currentSectors
  }, [bestSectors, currentSectors, enabled, lastLapTime, sessionBestSectors, settings])

  useEffect(() => {
    if (!enabled) {
      return
    }

    const previousLastLap = previousLastLapRef.current
    const isNewLapTime =
      lastLapTime !== null &&
      lastLapTime > 0 &&
      lastLapTime !== previousLastLap &&
      holdEndsAtRef.current > Date.now()

    if (isNewLapTime) {
      const highlight = getBestLapHighlightColor(
        lastLapTime,
        bestLapTime,
        classBestLapTime,
        settings
      )
      if (highlight) {
        setBestLapColor(highlight)
      }
    }

    previousLastLapRef.current = lastLapTime
  }, [bestLapTime, classBestLapTime, enabled, lastLapTime, settings])

  useEffect(() => {
    return () => {
      clearTextTimers(textTimerRefs.current)
      clearResetTimer(resetTimerRef)
    }
  }, [])

  return { sectorVisuals, bestLapColor }

  function activateSector(key: SectorKey, value: number): void {
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
  }
}

function didSectorAdvance(previousValue: number | null, nextValue: number | null): boolean {
  if (nextValue === null) {
    return false
  }

  if (previousValue === null) {
    return true
  }

  return Math.abs(nextValue - previousValue) > 0.0005
}
