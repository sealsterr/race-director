import { useEffect, useRef, useState } from 'react'
import type { DriverStanding, TelemetrySnapshot } from '../../../types/lmu'
import { createTelemetryLookup, findTelemetryForDriver } from './driverTelemetryUtils'

interface DriverSpeedometerData {
  readonly speedKph: number
  readonly rpm: number
  readonly fuelLevel: number
  readonly veLevel: number
  readonly throttleLevel: number
  readonly brakeLevel: number
}

const PREVIEW_DATA: DriverSpeedometerData = {
  speedKph: 320,
  rpm: 10000,
  fuelLevel: 100,
  veLevel: 100,
  throttleLevel: 100,
  brakeLevel: 100
}

export function useDriverSpeedometer(
  driver: DriverStanding,
  isPreview: boolean
): DriverSpeedometerData {
  const [displayData, setDisplayData] = useState<DriverSpeedometerData>(PREVIEW_DATA)
  const latestSnapshotRef = useRef<TelemetrySnapshot | null>(null)
  const targetRef = useRef<DriverSpeedometerData>(PREVIEW_DATA)

  useEffect(() => {
    if (isPreview) {
      latestSnapshotRef.current = null
      targetRef.current = PREVIEW_DATA
      return
    }

    const applySnapshot = (snapshot: TelemetrySnapshot | null): void => {
      latestSnapshotRef.current = snapshot
      targetRef.current = resolveTargetData(driver, snapshot)
    }

    let cancelled = false
    void globalThis.api
      .getTelemetry()
      .then((snapshot) => {
        if (!cancelled) {
          applySnapshot(snapshot)
        }
      })
      .catch(() => undefined)

    const unsubscribe = globalThis.api.onTelemetryUpdate((snapshot) => {
      applySnapshot(snapshot)
    })

    applySnapshot(latestSnapshotRef.current)

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [
    driver.carName,
    driver.carNumber,
    driver.driverName,
    driver.fuel,
    driver.slotId,
    driver.telemetryId,
    isPreview
  ])

  useEffect(() => {
    if (isPreview) {
      return
    }

    let frameId = 0
    let lastFrame = performance.now()

    const tick = (now: number): void => {
      const deltaSeconds = Math.min(0.05, (now - lastFrame) / 1000)
      lastFrame = now

      setDisplayData((current) => smoothTelemetry(current, targetRef.current, deltaSeconds))

      frameId = requestAnimationFrame(tick)
    }

    frameId = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(frameId)
    }
  }, [isPreview])

  return isPreview ? PREVIEW_DATA : displayData
}

function resolveTargetData(
  driver: DriverStanding,
  snapshot: TelemetrySnapshot | null
): DriverSpeedometerData {
  const telemetry = findTelemetryForDriver(driver, createTelemetryLookup(snapshot?.cars ?? []))

  return {
    speedKph: clampMetric(telemetry?.speedKph),
    rpm: clampMetric(telemetry?.rpm),
    fuelLevel: clampMetric(telemetry?.fuelPercentage ?? driver.fuel),
    veLevel: clampMetric(telemetry?.batteryChargePercentage),
    throttleLevel: clampMetric(telemetry?.throttle),
    brakeLevel: clampMetric(telemetry?.brake)
  }
}

function clampMetric(value: number | null | undefined): number {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return 0
  }

  return Math.max(0, value)
}

function smoothTelemetry(
  current: DriverSpeedometerData,
  target: DriverSpeedometerData,
  deltaSeconds: number
): DriverSpeedometerData {
  return {
    speedKph: smoothValue(current.speedKph, target.speedKph, deltaSeconds, 14),
    rpm: smoothValue(current.rpm, target.rpm, deltaSeconds, 18),
    fuelLevel: smoothValue(current.fuelLevel, target.fuelLevel, deltaSeconds, 5),
    veLevel: smoothValue(current.veLevel, target.veLevel, deltaSeconds, 5),
    throttleLevel: smoothValue(current.throttleLevel, target.throttleLevel, deltaSeconds, 20),
    brakeLevel: smoothValue(current.brakeLevel, target.brakeLevel, deltaSeconds, 20)
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
