/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useRef, useState } from 'react'

interface LapClock {
  baseTime: number | null
  basePerf: number
}

export function useSmoothLapTime(
  anchorTime: number | null,
  anchorTimestamp: number | null,
  isPreview: boolean
): number | null {
  const [lapTime, setLapTime] = useState<number | null>(anchorTime)
  const isLive = !isPreview && anchorTime !== null && anchorTimestamp !== null
  const clockRef = useRef<LapClock>({
    baseTime: anchorTime,
    basePerf: 0
  })

  useEffect(() => {
    if (!isLive) {
      clockRef.current = {
        baseTime: anchorTime,
        basePerf: performance.now()
      }
      setLapTime(anchorTime)
      return
    }

    const now = performance.now()
    const currentEstimate = getLapTime(clockRef.current, now)
    const shouldReset =
      currentEstimate === null ||
      anchorTime === null ||
      anchorTime < currentEstimate - 0.75 ||
      anchorTime > currentEstimate + 2

    if (shouldReset) {
      clockRef.current = {
        baseTime: anchorTime,
        basePerf: now
      }
      setLapTime(anchorTime)
    }
  }, [anchorTime, anchorTimestamp, isLive])

  useEffect(() => {
    if (!isLive) {
      return
    }

    let frameId = 0
    const tick = (now: number): void => {
      setLapTime(getLapTime(clockRef.current, now))
      frameId = requestAnimationFrame(tick)
    }

    frameId = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(frameId)
    }
  }, [isLive])

  return lapTime
}

function getLapTime(clock: LapClock, now: number): number | null {
  if (clock.baseTime === null) {
    return null
  }

  return Math.max(0, clock.baseTime + (now - clock.basePerf) / 1000)
}
