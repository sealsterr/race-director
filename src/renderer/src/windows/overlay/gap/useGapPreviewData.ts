import { useEffect, useState } from 'react'
import { GAP_PREVIEW_BATTLE, GAP_PREVIEW_CENTER_SEQUENCE } from './gapPreviewData'
import type { GapOverlayBattle, GapOverlayCenterState } from './gapTypes'

interface GapPreviewData {
  readonly battle: GapOverlayBattle
  readonly center: GapOverlayCenterState
}

const CENTER_UPDATE_MS = 2000

export function useGapPreviewData(): GapPreviewData {
  const [centerIndex, setCenterIndex] = useState(0)

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setCenterIndex((current) => (current + 1) % GAP_PREVIEW_CENTER_SEQUENCE.length)
    }, CENTER_UPDATE_MS)

    return () => window.clearInterval(timerId)
  }, [])

  return {
    battle: GAP_PREVIEW_BATTLE,
    center: GAP_PREVIEW_CENTER_SEQUENCE[centerIndex]
  }
}
