import { useEffect, useRef, useState } from 'react'
import type { DriverStanding, TelemetrySnapshot } from '../../../types/lmu'
import { createTelemetryLookup, findTelemetryForDriver } from '../driver/driverTelemetryUtils'
import { formatTelemetryGear } from './gapBattleUtils'

interface GapDriverTelemetryData {
  readonly speedKph: number
  readonly gear: string
}

interface GapBattleTelemetryData {
  readonly ahead: GapDriverTelemetryData
  readonly behind: GapDriverTelemetryData
}

const EMPTY_TELEMETRY: GapBattleTelemetryData = {
  ahead: { speedKph: 0, gear: 'N' },
  behind: { speedKph: 0, gear: 'N' }
}

export function useGapBattleTelemetry(
  pair: { ahead: DriverStanding; behind: DriverStanding } | null
): GapBattleTelemetryData {
  const [displayData, setDisplayData] = useState<GapBattleTelemetryData>(EMPTY_TELEMETRY)
  const targetRef = useRef<GapBattleTelemetryData>(EMPTY_TELEMETRY)

  useEffect(() => {
    if (!pair) {
      targetRef.current = EMPTY_TELEMETRY
      setDisplayData(EMPTY_TELEMETRY)
      return
    }

    const applySnapshot = (snapshot: TelemetrySnapshot | null): void => {
      targetRef.current = resolveTelemetryTarget(pair, snapshot)
    }

    let cancelled = false
    void globalThis.api
      .getTelemetry()
      .then((snapshot) => {
        if (cancelled) return
        applySnapshot(snapshot)
        setDisplayData(targetRef.current)
      })
      .catch(() => undefined)

    const unsubscribe = globalThis.api.onTelemetryUpdate((snapshot) => {
      applySnapshot(snapshot)
    })

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [pair?.ahead.slotId, pair?.behind.slotId])

  useEffect(() => {
    if (!pair) return

    let frameId = 0
    let lastFrame = performance.now()

    const tick = (now: number): void => {
      const deltaSeconds = Math.min(0.05, (now - lastFrame) / 1000)
      lastFrame = now

      setDisplayData((current) => smoothTelemetry(current, targetRef.current, deltaSeconds))
      frameId = requestAnimationFrame(tick)
    }

    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [pair?.ahead.slotId, pair?.behind.slotId])

  return displayData
}

function resolveTelemetryTarget(
  pair: { ahead: DriverStanding; behind: DriverStanding },
  snapshot: TelemetrySnapshot | null
): GapBattleTelemetryData {
  const lookup = createTelemetryLookup(snapshot?.cars ?? [])

  return {
    ahead: resolveDriverTelemetry(pair.ahead, lookup),
    behind: resolveDriverTelemetry(pair.behind, lookup)
  }
}

function resolveDriverTelemetry(
  driver: DriverStanding,
  lookup: ReturnType<typeof createTelemetryLookup>
): GapDriverTelemetryData {
  const telemetry = findTelemetryForDriver(driver, lookup)

  return {
    speedKph: clampMetric(telemetry?.speedKph),
    gear: formatTelemetryGear(telemetry?.gear)
  }
}

function clampMetric(value: number | null | undefined): number {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return 0
  }

  return Math.max(0, value)
}

function smoothTelemetry(
  current: GapBattleTelemetryData,
  target: GapBattleTelemetryData,
  deltaSeconds: number
): GapBattleTelemetryData {
  return {
    ahead: {
      speedKph: smoothValue(current.ahead.speedKph, target.ahead.speedKph, deltaSeconds, 14),
      gear: target.ahead.gear
    },
    behind: {
      speedKph: smoothValue(current.behind.speedKph, target.behind.speedKph, deltaSeconds, 14),
      gear: target.behind.gear
    }
  }
}

function smoothValue(
  current: number,
  target: number,
  deltaSeconds: number,
  responsiveness: number
): number {
  if (Math.abs(current - target) < 0.02) {
    return target
  }

  const easing = 1 - Math.exp(-deltaSeconds * responsiveness)
  return current + (target - current) * easing
}
