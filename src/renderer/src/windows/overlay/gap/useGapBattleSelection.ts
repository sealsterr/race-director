import { useEffect, useMemo, useRef, useState } from 'react'
import type { DriverStanding } from '../../../types/lmu'
import { useBufferedAppState } from '../tower/useBufferedAppState'
import { selectGapBattleCandidate } from './gapBattleUtils'
import type { GapOverlayCenterState, GapTrend } from './gapTypes'

interface SelectedGapPair {
  readonly ahead: DriverStanding
  readonly behind: DriverStanding
}

interface GapBattleSelectionResult {
  readonly pair: SelectedGapPair | null
  readonly center: GapOverlayCenterState | null
  readonly isPreview: boolean
}

interface PairSlotIds {
  readonly aheadSlotId: number
  readonly behindSlotId: number
}

const CENTER_UPDATE_MS = 2000
const DEFAULT_TREND: GapTrend = 'closing'

export function useGapBattleSelection(triggerThresholdSeconds: number): GapBattleSelectionResult {
  const appState = useBufferedAppState(100)
  const isPreview = appState.connection !== 'CONNECTED'
  const [selectedPairIds, setSelectedPairIds] = useState<PairSlotIds | null>(null)
  const [center, setCenter] = useState<GapOverlayCenterState | null>(null)
  const latestCandidateRef = useRef<ReturnType<typeof selectGapBattleCandidate>>(null)
  const lastGapRef = useRef<number | null>(null)
  const lastTrendRef = useRef<GapTrend>(DEFAULT_TREND)

  const candidate = useMemo(
    () => selectGapBattleCandidate(appState.standings, triggerThresholdSeconds),
    [appState.standings, triggerThresholdSeconds]
  )

  useEffect(() => {
    latestCandidateRef.current = candidate
  }, [candidate])

  useEffect(() => {
    if (!isPreview) return

    setSelectedPairIds(null)
    setCenter(null)
    lastGapRef.current = null
    lastTrendRef.current = DEFAULT_TREND
  }, [isPreview])

  useEffect(() => {
    if (isPreview || !candidate || center !== null) return

    setSelectedPairIds({
      aheadSlotId: candidate.ahead.slotId,
      behindSlotId: candidate.behind.slotId
    })
    setCenter({ gapSeconds: candidate.gapSeconds, trend: lastTrendRef.current })
    lastGapRef.current = candidate.gapSeconds
  }, [isPreview, candidate, center])

  useEffect(() => {
    if (isPreview) return

    const timerId = window.setInterval(() => {
      const nextCandidate = latestCandidateRef.current
      if (!nextCandidate) return

      const previousGap = lastGapRef.current
      const trend =
        previousGap === null
          ? lastTrendRef.current
          : nextCandidate.gapSeconds < previousGap
            ? 'closing'
            : nextCandidate.gapSeconds > previousGap
              ? 'growing'
              : lastTrendRef.current

      lastGapRef.current = nextCandidate.gapSeconds
      lastTrendRef.current = trend

      setSelectedPairIds({
        aheadSlotId: nextCandidate.ahead.slotId,
        behindSlotId: nextCandidate.behind.slotId
      })
      setCenter({ gapSeconds: nextCandidate.gapSeconds, trend })
    }, CENTER_UPDATE_MS)

    return () => window.clearInterval(timerId)
  }, [isPreview])

  const pair = useMemo(() => {
    if (selectedPairIds) {
      const ahead = appState.standings.find((standing) => standing.slotId === selectedPairIds.aheadSlotId)
      const behind = appState.standings.find(
        (standing) => standing.slotId === selectedPairIds.behindSlotId
      )

      if (ahead && behind) {
        return { ahead, behind }
      }
    }

    return candidate ? { ahead: candidate.ahead, behind: candidate.behind } : null
  }, [appState.standings, candidate, selectedPairIds])

  return { pair, center, isPreview }
}
