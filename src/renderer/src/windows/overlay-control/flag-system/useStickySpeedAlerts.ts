import { useEffect, useMemo, useState } from 'react'
import type { SpeedAlert } from './types'

const SPEED_ALERT_RETENTION_MS = 30_000
const SPEED_ALERT_PULSE_RETENTION_MS = 10_000

interface StickySpeedAlertRecord {
  alert: SpeedAlert
  retainUntil: number
  pulseUntil: number
}

export const useStickySpeedAlerts = (activeAlerts: SpeedAlert[]): SpeedAlert[] => {
  const [records, setRecords] = useState<Record<string, StickySpeedAlertRecord>>(() =>
    Object.fromEntries(
      activeAlerts.map((alert) => [
        alert.id,
        {
          alert: { ...alert, triggerActive: true, pulseActive: alert.pulseActive },
          retainUntil: Date.now() + SPEED_ALERT_RETENTION_MS,
          pulseUntil: Date.now() + SPEED_ALERT_PULSE_RETENTION_MS
        }
      ])
    )
  )

  useEffect(() => {
    const now = Date.now()
    const activeIds = new Set(activeAlerts.map((alert) => alert.id))

    const timeout = globalThis.setTimeout(() => {
      setRecords((current) => {
        const next: Record<string, StickySpeedAlertRecord> = {}

        Object.values(current).forEach((record) => {
          if (activeIds.has(record.alert.id)) return

          if (record.alert.triggerActive) {
            next[record.alert.id] = {
              alert: { ...record.alert, triggerActive: false },
              retainUntil: now + SPEED_ALERT_RETENTION_MS,
              pulseUntil: now + SPEED_ALERT_PULSE_RETENTION_MS
            }
            return
          }

          if (record.retainUntil > now) {
            next[record.alert.id] = {
              ...record,
              alert: {
                ...record.alert,
                pulseActive: record.alert.pulseActive && record.pulseUntil > now
              }
            }
          }
        })

        activeAlerts.forEach((alert) => {
          next[alert.id] = {
            alert: { ...alert, triggerActive: true, pulseActive: alert.pulseActive },
            retainUntil: now + SPEED_ALERT_RETENTION_MS,
            pulseUntil: now + SPEED_ALERT_PULSE_RETENTION_MS
          }
        })

        return next
      })
    }, 0)

    return () => globalThis.clearTimeout(timeout)
  }, [activeAlerts])

  useEffect(() => {
    const now = Date.now()
    const nextExpiry = Object.values(records).reduce<number | null>((earliest, record) => {
      if (record.alert.triggerActive) return earliest
      const nextRecordExpiry =
        record.alert.pulseActive && record.pulseUntil > now
          ? Math.min(record.pulseUntil, record.retainUntil)
          : record.retainUntil
      return earliest === null ? nextRecordExpiry : Math.min(earliest, nextRecordExpiry)
    }, null)

    if (nextExpiry === null) return

    const timeout = globalThis.setTimeout(
      () => {
        setRecords((current) => {
          const currentNow = Date.now()
          return Object.fromEntries(
            Object.entries(current)
              .filter(([, record]) => record.alert.triggerActive || record.retainUntil > currentNow)
              .map(([id, record]) => [
                id,
                record.alert.triggerActive
                  ? record
                  : {
                      ...record,
                      alert: {
                        ...record.alert,
                        pulseActive: record.alert.pulseActive && record.pulseUntil > currentNow
                      }
                    }
              ])
          )
        })
      },
      Math.max(0, nextExpiry - now)
    )

    return () => globalThis.clearTimeout(timeout)
  }, [records])

  return useMemo(
    () =>
      Object.values(records)
        .map((record) => record.alert)
        .sort((a, b) => b.sessionElapsedSeconds - a.sessionElapsedSeconds),
    [records]
  )
}
